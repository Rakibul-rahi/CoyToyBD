import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";

/* ---------------------------------------------------------
   CoyToy — Landing Page
   Fixed equal product card sizes
--------------------------------------------------------- */

const FONT_LINK_ID = "coytoy-cyberpunk-fonts";

function useInjectFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;

    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);
}

const KEYFRAMES = `
.ct-landing *,
.ct-landing *::before,
.ct-landing *::after {
  box-sizing: border-box;
}

.ct-landing *::selection {
  background: #ff3fc7;
  color: #06080f;
}

@keyframes ct-flicker-in {
  0%   { opacity: 0; filter: brightness(3); }
  8%   { opacity: 1; }
  10%  { opacity: 0.3; }
  13%  { opacity: 1; }
  20%  { opacity: 0.6; }
  24%  { opacity: 1; filter: brightness(1); }
  100% { opacity: 1; filter: brightness(1); }
}

@keyframes ct-fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes ct-twinkle {
  0%, 100% { opacity: 0.2; }
  50%      { opacity: 0.8; }
}

@keyframes ct-scan {
  0%   { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes ct-pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(255,63,199,0.5); }
  70%  { box-shadow: 0 0 0 12px rgba(255,63,199,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,63,199,0); }
}

@keyframes ct-glow-pulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

@keyframes ct-ticker {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes ct-badge-pop {
  0%   { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.ct-hero-title {
  animation: ct-flicker-in 1.5s ease-out both;
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  font-size: clamp(42px, 8vw, 88px);
  letter-spacing: 4px;
  line-height: 1;
  margin: 0;
  color: #ff3fc7;
  text-shadow:
    0 0 8px rgba(255,63,199,0.9),
    0 0 26px rgba(255,63,199,0.6),
    0 0 60px rgba(255,63,199,0.35);
}

.ct-hero-sub {
  animation: ct-fade-up 0.9s 0.6s ease both;
}

.ct-cta-primary {
  animation: ct-fade-up 0.9s 0.9s ease both;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  border-radius: 12px;
  border: 1.5px solid #ff3fc7;
  background: rgba(255,63,199,0.12);
  color: #ff3fc7;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-transform: uppercase;
  animation: ct-fade-up 0.9s 0.9s ease both, ct-pulse-ring 2.2s 1.5s ease-out infinite;
}

.ct-cta-primary:hover {
  background: rgba(255,63,199,0.25);
  box-shadow: 0 0 32px rgba(255,63,199,0.5);
  transform: translateY(-2px);
}

.ct-cta-secondary {
  animation: ct-fade-up 0.9s 1.05s ease both;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  border-radius: 12px;
  border: 1.5px solid #3fe3ff;
  background: rgba(63,227,255,0.08);
  color: #3fe3ff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1.5px;
  cursor: pointer;
  transition: all 0.25s ease;
  text-transform: uppercase;
}

.ct-cta-secondary:hover {
  background: rgba(63,227,255,0.18);
  box-shadow: 0 0 24px rgba(63,227,255,0.4);
  transform: translateY(-2px);
}

/* ---------- Fixed Product Cards ---------- */
.ct-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 220px));
  gap: 20px;
  align-items: stretch;
  justify-content: flex-start;
}

.ct-card {
  animation: ct-fade-up 0.5s ease both;
  transition: transform 0.3s ease;
  position: relative;
  width: 220px;
  height: 350px;
  min-height: 350px;
}

.ct-card:hover {
  transform: translateY(-8px);
}

.ct-card:hover .ct-card-glow {
  opacity: 1;
}

.ct-card:hover .ct-scanline {
  opacity: 1;
}

.ct-card:hover .ct-card-img {
  transform: scale(1.07);
  filter: saturate(1.2) brightness(1.05);
}

.ct-card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}

.ct-card-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 34px;
}

.ct-section-label {
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #3fe3ff;
  opacity: 0.8;
}

.ct-ticker-track {
  display: flex;
  gap: 48px;
  white-space: nowrap;
  animation: ct-ticker 24s linear infinite;
  will-change: transform;
}

.ct-offer-badge {
  animation: ct-badge-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.ct-add-btn {
  width: 100%;
  padding: 10px;
  border-radius: 9px;
  border: 1px solid #3fe3ff;
  background: rgba(63,227,255,0.1);
  color: #3fe3ff;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ct-add-btn:hover {
  background: rgba(63,227,255,0.22);
  box-shadow: 0 0 16px rgba(63,227,255,0.4);
}

.ct-add-btn:disabled {
  border-color: #1c2340;
  background: transparent;
  color: #5b6390;
  cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
  .ct-hero-title,
  .ct-hero-sub,
  .ct-cta-primary,
  .ct-cta-secondary,
  .ct-card,
  .ct-ticker-track,
  .ct-offer-badge {
    animation: none !important;
  }

  .ct-scanline {
    display: none !important;
  }
}

@media (max-width: 720px) {
  .ct-hero-actions {
    flex-direction: column !important;
    align-items: center !important;
  }

  .ct-cta-primary,
  .ct-cta-secondary {
    width: 100%;
    justify-content: center;
  }

  .ct-offer-grid {
    grid-template-columns: 1fr !important;
  }

  .ct-product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .ct-card {
    width: 100%;
    height: 350px;
  }
}
`;

function getStockStatus(quantity) {
  const qty = Number(quantity);

  if (qty <= 0) {
    return {
      text: "Out of Stock",
      color: "#ff4d6d",
      glow: "rgba(255,77,109,0.5)",
    };
  }

  if (qty <= 5) {
    return {
      text: "Low Stock",
      color: "#ffb14e",
      glow: "rgba(255,177,78,0.5)",
    };
  }

  return {
    text: "In Stock",
    color: "#3fe3ff",
    glow: "rgba(63,227,255,0.5)",
  };
}

function getProductImage(product) {
  return product.images?.[0] || product.imageUrl || product.image || "";
}

function shuffle(arr) {
  const a = [...arr];

  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

function StarsBg() {
  return (
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
        opacity: 0.45,
        animation: "ct-twinkle 4s ease-in-out infinite",
      }}
    />
  );
}

function ProductCard({ product, index, onAdd, onOpen }) {
  const stockStatus = getStockStatus(product.quantity);
  const outOfStock = Number(product.quantity) <= 0;
  const productImage = getProductImage(product);

  const handleOpen = () => {
    if (!product.id) return;
    onOpen(product);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  };

  return (
    <div
      className="ct-card"
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      style={{
        borderRadius: "16px",
        animationDelay: `${Math.min(index * 0.06, 0.4)}s`,
        cursor: "pointer",
      }}
    >
      <div
        className="ct-card-glow"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-1px",
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(63,227,255,0.55), rgba(255,63,199,0.55))",
          opacity: 0.3,
          filter: "blur(6px)",
          transition: "opacity 0.3s ease",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          borderRadius: "16px",
          background: "#0c1020",
          border: "1px solid #1c2340",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "150px",
            minHeight: "150px",
            overflow: "hidden",
            background: "#070a14",
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="ct-card-img"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                transition: "transform 0.4s ease, filter 0.4s ease",
                opacity: outOfStock ? 0.45 : 1,
                filter: outOfStock ? "grayscale(0.6)" : "none",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#5b6390",
                fontSize: "12px",
              }}
            >
              No Image
            </div>
          )}

          <div
            className="ct-scanline"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              transition: "opacity 0.3s ease",
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(63,227,255,0.25) 48%, transparent 100%)",
              animation: "ct-scan 1.8s linear infinite",
              pointerEvents: "none",
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(6,8,15,0.85), transparent 55%)",
            }}
          />

          <span
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              fontSize: "9px",
              fontWeight: 700,
              letterSpacing: "1px",
              padding: "3px 7px",
              borderRadius: "5px",
              textTransform: "uppercase",
              background: "rgba(6,8,15,0.7)",
              border: "1px solid #1c2340",
              color: "#3fe3ff",
            }}
          >
            {product.category || "Unsorted"}
          </span>
        </div>

        <div
          style={{
            padding: "12px 14px 14px",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <h3
            className="ct-card-title"
            style={{
              margin: "0 0 4px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#eef1fb",
              lineHeight: 1.3,
            }}
          >
            {product.name || "Unnamed Product"}
          </h3>

          <p
            className="ct-card-desc"
            style={{
              margin: "0 0 10px",
              fontSize: "11.5px",
              color: "#8993b8",
              lineHeight: 1.5,
            }}
          >
            {product.description || "No description available"}
          </p>

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "#ff3fc7",
                  textShadow: "0 0 10px rgba(255,63,199,0.5)",
                  whiteSpace: "nowrap",
                }}
              >
                {product.price} BDT
              </span>

              <span
                style={{
                  fontSize: "10px",
                  color: "#5b6390",
                  whiteSpace: "nowrap",
                }}
              >
                {product.quantity} left
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.4px",
                color: stockStatus.color,
                marginBottom: "10px",
                minHeight: "14px",
              }}
            >
              <span
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: stockStatus.color,
                  boxShadow: `0 0 6px ${stockStatus.glow}`,
                }}
              />
              {stockStatus.text.toUpperCase()}
            </div>

            <button
              className="ct-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              disabled={outOfStock}
            >
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, accent = "#3fe3ff" }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p className="ct-section-label" style={{ marginBottom: "8px" }}>
        {eyebrow}
      </p>

      <h2
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(22px, 4vw, 32px)",
          margin: 0,
          color: "#eef1fb",
          textShadow: `0 0 20px ${accent}55`,
        }}
      >
        {title}
      </h2>

      <div
        style={{
          marginTop: "10px",
          width: "48px",
          height: "3px",
          borderRadius: "2px",
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: "1px solid #1c2340" }} />;
}

export default function Landing() {
  useInjectFonts();

  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const data = await getProducts();
        setProducts(data);
      } catch (e) {
        console.error("Failed to load products:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const newProducts = useMemo(() => {
    if (!products.length) return [];
    return [...products].slice(-5).reverse();
  }, [products]);

  const trendyProducts = useMemo(() => {
    if (!products.length) return [];
    return shuffle(products).slice(0, 5);
  }, [products]);

  const handleAddToCart = (product) => {
    if (Number(product.quantity) <= 0) {
      alert("This product is out of stock");
      return;
    }

    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleOpenProduct = (product) => {
    if (!product?.id) return;
    navigate(`/product/${product.id}`);
  };

  const goToShop = () => navigate("/shop");

  const PAD = "clamp(20px, 5vw, 40px)";
  const MAX = "1240px";

  const tickerItems = [
    "Cars",
    "Dolls",
    "Action Figures",
    "Plush Toys",
    "Board Games",
    "Educational",
    "Collectibles",
    "Cyberpunk Exclusives",
  ];

  return (
    <div
      className="ct-landing"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,63,199,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(63,227,255,0.10), transparent), #06080f",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#eef1fb",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{KEYFRAMES}</style>
      <StarsBg />

      <div style={{ position: "relative", zIndex: 1 }}>
        <section
          style={{
            position: "relative",
            minHeight: "92vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: `80px ${PAD} 60px`,
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-10%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(900px, 130vw)",
              height: "min(600px, 80vw)",
              background:
                "radial-gradient(ellipse, rgba(255,63,199,0.22), rgba(63,227,255,0.14) 40%, transparent 70%)",
              filter: "blur(40px)",
              pointerEvents: "none",
              animation: "ct-glow-pulse 5s ease-in-out infinite",
            }}
          />

          <svg
            width="100"
            height="40"
            viewBox="0 0 200 80"
            aria-hidden="true"
            style={{
              filter:
                "drop-shadow(0 0 10px #3fe3ff) drop-shadow(0 0 20px rgba(63,227,255,0.6))",
              marginBottom: "18px",
            }}
          >
            <path
              d="M10 58 Q40 56 55 40 Q72 22 95 18 L150 18 Q170 18 178 36 L185 36 Q192 36 192 44 L192 54 Q192 58 186 58 L20 58 Q10 58 10 58 Z"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle
              cx="48"
              cy="58"
              r="9"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="2.5"
            />
            <circle
              cx="155"
              cy="58"
              r="9"
              fill="none"
              stroke="#3fe3ff"
              strokeWidth="2.5"
            />
            <line
              x1="12"
              y1="50"
              x2="60"
              y2="50"
              stroke="#3fe3ff"
              strokeWidth="2"
              opacity="0.6"
            />
            <line
              x1="12"
              y1="44"
              x2="45"
              y2="44"
              stroke="#3fe3ff"
              strokeWidth="1.5"
              opacity="0.4"
            />
          </svg>

          <h1 className="ct-hero-title">COYTOY</h1>

          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 600,
              fontSize: "12px",
              letterSpacing: "7px",
              color: "#3fe3ff",
              textShadow: "0 0 10px rgba(63,227,255,0.7)",
              marginTop: "14px",
              marginBottom: "0",
              textTransform: "uppercase",
              animation: "ct-fade-up 0.9s 0.35s ease both",
            }}
          >
            Fandom Collectibles
          </p>

          <p
            className="ct-hero-sub"
            style={{
              marginTop: "24px",
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "#8993b8",
              maxWidth: "560px",
              lineHeight: 1.65,
              marginBottom: 0,
            }}
          >
            The toy box of the future — cars, dolls, action figures, and rare
            collectibles straight from the grid.
          </p>

          <div
            className="ct-hero-actions"
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginTop: "40px",
              justifyContent: "center",
            }}
          >
            <button className="ct-cta-primary" onClick={goToShop}>
              <span>⚡</span> Shop Now
            </button>

            <button
              className="ct-cta-secondary"
              onClick={() =>
                document
                  .getElementById("ct-new")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View New Arrivals
            </button>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "28px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              opacity: 0.4,
              animation: "ct-fade-up 1s 1.5s ease both",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "2px",
                color: "#3fe3ff",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              SCROLL
            </span>

            <div
              style={{
                width: "1px",
                height: "28px",
                background: "linear-gradient(to bottom, #3fe3ff, transparent)",
              }}
            />
          </div>
        </section>

        <div
          style={{
            overflow: "hidden",
            borderTop: "1px solid #1c2340",
            borderBottom: "1px solid #1c2340",
            padding: "12px 0",
            background: "rgba(63,227,255,0.03)",
          }}
          aria-hidden="true"
        >
          <div style={{ display: "flex", gap: "0" }}>
            <div className="ct-ticker-track">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    color: i % 2 === 0 ? "#3fe3ff" : "#ff3fc7",
                    textTransform: "uppercase",
                    opacity: 0.75,
                  }}
                >
                  {item}
                  <span style={{ opacity: 0.3, marginLeft: "24px" }}>◆</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <Divider />

        <section
          id="ct-new"
          style={{
            padding: `72px ${PAD}`,
            maxWidth: MAX,
            marginInline: "auto",
          }}
        >
          <SectionHeading
            eyebrow="Just Arrived"
            title="New Products"
            accent="#3fe3ff"
          />

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="ct-product-grid">
              {newProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onAdd={handleAddToCart}
                  onOpen={handleOpenProduct}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: "32px" }}>
            <button
              className="ct-cta-secondary"
              onClick={goToShop}
              style={{ fontSize: "12px", padding: "12px 28px" }}
            >
              See All Products →
            </button>
          </div>
        </section>

        <Divider />

        <section
          style={{
            padding: `72px ${PAD}`,
            background:
              "radial-gradient(ellipse 80% 100% at 50% 50%, rgba(255,63,199,0.07), transparent 70%)",
          }}
        >
          <div style={{ maxWidth: MAX, marginInline: "auto" }}>
            <SectionHeading
              eyebrow="Limited Time"
              title="Offers & Deals"
              accent="#ff3fc7"
            />

            <div
              className="ct-offer-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <OfferCard
                badge="SEASONAL SALE"
                badgeColor="#ff3fc7"
                title="Summer Fandom Drop"
                body="Up to 30% off on selected Action Figures and Plush Toys. Stock is limited — grab yours before they're gone."
                cta="Shop Sale"
                ctaColor="#ff3fc7"
                bgAccent="rgba(255,63,199,0.06)"
                borderColor="rgba(255,63,199,0.25)"
                onCta={goToShop}
                index={0}
              />

              <OfferCard
                badge="BUNDLE DEAL"
                badgeColor="#3fe3ff"
                title="Buy 2, Save More"
                body="Mix and match any two toys from the Cars or Dolls category and get a special combo discount at checkout."
                cta="Browse Bundles"
                ctaColor="#3fe3ff"
                bgAccent="rgba(63,227,255,0.05)"
                borderColor="rgba(63,227,255,0.2)"
                onCta={goToShop}
                index={1}
              />

              <OfferCard
                badge="FLASH DEAL"
                badgeColor="#ffb14e"
                title="Weekend Collectibles"
                body="Every weekend a mystery collectible goes on flash sale. Follow us to be first in line when the next drop hits."
                cta="Explore Now"
                ctaColor="#ffb14e"
                bgAccent="rgba(255,177,78,0.05)"
                borderColor="rgba(255,177,78,0.2)"
                onCta={goToShop}
                index={2}
              />
            </div>
          </div>
        </section>

        <Divider />

        <section
          style={{
            padding: `72px ${PAD}`,
            maxWidth: MAX,
            marginInline: "auto",
          }}
        >
          <SectionHeading
            eyebrow="Everyone's Picking"
            title="Trending Now"
            accent="#ff3fc7"
          />

          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="ct-product-grid">
              {trendyProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  onAdd={handleAddToCart}
                  onOpen={handleOpenProduct}
                />
              ))}
            </div>
          )}

          <div style={{ marginTop: "32px" }}>
            <button
              className="ct-cta-secondary"
              onClick={goToShop}
              style={{ fontSize: "12px", padding: "12px 28px" }}
            >
              See Full Inventory →
            </button>
          </div>
        </section>

        <Divider />

        <section
          style={{
            padding: `96px ${PAD}`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(255,63,199,0.12), rgba(63,227,255,0.07) 50%, transparent 75%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <p className="ct-section-label" style={{ marginBottom: "14px" }}>
              Ready to explore?
            </p>

            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 5vw, 48px)",
                margin: "0 0 16px",
                color: "#eef1fb",
                lineHeight: 1.15,
              }}
            >
              The full inventory awaits.
            </h2>

            <p
              style={{
                color: "#8993b8",
                fontSize: "16px",
                maxWidth: "440px",
                marginInline: "auto",
                marginBottom: "36px",
                lineHeight: 1.65,
              }}
            >
              Browse every toy, filter by category and budget, and add your
              picks to cart in seconds.
            </p>

            <button
              className="ct-cta-primary"
              onClick={goToShop}
              style={{ fontSize: "16px", padding: "18px 52px" }}
            >
              ⚡ Shop Now
            </button>
          </div>
        </section>

        <footer
          style={{
            borderTop: "1px solid #1c2340",
            padding: "28px clamp(20px, 5vw, 40px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "3px",
              color: "#ff3fc7",
              textShadow: "0 0 10px rgba(255,63,199,0.5)",
            }}
          >
            COYTOY
          </span>

          <span style={{ fontSize: "12px", color: "#3b4266" }}>
            © {new Date().getFullYear()} CoyToy. Fandom Collectibles. All
            rights reserved.
          </span>
        </footer>
      </div>
    </div>
  );
}

function OfferCard({
  badge,
  badgeColor,
  title,
  body,
  cta,
  ctaColor,
  bgAccent,
  borderColor,
  onCta,
  index,
}) {
  return (
    <div
      className="ct-offer-badge"
      style={{
        padding: "28px",
        borderRadius: "16px",
        border: `1px solid ${borderColor}`,
        background: bgAccent,
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        animationDelay: `${index * 0.12}s`,
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontSize: "9px",
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          letterSpacing: "2.5px",
          color: badgeColor,
          border: `1px solid ${badgeColor}`,
          borderRadius: "4px",
          padding: "3px 9px",
          alignSelf: "flex-start",
          boxShadow: `0 0 10px ${badgeColor}44`,
        }}
      >
        {badge}
      </span>

      <h3
        style={{
          margin: 0,
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          fontSize: "18px",
          color: "#eef1fb",
          lineHeight: 1.3,
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: 0,
          fontSize: "13.5px",
          color: "#8993b8",
          lineHeight: 1.65,
        }}
      >
        {body}
      </p>

      <button
        onClick={onCta}
        style={{
          alignSelf: "flex-start",
          marginTop: "4px",
          padding: "10px 22px",
          borderRadius: "9px",
          border: `1px solid ${ctaColor}`,
          background: "transparent",
          color: ctaColor,
          fontSize: "12px",
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          letterSpacing: "1px",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = `${ctaColor}22`;
          e.currentTarget.style.boxShadow = `0 0 14px ${ctaColor}55`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {cta} →
      </button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "40px 0",
        color: "#5b6390",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "3px solid #1c2340",
          borderTopColor: "#ff3fc7",
          animation: "ct-pulse-ring 1.2s linear infinite",
        }}
      />

      <span style={{ fontSize: "13px", letterSpacing: "1px" }}>
        Loading inventory…
      </span>
    </div>
  );
}