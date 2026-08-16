// Single source of truth for the admin account's email.
// Mirrors isAdmin() in firestore.rules - both must stay in sync, since the
// rules are the actual server-side enforcement and this is only the client
// UX gate (Navbar link visibility, ProtectedRoute).
export const ADMIN_EMAIL = "admin@coytoybd.com";
