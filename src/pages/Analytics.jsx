import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Analytics() {
  const navigate = useNavigate();

  const [overallData, setOverallData] = useState(null);
  const [moduleData, setModuleData] = useState({});

  useEffect(() => {
    // 🔹 Overall emotions (Learning + Courses)
    const userEmail = localStorage.getItem("userEmail");
    const emotionHistoryKey = userEmail ? `emotionHistory_${userEmail}` : "emotionHistory";
    const moduleEmotionHistoryKey = userEmail ? `moduleEmotionHistory_${userEmail}` : "moduleEmotionHistory";

    const overall = JSON.parse(localStorage.getItem(emotionHistoryKey)) || {};

    if (Object.keys(overall).length > 0) {
      setOverallData({
        labels: Object.keys(overall),
        datasets: [
          {
            data: Object.values(overall),
            backgroundColor: [
              "#7c3aed",
              "#22c55e",
              "#facc15",
              "#ef4444",
              "#38bdf8",
              "#a855f7"
            ]
          }
        ]
      });
    }

    // 🔹 Module-wise emotions (ONLY modules)
    const module = JSON.parse(localStorage.getItem(moduleEmotionHistoryKey)) || {};
    setModuleData(module);
  }, []);

  const colors = [
    "#7c3aed",
    "#22c55e",
    "#facc15",
    "#ef4444",
    "#38bdf8",
    "#a855f7"
  ];

  return (
    <div style={{ padding: "40px" }}>
      
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
        ← Back to Home
      </button>

      <h2>Emotion Analytics Dashboard</h2>

      {/* ================= OVERALL ANALYTICS ================= */}
      <section style={{ marginTop: "30px" }}>
        <h3>Overall Emotion Analysis (Learning + Courses)</h3>

        {overallData ? (
          <div style={{ maxWidth: "420px", marginTop: "20px" }}>
            <Pie
              data={overallData}
              options={{
                plugins: {
                  legend: { position: "bottom" },
                  title: {
                    display: true,
                    text: "Overall Emotion Distribution"
                  }
                }
              }}
            />
          </div>
        ) : (
          <p>No overall emotion data available yet.</p>
        )}
      </section>

      {/* ================= MODULE-WISE ANALYTICS ================= */}
      <section style={{ marginTop: "50px" }}>
        <h3>Module-wise Emotion Analysis</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "25px",
            marginTop: "25px"
          }}
        >
          {Object.keys(moduleData).length === 0 && (
            <p>No module emotion data available yet.</p>
          )}

          {Object.entries(moduleData).map(([week, emotions]) => {
            const labels = Object.keys(emotions);
            const values = Object.values(emotions);

            const dominantEmotion =
              labels[values.indexOf(Math.max(...values))];

            return (
              <div
                key={week}
                style={{
                  background: "#ffffff",
                  padding: "20px",
                  borderRadius: "16px",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
                }}
              >
                <h4>Week {week}</h4>

                <Pie
                  data={{
                    labels,
                    datasets: [
                      {
                        data: values,
                        backgroundColor: colors.slice(
                          0,
                          labels.length
                        )
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      legend: { position: "bottom" }
                    }
                  }}
                />

                <p style={{ marginTop: "10px" }}>
                  <b>Dominant Emotion:</b> {dominantEmotion}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
