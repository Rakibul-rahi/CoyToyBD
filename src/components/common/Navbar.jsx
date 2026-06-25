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
    box-shadow: 0 0 6px rgba(255,63,199,0.65), 0 0 0 0 rgba(255,63,199,0.4);
  }
  50% {
    box-shadow: 0 0 12px rgba(255,63,199,0.95), 0 0 0 5px rgba(255,63,199,0);
  }
}

.coytoy-brand-link,
.coytoy-main-link,
.coytoy-mobile-cart,
.coytoy-cart-link {
  text-decoration: none;
}

.coytoy-nav-row {
  position: relative;
}

.coytoy-brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coytoy-brand-logo {
  filter: drop-shadow(0 0 6px #3fe3ff)
          drop-shadow(0 0 10px rgba(63,227,255,0.5));
}

.coytoy-brand-text {
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: 19px;
  letter-spacing: 1.5px;
  color: #ff3fc7;
  text-shadow:
    0 0 8px rgba(255,63,199,0.7),
    0 0 18px rgba(255,63,199,0.35);
}

.coytoy-main-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coytoy-main-link {
  color: #8993b8;
  font-size: 14px;
  font-weight: 700;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid transparent;
}

.coytoy-main-link.is-active {
  color: #3fe3ff;
  border-color: #1c7f94;
  background: rgba(63,227,255,0.1);
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
.coytoy-menu-btn,
.coytoy-mobile-cart {
  white-space: nowrap;
}

.coytoy-cart-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #eef1fb;
  font-size: 14px;
  font-weight: 700;
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
  font-weight: 800;
  box-shadow: 0 0 8px rgba(255,63,199,0.7);
}

.coytoy-admin-link {
  font-size: 12px;
  font-weight: 700;
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
  font-weight: 800;
  cursor: pointer;
}

.coytoy-logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.coytoy-menu-btn {
  display: none;
  border: none;
  background: transparent;
  color: #eef1fb;
  font-size: 25px;
  cursor: pointer;
  padding: 8px;
}

.coytoy-mobile-cart {
  display: none;
}

.coytoy-cart-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.coytoy-mobile-cart-badge {
  position: absolute;
  top: -8px;
  right: -9px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ff3fc7;
  color: #06080f;
  font-family: 'Orbitron', sans-serif;
  font-size: 10px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(255,63,199,0.75);
}

@media (max-width: 760px) {
  .coytoy-nav-row {
    height: 48px;
    padding: 0 14px !important;
    display: grid !important;
    grid-template-columns: 44px 1fr 44px;
    align-items: center;
    gap: 0 !important;
  }

  .coytoy-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: 44px;
    height: 44px;
    grid-column: 1;
  }

  .coytoy-brand-link {
    grid-column: 2;
    justify-content: center;
    justify-self: center;
    gap: 7px;
  }

  .coytoy-brand-logo {
    width: 26px;
    height: 16px;
  }

  .coytoy-brand-text {
    font-size: 16px;
    letter-spacing: 1.2px;
  }

  .coytoy-mobile-cart {
    grid-column: 3;
    justify-self: end;
    width: 44px;
    height: 44px;
    color: #eef1fb;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
  }

  .coytoy-main-links,
  .coytoy-nav-actions {
    display: none;
    position: absolute;
    top: 48px;
    left: 0;
    right: 0;
    width: 100%;
    margin-left: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 14px;
    border-top: 1px solid #1c2340;
    background: rgba(7, 9, 26, 0.98);
    backdrop-filter: blur(16px);
    box-shadow: 0 18px 40px rgba(0,0,0,0.45);
    z-index: 60;
  }

  .coytoy-main-links.open {
    display: flex;
  }

  .coytoy-nav-actions.open {
    display: flex;
    top: calc(48px + 116px);
    border-top: none;
    padding-top: 0;
  }

  .coytoy-main-link,
  .coytoy-cart-link,
  .coytoy-admin-link,
  .coytoy-logout-btn {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .coytoy-cart-link {
    display: none;
  }

  .coytoy-admin-group {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
}
`;

  document.head.appendChild(style);
}

function CartIcon({ size = 23 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.2 6.4H20L18.7 14.2H7.5L6.2 6.4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 6.4L5.7 3.8H3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="9" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BrandLogo() {
  return (
    <>
      <svg
        className="coytoy-brand-logo"
        width="30"
        height="18"
        viewBox="0 0 200 80"
        aria-hidden="true"
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

      <span className="coytoy-brand-text">COYTOY</span>
    </>
  );
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

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await signOut(auth);
      closeMenu();
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
        background: "rgba(12,16,32,0.88)",
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
        <button
          className="coytoy-menu-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <Link to="/" className="coytoy-brand-link" onClick={closeMenu}>
          <BrandLogo />
        </Link>

        <Link to="/cart" className="coytoy-mobile-cart" onClick={closeMenu}>
          <span className="coytoy-cart-icon-wrap">
            <CartIcon />
            {cartCount > 0 && (
              <span
                className="coytoy-mobile-cart-badge"
                style={{
                  animation: "coytoy-badge-pulse 2s ease-in-out infinite",
                }}
              >
                {cartCount}
              </span>
            )}
          </span>
        </Link>

        <div className={`coytoy-main-links ${menuOpen ? "open" : ""}`}>
          <NavLink
            to="/"
            end
            onClick={closeMenu}
            className={({ isActive }) =>
              "coytoy-main-link" + (isActive ? " is-active" : "")
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            onClick={closeMenu}
            className={({ isActive }) =>
              "coytoy-main-link" + (isActive ? " is-active" : "")
            }
          >
            Shop
          </NavLink>
        </div>

        <div className={`coytoy-nav-actions ${menuOpen ? "open" : ""}`}>
          <Link to="/cart" className="coytoy-cart-link" onClick={closeMenu}>
            <CartIcon size={20} />
            <span>Cart</span>

            <span
              className="coytoy-cart-badge"
              style={
                cartCount > 0
                  ? { animation: "coytoy-badge-pulse 2s ease-in-out infinite" }
                  : undefined
              }
            >
              {cartCount}
            </span>
          </Link>

          {isAdmin && (
            <div className="coytoy-admin-group">
              <NavLink
                to="/admin-dashboard"
                onClick={closeMenu}
                className={({ isActive }) =>
                  "coytoy-admin-link" + (isActive ? " is-active" : "")
                }
              >
                Dashboard
              </NavLink>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="coytoy-logout-btn"
              >
                {loggingOut ? "Signing out…" : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}