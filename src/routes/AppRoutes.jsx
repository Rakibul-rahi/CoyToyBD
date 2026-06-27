import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home/Home";
import Shop from "../pages/shop/Shop";
import ProductDetails from "../pages/Product/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import AdminLogin from "../pages/AdminLogin/AdminLogin";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import AdminOrders from "../pages/AdminOrders/AdminOrders";
import ProtectedRoute from "./ProtectedRoute";
import OrderSuccess from "../pages/OrderSuccess/OrderSuccess";
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public buyer routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-success" element={<OrderSuccess />} />

      {/* Hidden admin routes */}
      <Route path="/admin-login" element={<AdminLogin />} />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-orders"
        element={
          <ProtectedRoute>
            <AdminOrders />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}