import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.setItem("loggedIn", "true");
    navigate("/"); // go to home page
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Login</h2>
        <input placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button onClick={handleLogin}>Login</button>
      </div>
      <div className="login-right">
        <h1>Welcome to student portal</h1>
      </div>
    </div>
  );
}
