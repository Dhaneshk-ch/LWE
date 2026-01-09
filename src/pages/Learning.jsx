import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import SuggestionBox from "../components/SuggestionBox";
import { sendFrameToBackend } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/Learning.css";

const modules = [
  { week: 1, title: "Introduction to Emotion-Aware Learning", desc: "Overview of emotion-based education and system workflow." },
  { week: 2, title: "Basics of Facial Expressions", desc: "Understanding human emotions and facial movements." },
  { week: 3, title: "Introduction to Machine Learning", desc: "Basic ML concepts used in emotion recognition." },
  { week: 4, title: "Convolutional Neural Networks (CNN)", desc: "How CNNs extract features from face images." },
  { week: 5, title: "Emotion Datasets (FER-2013)", desc: "Dataset structure and preprocessing methods." },
  { week: 6, title: "Emotion Detection Pipeline", desc: "End-to-end workflow of emotion detection." },
  { week: 7, title: "Suggestion Engine Logic", desc: "Mapping emotions to adaptive learning suggestions." },
  { week: 8, title: "Backend API Integration", desc: "Connecting React frontend with Flask backend." },
  { week: 9, title: "Emotion Analytics & Visualization", desc: "Tracking emotions and plotting analytics graphs." },
  { week: 10, title: "Project Deployment & Ethics", desc: "Deployment basics, privacy, and ethical considerations." }
];

export default function Learning() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [emotion, setEmotion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [progress, setProgress] = useState({});

  const loggedIn = localStorage.getItem("loggedIn");

  // Dominant emotion per module (saved from ModulePage)
  const emotionSummary =
    JSON.parse(localStorage.getItem("moduleEmotionSummary")) || {};

  // 🔹 Load module completion progress
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("moduleProgress")) || {};
    setProgress(saved);
  }, []);

  // 🔹 Emotion detection for overall analytics (Learning page)
  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(async () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const res = await sendFrameToBackend(imageSrc);

        // 🔹 Update UI
        setEmotion(res.emotion);
        setSuggestion(res.suggestion);
        setShowSuggestion(true);

        // 🔹 SAVE OVERALL EMOTION (FOR OVERALL PIE CHART)
        const overallHistory =
          JSON.parse(localStorage.getItem("emotionHistory")) || {};

        overallHistory[res.emotion] =
          (overallHistory[res.emotion] || 0) + 1;

        localStorage.setItem(
          "emotionHistory",
          JSON.stringify(overallHistory)
        );

        // 🔹 Hide suggestion after 5 sec
        setTimeout(() => setShowSuggestion(false), 5000);
      } catch (err) {
        console.error("Emotion API error:", err);
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [loggedIn]);

  return (
    <div className="learning-page">
      <h2>Learning Modules (10 Weeks)</h2>

      <div className="module-list">
        {modules.map((m) => {
          const isCompleted = progress[m.week] === "completed";

          return (
            <div key={m.week} className="module-row">
              <h4>Week {m.week}: {m.title}</h4>
              <p>{m.desc}</p>

              {/* Progress bar */}
              <div className="progress-bar">
                <div
                  className={`progress-fill ${isCompleted ? "completed" : ""}`}
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>

              <div className="module-footer">
                <span className="status">
                  {isCompleted
                    ? `✔ Completed (Mostly ${emotionSummary[m.week] || "—"})`
                    : "Not Started"}
                </span>

                <button
                  onClick={() => navigate(`/learning/week/${m.week}`)}
                >
                  {isCompleted ? "View Module" : "Open Module"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔹 Hidden webcam */}
      {loggedIn && (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ position: "absolute", left: "-9999px" }}
        />
      )}

      {/* 🔹 Suggestion box */}
      {loggedIn && showSuggestion && (
        <SuggestionBox emotion={emotion} suggestion={suggestion} />
      )}
    </div>
  );
}
