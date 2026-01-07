// src/contexts/CartContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const { token } = useContext(AuthContext);

  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD CART ---------------- */
  useEffect(() => {
    if (!token) {
      setCart({ items: [] });
      return;
    }

    setLoading(true);

    fetch("http://localhost:5000/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setCart(d))
      .catch(() => setCart({ items: [] }))
      .finally(() => setLoading(false));
  }, [token]);

  /* ---------------- ADD / UPDATE ---------------- */
  const addToCart = async (productId, qty = 1) => {
    if (!token) return;

    // 🟢 Optimistic UI update (instant Zara feel)
    setCart((prev) => {
      const exists = prev.items.find((i) => i.productId === productId);
      if (exists) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.productId === productId
              ? { ...i, qty: i.qty + qty }
              : i
          ),
        };
      }
      return {
        ...prev,
        items: [...prev.items, { productId, qty }],
      };
    });

    await fetch("http://localhost:5000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, qty }),
    });
  };

  /* ---------------- DECREASE QTY ---------------- */
  const decreaseQty = async (productId) => {
    if (!token) return;

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return;

    if (item.qty === 1) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.productId === productId
          ? { ...i, qty: i.qty - 1 }
          : i
      ),
    }));

    await fetch("http://localhost:5000/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, qty: -1 }),
    });
  };

  /* ---------------- REMOVE ---------------- */
  const removeFromCart = async (productId) => {
    if (!token) return;

    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));

    await fetch("http://localhost:5000/api/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
  };

  /* ---------------- TOTAL ---------------- */
  const totalItems = cart.items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        addToCart,
        decreaseQty,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
