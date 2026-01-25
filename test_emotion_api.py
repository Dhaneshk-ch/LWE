"""
Test script to validate emotion prediction API
"""
import requests
import base64
import cv2
import numpy as np
from datetime import datetime

BASE_URL = "http://127.0.0.1:5000"

def test_emotion_prediction():
    """Test emotion prediction endpoint"""
    print("\n" + "="*60)
    print("Testing Emotion Prediction API")
    print("="*60)
    
    # Create a test image (neutral gray placeholder)
    test_image = np.full((480, 640, 3), 128, dtype=np.uint8)
    
    # Encode to base64
    _, buffer = cv2.imencode('.jpg', test_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Test 1: Send image and check response
    print("\n[Test 1] Sending neutral gray image to /api/emotion...")
    payload = {"image": image_base64}
    
    try:
        response = requests.post(f"{BASE_URL}/api/emotion", json=payload, timeout=5)
        print(f"Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            emotion = data.get("emotion")
            suggestion = data.get("suggestion")
            
            print(f"✓ Emotion: {emotion}")
            print(f"✓ Suggestion: {suggestion}")
            
            # Validate emotion is in expected set
            valid_emotions = {"Happy", "Neutral", "Confused", "Sad", "Frustrated", "Bored", "Anxiety"}
            if emotion in valid_emotions:
                print(f"✓ Emotion is valid: {emotion}")
            else:
                print(f"✗ Emotion '{emotion}' NOT in valid set: {valid_emotions}")
                
            if suggestion and suggestion != "Keep learning!":
                print(f"✓ Suggestion mapping works")
            else:
                print(f"✗ Suggestion missing or unmapped")
        else:
            print(f"✗ Error: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"✗ Request failed: {e}")
    
    # Test 2: Test with None/missing image (fallback)
    print("\n[Test 2] Sending empty/invalid base64 to /api/emotion...")
    payload = {"image": ""}
    
    try:
        response = requests.post(f"{BASE_URL}/api/emotion", json=payload, timeout=5)
        if response.status_code >= 400:
            print(f"✓ Correctly rejected empty image: {response.status_code}")
        else:
            data = response.json()
            emotion = data.get("emotion")
            print(f"✓ Returned emotion on fallback: {emotion}")
    except requests.exceptions.RequestException as e:
        print(f"Request result: {e}")
    
    # Test 3: Multiple calls to check variation
    print("\n[Test 3] Multiple predictions to check for variation...")
    emotions = []
    for i in range(5):
        test_image = np.full((480, 640, 3), 100 + i*20, dtype=np.uint8)  # Vary brightness
        _, buffer = cv2.imencode('.jpg', test_image)
        image_base64 = base64.b64encode(buffer).decode('utf-8')
        
        payload = {"image": image_base64}
        try:
            response = requests.post(f"{BASE_URL}/api/emotion", json=payload, timeout=5)
            if response.status_code == 200:
                emotion = response.json().get("emotion")
                emotions.append(emotion)
                print(f"  Call {i+1}: {emotion}")
        except:
            pass
    
    if len(set(emotions)) > 1:
        print(f"✓ Predictions vary: {set(emotions)}")
    elif len(emotions) > 0:
        print(f"⚠ All predictions returned: {emotions[0]} (may be expected for identical inputs)")
    
    print("\n" + "="*60)
    print("Test Complete")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_emotion_prediction()
