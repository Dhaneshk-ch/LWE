import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email && password) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userEmail", email);
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Login</h2>
        <p>Enter your account details</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
