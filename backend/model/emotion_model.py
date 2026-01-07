import cv2
import numpy as np

def predict_emotion(frame):
    """
    Dummy emotion predictor (replace with ML model later)
    """
    emotions = ["Happy", "Sad", "Neutral", "Angry", "Surprised"]
    return np.random.choice(emotions)
