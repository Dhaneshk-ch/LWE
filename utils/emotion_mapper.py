def get_suggestion(emotion):
    """Return a simple suggestion string for a given emotion."""
    suggestions = {
        "Happy": "Great! Keep learning or try a quiz.",
        "Neutral": "Stay focused and continue learning.",
        "Confused": "Try revisiting the topic with a simpler explanation.",
        "Bored": "Let’s switch to an interactive activity.",
        "Frustrated": "Take a short break and come back refreshed.",
        "Sad": "Take a short break and try a simpler example.",
        "Angry": "Step away for a moment and return calmer.",
        "Surprised": "Explore related challenges to deepen understanding."
    }
    return suggestions.get(emotion, "Keep going — you're doing fine!")
