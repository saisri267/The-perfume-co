// src/Login.js
import React, { useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const body = email ? { email, password } : { mobile, password };

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate("/");
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Login</h2>
        <p className="auth-sub">
          Use your email or mobile number with password
        </p>

        <input
          className="auth-input"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value) setMobile("");
          }}
        />

        <div className="auth-divider">OR</div>

        <input
          className="auth-input"
          placeholder="Mobile (digits only)"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            if (e.target.value) setEmail("");
          }}
        />

        <div className="password-wrap">
          <input
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="eye-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button className="auth-btn" type="submit">
          Login
        </button>

        <div className="auth-links">
          <button type="button" onClick={() => navigate("/otp")}>
            Login with OTP
          </button>
          <button type="button" onClick={() => navigate("/reset-password")}>
            Forgot password
          </button>
        </div>
      </form>
    </div>
  );
}
