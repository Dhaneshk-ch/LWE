import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import SuggestionBox from "../components/SuggestionBox";
import { sendFrameToBackend } from "../services/api";
import "../styles/Courses.css";

const courses = [
  { title: "Emotion-Aware Learning Systems", desc: "Learn how emotions enhance digital learning." },
  { title: "Facial Expression Analysis", desc: "Understand facial muscles and emotions." },
  { title: "Introduction to Machine Learning", desc: "Basics of ML and AI concepts." },
  { title: "Deep Learning Fundamentals", desc: "Neural networks and optimization." },
  { title: "Convolutional Neural Networks (CNN)", desc: "Image-based deep learning models." },
  { title: "Emotion Recognition using AI", desc: "Detect emotions using AI techniques." },
  { title: "Backend Development with Flask", desc: "Build APIs for AI applications." },
  { title: "Frontend Development with React", desc: "Create interactive UIs with React." },
  { title: "Emotion Analytics & Visualization", desc: "Analyze emotion trends visually." },
  { title: "Ethics in Emotion AI", desc: "Privacy and ethical considerations." }
];

export default function Courses() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [emotion, setEmotion] = useState("");
  const [suggestion, setSuggestion] = useState("");

  const loggedIn = localStorage.getItem("loggedIn");

  const userEmail = localStorage.getItem("userEmail");
  const emotionHistoryKey = userEmail ? `emotionHistory_${userEmail}` : "emotionHistory";

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

        // 🔹 SAVE OVERALL EMOTION (FOR OVERALL PIE CHART)
        const overallHistory = JSON.parse(localStorage.getItem(emotionHistoryKey)) || {};

        overallHistory[res.emotion] = (overallHistory[res.emotion] || 0) + 1;

        localStorage.setItem(emotionHistoryKey, JSON.stringify(overallHistory));

      } catch (err) {
        console.error("Emotion API error:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loggedIn]);

  return (
    <div className="courses-page">
      <h2>Available Courses</h2>

      <div className="courses-grid">
        {courses.map((course, index) => (
          <div
            key={index}
            className="course-card clickable"
            onClick={() => navigate("/learning")}
          >
            <h3>{course.title}</h3>
            <p>{course.desc}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/learning");
              }}
            >
              View Course
            </button>
          </div>
        ))}
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
      {loggedIn && emotion && (
        <SuggestionBox emotion={emotion} suggestion={suggestion} />
      )}
    </div>
  );
}
