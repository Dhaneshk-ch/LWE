import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

const puzzles = [
  {
    id: 1,
    title: "Logic Puzzle 1",
    description: "Solve the sequence: 2, 4, 8, 16, ?",
    answer: "32",
    hints: ["It's a doubling pattern", "Each number is multiplied by 2"]
  },
  {
    id: 2,
    title: "Logic Puzzle 2",
    description: "If all roses are flowers and all flowers fade, then all roses fade. True or False?",
    answer: "True",
    hints: ["This is a logical deduction problem", "Follow the chain of logic"]
  },
  {
    id: 3,
    title: "Logic Puzzle 3",
    description: "What comes next: A, B, D, G, ?",
    answer: "K",
    hints: ["Look at the gaps between letters", "1, 2, 3, 4 letter gaps"]
  }
];

export default function PuzzleGame() {
  const navigate = useNavigate();
  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);

  const puzzle = puzzles[currentPuzzle];

  const handleSubmit = () => {
    if (userAnswer.toLowerCase().trim() === puzzle.answer.toLowerCase()) {
      setSolved(true);
    }
  };

  const handleNext = () => {
    if (currentPuzzle < puzzles.length - 1) {
      setCurrentPuzzle(currentPuzzle + 1);
      setUserAnswer("");
      setShowHint(false);
      setSolved(false);
    } else {
      navigate("/gameshub");
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/gameshub")} style={styles.backBtn}>
        ← Back to Games
      </button>

      <div style={styles.puzzleCard}>
        <h2>🧩 Puzzle Game</h2>
        <p style={styles.puzzleNumber}>Puzzle {currentPuzzle + 1} of {puzzles.length}</p>

        <div style={styles.puzzleContent}>
          <p style={styles.description}>{puzzle.description}</p>

          <input
            type="text"
            placeholder="Enter your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            style={styles.input}
            disabled={solved}
          />

          <div style={styles.buttonGroup}>
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={solved}>
              {solved ? "✓ Correct!" : "Submit Answer"}
            </button>

            <button onClick={() => setShowHint(!showHint)} style={styles.hintBtn}>
              💡 Hint
            </button>
          </div>

          {showHint && (
            <div style={styles.hintBox}>
              <p><strong>Hint:</strong> {puzzle.hints[0]}</p>
            </div>
          )}

          {solved && (
            <div style={styles.successBox}>
              <p>🎉 Correct! The answer is: {puzzle.answer}</p>
              <button onClick={handleNext} style={styles.nextBtn}>
                {currentPuzzle < puzzles.length - 1 ? "Next Puzzle" : "Back to Games"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  backBtn: {
    padding: "10px 20px",
    marginBottom: "30px",
    background: "#fff",
    color: "#667eea",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  },
  puzzleCard: {
    maxWidth: "500px",
    margin: "0 auto",
    background: "#fff",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center"
  },
  puzzleNumber: {
    color: "#999",
    fontSize: "14px",
    marginBottom: "20px"
  },
  description: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "30px",
    color: "#333"
  },
  puzzleContent: {
    marginTop: "20px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    border: "2px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  submitBtn: {
    flex: 1,
    padding: "12px",
    background: "#667eea",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  },
  hintBtn: {
    flex: 1,
    padding: "12px",
    background: "#ffc107",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  },
  hintBox: {
    background: "#fff3cd",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    color: "#856404"
  },
  successBox: {
    background: "#d4edda",
    padding: "20px",
    borderRadius: "8px",
    color: "#155724"
  },
  nextBtn: {
    marginTop: "15px",
    padding: "12px 30px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold"
  }
};
