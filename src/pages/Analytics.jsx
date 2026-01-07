import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { fetchAnalytics } from "../services/api";

// ✅ Proper Chart.js registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

// ✅ REGISTER ONCE (outside component)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchAnalytics().then((data) => {
      setChartData({
        labels: Object.keys(data),
        datasets: [
          {
            label: "Emotion Count",
            data: Object.values(data),
            backgroundColor: "#7c3aed"
          }
        ]
      });
    });
  }, []);

  if (!chartData) {
    return <p style={{ padding: "40px" }}>Loading analytics...</p>;
  }

  return (
    <div className="page" style={{ padding: "40px" }}>
      <h2>Emotion Analytics</h2>

      {/* ✅ Render ONLY ONE chart */}
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: {
              display: true,
              text: "Emotion Analytics Dashboard"
            }
          }
        }}
      />
    </div>
  );
}
