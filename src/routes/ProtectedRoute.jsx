import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase/firebaseConfig";
import { ADMIN_EMAIL } from "../constants/admin";

/**
 * Gates the admin pages on the admin email, matching isAdmin() in
 * firestore.rules. This is only a UX guard — the real enforcement lives in
 * the rules, which check the same email server-side. (A custom-claim check
 * would be stronger, but this app has no Cloud Functions/Admin SDK to ever
 * set that claim, so there'd be no way to grant it.)
 */
export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#06080f",
          color: "#8993b8",
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: "0.4px",
        }}
      >
        Verifying access…
      </div>
    );
  }

  if (!user) return <Navigate to="/admin-login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />;

  return children;
}