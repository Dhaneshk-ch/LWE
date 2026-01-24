import "../styles/Home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <main className="main">

        {/* HERO */}
        <div className="hero">
          <div>
            <h2>Sharpen Your Skills With <br /> Professional Online Courses</h2>
            <button onClick={() => navigate("/learning")}>
              Explore Courses
            </button>
          </div>
        </div>

        {/* COURSE SECTION */}
        <section>
          <h3>Continue Learning</h3>

          <div className="cards">
            <div
              className="card clickable"
              onClick={() => navigate("/learning")}
            >
              <h4>Beginner Guide to Learning</h4>
              <p>UI/UX • 2h 30m</p>
            </div>

            <div
              className="card clickable"
              onClick={() => navigate("/learning")}
            >
              <h4>Emotion Aware Learning</h4>
              <p>AI • 3h 15m</p>
            </div>

            <div
              className="card clickable"
              onClick={() => navigate("/learning")}
            >
              <h4>Web Development</h4>
              <p>React • 4h</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
