"""
Webcam validation module for emotion detection.

Provides robust frame quality checks including:
- Frame brightness validation
- Motion blur detection
- Face detection using Haar Cascade classifiers
- Face region cropping for emotion model input
"""

import cv2
import numpy as np


# ----------------------------------------
# HAAR CASCADE CLASSIFIER PATHS
# ----------------------------------------
FACE_CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"


# ----------------------------------------
# CONFIGURATION THRESHOLDS
# ----------------------------------------
BRIGHTNESS_THRESHOLD_LOW = 30  # Min brightness (too dark)
BRIGHTNESS_THRESHOLD_HIGH = 220  # Max brightness (too bright/washed out)
BLUR_THRESHOLD = 100  # Laplacian variance threshold for blur detection
FACE_MIN_SIZE = 48  # Minimum face detection size


# ----------------------------------------
# VALIDATION RESULT CLASSES
# ----------------------------------------
class ValidationResult:
    """Result of webcam frame validation."""
    
    def __init__(self, is_valid, validation_type, message, face_region=None, num_faces=0):
        """
        Args:
            is_valid (bool): Whether frame passed validation
            validation_type (str): Type of validation (e.g., 'brightness', 'blur', 'face_count')
            message (str): Human-readable validation message
            face_region (tuple): (x, y, w, h) of detected face, None if not valid
            num_faces (int): Number of faces detected
        """
        self.is_valid = is_valid
        self.validation_type = validation_type
        self.message = message
        self.face_region = face_region
        self.num_faces = num_faces
    
    def to_emotion_response(self):
        """Convert validation failure to emotion API response."""
        if self.validation_type == "brightness":
            return {
                "emotion": "Unknown",
                "suggestion": "Camera not clear. Please face the camera properly."
            }
        elif self.validation_type == "blur":
            return {
                "emotion": "Unknown",
                "suggestion": "Camera not clear. Please face the camera properly."
            }
        elif self.validation_type == "no_face":
            return {
                "emotion": "Unknown",
                "suggestion": "No face detected. Please stay in front of the camera."
            }
        elif self.validation_type == "multiple_faces":
            return {
                "emotion": "Multi faces",
                "suggestion": "Multiple faces detected. Please ensure only one person is visible."
            }
        else:
            return {
                "emotion": "Unknown",
                "suggestion": "Camera not clear. Please face the camera properly."
            }


# ----------------------------------------
# BRIGHTNESS VALIDATION
# ----------------------------------------
def is_frame_too_dark_or_bright(frame):
    """
    Check if frame is too dark or too bright.
    
    Args:
        frame (np.ndarray): BGR OpenCV frame
    
    Returns:
        bool: True if frame is too dark/bright, False if acceptable
    """
    if frame is None:
        return True
    
    # Convert to grayscale for brightness analysis
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)
    
    # Check if too dark or too bright
    if brightness < BRIGHTNESS_THRESHOLD_LOW:
        return True  # Too dark
    if brightness > BRIGHTNESS_THRESHOLD_HIGH:
        return True  # Too bright/washed out
    
    return False


# ----------------------------------------
# BLUR DETECTION
# ----------------------------------------
def is_frame_blurred(frame):
    """
    Detect if frame is blurry using Laplacian variance method.
    
    Args:
        frame (np.ndarray): BGR OpenCV frame
    
    Returns:
        bool: True if frame is blurred, False if clear
    """
    if frame is None:
        return True
    
    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Calculate Laplacian variance (focus measure)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # If variance is below threshold, image is blurry
    if laplacian_var < BLUR_THRESHOLD:
        return True  # Blurred
    
    return False


# ----------------------------------------
# FACE DETECTION
# ----------------------------------------
def detect_faces(frame):
    """
    Detect faces in frame using Haar Cascade classifier.
    
    Args:
        frame (np.ndarray): BGR OpenCV frame
    
    Returns:
        list: List of detected faces as (x, y, w, h) tuples
    """
    if frame is None:
        return []
    
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)
        
        # Detect faces with reasonable parameters
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(FACE_MIN_SIZE, FACE_MIN_SIZE),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        return list(faces) if len(faces) > 0 else []
    
    except Exception as e:
        print(f"[webcam_validator] Face detection error: {e}")
        return []


# ----------------------------------------
# FACE REGION EXTRACTION
# ----------------------------------------
def extract_largest_face(frame, faces):
    """
    Extract the largest detected face region from frame.
    
    Args:
        frame (np.ndarray): BGR OpenCV frame
        faces (list): List of detected faces as (x, y, w, h) tuples
    
    Returns:
        np.ndarray: Cropped face region (grayscale), or None if no faces
    """
    if not faces or frame is None:
        return None
    
    try:
        # Sort by face area (width * height) and get largest
        largest_face = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)[0]
        x, y, w, h = largest_face
        
        # Convert to grayscale and crop
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        face_region = gray[y:y+h, x:x+w]
        
        return face_region
    
    except Exception as e:
        print(f"[webcam_validator] Face extraction error: {e}")
        return None


# ----------------------------------------
# COMPREHENSIVE VALIDATION
# ----------------------------------------
def validate_webcam_frame(frame):
    """
    Perform comprehensive validation on webcam frame.
    
    Checks in order:
    1. Brightness (too dark/bright)
    2. Blur detection
    3. Face detection count (0, 1, or >1)
    
    Args:
        frame (np.ndarray): BGR OpenCV frame
    
    Returns:
        ValidationResult: Result object with validation status and details
    """
    if frame is None:
        return ValidationResult(
            False, "invalid_frame", "Frame is None", None, 0
        )
    
    # Check 1: Brightness
    if is_frame_too_dark_or_bright(frame):
        return ValidationResult(
            False, "brightness", "Frame is too dark or too bright", None, 0
        )
    
    # Check 2: Blur
    if is_frame_blurred(frame):
        return ValidationResult(
            False, "blur", "Frame is too blurred", None, 0
        )
    
    # Check 3: Face detection
    faces = detect_faces(frame)
    num_faces = len(faces)
    
    if num_faces == 0:
        return ValidationResult(
            False, "no_face", "No face detected in frame", None, 0
        )
    
    if num_faces > 1:
        return ValidationResult(
            False, "multiple_faces", "Multiple faces detected", None, num_faces
        )
    
    # Check 4: Extract face region
    face_region = extract_largest_face(frame, faces)
    if face_region is None:
        return ValidationResult(
            False, "face_extraction", "Failed to extract face region", None, 1
        )
    
    # Validation passed: single face detected and extracted
    x, y, w, h = faces[0]
    return ValidationResult(
        True, "valid", "Valid single face detected", 
        face_region=face_region,
        num_faces=1
    )
