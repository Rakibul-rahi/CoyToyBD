import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../services/firebase/firebaseConfig";
import { useCart } from "../../context/CartContext";

const ADMIN_EMAIL = "admin@coytoybd.com";

const FONT_LINK_ID = "coytoy-cyberpunk-fonts";
const NAV_STYLE_ID = "coytoy-navbar-styles";

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

function ensureNavStylesInjected() {
  if (typeof document === "undefined") return;
  if (document.getElementById(NAV_STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = NAV_STYLE_ID;
  style.textContent = `
* {
  box-sizing: border-box;
}

@keyframes coytoy-badge-pulse {
  0%, 100% {
    box-shadow: 0 0 6px rgba(63,227,255,0.55), 0 0 0 0 rgba(63,227,255,0.4);
  }
  50% {
    box-shadow: 0 0 10px rgba(63,227,255,0.85), 0 0 0 4px rgba(63,227,255,0);
  }
}

.coytoy-brand-link {
  text-decoration: none;
}

.coytoy-nav-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
}

.coytoy-admin-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.coytoy-cart-link,
.coytoy-logout-btn,
.coytoy-admin-link,
.coytoy-menu-btn {
  white-space: nowrap;
}

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

.coytoy-admin-link {
  font-size: 12px;
  font-weight: 600;
  color: #8993b8;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #1c2340;
}

.coytoy-admin-link.is-active {
  color: #3fe3ff;
  border-color: #3fe3ff;
  background: rgba(63,227,255,0.1);
}

.coytoy-logout-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #3a1c30;
  background: rgba(255,77,109,0.06);
  color: #ff8fa3;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.coytoy-logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.coytoy-menu-btn {
  display: none;
  margin-left: auto;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #1c2340;
  background: rgba(63,227,255,0.08);
  color: #3fe3ff;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 760px) {
  .coytoy-nav-row {
    padding: 12px 16px !important;
    flex-wrap: wrap;
    gap: 12px !important;
  }

  .coytoy-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .coytoy-nav-actions {
    display: none;
    width: 100%;
    margin-left: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px solid #1c2340;
  }

  .coytoy-nav-actions.open {
    display: flex;
  }

  .coytoy-admin-group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  .coytoy-cart-link,
  .coytoy-admin-link,
  .coytoy-logout-btn {
    width: 100%;
    justify-content: center;
  }
}
`;
  document.head.appendChild(style);
}

export default function Navbar() {
  ensureFontsLoaded();
  ensureNavStylesInjected();

  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [user] = useAuthState(auth);

  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantityInCart || 0),
    0
  );

  const handleLogout = async () => {
  setLoggingOut(true);

  try {
    await signOut(auth);
    setMenuOpen(false);
    navigate("/", { replace: true });
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
        width: "100%",
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
        <Link
          to="/"
          className="coytoy-brand-link"
          onClick={() => setMenuOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <svg
            width="30"
            height="18"
            viewBox="0 0 200 80"
            aria-hidden="true"
            style={{
              filter:
                "drop-shadow(0 0 6px #3fe3ff) drop-shadow(0 0 10px rgba(63,227,255,0.5))",
            }}
          >
            <path
              d="M10 58 Q40 56 55 40 Q72 22 95 18 L150 18 Q170 18 178 36 L185 36 Q192 36 192 44 L192 54 Q192 58 186 58 L20 58 Q10 58 10 58 Z"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle
              cx="48"
              cy="58"
              r="9"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="4"
            />
            <circle
              cx="155"
              cy="58"
              r="9"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="4"
            />
          </svg>

          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: "19px",
              letterSpacing: "1.5px",
              color: "#ff3fc7",
              textShadow:
                "0 0 8px rgba(255,63,199,0.7), 0 0 18px rgba(255,63,199,0.35)",
            }}
          >
            COYTOY
          </span>
        </Link>

        <button
          className="coytoy-menu-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <div className={`coytoy-nav-actions ${menuOpen ? "open" : ""}`}>
          <Link
            to="/cart"
            className="coytoy-cart-link"
            onClick={() => setMenuOpen(false)}
          >
            <span>🛒</span>
            <span>Cart</span>
            <span
              className={
                "coytoy-cart-badge" + (cartCount > 0 ? " has-items" : "")
              }
              style={
                cartCount > 0
                  ? { animation: "coytoy-badge-pulse 2s ease-in-out infinite" }
                  : undefined
              }
            >
              {cartCount}
            </span>
          </Link>

          <div className="coytoy-admin-group">
            {!isAdmin && (
              <NavLink
                to="/admin-login"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  "coytoy-admin-link" + (isActive ? " is-active" : "")
                }
              >
                Admin Login
              </NavLink>
            )}

            {isAdmin && (
              <NavLink
                to="/admin-dashboard"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  "coytoy-admin-link" + (isActive ? " is-active" : "")
                }
              >
                Dashboard
              </NavLink>
            )}
          </div>

          {isAdmin && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="coytoy-logout-btn"
            >
              {loggingOut ? "Signing out…" : "Logout"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}