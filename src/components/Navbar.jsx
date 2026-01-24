import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { useState } from "react";
import ProfilePanel from "./ProfilePanel";

export default function Navbar() {
  const location = useLocation();   // ✅ detect page
  const navigate = useNavigate();
  const loggedIn = localStorage.getItem("loggedIn");
  const [showProfile, setShowProfile] = useState(false);

  // ❌ Hide navbar right section on login page
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      <nav className="navbar">
        {/* LOGO */}
        <div className="logo">LBE</div>

        {/* LINKS */}
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          <li><Link to="/learning">Learning</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
        </ul>

        {/* RIGHT SIDE */}
        {!isLoginPage && (
          <div className="nav-right">
            {loggedIn ? (
              <div
                className="profile-icon"
                onClick={() => setShowProfile(true)}
              >
                👤
              </div>
            ) : (
              <button
                className="login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            )}
          </div>
        )}
      </nav>

      {showProfile && (
        <ProfilePanel onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
