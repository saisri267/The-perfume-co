// src/ResetPassword.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [target, setTarget] = useState("");
  const [step, setStep] = useState("send");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const send = async () => {
    const res = await fetch("/api/auth/send-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target, type: "reset" }) });
    const data = await res.json();
    if (res.ok) {
      alert("OTP sent (if configured)");
      setStep("verify");
    } else {
      alert(data.error || "Error sending OTP");
    }
  };

  const reset = async () => {
    const res = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ target, code, newPassword }) });
    const data = await res.json();
    if (res.ok) {
      alert("Password reset. Please log in.");
      navigate("/login");
    } else {
      alert(data.error || "Reset failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset password</h2>
        {step === "send" ? (
          <>
            <input placeholder="Email or mobile" value={target} onChange={(e) => setTarget(e.target.value)} />
            <button className="auth-btn" onClick={send}>Send OTP</button>
          </>
        ) : (
          <>
            <input placeholder="OTP" value={code} onChange={(e) => setCode(e.target.value)} />
            <input placeholder="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button className="auth-btn" onClick={reset}>Reset password</button>
          </>
        )}
      </div>
    </div>
  );
}
