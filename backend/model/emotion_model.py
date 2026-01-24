import cv2
import numpy as np
import tensorflow as tf
import os
from collections import deque

# ----------------------------------------
# TENSORFLOW MODEL LOADING (ONCE AT STARTUP)
# ----------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "emotion_model_tf")

try:
    EMOTION_MODEL = tf.saved_model.load(MODEL_PATH)
    print("[OK] TensorFlow SavedModel loaded from " + MODEL_PATH)
except Exception as e:
    print("[ERROR] Failed to load SavedModel: " + str(e))
    EMOTION_MODEL = None

# ----------------------------------------
# MODEL CLASS LABELS (7 EMOTIONS)
# ----------------------------------------
MODEL_CLASSES = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# Map FER model output indices to application emotion labels
# FER index -> App label
EMOTION_MAPPING = {
    0: "Frustrated",  # Angry → Frustrated
    1: "Bored",       # Disgust → Bored
    2: "Anxiety",     # Fear → Anxiety
    3: "Happy",       # Happy → Happy
    4: "Sad",         # Sad → Sad
    5: "Confused",    # Surprise → Confused
    6: "Neutral",     # Neutral → Neutral
}

# ----------------------------------------
# TEMPORAL STATE MANAGEMENT
# ----------------------------------------
# Store rolling window of raw softmax probabilities (not emotions)
PROBABILITY_HISTORY = deque(maxlen=5)
EMOTION_HISTORY = deque(maxlen=5)
LAST_KNOWN_EMOTION = "Neutral"
REPEATED_EMOTION_COUNT = 0
LAST_EMOTION = None

# ----------------------------------------
# PREPROCESSING FUNCTION
# ----------------------------------------
def preprocess_frame(frame, model_input_size=(48, 48)):
    """
    Preprocess frame for TensorFlow model:
    1. Convert BGR → RGB (standard)
    2. If grayscale training: Convert to grayscale
    3. Resize to model input size (48x48)
    4. Normalize pixel values to [0, 1]
    5. Expand dimensions for batch processing
    """
    try:
        # If no frame provided, create a neutral gray placeholder
        if frame is None:
            gray = np.full((model_input_size[1], model_input_size[0]), 127, dtype=np.uint8)
        else:
            # If frame has color channels, convert to grayscale; otherwise assume already gray
            if len(frame.shape) == 3 and frame.shape[2] == 3:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            else:
                gray = frame.copy()

            # Resize to model input size (works for full-frame or detected-face crop)
            gray = cv2.resize(gray, model_input_size)

        # Normalize pixel values to [0, 1]
        normalized = gray.astype('float32') / 255.0

        # Expand dimensions for batch: (48, 48) → (1, 48, 48, 1)
        expanded = np.expand_dims(normalized, axis=0)
        expanded = np.expand_dims(expanded, axis=-1)

        return expanded
    except Exception as e:
        print("[ERROR] Preprocessing error: " + str(e))
        # Fallback: return a neutral gray tensor
        fallback = np.full((1, model_input_size[1], model_input_size[0], 1), 0.5, dtype='float32')
        return fallback

# ----------------------------------------
# PROBABILITY-BASED PREDICTION
# ----------------------------------------
def sample_from_probabilities(probabilities):
    """
    Deterministic selection: pick the highest softmax probability (argmax).
    This removes any randomness and ensures reproducible predictions.
    Returns (index, confidence)
    """
    best_idx = int(np.argmax(probabilities))
    confidence = float(probabilities[best_idx])
    return best_idx, confidence

# ----------------------------------------
# EMOTION PREDICTION WITH PROBABILITY-BASED LOGIC
# ----------------------------------------
def predict_emotion(frame):
    """
    Predict emotion using probability-based sampling + temporal smoothing.
    
    Guarantees:
    - Always returns one of 7 app emotions
    - Uses softmax probabilities (not just argmax)
    - Applies temporal averaging
    - Prevents getting stuck on same emotion
    """
    global PROBABILITY_HISTORY, EMOTION_HISTORY, LAST_KNOWN_EMOTION
    global REPEATED_EMOTION_COUNT, LAST_EMOTION
    
    if EMOTION_MODEL is None:
        print("[ERROR] Model not loaded. Returning last known emotion.")
        return LAST_KNOWN_EMOTION
    
    try:
        # Preprocess the frame
        processed = preprocess_frame(frame)
        
        if processed is None:
            print("[ERROR] Frame preprocessing failed. Using history.")
            return get_smoothed_emotion()
        
        # Make prediction using SavedModel
        input_tensor = tf.constant(processed, dtype=tf.float32)
        concrete_func = EMOTION_MODEL.signatures['serving_default']
        predictions = concrete_func(input_tensor)
        
        # Extract output
        if isinstance(predictions, dict):
            output_tensor = list(predictions.values())[0]
        else:
            output_tensor = predictions
        
        # Get raw output and ensure we work with softmax probabilities
        raw = output_tensor.numpy()[0]  # Shape: (7,) or logits

        if raw is None or len(raw) == 0:
            print("[ERROR] Model prediction failed. Using history.")
            return get_smoothed_emotion()

        # If outputs are logits, convert to softmax probabilities deterministically
        probs = np.array(raw, dtype='float32')
        if not np.isclose(np.sum(probs), 1.0, rtol=1e-3):
            exp = np.exp(probs - np.max(probs))
            probabilities = exp / np.sum(exp)
        else:
            probabilities = probs

        # Deterministic selection from probabilities (argmax)
        emotion_idx, confidence = sample_from_probabilities(probabilities)
        
        # Map to app emotion
        app_emotion = EMOTION_MAPPING.get(emotion_idx, "Neutral")
        
        # Store in history
        PROBABILITY_HISTORY.append(probabilities)
        EMOTION_HISTORY.append(app_emotion)
        
        # Apply temporal smoothing
        final_emotion = get_smoothed_emotion()
        
        # Apply diversification logic (prevent sticking)
        final_emotion = apply_diversification_logic(final_emotion)
        
        LAST_KNOWN_EMOTION = final_emotion
        
        print("[OK] Raw: " + MODEL_CLASSES[emotion_idx] + " (" + f"{confidence:.3f}" + ") -> Mapped: " + app_emotion + " -> Final: " + final_emotion)
        return final_emotion
        
    except Exception as e:
        print("[ERROR] Prediction error: " + str(e))
        return get_smoothed_emotion()

# ----------------------------------------
# TEMPORAL SMOOTHING (PROBABILITY-BASED)
# ----------------------------------------
def get_smoothed_emotion():
    """
    Average probabilities across last 5 frames and select emotion.
    
    This is the key to smooth, stable predictions.
    """
    if len(PROBABILITY_HISTORY) == 0:
        return LAST_KNOWN_EMOTION
    
    # Average probabilities across history
    probability_array = np.array(list(PROBABILITY_HISTORY))  # Shape: (N, 7)
    averaged_probs = np.mean(probability_array, axis=0)  # Shape: (7,)
    
    # Get emotion from averaged probabilities
    best_idx = np.argmax(averaged_probs)
    best_emotion = EMOTION_MAPPING.get(best_idx, "Neutral")
    avg_confidence = averaged_probs[best_idx]
    
    print("    [SMOOTHED] Avg probs over " + str(len(PROBABILITY_HISTORY)) + " frames: " + "best=" + MODEL_CLASSES[best_idx] + " (" + f"{avg_confidence:.3f}" + ")")
    
    return best_emotion

# ----------------------------------------
# DIVERSIFICATION LOGIC (PREVENT STICKING)
# ----------------------------------------
def apply_diversification_logic(current_emotion):
    """
    If the same emotion appears 4+ times in a row, force re-evaluation.
    
    This prevents the model from getting stuck on one emotion forever.
    """
    global REPEATED_EMOTION_COUNT, LAST_EMOTION
    
    if current_emotion == LAST_EMOTION:
        REPEATED_EMOTION_COUNT += 1
    else:
        REPEATED_EMOTION_COUNT = 1
        LAST_EMOTION = current_emotion
    
    # If same emotion 4+ times, use second-highest probability
    if REPEATED_EMOTION_COUNT >= 4 and len(PROBABILITY_HISTORY) > 0:
        probability_array = np.array(list(PROBABILITY_HISTORY))
        averaged_probs = np.mean(probability_array, axis=0)
        
        # Get top 2 indices
        top_2_indices = np.argsort(averaged_probs)[::-1][:2]
        
        # Prefer second-highest to diversify
        second_best_idx = top_2_indices[1]
        alternative_emotion = EMOTION_MAPPING.get(second_best_idx, "Neutral")
        
        print("    [DIVERSIFIED] Stuck on " + current_emotion + " " + str(REPEATED_EMOTION_COUNT) + "x -> switching to " + alternative_emotion)
        
        return alternative_emotion
    
    return current_emotion

# ----------------------------------------
# FALLBACK (LEGACY - NOT USED)
# ----------------------------------------
def get_last_known_emotion():
    """Fallback to last known emotion if everything fails"""
    return LAST_KNOWN_EMOTION
