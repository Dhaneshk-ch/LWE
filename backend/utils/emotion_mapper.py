def get_suggestion(emotion):
    emotion = emotion.lower()

    # 🔥 SMART DERIVED EMOTIONS
    if emotion == "neutral":
        emotion = "bored"

    suggestions = {
        "happy": "You seem positive! Try a quiz.",
        "bored": "You seem disengaged. Try interactive games.",
        "sad": "Let’s review examples slowly.",
        "angry": "Take a short break and relax.",
        "fear": "Revisit basics with examples.",
        "surprise": "Explore more learning content."
    }

    return suggestions.get(emotion, "Continue learning at your pace.")
