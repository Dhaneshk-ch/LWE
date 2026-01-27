import { useNavigate } from "react-router-dom";
import "../../styles/GamesHub.css";

export default function GamesHub() {
  const navigate = useNavigate();

  return (
    <div className="gameshub-page">
      {/* HERO */}
      <div className="gameshub-hero">
        <h1 className="gameshub-title">🎮 Learning Games</h1>
        <p className="gameshub-subtitle">
          Choose a game to refresh your mind
        </p>
      </div>

      {/* CONTENT */}
      <div className="gameshub-content">
        <div className="games-grid">
          {/* QUIZ */}
          <div className="game-card">
            <h3>🧠 Quiz</h3>
            <p>Test your knowledge</p>
            <button
              className="game-btn"
              onClick={() => navigate("/quiz")}
            >
              Play Quiz
            </button>
          </div>

          {/* WORKFLOW */}
          <div className="game-card">
            <h3>🔀 Workflow Design</h3>
            <p>Arrange steps logically</p>
            <button
              className="game-btn"
              onClick={() => navigate("/workflow")}
            >
              Play Workflow
            </button>
          </div>
        </div>
       </div>
      </div>
  );
}
