import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";

/* ---------------------------------------------------------
   CoyToy — "Fandom Collectibles" cyberpunk shop page
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
.coytoy-root *,
.coytoy-root *::before,
.coytoy-root *::after {
  box-sizing: border-box;
}

.coytoy-root *::selection {
  background: #ff3fc7;
  color: #06080f;
}

.coytoy-input::placeholder {
  color: #5b6390;
}

.coytoy-input:focus,
.coytoy-select:focus {
  outline: none;
  border-color: #3fe3ff !important;
  box-shadow:
    0 0 0 3px rgba(63, 227, 255, 0.18),
    0 0 18px rgba(63, 227, 255, 0.25) !important;
}

.coytoy-chip:focus-visible,
.coytoy-btn:focus-visible,
.coytoy-input:focus-visible,
.coytoy-select:focus-visible,
.coytoy-card-link:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}

.coytoy-card-link {
  color: inherit;
  text-decoration: none;
  display: block;
  width: 236px;
  height: 370px;
}

.coytoy-search-wrap {
  position: relative;
  flex: 1 1 220px;
  min-width: 200px;
}

.coytoy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(236px, 236px));
  gap: 22px;
  align-items: stretch;
  justify-content: center;
}

.coytoy-card {
  animation: coytoy-fade-up 0.5s ease both;
  position: relative;
  width: 236px;
  height: 370px;
  min-height: 370px;
  border-radius: 16px;
  transition: transform 0.3s ease;
  cursor: pointer;
}

.coytoy-card:hover {
  transform: translateY(-6px);
}

.coytoy-card:hover .coytoy-card-glow {
  opacity: 1;
}

.coytoy-card:hover .coytoy-scanline {
  opacity: 1;
}

.coytoy-card:hover .coytoy-img {
  transform: scale(1.06);
  filter: saturate(1.15) brightness(1.05);
}

.coytoy-card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 39px;
}

.coytoy-card-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 38px;
}

.coytoy-wordmark {
  animation: coytoy-flicker-in 1.4s ease-out both;
}

@keyframes coytoy-twinkle {
  0%, 100% {
    opacity: 0.25;
  }
  50% {
    opacity: 1;
  }
}

@keyframes coytoy-drift {
  from {
    background-position: 0 0, 0 0;
  }
  to {
    background-position: 1000px 600px, -800px 500px;
  }
}

@keyframes coytoy-scan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

@keyframes coytoy-pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 63, 199, 0.45);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 63, 199, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 63, 199, 0);
  }
}

@keyframes coytoy-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes coytoy-flicker-in {
  0% {
    opacity: 0;
    filter: brightness(2.5);
  }
  8% {
    opacity: 1;
  }
  10% {
    opacity: 0.4;
  }
  12% {
    opacity: 1;
  }
  20% {
    opacity: 0.7;
  }
  24% {
    opacity: 1;
    filter: brightness(1);
  }
  100% {
    opacity: 1;
    filter: brightness(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .coytoy-card,
  .coytoy-wordmark {
    animation: none !important;
  }

  .coytoy-scanline {
    display: none !important;
  }
}

@media (max-width: 720px) {
  .coytoy-toolbar {
    flex-direction: column;
    align-items: stretch !important;
  }

  .coytoy-toolbar > * {
    width: 100% !important;
    min-width: 0 !important;
  }

  .coytoy-search-wrap {
    flex: 0 0 auto !important;
    height: auto !important;
    min-height: 0 !important;
  }

  .coytoy-hero-title {
    font-size: 38px !important;
  }

  .coytoy-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    justify-content: center;
  }

  .coytoy-card-link {
    width: 100%;
    height: 370px;
  }

  .coytoy-card {
    width: 100%;
    height: 370px;
  }
}

@media (max-width: 480px) {
  .coytoy-hero-title {
    font-size: 28px !important;
    letter-spacing: 2px !important;
  }

  .coytoy-grid {
    grid-template-columns: 1fr;
  }

  .coytoy-card-link {
    width: 100% !important;
    max-width: 320px !important;
    height: 370px;
    margin-inline: auto;
  }

  .coytoy-card {
    width: 100% !important;
    max-width: 320px !important;
    height: 370px;
  }

  .coytoy-toolbar {
    padding: 12px !important;
    gap: 12px !important;
  }

  .coytoy-toolbar input,
  .coytoy-toolbar select,
  .coytoy-toolbar button {
    width: 100% !important;
    min-width: 0 !important;
  }
}
`;

export default function Shop() {
  useInjectFonts();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const { addToCart } = useCart();

  const categories = [
    "All",
    "Cars",
    "Dolls",
    "Educational",
    "Action Figures",
    "Plush Toys",
    "Board Games",
  ];

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getProductImage = (product) => {
    return product.images?.[0] || product.imageUrl || product.image || "";
  };

  const getStockStatus = (quantity) => {
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
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productName = product.name || "";
      const productCategory = product.category || "";
      const productPrice = Number(product.price) || 0;

      const search = searchText.trim().toLowerCase();

      const matchesSearch =
        productName.toLowerCase().includes(search) ||
        productCategory.toLowerCase().includes(search) ||
        (product.uid || "").toLowerCase().includes(search) ||
        (product.id || "").toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "All" || productCategory === selectedCategory;

      const matchesMinPrice =
        minPrice === "" || productPrice >= Number(minPrice);

      const matchesMaxPrice =
        maxPrice === "" || productPrice <= Number(maxPrice);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [products, searchText, selectedCategory, minPrice, maxPrice]);

  const handleAddToCart = (product) => {
    if (Number(product.quantity) <= 0) {
      alert("This product is out of stock");
      return;
    }

    addToCart(product);
    alert(`${product.name} added to cart`);
  };

  const hasActiveFilters =
    searchText !== "" ||
    selectedCategory !== "All" ||
    minPrice !== "" ||
    maxPrice !== "";

  const resetFilters = () => {
    setSearchText("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div
      className="coytoy-root"
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
          animation: "coytoy-twinkle 4s ease-in-out infinite",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          style={{
            padding: "64px clamp(16px, 4vw, 32px) 48px",
            textAlign: "center",
            borderBottom: "1px solid #1c2340",
            position: "relative",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "min(640px, 90vw)",
              height: "min(280px, 40vw)",
              background:
                "radial-gradient(ellipse, rgba(255,63,199,0.18), rgba(63,227,255,0.10) 45%, transparent 75%)",
              filter: "blur(10px)",
              pointerEvents: "none",
            }}
          />

          <svg
            width="120"
            height="48"
            viewBox="0 0 200 80"
            aria-hidden="true"
            style={{
              filter:
                "drop-shadow(0 0 10px #3fe3ff) drop-shadow(0 0 20px rgba(63,227,255,0.6))",
              marginBottom: "10px",
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

          <h1
            className="coytoy-wordmark coytoy-hero-title"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 800,
              fontSize: "56px",
              letterSpacing: "4px",
              margin: 0,
              lineHeight: 1,
              color: "#ff3fc7",
              textShadow:
                "0 0 8px rgba(255,63,199,0.9), 0 0 22px rgba(255,63,199,0.6), 0 0 46px rgba(255,63,199,0.35)",
            }}
          >
            COYTOY SHOP
          </h1>

          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              letterSpacing: "6px",
              color: "#3fe3ff",
              textShadow: "0 0 10px rgba(63,227,255,0.7)",
              marginTop: "14px",
              marginBottom: 0,
              textTransform: "uppercase",
            }}
          >
            Fandom Collectibles
          </p>

          <p
            style={{
              marginTop: "18px",
              color: "#8993b8",
              fontSize: "15px",
              maxWidth: "480px",
              marginInline: "auto",
            }}
          >
            Cars, dolls, and collectibles from the toy box of the future.
            Browse the full inventory below.
          </p>
        </header>

        <div
          style={{
            padding: "28px clamp(16px, 4vw, 32px) 0",
            maxWidth: "1240px",
            marginInline: "auto",
          }}
        >
          <div
            className="coytoy-toolbar"
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
              background: "rgba(15,20,38,0.6)",
              border: "1px solid #1c2340",
              borderRadius: "14px",
              padding: "16px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="coytoy-search-wrap">
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#5b6390",
                  fontSize: "15px",
                }}
              >
                ⌖
              </span>

              <input
                type="text"
                placeholder="Search toys…"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="coytoy-input"
                aria-label="Search toys"
                style={{
                  width: "100%",
                  padding: "12px 14px 12px 36px",
                  borderRadius: "10px",
                  border: "1px solid #1c2340",
                  background: "#0c1020",
                  color: "#eef1fb",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  display: "block",
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="coytoy-select"
              aria-label="Filter by category"
              style={{
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #1c2340",
                background: "#0c1020",
                color: "#eef1fb",
                fontSize: "14px",
                fontFamily: "inherit",
                minWidth: "170px",
              }}
            >
              {categories.map((category) => (
                <option
                  key={category}
                  value={category}
                  style={{ background: "#0c1020" }}
                >
                  {category}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min BDT"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="coytoy-input"
              aria-label="Minimum price"
              style={{
                width: "110px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #1c2340",
                background: "#0c1020",
                color: "#eef1fb",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />

            <input
              type="number"
              placeholder="Max BDT"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="coytoy-input"
              aria-label="Maximum price"
              style={{
                width: "110px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #1c2340",
                background: "#0c1020",
                color: "#eef1fb",
                fontSize: "14px",
                fontFamily: "inherit",
              }}
            />

            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className="coytoy-btn"
              style={{
                padding: "12px 18px",
                borderRadius: "10px",
                border:
                  "1px solid " + (hasActiveFilters ? "#ff3fc7" : "#1c2340"),
                background: hasActiveFilters
                  ? "rgba(255,63,199,0.08)"
                  : "transparent",
                color: hasActiveFilters ? "#ff3fc7" : "#5b6390",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: hasActiveFilters ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              Reset
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "16px",
            }}
          >
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="coytoy-chip"
                  style={{
                    padding: "7px 16px",
                    borderRadius: "999px",
                    border: "1px solid " + (active ? "#3fe3ff" : "#1c2340"),
                    background: active
                      ? "rgba(63,227,255,0.12)"
                      : "transparent",
                    color: active ? "#3fe3ff" : "#8993b8",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    boxShadow: active
                      ? "0 0 14px rgba(63,227,255,0.35)"
                      : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <p
            style={{
              marginTop: "22px",
              color: "#5b6390",
              fontSize: "13px",
              letterSpacing: "0.3px",
            }}
          >
            <span style={{ color: "#3fe3ff", fontWeight: 700 }}>
              {filteredProducts.length}
            </span>{" "}
            {filteredProducts.length === 1 ? "unit" : "units"} found in
            inventory
          </p>
        </div>

        <div
          style={{
            padding: "20px clamp(16px, 4vw, 32px) 80px",
            maxWidth: "1240px",
            marginInline: "auto",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "14px",
                padding: "80px 0",
                color: "#5b6390",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "3px solid #1c2340",
                  borderTopColor: "#ff3fc7",
                  animation:
                    "coytoy-pulse-ring 1.4s linear infinite, coytoy-drift 1s linear infinite",
                }}
              />

              <span style={{ fontSize: "13px", letterSpacing: "1px" }}>
                Loading inventory…
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                border: "1px dashed #1c2340",
                borderRadius: "16px",
                color: "#8993b8",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>🛰️</div>

              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#eef1fb",
                  margin: "0 0 6px",
                }}
              >
                No products match these filters
              </p>

              <p style={{ fontSize: "14px", margin: "0 0 18px" }}>
                Try a wider price range or a different category.
              </p>

              <button
                onClick={resetFilters}
                className="coytoy-btn"
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1px solid #ff3fc7",
                  background: "rgba(255,63,199,0.1)",
                  color: "#ff3fc7",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="coytoy-grid">
              {filteredProducts.map((product, i) => {
                const stockStatus = getStockStatus(product.quantity);
                const outOfStock = Number(product.quantity) <= 0;
                const productImage = getProductImage(product);

                return (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="coytoy-card-link"
                    aria-label={`View details for ${product.name}`}
                  >
                    <div
                      className="coytoy-card"
                      style={{
                        animationDelay: `${Math.min(i * 0.05, 0.4)}s`,
                      }}
                    >
                      <div
                        className="coytoy-card-glow"
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: "-1px",
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, rgba(63,227,255,0.55), rgba(255,63,199,0.55))",
                          opacity: 0.35,
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
                            height: "160px",
                            minHeight: "160px",
                            overflow: "hidden",
                            background: "#070a14",
                          }}
                        >
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className="coytoy-img"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition:
                                  "transform 0.4s ease, filter 0.4s ease",
                                opacity: outOfStock ? 0.45 : 1,
                                filter: outOfStock ? "grayscale(0.6)" : "none",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#5b6390",
                                fontSize: "13px",
                              }}
                            >
                              No Image
                            </div>
                          )}

                          <div
                            className="coytoy-scanline"
                            aria-hidden="true"
                            style={{
                              position: "absolute",
                              inset: 0,
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                              background:
                                "linear-gradient(to bottom, transparent 0%, rgba(63,227,255,0.25) 48%, transparent 100%)",
                              animation: "coytoy-scan 1.8s linear infinite",
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
                              top: "10px",
                              left: "10px",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "1px",
                              padding: "3px 8px",
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
                            padding: "14px 16px 16px",
                            display: "flex",
                            flexDirection: "column",
                            flex: 1,
                            minHeight: 0,
                          }}
                        >
                          <h3
                            className="coytoy-card-title"
                            style={{
                              margin: "0 0 6px",
                              fontSize: "15px",
                              fontWeight: 700,
                              color: "#eef1fb",
                              lineHeight: 1.3,
                            }}
                          >
                            {product.name || "Unnamed Product"}
                          </h3>

                          <p
                            className="coytoy-card-desc"
                            style={{
                              margin: "0 0 12px",
                              fontSize: "12.5px",
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
                                marginBottom: "10px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "'Orbitron', sans-serif",
                                  fontWeight: 700,
                                  fontSize: "18px",
                                  color: "#ff3fc7",
                                  textShadow:
                                    "0 0 10px rgba(255,63,199,0.5)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {product.price} BDT
                              </span>

                              <span
                                style={{
                                  fontSize: "11px",
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
                                gap: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                letterSpacing: "0.4px",
                                color: stockStatus.color,
                                marginBottom: "12px",
                                minHeight: "15px",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: stockStatus.color,
                                  boxShadow: `0 0 6px ${stockStatus.glow}`,
                                }}
                              />

                              {stockStatus.text.toUpperCase()}
                            </div>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              disabled={outOfStock}
                              className="coytoy-btn"
                              style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "9px",
                                border:
                                  "1px solid " +
                                  (outOfStock ? "#1c2340" : "#3fe3ff"),
                                background: outOfStock
                                  ? "transparent"
                                  : "rgba(63,227,255,0.1)",
                                color: outOfStock ? "#5b6390" : "#3fe3ff",
                                fontSize: "13px",
                                fontWeight: 700,
                                fontFamily: "inherit",
                                cursor: outOfStock ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                boxShadow: outOfStock
                                  ? "none"
                                  : "0 0 0 rgba(63,227,255,0)",
                              }}
                              onMouseEnter={(e) => {
                                if (!outOfStock) {
                                  e.currentTarget.style.background =
                                    "rgba(63,227,255,0.22)";
                                  e.currentTarget.style.boxShadow =
                                    "0 0 16px rgba(63,227,255,0.4)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!outOfStock) {
                                  e.currentTarget.style.background =
                                    "rgba(63,227,255,0.1)";
                                  e.currentTarget.style.boxShadow =
                                    "0 0 0 rgba(63,227,255,0)";
                                }
                              }}
                            >
                              {outOfStock ? "Out of Stock" : "Add to Cart"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}