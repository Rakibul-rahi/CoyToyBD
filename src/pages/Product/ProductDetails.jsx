import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { useCart } from "../../context/CartContext";

const FONT_LINK_ID = "coytoy-product-fonts";

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

const PRODUCT_DETAILS_STYLES = `
.coytoy-product-page *,
.coytoy-product-page *::before,
.coytoy-product-page *::after {
  box-sizing: border-box;
}

.coytoy-product-thumb:hover {
  transform: translateY(-2px);
}

.coytoy-product-action:hover {
  transform: translateY(-2px);
}

.coytoy-product-back:hover {
  color: #3fe3ff !important;
}

@media (max-width: 900px) {
  .coytoy-product-layout {
    grid-template-columns: 1fr !important;
  }

  .coytoy-product-title {
    font-size: 32px !important;
  }

  .coytoy-main-image {
    height: 380px !important;
  }
}

@media (max-width: 520px) {
  .coytoy-product-page {
    padding: 22px 14px 60px !important;
  }

  .coytoy-product-card {
    padding: 16px !important;
  }

  .coytoy-main-image {
    height: 300px !important;
  }

  .coytoy-product-title {
    font-size: 26px !important;
  }

  .coytoy-product-actions {
    flex-direction: column !important;
  }

  .coytoy-product-action {
    width: 100% !important;
  }
}
`;

export default function ProductDetails() {
  useInjectFonts();

  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);

      try {
        const ref = doc(db, "products", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };

          const productImages =
            data.images?.length > 0
              ? data.images
              : [data.imageUrl || data.image].filter(Boolean);

          setProduct({ ...data, images: productImages });
          setMainImage(productImages[0] || "");
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Failed to load product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const stockInfo = useMemo(() => {
    const quantity = Number(product?.quantity || 0);

    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        color: "#ff4d6d",
        bg: "rgba(255,77,109,0.08)",
        border: "rgba(255,77,109,0.35)",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        color: "#ffb14e",
        bg: "rgba(255,177,78,0.08)",
        border: "rgba(255,177,78,0.35)",
      };
    }

    return {
      label: "In Stock",
      color: "#3fe3ff",
      bg: "rgba(63,227,255,0.08)",
      border: "rgba(63,227,255,0.35)",
    };
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (Number(product.quantity) <= 0) {
      alert("This product is out of stock");
      return;
    }

    addToCart(product);
    alert(`${product.name} added to cart`);
  };

  const handleCheckout = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <main
        className="coytoy-product-page"
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,63,199,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(63,227,255,0.10), transparent), #06080f",
          color: "#eef1fb",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{PRODUCT_DETAILS_STYLES}</style>
        <p style={{ color: "#8993b8", letterSpacing: "1px" }}>
          Loading product details…
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main
        className="coytoy-product-page"
        style={{
          minHeight: "100vh",
          background: "#06080f",
          color: "#eef1fb",
          fontFamily: "'Inter', system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <style>{PRODUCT_DETAILS_STYLES}</style>

        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            border: "1px solid #1c2340",
            background: "rgba(12,16,32,0.86)",
            borderRadius: "20px",
            padding: "34px",
          }}
        >
          <h1 style={{ margin: "0 0 10px", color: "#ff3fc7" }}>
            Product Not Found
          </h1>

          <p style={{ color: "#8993b8", lineHeight: 1.7 }}>
            This product may have been removed or the link is incorrect.
          </p>

          <Link
            to="/shop"
            style={{
              display: "inline-flex",
              marginTop: "18px",
              padding: "12px 18px",
              borderRadius: "12px",
              background: "rgba(63,227,255,0.1)",
              border: "1px solid #3fe3ff",
              color: "#3fe3ff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  const images = product.images?.slice(0, 4) || [];
  const outOfStock = Number(product.quantity) <= 0;

  return (
    <main
      className="coytoy-product-page"
      style={{
        minHeight: "100vh",
        padding: "34px clamp(16px, 4vw, 32px) 80px",
        background:
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,63,199,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(63,227,255,0.10), transparent), #06080f",
        color: "#eef1fb",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{PRODUCT_DETAILS_STYLES}</style>

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="coytoy-product-back"
          style={{
            marginBottom: "22px",
            border: "none",
            background: "transparent",
            color: "#8993b8",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>

        <div
          className="coytoy-product-card"
          style={{
            border: "1px solid #1c2340",
            background:
              "linear-gradient(180deg, rgba(12,16,32,0.92), rgba(7,9,26,0.96))",
            borderRadius: "24px",
            padding: "24px",
            boxShadow:
              "0 20px 70px rgba(0,0,0,0.35), 0 0 40px rgba(63,227,255,0.06)",
          }}
        >
          <div
            className="coytoy-product-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: "34px",
              alignItems: "start",
            }}
          >
            <section>
              <div
                style={{
                  position: "relative",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid #1c2340",
                  background: "#070a14",
                }}
              >
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="coytoy-main-image"
                    style={{
                      width: "100%",
                      height: "500px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    className="coytoy-main-image"
                    style={{
                      height: "500px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#5b6390",
                    }}
                  >
                    No Image Available
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(6,8,15,0.55), transparent 45%)",
                    pointerEvents: "none",
                  }}
                />

                <span
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: stockInfo.bg,
                    border: `1px solid ${stockInfo.border}`,
                    color: stockInfo.color,
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  {stockInfo.label}
                </span>
              </div>

              {images.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "12px",
                    marginTop: "14px",
                  }}
                >
                  {images.map((img, index) => {
                    const active = mainImage === img;

                    return (
                      <button
                        key={`${img}-${index}`}
                        type="button"
                        onClick={() => setMainImage(img)}
                        className="coytoy-product-thumb"
                        aria-label={`View product image ${index + 1}`}
                        style={{
                          height: "92px",
                          padding: 0,
                          borderRadius: "14px",
                          overflow: "hidden",
                          border: active
                            ? "2px solid #3fe3ff"
                            : "1px solid #1c2340",
                          background: "#070a14",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: active
                            ? "0 0 18px rgba(63,227,255,0.35)"
                            : "none",
                        }}
                      >
                        <img
                          src={img}
                          alt={`${product.name} ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            opacity: active ? 1 : 0.72,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    background: "rgba(63,227,255,0.08)",
                    border: "1px solid rgba(63,227,255,0.25)",
                    color: "#3fe3ff",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {product.category || "Unsorted"}
                </span>

                {(product.uid || product.id) && (
                  <span
                    style={{
                      padding: "7px 12px",
                      borderRadius: "999px",
                      background: "rgba(255,63,199,0.08)",
                      border: "1px solid rgba(255,63,199,0.25)",
                      color: "#ff3fc7",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                    }}
                  >
                    ID: {product.uid || product.id}
                  </span>
                )}
              </div>

              <h1
                className="coytoy-product-title"
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  margin: "0 0 14px",
                  fontSize: "42px",
                  lineHeight: 1.1,
                  color: "#eef1fb",
                  letterSpacing: "1px",
                }}
              >
                {product.name}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "30px",
                    color: "#ff3fc7",
                    textShadow: "0 0 16px rgba(255,63,199,0.45)",
                  }}
                >
                  {product.price} BDT
                </h2>

                {product.oldPrice &&
                  Number(product.oldPrice) > Number(product.price) && (
                    <span
                      style={{
                        color: "#5b6390",
                        fontSize: "16px",
                        textDecoration: "line-through",
                      }}
                    >
                      {product.oldPrice} BDT
                    </span>
                  )}
              </div>

              <p
                style={{
                  color: "#8993b8",
                  lineHeight: 1.85,
                  fontSize: "15px",
                  margin: "0 0 24px",
                }}
              >
                {product.description || "No description added yet."}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <InfoBox label="Availability" value={stockInfo.label} />
                <InfoBox
                  label="Quantity Left"
                  value={`${product.quantity || 0} pcs`}
                />
                <InfoBox label="Ordering" value="Cart Checkout" />
              </div>

              <div
                className="coytoy-product-actions"
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "22px",
                }}
              >
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="coytoy-product-action"
                  style={{
                    flex: 1,
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: outOfStock
                      ? "1px solid #1c2340"
                      : "1px solid #3fe3ff",
                    background: outOfStock
                      ? "transparent"
                      : "rgba(63,227,255,0.12)",
                    color: outOfStock ? "#5b6390" : "#3fe3ff",
                    fontSize: "14px",
                    fontWeight: 800,
                    fontFamily: "inherit",
                    cursor: outOfStock ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={handleCheckout}
                  className="coytoy-product-action"
                  style={{
                    flex: 1,
                    padding: "15px 18px",
                    borderRadius: "14px",
                    border: "1px solid #ff3fc7",
                    background: "rgba(255,63,199,0.12)",
                    color: "#ff3fc7",
                    fontSize: "14px",
                    fontWeight: 800,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Checkout / Go to Cart
                </button>
              </div>

              <div
                style={{
                  border: "1px solid #1c2340",
                  borderRadius: "16px",
                  padding: "16px",
                  background: "rgba(7,9,26,0.5)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 10px",
                    color: "#3fe3ff",
                    fontSize: "14px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Shopping Note
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#8993b8",
                    lineHeight: 1.7,
                    fontSize: "13.5px",
                  }}
                >
                  Add this product to your cart first. After reviewing all
                  selected items in the cart, you can checkout through WhatsApp.
                  We will confirm availability, final price, and delivery
                  details before processing the order.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #1c2340",
        background: "rgba(7,9,26,0.55)",
        borderRadius: "14px",
        padding: "14px",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          color: "#5b6390",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "1px",
          fontWeight: 800,
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          color: "#eef1fb",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        {value}
      </p>
    </div>
  );
}