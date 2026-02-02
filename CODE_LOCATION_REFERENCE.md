# Code Location Reference

## Quick File Locations

### Core Implementation Files

**1. NEW FILE: backend/utils/webcam_validator.py**
- Lines 1-9: Module docstring and imports
- Lines 13-16: Configuration thresholds (EDITABLE)
- Lines 20-41: ValidationResult class
- Lines 45-61: `is_frame_too_dark_or_bright()` function
- Lines 65-81: `is_frame_blurred()` function
- Lines 85-107: `detect_faces()` function
- Lines 111-133: `extract_largest_face()` function
- Lines 137-200: `validate_webcam_frame()` function

**2. MODIFIED FILE: backend/model/emotion_model.py**
- Lines 1-9: Imports (UPDATED - added validation imports)
- Lines 60-82: `preprocess_frame_with_face()` (NEW function)
- Lines 180-289: `predict_emotion()` (MODIFIED - added validation logic)

**3. MODIFIED FILE: backend/app.py**
- Lines 57-120: `emotion_detection()` endpoint (MODIFIED)
  - Lines 73-76: Validation result check
  - Lines 78-84: "Unknown" emotion handling
  - Lines 86-92: "Multi faces" emotion handling
  - Lines 94-120: Database save logic

---

## Validation Function Locations

### In webcam_validator.py

**Brightness Check**
```python
def is_frame_too_dark_or_bright(frame):  # Lines 45-61
    # Returns True if too dark (< 30) or too bright (> 220)
```

**Blur Detection**
```python
def is_frame_blurred(frame):  # Lines 65-81
    # Returns True if Laplacian variance < 100
```

**Face Detection**
```python
def detect_faces(frame):  # Lines 85-107
    # Returns list of (x, y, w, h) tuples
```

**Face Extraction**
```python
def extract_largest_face(frame, faces):  # Lines 111-133
    # Returns grayscale cropped face region
```

**Complete Validation**
```python
def validate_webcam_frame(frame):  # Lines 137-200
    # Returns ValidationResult object with all details
```

---

## Integration Points

### emotion_model.py → webcam_validator.py
**Location**: Lines 1-9 (imports)
```python
from utils.webcam_validator import validate_webcam_frame, ValidationResult
```

**Usage**: Lines 180-195 (predict_emotion function)
```python
validation = validate_webcam_frame(frame)
if not validation.is_valid:
    return "Unknown" or "Multi faces"
```

### app.py → emotion_model.py
**Location**: Line 70 (emotion_model.py import)
```python
from model.emotion_model import predict_emotion
```

**Usage**: Line 73 (emotion_detection endpoint)
```python
raw_emotion = predict_emotion(frame)
```

### Response Handling
**Lines 73-92** (app.py)
```python
# Check if validation failed
if raw_emotion == "Unknown":
    return jsonify({...})  # Lines 75-78

if raw_emotion == "Multi faces":
    return jsonify({...})  # Lines 80-83
```

---

## Configuration Locations

### Brightness Thresholds
**File**: backend/utils/webcam_validator.py
**Lines**: 25-26
```python
BRIGHTNESS_THRESHOLD_LOW = 30       # Line 25
BRIGHTNESS_THRESHOLD_HIGH = 220     # Line 26
```

### Blur Threshold
**File**: backend/utils/webcam_validator.py
**Line**: 27
```python
BLUR_THRESHOLD = 100                # Line 27
```

### Face Size Threshold
**File**: backend/utils/webcam_validator.py
**Line**: 28
```python
FACE_MIN_SIZE = 48                  # Line 28
```

### Smoothing Window
**File**: backend/model/emotion_model.py
**Line**: 18
```python
SMOOTHING_WINDOW = 3                # Line 18
```

---

## Key Constants

### Validation Result Types
- `"brightness"` - Too dark/bright
- `"blur"` - Blurred frame
- `"no_face"` - No faces detected
- `"multiple_faces"` - Multiple faces detected
- `"valid"` - Passed all validation

### Return Emotions
- `"Unknown"` - Validation failed (quality issue)
- `"Multi faces"` - Multiple faces detected
- Valid emotions: `"Happy"`, `"Sad"`, `"Neutral"`, etc.

---

## API Response Structure

### SUCCESS (Valid Emotion)
**Location**: app.py lines 113-118
```python
return jsonify({
    "emotion": emotion,
    "suggestion": suggestion
})
```

### VALIDATION FAILURE (Unknown)
**Location**: app.py lines 75-78
```python
return jsonify({
    "emotion": "Unknown",
    "suggestion": "Camera not clear. Please face the camera properly."
})
```

### VALIDATION FAILURE (Multiple Faces)
**Location**: app.py lines 80-83
```python
return jsonify({
    "emotion": "Multi faces",
    "suggestion": "Multiple faces detected. Please ensure only one person is visible."
})
```

---

## Database Operations

### Save Valid Emotion
**Location**: app.py lines 107-112
```python
log = EmotionLog(
    emotion=emotion,
    timestamp=datetime.now()
)
db.session.add(log)
db.session.commit()
```

### Skip Invalid Emotions
**Logic**: Lines 73-92 in app.py
- If raw_emotion == "Unknown" → return immediately (no DB save)
- If raw_emotion == "Multi faces" → return immediately (no DB save)
- Otherwise → Continue to DB save

---

## Testing Entry Points

### Frontend API Call
**File**: src/components/WebcamBox.jsx
**Endpoint**: POST /api/emotion
**Request**: `{ image: base64_string }`
**Response**: `{ emotion: string, suggestion: string }`

### Backend Testing
**Entry Point**: app.py `/api/emotion` endpoint
**Pre-validation**: emotion_model.py `predict_emotion()`
**Actual validation**: webcam_validator.py `validate_webcam_frame()`

---

## Error Handling

### Try-Except Blocks

**File**: webcam_validator.py
- Face detection try-except: Lines 96-104
- Face extraction try-except: Lines 120-131

**File**: emotion_model.py
- Model loading: Lines 37-50
- Model inference: Lines 196-240
- Preprocessing: Lines 74-82

**File**: app.py
- Main endpoint: Lines 71-120
- Exception handler: Lines 119-120

---

## Class Definitions

### ValidationResult Class
**Location**: webcam_validator.py lines 20-41
**Attributes**:
- `is_valid: bool`
- `validation_type: str`
- `message: str`
- `face_region: np.ndarray`
- `num_faces: int`

**Methods**:
- `__init__()`: Lines 22-31
- `to_emotion_response()`: Lines 33-41

---

## Imports Summary

### webcam_validator.py
```python
import cv2                          # Line 10
import numpy as np                  # Line 11
```

### emotion_model.py
```python
import os                           # Line 1
import sys                          # Line 2
import cv2                          # Line 3
import numpy as np                  # Line 4
from utils.webcam_validator import (  # Lines 7-8
    validate_webcam_frame, ValidationResult
)
import tensorflow as tf             # Line 11 (try)
```

### app.py
```python
from flask import Flask, request, jsonify  # Line 1
from flask_cors import CORS               # Line 2
from models import db, EmotionLog         # Line 3
import base64                             # Line 4
import numpy as np                        # Line 5
import cv2                                # Line 6
from utils.emotion_mapper import get_suggestion  # Line 7
from model.emotion_model import predict_emotion # Line 8
from datetime import datetime              # Line 9
```

---

## Deployment File List

1. **backend/utils/webcam_validator.py** (270 lines) - NEW
2. **backend/model/emotion_model.py** (289 lines) - MODIFIED
3. **backend/app.py** (168 lines) - MODIFIED
4. **backend/requirements.txt** - NO CHANGE (opencv-python already present)

---

## Quick Navigation

### To understand validation logic:
→ Read `backend/utils/webcam_validator.py` lines 137-200 (`validate_webcam_frame()`)

### To understand model integration:
→ Read `backend/model/emotion_model.py` lines 180-289 (`predict_emotion()`)

### To understand API response:
→ Read `backend/app.py` lines 73-120 (`emotion_detection()`)

### To adjust thresholds:
→ Edit `backend/utils/webcam_validator.py` lines 25-28

### To see response structure:
→ Check `backend/utils/webcam_validator.py` lines 33-41 (`to_emotion_response()`)

---

## All Changes Summary

| File | Type | Lines | Changes |
|------|------|-------|---------|
| webcam_validator.py | NEW | 270 | Complete validation module |
| emotion_model.py | MODIFIED | 289 | Added imports + 2 functions |
| app.py | MODIFIED | 168 | Updated emotion_detection() |
| requirements.txt | NONE | - | No changes needed |

**Total New Lines**: ~270
**Total Modified Lines**: ~40
**Files Changed**: 3
**Breaking Changes**: 0
**API Contract Changes**: 0
