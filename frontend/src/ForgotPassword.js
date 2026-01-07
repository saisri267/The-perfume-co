import React, { useState } from "react";
export default function ForgotPassword(){
  const [email,setEmail]=useState("");
  const [msg,setMsg]=useState("");
  const send=async()=>{
    const r=await fetch("http://localhost:5000/api/auth/forgot",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})});
    const d=await r.json();
    setMsg(d.message || d.error || "Check email");
  };
  return (
    <div className="auth-container">
      <h1>Reset Password</h1>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <button className="auth-btn" onClick={send}>Send Reset Link</button>
      {msg && <div className="success-popup">{msg}</div>}
    </div>
  );
}
