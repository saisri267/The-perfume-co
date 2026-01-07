// src/Register.js
import React, { useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const body = {
      name,
      email: email || undefined,
      mobile: mobile || undefined,
      password,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate("/");
    } else {
      alert(data.error || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h2 className="auth-title">Create account</h2>
        <p className="auth-sub">
          Sign up to manage orders, wishlist & addresses
        </p>

        <input
          className="auth-input"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          className="auth-input"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (e.target.value) setMobile("");
          }}
        />

        <div className="auth-divider">or</div>

        <input
          className="auth-input"
          placeholder="Mobile (optional)"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            if (e.target.value) setEmail("");
          }}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-btn" type="submit">
          Create Account
        </button>

        <div className="auth-links">
          <button
            type="button"
            className="linkish"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
}
