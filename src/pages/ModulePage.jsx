import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import SuggestionBox from "../components/SuggestionBox";
import { sendFrameToBackend } from "../services/api";
import "../styles/ModulePage.css";

/*import { Pie } from "react-chartjs-2";*/
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ModulePage() {
  const { weekId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [emotion, setEmotion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);

  // 🔹 Emotion detection every 10 sec
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!webcamRef.current) return;

      const img = webcamRef.current.getScreenshot();
      if (!img) return;

      try {
        const res = await sendFrameToBackend(img);

        setEmotion(res.emotion);
        setSuggestion(res.suggestion);
        setShowSuggestion(true);

        // 🔹 SAVE emotion per module
        const history =
          JSON.parse(localStorage.getItem("moduleEmotionHistory")) || {};

        history[weekId] = history[weekId] || {};
        history[weekId][res.emotion] =
          (history[weekId][res.emotion] || 0) + 1;

        localStorage.setItem(
          "moduleEmotionHistory",
          JSON.stringify(history)
        );

        setTimeout(() => setShowSuggestion(false), 5000);
      } catch (err) {
        console.error(err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [weekId]);

  // 🔹 Prepare chart data
  const history =
    JSON.parse(localStorage.getItem("moduleEmotionHistory")) || {};
  const dataObj = history[weekId] || {};
  const labels = Object.keys(dataObj);
  const values = Object.values(dataObj);

  const highestEmotion =
    labels.length
      ? labels[values.indexOf(Math.max(...values))]
      : "Not enough data";

  const pieData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#7c3aed",
          "#22c55e",
          "#facc15",
          "#ef4444",
          "#38bdf8"
        ]
      }
    ]
  };

  // 🔹 Mark module complete
  const markComplete = () => {
    const progress =
      JSON.parse(localStorage.getItem("moduleProgress")) || {};
    const summary =
      JSON.parse(localStorage.getItem("moduleEmotionSummary")) || {};

    progress[weekId] = "completed";
    summary[weekId] = highestEmotion;

    localStorage.setItem("moduleProgress", JSON.stringify(progress));
    localStorage.setItem(
      "moduleEmotionSummary",
      JSON.stringify(summary)
    );

    navigate("/learning");
  };

  return (
    <div className="module-page">
         {/* 🔙 BACK BUTTON */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#ede9fe",
          color: "#4c1d95",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer"
        }}
      >
        ← Go Back 
      </button>
      <h2>Week {weekId} Module</h2>

      <p>
        This module tracks your emotions and adapts suggestions
        while you learn.
      </p>

      <ul>
        <li>Concept explanation</li>
        <li>Examples</li>
        <li>Practice</li>
      </ul>

     

      <button className="complete-btn" onClick={markComplete}>
        Mark as Complete
      </button>

      {/* Hidden webcam */}
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ position: "absolute", left: "-9999px" }}
      />

      {/* Suggestion box */}
      {showSuggestion && (
        <SuggestionBox emotion={emotion} suggestion={suggestion} />
      )}
    </div>
  );
}
