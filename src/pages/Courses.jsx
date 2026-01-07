import { useEffect, useRef, useState } from "react";
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
  const [emotion, setEmotion] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const loggedIn = localStorage.getItem("loggedIn");

  useEffect(() => {
    if (!loggedIn) return;

    const interval = setInterval(async () => {
      if (!webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) return;

      try {
        const result = await sendFrameToBackend(imageSrc);
        setEmotion(result.emotion);
        setSuggestion(result.suggestion);
      } catch (err) {
        console.error("Emotion API error:", err);
      }
    }, 5000); // 🔥 always updating

    return () => clearInterval(interval);
  }, [loggedIn]);

  return (
    <div className="courses-page">
      <h2>Available Courses</h2>

      <div className="courses-grid">
        {courses.map((course, index) => (
          <div key={index} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.desc}</p>
            <button>View Course</button>
          </div>
        ))}
      </div>

      {/* HIDDEN WEBCAM */}
      {loggedIn && (
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={160}
          height={120}
          style={{ position: "absolute", left: "-9999px" }}
        />
      )}

      {/* 🔹 ALWAYS VISIBLE SUGGESTION BOX */}
      {loggedIn && emotion && (
        <SuggestionBox emotion={emotion} suggestion={suggestion} />
      )}
    </div>
  );
}
