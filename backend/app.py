from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, EmotionLog
import base64
import numpy as np
import cv2
from utils.emotion_mapper import get_suggestion
from model.emotion_model import predict_emotion
from datetime import datetime

# ----------------------------------------
# APP INITIALIZATION
# ----------------------------------------
app = Flask(__name__)
CORS(app)

# ----------------------------------------
# DATABASE CONFIG
# ----------------------------------------
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

    if email == "student@lbe.com" and password == "1234":
        return jsonify({
            "success": True,
            "username": "Student",
            "token": "dummy-jwt-token"
        })

    return jsonify({"success": False, "message": "Invalid credentials"}), 401

# ----------------------------------------
# EMOTION DETECTION API (FINAL)
# ----------------------------------------
@app.route("/api/emotion", methods=["POST"])
def emotion_detection():
    data = request.json
    image_base64 = data.get("image")

    if not image_base64:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_base64.split(",")[1])
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Predict emotion from model
        raw_emotion = predict_emotion(frame)
        print("MODEL OUTPUT:", raw_emotion)

        # ----------------------------------------
        # DERIVED EMOTION LOGIC (IMPORTANT)
        # ----------------------------------------
        emotion = raw_emotion.lower()

        if emotion == "neutral":
            emotion = "Bored"
        else:
            emotion = emotion.capitalize()

        print("FINAL EMOTION SENT TO UI:", emotion)

        # Get suggestion
        suggestion = get_suggestion(emotion)

        # Save to database
        log = EmotionLog(
            emotion=emotion,
            timestamp=datetime.now()
        )
        db.session.add(log)
        db.session.commit()

        return jsonify({
            "emotion": emotion,
            "suggestion": suggestion
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------------------
# COURSE LIST API
# ----------------------------------------
@app.route("/api/courses", methods=["GET"])
def courses():
    return jsonify([
        {
            "id": 1,
            "title": "Python Basics",
            "description": "Learn Python from scratch"
        },
        {
            "id": 2,
            "title": "Machine Learning",
            "description": "Introduction to ML concepts"
        },
        {
            "id": 3,
            "title": "Web Development",
            "description": "HTML, CSS, JavaScript & React"
        }
    ])

# ----------------------------------------
# ANALYTICS API
# ----------------------------------------
@app.route("/api/analytics", methods=["GET"])
def analytics():
    emotions = db.session.query(
        EmotionLog.emotion,
        db.func.count(EmotionLog.emotion)
    ).group_by(EmotionLog.emotion).all()

    return jsonify({emotion: count for emotion, count in emotions})

# ----------------------------------------
# RUN SERVER
# ----------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
