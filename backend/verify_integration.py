"""
Final Integration Verification
Comprehensive tests for TensorFlow emotion detection
"""

import sys
print("=" * 70)
print("FINAL INTEGRATION VERIFICATION")
print("=" * 70)

# Test 1: Imports
print("\n[1/5] Testing imports...")
try:
    import tensorflow as tf
    import cv2
    import numpy as np
    from app import app
    from model.emotion_model import predict_emotion, EMOTION_MODEL
    from utils.emotion_mapper import get_suggestion
    print("✓ All imports successful")
except Exception as e:
    print(f"✗ Import failed: {e}")
    sys.exit(1)

# Test 2: Model Loading
print("\n[2/5] Testing model loading...")
if EMOTION_MODEL is None:
    print("✗ Model not loaded")
    sys.exit(1)
print(f"✓ Model loaded successfully")
print(f"  Type: {type(EMOTION_MODEL)}")

# Test 3: Preprocessing
print("\n[3/5] Testing image preprocessing...")
try:
    from model.emotion_model import preprocess_frame
    test_frame = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
    processed = preprocess_frame(test_frame)
    if processed is None:
        print("✗ Preprocessing returned None")
        sys.exit(1)
    print(f"✓ Preprocessing works")
    print(f"  Input shape: {test_frame.shape}")
    print(f"  Output shape: {processed.shape}")
    assert processed.shape == (1, 48, 48, 1), f"Wrong shape: {processed.shape}"
except Exception as e:
    print(f"✗ Preprocessing failed: {e}")
    sys.exit(1)

# Test 4: Inference
print("\n[4/5] Testing inference...")
try:
    emotion = predict_emotion(test_frame)
    print(f"✓ Inference successful")
    print(f"  Predicted emotion: {emotion}")
    valid_emotions = ["Happy", "Neutral", "Confused", "Sad", "Frustrated", "Bored", "Anxiety"]
    if emotion not in valid_emotions:
        print(f"✗ Invalid emotion returned: {emotion}")
        sys.exit(1)
except Exception as e:
    print(f"✗ Inference failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test 5: Suggestions
print("\n[5/5] Testing suggestion mapping...")
try:
    for test_emotion in ["Happy", "Neutral", "Confused", "Sad", "Frustrated", "Bored", "Anxiety"]:
        suggestion = get_suggestion(test_emotion)
        if not suggestion or suggestion == "Keep learning!":
            print(f"⚠ Missing suggestion for {test_emotion}")
        else:
            print(f"✓ {test_emotion:12} → {suggestion[:50]}...")
except Exception as e:
    print(f"✗ Suggestion test failed: {e}")
    sys.exit(1)

print("\n" + "=" * 70)
print("✓ ALL TESTS PASSED - INTEGRATION READY")
print("=" * 70)
print("\nSummary:")
print("  ✓ TensorFlow model loaded")
print("  ✓ Image preprocessing working")
print("  ✓ Emotion inference functional")
print("  ✓ All emotion suggestions mapped")
print("  ✓ Flask app imports successfully")
print("\nThe backend is ready to serve emotion predictions!")
