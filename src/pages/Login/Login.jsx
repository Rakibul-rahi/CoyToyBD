import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase/firebaseConfig";

/* ---------------------------------------------------------
   CoyToy — Customer Login
   Shares tokens with AdminLogin / Navbar / Home:
     bg-void #06080f   bg-panel #0c1020   line #1c2340
     cyan #3fe3ff   magenta #ff3fc7   red #ff4d6d
     ink #eef1fb   mute #8993b8
   display: "Orbitron" (eyebrow + brand)   body: "Inter"
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

const STYLE_ID = "coytoy-customerauth-styles";

function ensureStylesInjected() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
@keyframes coytoy-cauth-twinkle { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes coytoy-cauth-fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes coytoy-cauth-flicker-in {
  0% { opacity: 0; filter: brightness(2.5); }
  8% { opacity: 1; } 10% { opacity: 0.4; } 12% { opacity: 1; }
  20% { opacity: 0.7; } 24% { opacity: 1; filter: brightness(1); }
  100% { opacity: 1; filter: brightness(1); }
}
@keyframes coytoy-cauth-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
@keyframes coytoy-cauth-spin { to { transform: rotate(360deg); } }

.coytoy-cauth-card { animation: coytoy-cauth-fade-up 0.5s ease both; }
.coytoy-cauth-wordmark { animation: coytoy-cauth-flicker-in 1.2s ease-out both; }
.coytoy-cauth-error { animation: coytoy-cauth-shake 0.4s ease; }

.coytoy-cauth-input {
  width: 100%;
  padding: 13px 14px;
  border-radius: 10px;
  border: 1px solid #1c2340;
  background: #0c1020;
  color: #eef1fb;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.coytoy-cauth-input::placeholder { color: #5b6390; }
.coytoy-cauth-input:focus {
  outline: none;
  border-color: #3fe3ff;
  box-shadow: 0 0 0 3px rgba(63,227,255,0.18), 0 0 18px rgba(63,227,255,0.25);
}
.coytoy-cauth-input:focus-visible { outline: none; }

.coytoy-cauth-pw-toggle {
  background: none;
  border: none;
  color: #5b6390;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.3px;
  padding: 4px 6px;
  transition: color 0.2s ease;
}
.coytoy-cauth-pw-toggle:hover { color: #3fe3ff; }
.coytoy-cauth-pw-toggle:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
  border-radius: 4px;
}

.coytoy-cauth-submit-btn {
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  border: 1px solid #3fe3ff;
  background: rgba(63,227,255,0.12);
  color: #3fe3ff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.4px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}
.coytoy-cauth-submit-btn:hover:not(:disabled) {
  background: rgba(63,227,255,0.22);
  box-shadow: 0 0 18px rgba(63,227,255,0.4);
}
.coytoy-cauth-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.coytoy-cauth-submit-btn:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}

.coytoy-cauth-switch-link {
  color: #ff3fc7;
  font-weight: 700;
  text-decoration: none;
}
.coytoy-cauth-switch-link:hover { text-decoration: underline; }
.coytoy-cauth-switch-link:focus-visible {
  outline: 2px solid #ff3fc7;
  outline-offset: 2px;
  border-radius: 4px;
}

.coytoy-cauth-spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(63,227,255,0.3);
  border-top-color: #3fe3ff;
  animation: coytoy-cauth-spin 0.7s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .coytoy-cauth-card, .coytoy-cauth-wordmark, .coytoy-cauth-error, .coytoy-cauth-spinner { animation: none !important; }
}
@media (max-width: 480px) {
  .coytoy-cauth-card { padding: 28px 22px !important; }
}
`;
  document.head.appendChild(style);
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (
    code.includes("invalid-credential") ||
    code.includes("wrong-password") ||
    code.includes("user-not-found")
  ) {
    return "Incorrect email or password. Please try again.";
  }
  if (code.includes("too-many-requests")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  if (code.includes("invalid-email")) {
    return "Enter a valid email address.";
  }
  if (code.includes("network-request-failed")) {
    return "Network error. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

export default function Login() {
  ensureFontsLoaded();
  ensureStylesInjected();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, authLoading] = useAuthState(auth);

  const from = location.state?.from || "/";

  // If someone lands on /login while already signed in (e.g. back button),
  // send them straight on to wherever they were headed.
  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate(from, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, currentUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(63,227,255,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(255,63,199,0.10), transparent), #06080f",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#eef1fb",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      {/* starfield layer */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20% 30%, #ffffff 100%, transparent), radial-gradient(1px 1px at 75% 15%, #ffffff 100%, transparent), radial-gradient(1px 1px at 40% 70%, #ffffff 100%, transparent), radial-gradient(2px 2px at 85% 80%, #ffffff 100%, transparent), radial-gradient(1px 1px at 10% 85%, #ffffff 100%, transparent), radial-gradient(1.5px 1.5px at 60% 45%, #ffffff 100%, transparent), radial-gradient(1px 1px at 95% 50%, #ffffff 100%, transparent), radial-gradient(1px 1px at 30% 10%, #ffffff 100%, transparent)",
          backgroundSize: "100% 100%",
          opacity: 0.5,
          animation: "coytoy-cauth-twinkle 4s ease-in-out infinite",
        }}
      />

      <div
        className="coytoy-cauth-card"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "400px",
          padding: "40px 36px",
          borderRadius: "18px",
          background: "rgba(12,16,32,0.7)",
          border: "1px solid #1c2340",
          backdropFilter: "blur(14px)",
          boxShadow: "0 0 60px rgba(63,227,255,0.06), 0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <svg
            width="64"
            height="26"
            viewBox="0 0 200 80"
            aria-hidden="true"
            style={{
              filter: "drop-shadow(0 0 8px #3fe3ff) drop-shadow(0 0 16px rgba(63,227,255,0.5))",
              marginBottom: "6px",
            }}
          >
            <path
              d="M10 58 Q40 56 55 40 Q72 22 95 18 L150 18 Q170 18 178 36 L185 36 Q192 36 192 44 L192 54 Q192 58 186 58 L20 58 Q10 58 10 58 Z"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <circle cx="48" cy="58" r="9" fill="none" stroke="#3fe3ff" strokeWidth="3" />
            <circle cx="155" cy="58" r="9" fill="none" stroke="#3fe3ff" strokeWidth="3" />
          </svg>
          <h1
            className="coytoy-cauth-wordmark"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: "28px",
              letterSpacing: "2px",
              margin: 0,
              color: "#ff3fc7",
              textShadow: "0 0 8px rgba(255,63,199,0.8), 0 0 20px rgba(255,63,199,0.4)",
            }}
          >
            COYTOY
          </h1>
        </div>

        <p
          style={{
            textAlign: "center",
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 600,
            fontSize: "11px",
            letterSpacing: "4px",
            color: "#3fe3ff",
            textShadow: "0 0 8px rgba(63,227,255,0.6)",
            textTransform: "uppercase",
            margin: "0 0 28px",
          }}
        >
          Customer Login
        </p>

        {error && (
          <div
            className="coytoy-cauth-error"
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "11px 13px",
              borderRadius: "10px",
              border: "1px solid #3a1c30",
              background: "rgba(255,77,109,0.1)",
              color: "#ff8fa3",
              fontSize: "13px",
              lineHeight: 1.4,
              marginBottom: "18px",
            }}
          >
            <span aria-hidden="true" style={{ marginTop: "1px" }}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="customer-email"
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.4px",
                color: "#8993b8",
                marginBottom: "7px",
              }}
            >
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="coytoy-cauth-input"
              required
            />
          </div>

          <div style={{ marginBottom: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "7px",
              }}
            >
              <label
                htmlFor="customer-password"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.4px",
                  color: "#8993b8",
                }}
              >
                Password
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Link
                  to="/forgot-password"
                  className="coytoy-cauth-switch-link"
                  style={{ fontSize: "12px" }}
                >
                  Forgot password?
                </Link>
                <button
                  type="button"
                  className="coytoy-cauth-pw-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <input
              id="customer-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="coytoy-cauth-input"
              required
            />
          </div>

          <button type="submit" className="coytoy-cauth-submit-btn" disabled={submitting}>
            {submitting && <span className="coytoy-cauth-spinner" aria-hidden="true" />}
            {submitting ? "Signing in…" : "Log In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#8993b8",
            marginTop: "22px",
            marginBottom: 0,
          }}
        >
          New to CoyToy?{" "}
          <Link
            to="/signup"
            state={{ from: location.state?.from }}
            className="coytoy-cauth-switch-link"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
