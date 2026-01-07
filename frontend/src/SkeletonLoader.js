import React from "react";

export default function Skeleton({ rows = 4 }) {
  return (
    <div style={{ padding: 20 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row" style={{ marginBottom: 12 }} />
      ))}
    </div>
  );
}
