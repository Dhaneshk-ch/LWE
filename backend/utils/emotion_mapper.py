def get_suggestion(emotion):
    suggestions = {
        "Happy": "Great! Try a quiz to test your knowledge.",
        "Neutral": "Continue learning at your pace.",
        "Confused": "Here is a simplified explanation for you.",
        "Sad": "Take a short break or watch a motivational video.",
        "Frustrated": "Relax for 2 minutes, then try again.",
        "Bored": "Let’s try an interactive activity!",
        "Anxiety": "Slow down. Focus on basics and breathe."
    }

    return suggestions.get(emotion, "Keep learning!")
