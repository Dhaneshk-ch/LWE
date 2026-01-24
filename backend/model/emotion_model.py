import cv2
import numpy as np
import tensorflow as tf
import os
from collections import deque

# ----------------------------------------
# LOAD SAVEDMODEL
# ----------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "emotion_model_tf")
EMOTION_MODEL = tf.saved_model.load(MODEL_PATH)
infer = EMOTION_MODEL.signatures["serving_default"]

# ----------------------------------------
# EMOTION LABELS
# ----------------------------------------
MODEL_CLASSES = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

EMOTION_MAPPING = {
    0: "Frustrated",
    1: "Bored",
    2: "Anxiety",
    3: "Happy",
    4: "Sad",
    5: "Confused",
    6: "Neutral",
}

# ----------------------------------------
# STATE
# ----------------------------------------
PROB_HISTORY = deque(maxlen=7)
LAST_EMOTION = "Neutral"

# ----------------------------------------
# FACE DETECTOR (CRITICAL FIX)
# ----------------------------------------
FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

# ----------------------------------------
# PREPROCESS
# ----------------------------------------
def preprocess(img):
    img = cv2.resize(img, (48, 48))
    img = img.astype("float32") / 255.0
    img = np.expand_dims(img, axis=(0, -1))
    return img

# ----------------------------------------
# MAIN PREDICTION
# ----------------------------------------
def predict_emotion(frame):
    global LAST_EMOTION

    if frame is None:
        return LAST_EMOTION

    # Convert & enhance
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    # Detect faces
    faces = FACE_CASCADE.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(40, 40)
    )

    # ---------------- FACE FOUND ----------------
    if len(faces) > 0:
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        roi = gray[y:y + h, x:x + w]
    else:
        # ---------------- FALLBACK ----------------
        h, w = gray.shape
        roi = gray[h//4:3*h//4, w//4:3*w//4]

    try:
        input_tensor = tf.constant(preprocess(roi))
        output = list(infer(input_tensor).values())[0].numpy()[0]

        # Softmax safety
        exp = np.exp(output - np.max(output))
        probs = exp / np.sum(exp)

        PROB_HISTORY.append(probs)
        avg_probs = np.mean(PROB_HISTORY, axis=0)

        best_idx = int(np.argmax(avg_probs))
        emotion = EMOTION_MAPPING.get(best_idx, "Neutral")

        # ---------------- STICKINESS FIX ----------------
        if emotion == LAST_EMOTION and avg_probs[best_idx] < 0.55:
            second_idx = np.argsort(avg_probs)[-2]
            emotion = EMOTION_MAPPING.get(second_idx, emotion)

        LAST_EMOTION = emotion
        return emotion

    except Exception as e:
        print("[Emotion error]", e)
        return LAST_EMOTION
