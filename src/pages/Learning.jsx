import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import SuggestionBox from "../components/SuggestionBox";
import { sendFrameToBackend } from "../services/api";
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

  const [emotion, setEmotion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  const loggedIn = localStorage.getItem("loggedIn");

  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(async () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const result = await sendFrameToBackend(imageSrc);

        // 🔹 Show suggestion
        setEmotion(result.emotion);
        setSuggestion(result.suggestion);
        setShowSuggestion(true);

        // 🔹 Hide after 5 seconds
        setTimeout(() => {
          setShowSuggestion(false);
        }, 5000);

      } catch (err) {
        console.error("Emotion API error:", err);
      }
    }, 10000); // 🔥 every 10 sec (5 sec visible + 5 sec hidden)

    return () => clearInterval(interval);
  }, [loggedIn]);

  return (
    <div className="learning-page">
      <h2>Learning Modules (10 Weeks)</h2>

      {/* MODULE LIST */}
      <div className="module-grid">
        {modules.map((m) => (
          <div key={m.week} className="module-card">
            <h3>Week {m.week}</h3>
            <h4>{m.title}</h4>
            <p>{m.desc}</p>
            <button>Start Week</button>
          </div>
        ))}
      </div>

      {/* HIDDEN WEBCAM */}
      {loggedIn && (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={200}
          height={150}
          style={{ position: "absolute", left: "-9999px" }}
        />
      )}

      {/* SUGGESTION BOX */}
      {loggedIn && showSuggestion && (
        <SuggestionBox emotion={emotion} suggestion={suggestion} />
      )}
    </div>
  );
}
