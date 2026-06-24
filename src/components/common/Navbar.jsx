import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase/firebaseConfig";
import { useCart } from "../../context/CartContext";

/* ---------------------------------------------------------
   CoyToy — Navbar
   Shares the palette + type tokens from the storefront page:
     bg-panel  #0c1020   cyan  #3fe3ff   magenta #ff3fc7
     line      #1c2340   ink   #eef1fb   mute    #8993b8
   display: "Orbitron" (wordmark)   body: "Inter" (links)
--------------------------------------------------------- */

const FONT_LINK_ID = "coytoy-cyberpunk-fonts";

function ensureFontsLoaded() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap";
  document.head.appendChild(link);
}

const NAV_STYLE_ID = "coytoy-navbar-styles";

function ensureNavStylesInjected() {
  if (typeof document === "undefined") return;
  if (document.getElementById(NAV_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = NAV_STYLE_ID;
  style.textContent = `
@keyframes coytoy-badge-pulse {
  0%, 100% { box-shadow: 0 0 6px rgba(63,227,255,0.55), 0 0 0 0 rgba(63,227,255,0.4); }
  50% { box-shadow: 0 0 10px rgba(63,227,255,0.85), 0 0 0 4px rgba(63,227,255,0); }
}
.coytoy-brand-link { text-decoration: none; }
.coytoy-cart-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #eef1fb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #1c2340;
  background: rgba(63,227,255,0.06);
  transition: all 0.2s ease;
}
.coytoy-cart-link:hover {
  border-color: #3fe3ff;
  background: rgba(63,227,255,0.14);
  box-shadow: 0 0 16px rgba(63,227,255,0.3);
}
.coytoy-cart-link:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}
.coytoy-cart-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 999px;
  background: #ff3fc7;
  color: #06080f;
  font-family: 'Orbitron', sans-serif;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(255,63,199,0.7);
}
.coytoy-logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #3a1c30;
  background: rgba(255,77,109,0.06);
  color: #ff8fa3;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.coytoy-logout-btn:hover {
  border-color: #ff4d6d;
  background: rgba(255,77,109,0.14);
  color: #ff4d6d;
  box-shadow: 0 0 14px rgba(255,77,109,0.35);
}
.coytoy-logout-btn:focus-visible {
  outline: 2px solid #ff4d6d;
  outline-offset: 2px;
}
.coytoy-admin-link {
  font-size: 12px;
  font-weight: 600;
  color: #5b6390;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #1c2340;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.coytoy-admin-link:hover {
  color: #3fe3ff;
  border-color: #3fe3ff;
  background: rgba(63,227,255,0.08);
}
.coytoy-admin-link:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}
.coytoy-brand-link:focus-visible {
  outline: 2px solid #ff3fc7;
  outline-offset: 4px;
  border-radius: 6px;
}
@media (prefers-reduced-motion: reduce) {
  .coytoy-cart-badge.has-items { animation: none !important; }
}
@media (max-width: 760px) {
  .coytoy-nav-row { flex-wrap: wrap; row-gap: 12px; }
  .coytoy-admin-group { margin-left: 0 !important; }
}
`;
  document.head.appendChild(style);
}

export default function Navbar() {
  ensureFontsLoaded();
  ensureNavStylesInjected();

  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantityInCart,
    0
  );

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/admin-login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(12,16,32,0.78)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #1c2340",
        boxShadow: "0 1px 0 rgba(63,227,255,0.08)",
      }}
    >
      <div
        className="coytoy-nav-row"
        style={{
          maxWidth: "1240px",
          marginInline: "auto",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          gap: "28px",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* brand */}
        <Link to="/" className="coytoy-brand-link" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg
            width="30"
            height="18"
            viewBox="0 0 200 80"
            aria-hidden="true"
            style={{ filter: "drop-shadow(0 0 6px #3fe3ff) drop-shadow(0 0 10px rgba(63,227,255,0.5))" }}
          >
            <path
              d="M10 58 Q40 56 55 40 Q72 22 95 18 L150 18 Q170 18 178 36 L185 36 Q192 36 192 44 L192 54 Q192 58 186 58 L20 58 Q10 58 10 58 Z"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="48" cy="58" r="9" fill="none" stroke="#3fe3ff" strokeWidth="4" />
            <circle cx="155" cy="58" r="9" fill="none" stroke="#3fe3ff" strokeWidth="4" />
          </svg>
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: "19px",
              letterSpacing: "1.5px",
              color: "#ff3fc7",
              textShadow: "0 0 8px rgba(255,63,199,0.7), 0 0 18px rgba(255,63,199,0.35)",
            }}
          >
            COYTOY
          </span>
        </Link>

        {/* right cluster: cart, admin group, logout */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginLeft: "auto" }}>
          <Link to="/cart" className="coytoy-cart-link" aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}>
            <span aria-hidden="true" style={{ fontSize: "15px" }}>🛒</span>
            <span>Cart</span>
            <span className={"coytoy-cart-badge" + (cartCount > 0 ? " has-items" : "")} style={cartCount > 0 ? { animation: "coytoy-badge-pulse 2s ease-in-out infinite" } : undefined}>
              {cartCount}
            </span>
          </Link>

          <div
            className="coytoy-admin-group"
            style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "4px" }}
          >
            <NavLink
              to="/admin-login"
              className={({ isActive }) => "coytoy-admin-link" + (isActive ? " is-active" : "")}
            >
              Admin Login
            </NavLink>
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) => "coytoy-admin-link" + (isActive ? " is-active" : "")}
            >
              Dashboard
            </NavLink>
          </div>

          <button onClick={handleLogout} disabled={loggingOut} className="coytoy-logout-btn">
            {loggingOut ? "Signing out…" : "Logout"}
          </button>
        </div>
      </div>
    </nav>
  );
}