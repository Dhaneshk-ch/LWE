import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import { useState } from "react";
import ProfilePanel from "./ProfilePanel";

export default function Navbar() {
  const loggedIn = localStorage.getItem("loggedIn");
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <nav className="navbar">
        {/* LEFT LOGO */}
        <div className="logo">LBE</div>

        {/* CENTER LINKS */}
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/courses">Courses</Link></li>
          <li><Link to="/learning">Learning</Link></li>
          <li><Link to="/analytics">Analytics</Link></li>
        </ul>

        {/* RIGHT PROFILE ICON */}
        {loggedIn && (
          <div
            className="profile-icon"
            onClick={() => setShowProfile(true)}
          >
            👤
          </div>
        )}
      </nav>

      {/* PROFILE SLIDE PANEL */}
      {showProfile && (
        <ProfilePanel onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
