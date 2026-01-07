// src/RelatedProducts.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 🔹 Safe image resolver
const IMG = (file) => {
  if (!file) return "/images/hero.png";
  if (file.startsWith("http")) return file;
  return `/images/${file}`;
};

export default function RelatedProducts({ productId }) {
  const [related, setRelated] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/related/${productId}`)
      .then((r) => r.json())
      .then((d) => setRelated(Array.isArray(d) ? d : []))
      .catch(() => setRelated([]));
  }, [productId]);

  if (!related.length) return null;

  return (
    <section style={{ padding: "18px 0" }}>
      <h3 style={{ marginLeft: 12 }}>You may also like</h3>

      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          padding: "12px",
        }}
      >
        {related.map((p) => (
          <div
            key={p._id}
            style={{ width: 200, minWidth: 200, cursor: "pointer" }}
            onClick={() => navigate(`/product/${p._id}`)}
          >
            <div
              style={{
                height: 140,
                overflow: "hidden",
                borderRadius: 8,
                background: "#f4f4f4",
              }}
            >
              <img
                src={IMG(p.image)}
                alt={p.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
                onError={(e) => (e.target.src = "/images/hero.png")}
              />
            </div>

            <div style={{ fontWeight: 700, marginTop: 8 }}>
              {p.name}
            </div>
            <div style={{ color: "#666" }}>₹{p.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
