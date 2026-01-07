// src/OTPLogin.js
import React, { useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OTPLogin() {
  const [target, setTarget] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("send"); // send or verify
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const send = async () => {
    const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target, type: "login" }) });
    const data = await res.json();
    if (res.ok) {
      setStep("verify");
      alert("OTP sent (if configured)");
    } else {
      alert(data.error || "Error sending OTP");
    }
  };

  const verify = async () => {
    const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target, code, type: "login" }) });
    const data = await res.json();
    if (res.ok) {
      login(data.token, data.user);
      navigate("/");
    } else {
      alert(data.error || "Invalid OTP");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login with OTP</h2>
        {step === "send" ? (
          <>
            <input placeholder="Email or mobile" value={target} onChange={(e) => setTarget(e.target.value)} />
            <button className="auth-btn" onClick={send}>Send OTP</button>
          </>
        ) : (
          <>
            <div>OTP sent to <strong>{target}</strong></div>
            <input placeholder="Enter code" value={code} onChange={(e) => setCode(e.target.value)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="auth-btn" onClick={verify}>Verify</button>
              <button className="linkish" onClick={() => setStep("send")}>Send again</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
