import { Navigate } from "react-router-dom";
import { auth } from "../services/firebase/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";

const ADMIN_EMAIL = "admin@coytoybd.com";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <h2 style={{ padding: "30px" }}>Checking login...</h2>;
  }

  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user.email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  return children;
}