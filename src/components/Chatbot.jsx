import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Chatbot.css";
import SuggestionBox from "./SuggestionBox";

const emotionSuggestions = {
  "Happy": {
    text: "Great! Keep learning or try a quiz.",
    action: "Play Quiz"
  },
  "Neutral": {
    text: "Stay focused and continue learning.",
    action: "Continue Learning"
  },
  "Confused": {
    text: "Try revisiting the topic with a simpler explanation.",
    action: "View Resources"
  },
  "Bored": {
    text: "Let's switch to an interactive activity.",
    action: "More Learning"
  },
  "Frustrated": {
    text: "Take a short break and come back refreshed.",
    action: "Take a Break"
  },
  "Sad": {
    text: "Take a short break and try a simpler example.",
    action: "View Examples"
  },
  "Angry": {
    text: "Step away for a moment and return calmer.",
    action: "Take a Break"
  },
  "Surprised": {
    text: "Explore related challenges to deepen understanding.",
    action: "Continue Learning"
  }
};

export default function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState(null);

  const handleDetectEmotion = (emotion) => {
    setDetectedEmotion(emotion);
  };

  const handleActionClick = () => {
    const action = emotionSuggestions[detectedEmotion].action;
    
    if (action === "Play Quiz") {
      if (detectedEmotion === "Happy") {
        navigate("/quiz");
      } else {
        alert("🎯 Quiz is only available when you're feeling Happy! 😊");
      }
    } else if (action === "Continue Learning") {
      navigate("/learning");
    } else if (action === "View Resources") {
      navigate("/courses");
    } else if (action === "Take a Break") {
      alert("Take a 5-10 minute break! 🌟 You'll feel refreshed.");
    } else if (action === "View Examples") {
      navigate("/learning");
    } else if (action === "More Learning") {
      navigate("/learning");
    }
  };

  return (
    <>
      <button className="chat-toggle" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chatbox">
          <div className="chat-header">
            LeadBot <span onClick={() => setOpen(false)}>✖</span>
          </div>
          <div className="chat-body">
            {!detectedEmotion ? (
              <>
                <p className="bot">👋 Hi! How are you feeling right now?</p>
                <p className="bot">Let me detect your emotion to give you the best suggestion!</p>
                <div className="emotion-buttons">
                  {Object.keys(emotionSuggestions).map((emotion) => (
                    <button
                      key={emotion}
                      className="emotion-btn"
                      onClick={() => handleDetectEmotion(emotion)}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <SuggestionBox 
                emotion={detectedEmotion}
                suggestion={emotionSuggestions[detectedEmotion].text}
                action={emotionSuggestions[detectedEmotion].action}
                onActionClick={handleActionClick}
                onReset={() => setDetectedEmotion(null)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}