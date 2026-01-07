import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "./contexts/AuthContext";

export default function AccountPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <motion.div
      style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 style={{ marginBottom: 6 }}>My Account</h1>
      <p style={{ color: "#666", marginBottom: 30 }}>
        Welcome{user?.email ? `, ${user.email}` : ""}
      </p>

      {/* GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
        }}
      >
        <AccountCard title="Edit Profile" onClick={() => navigate("/account/edit-profile")} />
        <AccountCard title="My Wishlist" onClick={() => navigate("/account/wishlist")} />
        <AccountCard title="My Orders" onClick={() => navigate("/account/orders")} />
        <AccountCard title="Addresses" onClick={() => navigate("/account/addresses")} />
        <AccountCard title="Gift Cards & Vouchers" onClick={() => navigate("/account/gift-cards")} />
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        style={{
          marginTop: 40,
          background: "none",
          border: "1px solid #000",
          padding: "12px 18px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </motion.div>
  );
}

function AccountCard({ title, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{
        border: "1px solid #ddd",
        padding: 24,
        cursor: "pointer",
        background: "#fff",
      }}
    >
      <h3 style={{ margin: 0 }}>{title}</h3>
      <p style={{ color: "#777", marginTop: 6 }}>Manage {title.toLowerCase()}</p>
    </motion.div>
  );
}
