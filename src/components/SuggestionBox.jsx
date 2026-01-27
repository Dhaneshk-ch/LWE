import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuggestionBox.css";

export default function SuggestionBox({
  emotion,
  suggestion,
  action,
  onActionClick,
  onReset
}) {
  const navigate = useNavigate();

  // Default action labels
  const defaultActions = {
    Happy: "Play Quiz",
    Neutral: "Continue Learning",
    Confused: "View Resources",
    Bored: "Play some games / Take a break",
    Frustrated: "Take a Break",
    Sad: "View Examples",
    Angry: "Take a Break",
    Surprised: "Continue Learning"
  };

  const computedAction =
    action || defaultActions[emotion] || "Continue Learning";

  const handlePrimary = useCallback(() => {
    // Prefer parent handler if provided
    if (typeof onActionClick === "function") {
      onActionClick();
      return;
    }

    // 😊 HAPPY → QUIZ (NEW TAB)
    if (emotion === "Happy") {
      window.open("/quiz", "_blank", "noopener,noreferrer");
      return;
    }

    // 😴 BORED → GAMES HUB (NEW TAB)
    if (emotion === "Bored") {
      window.open("/gameshub", "_blank", "noopener,noreferrer");
      return;
    }


    // 😕 CONFUSED → RESOURCES
    if (emotion === "Confused") {
      navigate("/courses");
      return;
    }

    // 😠 FRUSTRATED / ANGRY → BREAK
    if (emotion === "Frustrated" || emotion === "Angry") {
      alert("😌 Take a short 5–10 minute break and come back refreshed.");
      return;
    }

    // 📘 DEFAULT → LEARNING
    navigate("/learning");
  }, [emotion, navigate, onActionClick]);

  const handleBack = useCallback(() => {
    if (typeof onReset === "function") onReset();
  }, [onReset]);

  return (
    <div className="suggestion-box">
      <div className="emotion-header">
        <h4>Emotion Detected</h4>
      </div>

      <p className="emotion">{emotion}</p>
      <p className="suggestion">{suggestion}</p>

      <div className="suggestion-actions">
        <button
          className="action-btn primary"
          type="button"
          onClick={handlePrimary}
        >
          {computedAction} →
        </button>

        <button
          className="action-btn secondary"
          type="button"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
    </div>
  );
}
