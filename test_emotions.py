"""
Test script to verify the new probability-based emotion prediction works correctly.
Sends multiple frame requests to test diversity and smoothing.
"""
import requests
import cv2
import numpy as np
import base64
import time

# Server endpoint
API_URL = "http://127.0.0.1:5000/api/emotion"

def create_test_frame(seed=None):
    """Create a random test frame (grayscale face-like data)"""
    if seed is not None:
        np.random.seed(seed)
    
    # Create random 480x640 frame
    frame = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
    return frame

def frame_to_base64(frame):
    """Convert frame to base64 JPEG for API"""
    _, jpeg = cv2.imencode('.jpg', frame)
    base64_frame = base64.b64encode(jpeg).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_frame}"

def test_emotion_diversity():
    """Send 10 consecutive frames and check that emotions vary"""
    print("\n" + "="*70)
    print("TESTING EMOTION DIVERSITY")
    print("="*70)
    
    emotions = []
    
    for i in range(10):
        try:
            # Create a frame with slight variation
            frame = create_test_frame(seed=i)
            
            # Convert to base64
            payload = {"image": frame_to_base64(frame)}
            
            # Send request
            response = requests.post(API_URL, json=payload, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                emotion = data.get("emotion", "Unknown")
                emotions.append(emotion)
                
                print(f"  Frame {i+1:2d} → Emotion: {emotion:12s}")
            else:
                print(f"  Frame {i+1:2d} → ERROR: {response.status_code}")
        
        except Exception as e:
            print(f"  Frame {i+1:2d} → Exception: {e}")
        
        time.sleep(0.3)  # Small delay between requests
    
    # Analysis
    unique_emotions = set(emotions)
    print(f"\n{'Summary':^70}")
    print(f"Total frames: {len(emotions)}")
    print(f"Unique emotions: {len(unique_emotions)}")
    print(f"Emotions seen: {', '.join(sorted(unique_emotions))}")
    print(f"Emotion counts: {dict([(e, emotions.count(e)) for e in unique_emotions])}")
    
    if len(unique_emotions) > 1:
        print("✓ PASS: Multiple different emotions detected!")
    else:
        print("⚠ FAIL: Only one emotion detected. Diversification may not be working.")

def test_model_loading():
    """Test that server is responsive"""
    print("\n" + "="*70)
    print("TESTING SERVER CONNECTION")
    print("="*70)
    
    try:
        frame = create_test_frame(seed=42)
        payload = {"image": frame_to_base64(frame)}
        response = requests.post(API_URL, json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Server responding correctly")
            print(f"  Response: {data}")
            return True
        else:
            print(f"✗ Server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("\n🧪 EMOTION PREDICTION TESTS")
    
    # Test 1: Server connection
    if not test_model_loading():
        print("\n⚠ Server not responding. Make sure Flask app is running.")
        exit(1)
    
    # Test 2: Emotion diversity
    test_emotion_diversity()
    
    print("\n" + "="*70)
    print("✓ Tests complete! Check server logs for prediction details.")
    print("="*70)
