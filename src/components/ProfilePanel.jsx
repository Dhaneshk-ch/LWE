import { useNavigate } from "react-router-dom";
import "../styles/ProfilePanel.css";

export default function ProfilePanel({ onClose }) {
  const navigate = useNavigate();

  // ✅ GET EMAIL FROM LOCAL STORAGE
  const email = localStorage.getItem("userEmail");

  const logout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userEmail");
    onClose();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="profile-panel">
      {/* HEADER */}
      <div className="profile-header">
        <h2>My Profile</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="profile-body">
        <div className="avatar">👤</div>

        <p><b>Email:</b></p>
        <span className="profile-email">
          {email || "Not available"}
        </span>

        <p><b>Role:</b> Learner</p>
        <p><b>Platform:</b> LearnByEmotion (LBE)</p>

        <h3>Your Progress</h3>
        <div className="progress-box">
          Course Progress: <b>75%</b>
        </div>

        {/* ACTION BUTTONS */}
        <div className="profile-actions">
          <button
            className="analytics-btn"
            onClick={() => {
              onClose();
              navigate("/analytics");
            }}
          >
            View Emotion Analytics
          </button>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
