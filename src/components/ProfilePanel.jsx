import EmotionChart from "./EmotionChart";
import "../styles/ProfilePanel.css";

export default function ProfilePanel({ onClose }) {
  const email = localStorage.getItem("userEmail");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* OVERLAY */}
      <div className="profile-overlay" onClick={onClose}></div>

      {/* PANEL */}
      <div className="profile-panel">
        <div className="panel-header">
          <h3>My Profile</h3>
          <button onClick={onClose}>✖</button>
        </div>

        <div className="profile-content">
          <div className="avatar">👤</div>

          <p><strong>Email:</strong></p>
          <span>{email || "Not available"}</span>

          <div className="info">
            <p><strong>Role:</strong> Learner</p>
            <p><strong>Platform:</strong> LearnByEmotion (LBE)</p>
          </div>

          <h4>Your Progress</h4>
          <div className="stats">
            <div>Course Progress: <b>75%</b></div>
          </div>

          <h4>Emotion Analysis</h4>
          <EmotionChart />
        </div>

        {/* LOGOUT AT BOTTOM */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </>
  );
}
