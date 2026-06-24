import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import ProductDetails from "../pages/Product/ProductDetails";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import ProtectedRoute from "./ProtectedRoute";
import Cart from "../pages/Cart/Cart";
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/cart" element={<Cart />} />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}