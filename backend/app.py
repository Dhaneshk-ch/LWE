from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, EmotionLog
import base64
import numpy as np
import cv2
from utils.emotion_mapper import get_suggestion
from model.emotion_model import predict_emotion
from datetime import datetime

app = Flask(__name__)
CORS(app)   # Allow React frontend access
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///emotion_data.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# ----------------------------------------
# TEST API
# ----------------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "LearnByEmotion Backend Running"})

# ----------------------------------------
# LOGIN API (Dummy Authentication)
# ----------------------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Dummy validation
    if email == "student@lbe.com" and password == "1234":
        return jsonify({
            "success": True,
            "username": "Student",
            "token": "dummy-jwt-token"
        })
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401


# ----------------------------------------
# EMOTION DETECTION API
# ----------------------------------------
@app.route("/api/emotion", methods=["POST"])
def emotion_detection():
    """
    Emotion detection endpoint using TensorFlow model.
    
    Accepts:
    - image: base64 encoded frame from webcam
    
    Returns:
    - emotion: Always one of [Happy, Neutral, Confused, Sad, Frustrated, Bored, Anxiety]
    - suggestion: Learning recommendation based on emotion
    """
    try:
        data = request.json
        image_base64 = data.get("image")

        if not image_base64:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 image
        try:
            # Handle both data:image/jpeg;base64,... and plain base64 formats
            if "," in image_base64:
                image_data = image_base64.split(",")[1]
            else:
                image_data = image_base64
            
            image_bytes = base64.b64decode(image_data)
            np_arr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            
            # Always run prediction; model handles None / placeholder frames
            emotion = predict_emotion(frame)
        except Exception as decode_error:
            print(f"⚠ Image decoding error: {decode_error}")
            # Let model handle missing/invalid frames deterministically
            emotion = predict_emotion(None)

        # Get suggestion based on emotion
        suggestion = get_suggestion(emotion)

        # Save to database
        log = EmotionLog(emotion=emotion, timestamp=datetime.utcnow())
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "emotion": emotion,
            "suggestion": suggestion
        })

    except Exception as e:
        print(f"⚠ Emotion detection error: {e}")
        return jsonify({
            "emotion": "Neutral",
            "suggestion": "Continue learning at your pace."
        })


# ----------------------------------------
# COURSE LIST API
# ----------------------------------------
@app.route("/api/courses", methods=["GET"])
def courses():
    course_list = [
        {
            "id": 1,
            "title": "Python Basics",
            "description": "Learn Python from scratch",
        },
        {
            "id": 2,
            "title": "Machine Learning",
            "description": "Introduction to ML concepts",
        },
        {
            "id": 3,
            "title": "Web Development",
            "description": "HTML, CSS, JavaScript & React",
        },
    ]
    return jsonify(course_list)


# ----------------------------------------
# ANALYTICS API
# ----------------------------------------
@app.route("/api/analytics", methods=["GET"])
def analytics():
    emotions = db.session.query(
        EmotionLog.emotion,
        db.func.count(EmotionLog.emotion)
    ).group_by(EmotionLog.emotion).all()

    result = {emotion: count for emotion, count in emotions}
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=False)
