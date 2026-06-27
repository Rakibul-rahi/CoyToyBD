import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#06080f",
        }}
      >
        <Navbar />

        <main style={{ flex: 1 }}>
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;