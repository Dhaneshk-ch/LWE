import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function EmotionChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const history =
      JSON.parse(localStorage.getItem("emotionHistory")) || {};

    const labels = Object.keys(history);
    const values = Object.values(history);

    if (labels.length === 0) return;

    setChartData({
      labels,
      datasets: [
        {
          label: "Emotion Count",
          data: values,
          backgroundColor: "#7c3aed",
          borderRadius: 8
        }
      ]
    });
  }, []);

  if (!chartData) {
    return <p>No emotion data yet</p>;
  }

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false
      }}
    />
  );
}
