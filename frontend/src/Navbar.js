import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "./contexts/CartContext";
import { AuthContext } from "./contexts/AuthContext";

export default function Navbar() {
  const { cart } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const count =
    cart?.items?.reduce((s, it) => s + (it.qty || 0), 0) || 0;

  return (
    <>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="hamburger"
            onClick={() =>
              document.body.classList.toggle("menu-open")
            }
          >
            ☰
          </button>

          <div className="brand" onClick={() => navigate("/")}>
            THE PERFUME CO
          </div>

          <button className="nav-home" onClick={() => navigate("/")}>
            Home
          </button>
        </div>

        <div className="topbar-center">
          <input
            className="search-input"
            placeholder="Search perfumes, brands..."
          />
        </div>

        <div className="topbar-right">
          {user ? (
            <>
              <button onClick={() => navigate("/account")}>Account</button>
              <button onClick={() => navigate("/cart")}>
                Bag ({count})
              </button>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => navigate("/cart")}>
                Bag ({count})
              </button>
            </>
          )}
        </div>
      </header>

      <nav className="side-menu">
        <h4>Collections</h4>
        <ul>
          <li onClick={() => navigate("/?category=Women")}>Women</li>
          <li onClick={() => navigate("/?category=Men")}>Men</li>
          <li onClick={() => navigate("/?category=Unisex")}>Unisex</li>
        </ul>
      </nav>
    </>
  );
}
