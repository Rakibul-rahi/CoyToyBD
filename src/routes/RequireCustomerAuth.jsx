import { Navigate, useLocation } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase/firebaseConfig";

/**
 * Gates buyer-only pages (checkout) behind a signed-in customer account.
 *
 * Unlike ProtectedRoute (which additionally checks for the admin email),
 * this only requires *any* authenticated Firebase user - customers never need
 * admin access. Guests are bounced to /login with the page they were headed
 * to stashed in router state, so Login/Signup can send them straight back to
 * checkout (with their cart untouched) right after they authenticate.
 */
export default function RequireCustomerAuth({ children }) {
  const [user, loading] = useAuthState(auth);
  const location = useLocation();

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
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
