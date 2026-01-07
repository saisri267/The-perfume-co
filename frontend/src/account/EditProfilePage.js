import React, { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function EditProfilePage() {
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });

  const submit = (e) => {
    e.preventDefault();
    alert("Profile updated (UI only for now)");
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h2>Edit profile</h2>

      <form onSubmit={submit}>
        {["name", "email", "mobile"].map((f) => (
          <input
            key={f}
            placeholder={f.toUpperCase()}
            value={form[f]}
            onChange={(e) =>
              setForm({ ...form, [f]: e.target.value })
            }
            style={input}
          />
        ))}

        <button style={primary}>Save changes</button>
      </form>
    </div>
  );
}

const input = {
  width: "100%",
  padding: 14,
  marginBottom: 12,
  border: "1px solid #ccc",
};

const primary = {
  width: "100%",
  padding: 14,
  background: "#000",
  color: "#fff",
  border: "none",
};
