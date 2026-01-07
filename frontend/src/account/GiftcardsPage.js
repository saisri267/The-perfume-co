import React from "react";

export default function GiftCardsPage() {
  return (
    <div style={{ padding: 40 }}>
      <h2>GIFT CARDS & VOUCHERS</h2>

      <p style={{ color: "#666", marginTop: 10 }}>
        You currently have no active gift cards or vouchers.
      </p>

      <button className="cta-primary" style={{ marginTop: 20 }}>
        Add gift card
      </button>
    </div>
  );
}
