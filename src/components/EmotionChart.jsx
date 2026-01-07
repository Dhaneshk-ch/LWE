import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export default function EmotionChart() {
  const history = JSON.parse(localStorage.getItem("emotionHistory")) || {};

  const labels = Object.keys(history);
  const values = Object.values(history);

  if (labels.length === 0) {
    return <p>No emotion data available yet.</p>;
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Emotion Count",
        data: values,
        backgroundColor: "#7c3aed",
        borderRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  return <Bar data={data} options={options} />;
}
