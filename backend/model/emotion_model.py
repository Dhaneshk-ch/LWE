import os
import sys
import cv2
import numpy as np

# Import webcam validation module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from utils.webcam_validator import validate_webcam_frame, ValidationResult

try:
    import tensorflow as tf
except Exception:
    tf = None

# Model configuration
MODEL_DIR = os.path.join(os.path.dirname(__file__), "emotion_model_tf")
MODEL_INPUT_SIZE = (48, 48)  # height, width
SMOOTHING_WINDOW = 3

# Mapping from model class index -> application emotion
FALLBACK_MAPPING = {
    0: "Frustrated",  # Angry
    1: "Frustrated",  # Disgust
    2: "Anxiety",     # Fear
    3: "Happy",       # Happy
    4: "Neutral",     # Neutral
    5: "Sad",         # Sad
    6: "Neutral",     # Surprise
}

# Global state
EMOTION_MODEL = None
_pred_history = []  # list of (class_idx, confidence)
_last_known = "Neutral"


def _load_model():
    global EMOTION_MODEL
    if tf is None:
        return None

    if EMOTION_MODEL is not None:
        return EMOTION_MODEL

    if not os.path.isdir(MODEL_DIR):
        return None

    try:
        EMOTION_MODEL = tf.saved_model.load(MODEL_DIR)
        try:
            print(f"[emotion_model] Loaded SavedModel from: {MODEL_DIR}")
        except Exception:
            pass
        return EMOTION_MODEL
    except Exception as e:
        try:
            print(f"[emotion_model] Failed loading SavedModel: {e}")
        except Exception:
            pass
        EMOTION_MODEL = None
        return None


def preprocess_frame(frame):
    """Convert BGR OpenCV frame to model input tensor.

    Returns: numpy array of shape (1, H, W, 1) dtype float32
    """
    if frame is None:
        return None

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Try face detection and crop to face if possible (improves emotion detection)
    face_found = False
    try:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(48, 48))
        if len(faces) > 0:
            # choose largest face
            faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
            x, y, w, h = faces[0]
            cropped = gray[y : y + h, x : x + w]
            face_found = True
        else:
            cropped = gray
    except Exception:
        cropped = gray

    if not face_found:
        # center-crop fallback to focus on face region
        h, w = gray.shape[:2]
        cx, cy = w // 2, h // 3  # face usually upper-center
        crop_w = min(w, h)
        x1 = max(0, cx - crop_w // 2)
        y1 = max(0, cy - crop_w // 2)
        cropped = gray[y1 : y1 + crop_w, x1 : x1 + crop_w]

    # Resize to model input
    resized = cv2.resize(cropped, (MODEL_INPUT_SIZE[1], MODEL_INPUT_SIZE[0]))

    # Normalize to [0,1]
    normalized = resized.astype(np.float32) / 255.0

    # Expand dims to (1, H, W, 1)
    tensor = np.expand_dims(normalized, axis=(0, -1))
    return tensor


def preprocess_frame_with_face(face_region):
    """Convert pre-extracted face region to model input tensor.
    
    This is used when face has already been validated and cropped
    by the webcam validator.
    
    Args:
        face_region (np.ndarray): Grayscale cropped face image
    
    Returns:
        np.ndarray: Model input tensor of shape (1, H, W, 1) dtype float32, or None if invalid
    """
    if face_region is None:
        return None
    
    try:
        # Resize to model input
        resized = cv2.resize(face_region, (MODEL_INPUT_SIZE[1], MODEL_INPUT_SIZE[0]))
        
        # Normalize to [0,1]
        normalized = resized.astype(np.float32) / 255.0
        
        # Expand dims to (1, H, W, 1)
        tensor = np.expand_dims(normalized, axis=(0, -1))
        return tensor
    except Exception as e:
        print(f"[emotion_model] Error preprocessing face region: {e}")
        return None


def _smooth_and_map(class_idx, confidence):
    """Maintain sliding window of preds and return mapped emotion string."""
    global _pred_history, _last_known

    _pred_history.append((int(class_idx), float(confidence)))
    if len(_pred_history) > SMOOTHING_WINDOW:
        _pred_history.pop(0)

    # majority vote on class_idx
    classes = [p[0] for p in _pred_history]
    counts = {}
    for c in classes:
        counts[c] = counts.get(c, 0) + 1

    majority_class = max(counts.items(), key=lambda x: x[1])[0]

    # average confidence for majority class
    confidences = [p[1] for p in _pred_history if p[0] == majority_class]
    avg_conf = float(np.mean(confidences)) if confidences else float(confidence)

    mapped = FALLBACK_MAPPING.get(majority_class, "Neutral")
    _last_known = mapped
    return mapped, avg_conf


def predict_emotion(frame):
    """Run model inference on an OpenCV BGR frame and return mapped emotion string.
    
    First performs comprehensive webcam validation:
    - Checks frame brightness
    - Detects blur
    - Validates face detection (exactly 1 face required)
    
    If validation fails, returns "Unknown" emotion with guidance message.
    If validation passes, crops face region and passes to emotion model.
    
    If the SavedModel isn't available, falls back to a deterministic heuristic (brightness-based).
    """
    global _last_known
    
    # ================================================================
    # STEP 1: VALIDATE WEBCAM FRAME QUALITY AND FACE DETECTION
    # ================================================================
    validation = validate_webcam_frame(frame)
    
    # If validation fails, return Unknown emotion with specific guidance
    if not validation.is_valid:
        if validation.validation_type == "brightness":
            return "Unknown"
        elif validation.validation_type == "blur":
            return "Unknown"
        elif validation.validation_type == "no_face":
            return "Unknown"
        elif validation.validation_type == "multiple_faces":
            return "Multi faces"
        else:
            return "Unknown"
    
    # ================================================================
    # STEP 2: PREPROCESS VALIDATED FACE REGION
    # ================================================================
    # Use validated face region instead of full frame
    tensor = preprocess_frame_with_face(validation.face_region)
    if tensor is None:
        return _last_known

    model = _load_model()
    if model is None:
        # Fallback deterministic: use mean pixel to choose Neutral/Happy/Sad
        mean_val = tensor.mean()
        if mean_val > 0.6:
            return "Happy"
        if mean_val < 0.3:
            return "Sad"
        return "Neutral"

    try:
        # Try using serving_default signature
        tf_input = tf.convert_to_tensor(tensor)

        if hasattr(model, "signatures") and "serving_default" in model.signatures:
            func = model.signatures["serving_default"]
            # Try to detect expected input name for the signature
            try:
                _, in_spec = func.structured_input_signature
                input_keys = list(in_spec.keys())
            except Exception:
                input_keys = []

            try:
                if input_keys:
                    # call with named arg
                    kwargs = {input_keys[0]: tf_input}
                    out = func(**kwargs)
                else:
                    out = func(tf_input)
            except Exception as e:
                # fallback: try calling directly
                try:
                    out = func(tf_input)
                except Exception as e2:
                    raise

            # out may be a dict of tensors
            if isinstance(out, dict):
                first = list(out.values())[0]
                probs = first.numpy()
            else:
                probs = out.numpy()
        else:
            # Call model directly
            preds = model(tf_input)
            if isinstance(preds, dict):
                first = list(preds.values())[0]
                probs = first.numpy()
            else:
                probs = preds.numpy()

        # Ensure shape (1, num_classes)
        if probs.ndim == 1:
            probs = np.expand_dims(probs, axis=0)

        probs = probs[0]
        # If outputs appear to be logits (do not sum to ~1), apply softmax
        s = float(np.sum(probs))
        if not (0.9 <= s <= 1.1):
            try:
                exp = np.exp(probs - np.max(probs))
                probs = exp / exp.sum()
            except Exception:
                pass

        class_idx = int(np.argmax(probs))
        confidence = float(probs[class_idx])

        mapped_emotion, avg_conf = _smooth_and_map(class_idx, confidence)

        try:
            print(f"[emotion_model] pred class={class_idx} conf={confidence:.3f} mapped={mapped_emotion}")
        except Exception:
            pass

        return mapped_emotion

    except Exception:
        return _last_known

