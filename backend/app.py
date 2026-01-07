from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, EmotionLog
import base64
import numpy as np
import cv2
from utils.emotion_mapper import get_suggestion
from model.emotion_model import predict_emotion
import random
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
    data = request.json
    image_base64 = data.get("image")

    if not image_base64:
        return jsonify({"error": "No image provided"}), 400

    # Decode image (already in your project)
    import base64, cv2, numpy as np
    image_bytes = base64.b64decode(image_base64.split(",")[1])
    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    emotion = predict_emotion(frame)
    suggestion = get_suggestion(emotion)

    # 🔥 SAVE TO DATABASE
    log = EmotionLog(emotion=emotion)
    db.session.add(log)
    db.session.commit()

    return jsonify({
        "emotion": emotion,
        "suggestion": suggestion
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
@app.route("/api/analytics", methods=["GET"])
def analytics():
    emotions = db.session.query(
        EmotionLog.emotion,
        db.func.count(EmotionLog.emotion)
    ).group_by(EmotionLog.emotion).all()

    result = {emotion: count for emotion, count in emotions}
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)

    
@app.route("/api/emotion", methods=["POST"])
def detect_emotion():
    emotions = ["Happy", "Neutral", "Confused", "Bored", "Frustrated"]
    emotion = random.choice(emotions)

    suggestions = {
        "Happy": "Great! Keep learning or try a quiz.",
        "Neutral": "Stay focused and continue learning.",
        "Confused": "Try revisiting the topic with a simpler explanation.",
        "Bored": "Let’s switch to an interactive activity.",
        "Frustrated": "Take a short break and come back refreshed."
    }

    # save emotion to DB if you want
    db.session.add(
        EmotionLog(
            emotion=emotion,
            timestamp=datetime.now()
        )
    )
    db.session.commit()

    return jsonify({
        "emotion": emotion,
        "suggestion": suggestions[emotion]
    })