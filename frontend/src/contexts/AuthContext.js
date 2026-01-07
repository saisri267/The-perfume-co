// src/contexts/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");

    if (!stored || stored === "null" || stored === "undefined") {
      setUser(null);
      setToken("");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(stored);
      setUser({
        id: decoded.id,
        email: decoded.email,
        mobile: decoded.mobile,
      });
      setToken(stored);
    } catch (err) {
      console.log("JWT decode failed", err);
      localStorage.removeItem("token");
      setUser(null);
      setToken("");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (tk, usr) => {
    localStorage.setItem("token", tk);
    setToken(tk);
    setUser(usr);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
