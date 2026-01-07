import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function WishlistPage() {
  const navigate = useNavigate();

  // dummy wishlist (later connect to API)
  const wishlist = [
    { _id: "1", name: "Dior Purple Oud", image: "/images/diorwomen1.webp", price: 19999 },
    { _id: "2", name: "Paco Rabanne 1 Million", image: "/images/paco.jpg", price: 7999 },
  ];

  return (
    <motion.div
      style={{ padding: 40 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2>My Wishlist</h2>

      <div style={grid}>
        {wishlist.map((p) => (
          <div
            key={p._id}
            style={card}
            onClick={() => navigate(`/product/${p._id}`)}
          >
            <img src={p.image} alt={p.name} style={img} />
            <div>
              <strong>{p.name}</strong>
              <p>₹{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 20,
  marginTop: 20,
};

const card = {
  cursor: "pointer",
};

const img = {
  width: "100%",
  height: 220,
  objectFit: "contain",
  background: "#f4f4f4",
};
