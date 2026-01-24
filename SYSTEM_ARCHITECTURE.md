# System Architecture - TensorFlow Emotion Detection

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                          │
│                                                                 │
│  User enables webcam → Frame captured → Base64 encoded          │
│                                  │                              │
│                                  ▼                              │
│                      POST /api/emotion                          │
│                      {"image": "base64..."}                     │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   FLASK BACKEND (app.py)    │
                    │                              │
                    │  1. Receive request          │
                    │  2. Decode base64 image      │
                    │  3. Validate image           │
                    │  4. Call predict_emotion()   │
                    │  5. Get suggestion           │
                    │  6. Save to database         │
                    │  7. Return JSON response     │
                    └──────────┬───────────────────┘
                               │
                ┌──────────────▼──────────────────┐
                │  EMOTION MODEL (emotion_model.py) │
                │                                  │
                │  predict_emotion(frame):         │
                │    ├─ Preprocess frame           │
                │    │  ├─ BGR → Grayscale        │
                │    │  ├─ Resize to 48x48        │
                │    │  ├─ Normalize [0,1]        │
                │    │  └─ Expand dims            │
                │    │                             │
                │    ├─ TensorFlow Inference      │
                │    │  └─ SavedModel call        │
                │    │                             │
                │    ├─ Map output                │
                │    │  └─ Class idx → emotion   │
                │    │                             │
                │    ├─ Smooth prediction         │
                │    │  └─ Last 5 frames → avg   │
                │    │                             │
                │    └─ Return emotion            │
                └──────────┬───────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌───────────┐  ┌──────────────┐  ┌───────────────────┐
    │ DATABASE  │  │ SUGGESTIONS  │  │ TENSORFLOW MODEL  │
    │           │  │ (emotion_    │  │                   │
    │ emotion_  │  │  mapper.py)  │  │ emotion_model_tf/ │
    │ data.db   │  │              │  │                   │
    │           │  │ Happy →      │  │ • saved_model.pb  │
    │ Store:    │  │ "Try quiz"   │  │ • variables/      │
    │ - Emotion │  │              │  │ • assets/         │
    │ - Time    │  │ Sad →        │  │                   │
    │ - ID      │  │ "Take break" │  │ Input: (1,48,48,1)│
    │           │  │              │  │ Output: (1, 7)    │
    └───────────┘  │ etc...       │  │                   │
                   └──────────────┘  └───────────────────┘
        │
        ▼
    ┌──────────────┐
    │  ANALYTICS   │
    │  /api/       │
    │  analytics   │
    │              │
    │ Happy: 65    │
    │ Sad: 42      │
    │ Neutral: 38  │
    └──────────────┘
        │
        ▼
┌──────────────────────────────────┐
│     REACT DASHBOARD              │
│   Shows emotion distribution     │
│   and learning insights          │
└──────────────────────────────────┘
```

---

## Component Interactions

```
┌────────────────────────────────────────────────────────────────┐
│                        Flask Application                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  app.py                                                        │
│  ├─ @app.route("/api/emotion")                              │
│  │  └─ emotion_detection()                                  │
│  │     ├─ Receive base64 image                              │
│  │     ├─ Validate & decode                                 │
│  │     └─ Call predict_emotion(frame)  ──────┐              │
│  │                                           │              │
│  │  Get suggestion  ◄─────────────────────────┼─┐           │
│  │  ├─ Call get_suggestion(emotion)           │ │           │
│  │  └─ Return suggestion string               │ │           │
│  │                                            │ │           │
│  │  Save to database                          │ │           │
│  │  ├─ Create EmotionLog entry                │ │           │
│  │  ├─ Set emotion field                      │ │           │
│  │  ├─ Set timestamp field                    │ │           │
│  │  └─ db.session.commit()                    │ │           │
│  │                                            │ │           │
│  │  Return JSON response                      │ │           │
│  │  └─ {"emotion": "...", "suggestion": "..."}  │ │        │
│  │                                            │ │           │
│  │                            emotion_model.py │           │
│  │                            ─────────────────┘           │
│  │                                      │                  │
│  │  Emotion Model Module                │                  │
│  │  ├─ EMOTION_MODEL                    │                  │
│  │  │  (TensorFlow SavedModel, loaded   │                  │
│  │  │   once at module import)          │                  │
│  │  │                                   │                  │
│  │  ├─ preprocess_frame(frame)          │                  │
│  │  │  ├─ cv2.cvtColor()                │                  │
│  │  │  ├─ cv2.resize()                  │                  │
│  │  │  ├─ Normalize values              │                  │
│  │  │  └─ np.expand_dims()              │                  │
│  │  │                                   │                  │
│  │  ├─ predict_emotion(frame)  ◄────────┘                  │
│  │  │  ├─ Call preprocess_frame()                          │
│  │  │  ├─ Model inference                                  │
│  │  │  ├─ Get predictions                                  │
│  │  │  ├─ Update EMOTION_HISTORY                           │
│  │  │  ├─ Call smooth_emotion_prediction()                 │
│  │  │  └─ Return emotion string                            │
│  │  │                                                       │
│  │  ├─ smooth_emotion_prediction()                         │
│  │  │  ├─ Analyze EMOTION_HISTORY                          │
│  │  │  ├─ Count emotions                                   │
│  │  │  ├─ Average confidence                               │
│  │  │  └─ Return best emotion                              │
│  │  │                                                       │
│  │  └─ EMOTION_HISTORY (global state)                      │
│  │     (Stores last 5 predictions)                         │
│  │                                                          │
│  │                                                          │
│  │  utils/emotion_mapper.py                                │
│  │  └─ get_suggestion(emotion)  ◄──┐                      │
│  │     ├─ Look up emotion          │                      │
│  │     ├─ Return suggestion string │                      │
│  │     └─ Default fallback if key  │                      │
│  │        not found                │                      │
│  │        (returns "Keep learning!")                      │
│  │                                                          │
│  └────────────────────────────────────────────────────────│
│                                                            │
│  models.py                                                │
│  ├─ db = SQLAlchemy()                                    │
│  └─ EmotionLog                                           │
│     ├─ id (primary key)                                  │
│     ├─ emotion (string)                                  │
│     └─ timestamp (datetime)                              │
│                                                           │
└────────────────────────────────────────────────────────────┘

                          ▼

┌────────────────────────────────────────────────────────────┐
│                    SQLite Database                        │
│              emotion_data.db                              │
│                                                          │
│  emotion_log table:                                      │
│  ┌────┬─────────────┬──────────────────────────┐        │
│  │ id │   emotion   │      timestamp           │        │
│  ├────┼─────────────┼──────────────────────────┤        │
│  │ 1  │ Neutral     │ 2026-01-21 16:03:06.134 │        │
│  │ 2  │ Happy       │ 2026-01-21 16:03:06.182 │        │
│  │ 3  │ Happy       │ 2026-01-21 16:03:06.234 │        │
│  │... │    ...      │         ...              │        │
│  └────┴─────────────┴──────────────────────────┘        │
│                                                          │
│  Analytics Query:                                       │
│  SELECT emotion, COUNT(*) FROM emotion_log              │
│  GROUP BY emotion                                       │
│                                                          │
│  Result: {"Happy": 65, "Sad": 42, ...}                 │
│                                                          │
└────────────────────────────────────────────────────────────┘
```

---

## Request/Response Cycle

```
STEP 1: CLIENT SENDS REQUEST
├─ Browser: GET http://localhost:3000
├─ React loads
├─ User clicks "Detect Emotion"
├─ Permission request for camera
└─ Camera stream starts

STEP 2: FRAME CAPTURE
├─ RequestAnimationFrame loop
├─ Capture frame from canvas
├─ Convert to base64
└─ Every ~100ms: POST to /api/emotion

STEP 3: SERVER RECEIVES REQUEST
├─ Flask receives POST /api/emotion
├─ Extract base64 from JSON body
├─ Validate format
└─ Check for empty/null values

STEP 4: IMAGE DECODING
├─ Split data URI if needed: data:image/jpeg;base64,...
├─ base64.b64decode()
├─ Convert bytes to numpy array
├─ cv2.imdecode() → BGR frame
└─ Validate shape and content

STEP 5: PREPROCESSING
├─ preprocess_frame(frame)
├─ cv2.cvtColor(BGR → GRAY): (480, 640, 3) → (480, 640)
├─ cv2.resize(): (480, 640) → (48, 48)
├─ Normalize: [0, 255] → [0, 1]
├─ expand_dims: (48, 48) → (48, 48, 1)
├─ expand_dims: (48, 48, 1) → (1, 48, 48, 1)
└─ tf.constant(): Convert to tensor

STEP 6: MODEL INFERENCE
├─ EMOTION_MODEL.signatures['serving_default']
├─ model(input_tensor) → output_tensor
├─ Output shape: (1, 7) = 7 emotion classes
├─ Values: [0.01, 0.05, 0.08, 0.65, 0.10, 0.09, 0.02]
└─ np.argmax() → 3 (Happy class)

STEP 7: MAPPING
├─ Class 3 → FALLBACK_MAPPING[3] → "Happy"
├─ Append to EMOTION_HISTORY: ("Happy", 0.65)
├─ Keep only last 5 entries
└─ smooth_emotion_prediction()

STEP 8: SMOOTHING
├─ Count occurrences:
│  - "Happy": 4 times (confidence avg 0.72)
│  - "Neutral": 1 time (confidence 0.45)
├─ Select: "Happy" (highest count + avg confidence)
└─ Update LAST_KNOWN_EMOTION = "Happy"

STEP 9: SUGGESTION LOOKUP
├─ get_suggestion("Happy")
├─ Look up in SUGGESTIONS dict
└─ Return: "Great! Try a quiz to test your knowledge."

STEP 10: DATABASE STORAGE
├─ Create EmotionLog(emotion="Happy", timestamp=now())
├─ db.session.add(log)
├─ db.session.commit()
└─ Record saved

STEP 11: RESPONSE SENT
├─ Return JSON:
│  {
│    "emotion": "Happy",
│    "suggestion": "Great! Try a quiz..."
│  }
├─ Status 200 OK
└─ Send to React

STEP 12: CLIENT DISPLAYS
├─ React receives response
├─ Update emotion state
├─ Display emotion label
├─ Show suggestion message
├─ Update analytics chart
└─ Loop back to STEP 2 for next frame
```

---

## State Management

```
GLOBAL STATE (emotion_model.py)

EMOTION_MODEL
└─ TensorFlow SavedModel instance
   ├─ Loaded at import time
   ├─ Stays in memory for entire session
   ├─ Contains model architecture + weights
   └─ Signature: serving_default

EMOTION_HISTORY (list of tuples)
├─ Max length: 5
├─ Format: [("Happy", 0.85), ("Happy", 0.91), ...]
├─ Updated every prediction
├─ Used for smoothing
└─ Example size: 5 entries × 2 values = 10 floats

LAST_KNOWN_EMOTION (string)
├─ Default: "Neutral"
├─ Updated after each prediction
├─ Used as fallback if inference fails
└─ Example: "Happy"

EMOTION_MAPPING (dict)
├─ Static mapping
├─ 7 classes → 7 emotions
└─ Not modified during runtime

FALLBACK_MAPPING (dict)
├─ Class index → emotion string
├─ Used for inference output mapping
├─ Example: {0: "Frustrated", 1: "Frustrated", ...}
└─ Not modified during runtime
```

---

## Error Handling Flow

```
Request received
    │
    ├─ No image? ─→ Return 400 error
    │
    ├─ Invalid base64? ─────┐
    │                      │
    ├─ Decode fails? ───────┤
    │                      │
    ├─ Frame is None? ──────┤
    │                      │
    ├─ Model not loaded? ───┤
    │                      │
    ├─ Inference error? ────┤
    │                      ▼
    │           Set emotion = LAST_KNOWN_EMOTION
    │           If none, emotion = "Neutral"
    │
    ├─ Always return valid emotion
    │
    └─ Get suggestion + return JSON
```

---

## Performance Timeline

```
Request arrives (t=0ms)
    │
    ├─ Parse JSON: 1-2ms
    ├─ Decode base64: 5-10ms
    ├─ Create numpy array: 1ms
    │
    ├─ BGR→Gray conversion: 10-15ms
    ├─ Resize to 48x48: 5-10ms
    ├─ Normalize: 1-2ms
    ├─ Expand dims: <1ms
    │
    ├─ Create tensor: 1-2ms
    ├─ Model inference: 50-100ms  ← Most time
    ├─ Get argmax: <1ms
    │
    ├─ Update history: <1ms
    ├─ Smooth prediction: <1ms
    │
    ├─ Database query: 5-10ms
    ├─ Database insert: 5-10ms
    │
    ├─ JSON serialization: 1ms
    │
    └─ Response sent (t=100-200ms total)
    
First inference is slower (~500ms) due to TensorFlow JIT compilation
Subsequent inferences are ~150-200ms
```

---

## Supported Emotions Mapping

```
Model Outputs (7 classes)
        │
        ├─ Class 0: Angry       ─→ FRUSTRATED
        │
        ├─ Class 1: Disgust     ─→ FRUSTRATED
        │
        ├─ Class 2: Fear        ─→ ANXIETY
        │
        ├─ Class 3: Happy       ─→ HAPPY
        │
        ├─ Class 4: Neutral     ─→ NEUTRAL
        │
        ├─ Class 5: Sad         ─→ SAD
        │
        └─ Class 6: Surprise    ─→ NEUTRAL
        
App Emotions (7 emotions)
        │
        ├─ Happy
        ├─ Neutral
        ├─ Confused
        ├─ Sad
        ├─ Frustrated
        ├─ Bored
        └─ Anxiety

Note: "Confused" and "Bored" are mapped via logic
or can be implemented through separate detection
```

---

## Summary

This architecture ensures:
- ✓ Real-time emotion detection
- ✓ Robust error handling  
- ✓ Smooth predictions
- ✓ Persistent data storage
- ✓ Scalable database
- ✓ Clean separation of concerns
- ✓ Full backward compatibility
