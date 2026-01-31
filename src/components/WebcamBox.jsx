import React, { useRef, useEffect } from "react";
import "../styles/WebcamBox.css";

const WebcamBox = ({ onEmotionDetected }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    // Start webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Webcam error:", err));

    const interval = setInterval(captureAndSend, 3000);
    return () => clearInterval(interval);
  }, []);

  const captureAndSend = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 120;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg");

    try {
      const res = await fetch("http://localhost:5000/api/emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await res.json();

      if (data.emotion) {
        onEmotionDetected(data.emotion, data.suggestion);
      }
    } catch (err) {
      console.error("Emotion API error:", err);
    }
  };

  return (
    <div className="webcam-box">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="webcam-video"
      />
    </div>
  );
};

export default WebcamBox;
