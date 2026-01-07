import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "./contexts/CartContext";
import { useNavigate } from "react-router-dom";

const resolveImage = (file) => {
  if (!file) return "/images/hero.png";
  return `/images/${file}`;
};

export default function CartPage() {
  const { cart, removeFromCart } = useContext(CartContext);
  const [items, setItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setItems(cart?.items || []);
  }, [cart]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("addresses") || "[]");
    const def = saved.find((a) => a.isDefault);
    setDefaultAddress(def || null);
  }, []);

  const total = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.qty || 1),
    0
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Your Bag</h2>

      {items.length === 0 ? (
        <p>Your bag is empty.</p>
      ) : (
        <>
          {items.map((it, i) => (
            <div key={i} style={row}>
              <img
                src={resolveImage(it.image)}
                alt={it.productName}
                style={img}
              />

              <div style={{ flex: 1 }}>
                <strong>{it.productName}</strong>
                <div>Qty: {it.qty}</div>
              </div>

              <div>₹{it.price * it.qty}</div>

              <button style={remove} onClick={() => removeFromCart(it.productId)}>
                Remove
              </button>
            </div>
          ))}

          {/* ADDRESS */}
          <div style={box}>
            <h4>Delivery address</h4>
            {defaultAddress ? (
              <>
                <p><strong>{defaultAddress.name}</strong></p>
                <p>{defaultAddress.street}</p>
                <p>{defaultAddress.city} – {defaultAddress.pincode}</p>
                <button style={link} onClick={() => navigate("/account/addresses")}>
                  Change address
                </button>
              </>
            ) : (
              <button style={link} onClick={() => navigate("/account/addresses")}>
                Add address
              </button>
            )}
          </div>

          <h3>Total: ₹{total}</h3>
        </>
      )}
    </div>
  );
}

const row = {
  display: "flex",
  gap: 14,
  alignItems: "center",
  marginBottom: 14,
};

const img = {
  width: 90,
  height: 90,
  objectFit: "contain",
  background: "#f4f4f4",
};

const remove = {
  background: "none",
  border: "none",
  color: "#c00",
  cursor: "pointer",
};

const link = {
  background: "none",
  border: "none",
  color: "#000",
  textDecoration: "underline",
  cursor: "pointer",
};

const box = {
  border: "1px solid #e5e5e5",
  padding: 16,
  marginTop: 30,
};
