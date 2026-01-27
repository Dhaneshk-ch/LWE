import { useState } from "react";
import "../../styles/WorkflowGame.css";

const workflowTopics = {
  "Machine Learning": [
    [
      "Data Collection",
      "Data Preprocessing",
      "Feature Engineering",
      "Model Training",
      "Model Evaluation"
    ]
  ],
  "Web Development": [
    [
      "Requirement Analysis",
      "UI Design",
      "Frontend Development",
      "Backend Development",
      "Testing & Deployment"
    ]
  ]
};

export default function WorkflowGame() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [available, setAvailable] = useState([]);
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState("");

  const startTopic = (topic) => {
    const wf = workflowTopics[topic][0];
    setSelectedTopic(topic);
    setAvailable([...wf].sort(() => Math.random() - 0.5));
    setSlots(Array(wf.length).fill(null));
    setMessage("");
  };

  const retryGame = () => {
    const wf = workflowTopics[selectedTopic][0];
    setAvailable([...wf].sort(() => Math.random() - 0.5));
    setSlots(Array(wf.length).fill(null));
    setMessage("");
  };

  const onDragStart = (e, step) => {
    e.dataTransfer.setData("step", step);
  };

  const onDrop = (e, index) => {
    const step = e.dataTransfer.getData("step");
    if (!slots[index]) {
      const updated = [...slots];
      updated[index] = step;
      setSlots(updated);
      setAvailable(available.filter(s => s !== step));
    }
  };

  const checkAnswer = () => {
    const correct = workflowTopics[selectedTopic][0];
    for (let i = 0; i < correct.length; i++) {
      if (slots[i] !== correct[i]) {
        setMessage("❌ Incorrect order. Try again!");
        return;
      }
    }
    setMessage("🎉 Correct workflow!");
  };

  /* ================= TOPIC SELECTION (GRADIENT) ================= */
  if (!selectedTopic) {
    return (
      <div className="workflow-page">
        <div className="workflow-card">
          <div className="workflow-header">
            <h1 className="workflow-title">🔀 Workflow Design Game</h1>
            <p className="workflow-subtitle">Select a topic to practice</p>
          </div>

          <div className="workflow-topics">
            {Object.keys(workflowTopics).map(topic => (
              <div key={topic} className="workflow-topic-card">
                <h3>{topic}</h3>
                <p>{workflowTopics[topic].length} workflows</p>
                <button
                  className="workflow-btn"
                  onClick={() => startTopic(topic)}
                >
                  Start
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ================= GAME SCREEN (WHITE) ================= */
  return (
    <div className="workflow-play-page">
      <div className="workflow-card">

        <div className="workflow-header">
          <h2 className="workflow-title">
            {selectedTopic} – Workflow
          </h2>
        </div>

        {/* DRAGGABLE STEPS */}
        <div className="steps-container">
          {available.map(step => (
            <div
              key={step}
              draggable
              onDragStart={(e) => onDragStart(e, step)}
              className="step"
            >
              {step}
            </div>
          ))}
        </div>

        {/* DROP ZONES */}
        <div className="workflow-area">
          {slots.map((slot, index) => (
            <div key={index} className="workflow-row">
              <div
                className={`drop-slot ${slot ? "filled" : ""}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, index)}
              >
                {slot || "Drop here"}
              </div>
              {index < slots.length - 1 && (
                <span className="arrow">➡</span>
              )}
            </div>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="workflow-actions">
          <button className="workflow-btn" onClick={checkAnswer}>
            Submit
          </button>
          <button className="workflow-btn" onClick={retryGame}>
            Retry
          </button>
          <button
            className="workflow-btn"
            onClick={() => setSelectedTopic(null)}
          >
            Back
          </button>
        </div>

        {message && (
          <p className="workflow-message">{message}</p>
        )}
      </div>
    </div>
  );
}
