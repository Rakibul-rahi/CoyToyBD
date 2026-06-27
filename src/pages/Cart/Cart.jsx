import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useEffect } from "react";

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

const STYLES = `
.coytoy-cart-root *,
.coytoy-cart-root *::before,
.coytoy-cart-root *::after {
  box-sizing: border-box;
}

.coytoy-cart-root *::selection {
  background: #ff3fc7;
  color: #06080f;
}

.coytoy-cart-card {
  animation: coytoy-fade-up 0.45s ease both;
}

.coytoy-cart-card:hover {
  transform: translateY(-4px);
  border-color: rgba(63, 227, 255, 0.45) !important;
  box-shadow: 0 0 24px rgba(63, 227, 255, 0.1);
}

.coytoy-cart-btn,
.coytoy-cart-link {
  transition: all 0.2s ease;
}

.coytoy-cart-btn:focus-visible,
.coytoy-cart-link:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}

.coytoy-cart-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.coytoy-cart-qty-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed !important;
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
  100% {
    opacity: 1;
    filter: brightness(1);
  }
}

@media (max-width: 900px) {
  .coytoy-cart-layout {
    grid-template-columns: 1fr !important;
  }

  .coytoy-cart-summary {
    position: static !important;
  }
}

@media (max-width: 650px) {
  .coytoy-cart-header {
    padding: 42px 18px 28px !important;
  }

  .coytoy-cart-title {
    font-size: 34px !important;
    letter-spacing: 2px !important;
  }

  .coytoy-cart-content {
    padding: 24px 16px 70px !important;
  }

  .coytoy-cart-item {
    grid-template-columns: 92px 1fr !important;
    gap: 12px !important;
    align-items: start !important;
  }

  .coytoy-cart-image {
    height: 92px !important;
  }

  .coytoy-cart-actions {
    grid-column: 1 / -1;
    width: 100%;
    align-items: stretch !important;
    flex-direction: row !important;
    justify-content: space-between !important;
  }

  .coytoy-cart-subtotal {
    text-align: left !important;
  }

  .coytoy-cart-remove-btn {
    align-self: center;
  }
}

@media (max-width: 420px) {
  .coytoy-cart-item {
    grid-template-columns: 1fr !important;
  }

  .coytoy-cart-image {
    width: 100% !important;
    height: 170px !important;
  }

  .coytoy-cart-actions {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .coytoy-cart-remove-btn {
    width: 100%;
  }
}
`;

export default function Cart() {
  useInjectFonts();

  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const totalPrice = cartItems.reduce((total, item) => {
    return total + Number(item.price || 0) * Number(item.quantityInCart || 0);
  }, 0);

  const totalItems = cartItems.reduce((total, item) => {
    return total + Number(item.quantityInCart || 0);
  }, 0);

  const formatMoney = (amount) => {
    return `${Number(amount || 0).toLocaleString("en-BD")} BDT`;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    navigate("/checkout");
  };

  return (
    <div
      className="coytoy-cart-root"
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
      <style>{STYLES}</style>

      <div style={{ position: "relative", zIndex: 1 }}>
        <header
          className="coytoy-cart-header"
          style={{
            padding: "56px 32px 36px",
            borderBottom: "1px solid #1c2340",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#3fe3ff",
              letterSpacing: "5px",
              fontSize: "12px",
              fontWeight: 700,
              margin: "0 0 12px",
              textTransform: "uppercase",
            }}
          >
            Checkout Terminal
          </p>

          <h1
            className="coytoy-cart-title"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "50px",
              fontWeight: 800,
              letterSpacing: "3px",
              margin: 0,
              color: "#ff3fc7",
              textShadow:
                "0 0 8px rgba(255,63,199,0.9), 0 0 24px rgba(255,63,199,0.5)",
              animation: "coytoy-flicker-in 1.2s ease-out both",
            }}
          >
            YOUR CART
          </h1>

          <p
            style={{
              margin: "16px auto 0",
              color: "#8993b8",
              maxWidth: "560px",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Review your selected toys before continuing to secure checkout.
          </p>
        </header>

        <main
          className="coytoy-cart-content"
          style={{
            maxWidth: "1180px",
            marginInline: "auto",
            padding: "30px 32px 80px",
          }}
        >
          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div
              className="coytoy-cart-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 350px",
                gap: "24px",
                alignItems: "start",
              }}
            >
              <section style={{ display: "grid", gap: "16px" }}>
                {cartItems.map((item) => {
                  const quantityInCart = Number(item.quantityInCart || 0);
                  const availableQuantity = Number(item.quantity || 0);
                  const subtotal = Number(item.price || 0) * quantityInCart;
                  const reachedStockLimit =
                    availableQuantity > 0 &&
                    quantityInCart >= availableQuantity;

                  return (
                    <div
                      key={item.id}
                      className="coytoy-cart-card coytoy-cart-item"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "120px 1fr auto",
                        gap: "16px",
                        alignItems: "center",
                        padding: "14px",
                        borderRadius: "18px",
                        background: "rgba(15,20,38,0.72)",
                        border: "1px solid #1c2340",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="coytoy-cart-image"
                          style={{
                            width: "100%",
                            height: "112px",
                            objectFit: "cover",
                            borderRadius: "13px",
                            border: "1px solid #1c2340",
                            background: "#070a14",
                          }}
                        />
                      ) : (
                        <div
                          className="coytoy-cart-image"
                          style={{
                            width: "100%",
                            height: "112px",
                            borderRadius: "13px",
                            border: "1px solid #1c2340",
                            background: "#070a14",
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

                      <div>
                        <p
                          style={{
                            color: "#3fe3ff",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "1px",
                            textTransform: "uppercase",
                            margin: "0 0 6px",
                          }}
                        >
                          {item.category || "Collectible"}
                        </p>

                        <h3 style={{ margin: "0 0 8px", fontSize: "17px" }}>
                          {item.name}
                        </h3>

                        <p
                          style={{
                            margin: "0 0 12px",
                            color: "#8993b8",
                            fontSize: "13px",
                          }}
                        >
                          Unit Price:{" "}
                          <span style={{ color: "#eef1fb", fontWeight: 700 }}>
                            {formatMoney(item.price)}
                          </span>
                        </p>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "6px",
                              borderRadius: "999px",
                              border: "1px solid #1c2340",
                              background: "#0c1020",
                            }}
                          >
                            <button
                              onClick={() => decreaseQuantity(item.id)}
                              disabled={quantityInCart <= 1}
                              className="coytoy-cart-btn coytoy-cart-qty-btn"
                              style={quantityButtonStyle}
                            >
                              −
                            </button>

                            <span
                              style={{
                                minWidth: "28px",
                                textAlign: "center",
                                fontWeight: 800,
                              }}
                            >
                              {quantityInCart}
                            </span>

                            <button
                              onClick={() => increaseQuantity(item.id)}
                              disabled={reachedStockLimit}
                              className="coytoy-cart-btn coytoy-cart-qty-btn"
                              style={quantityButtonStyle}
                            >
                              +
                            </button>
                          </div>

                          <span
                            style={{
                              fontSize: "12px",
                              color: reachedStockLimit ? "#ffb14e" : "#5b6390",
                              fontWeight: 700,
                            }}
                          >
                            {availableQuantity > 0
                              ? reachedStockLimit
                                ? "Stock limit reached"
                                : `${availableQuantity} available`
                              : "Stock unavailable"}
                          </span>
                        </div>
                      </div>

                      <div
                        className="coytoy-cart-actions"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          alignItems: "flex-end",
                        }}
                      >
                        <div
                          className="coytoy-cart-subtotal"
                          style={{ textAlign: "right" }}
                        >
                          <p
                            style={{
                              margin: "0 0 5px",
                              color: "#5b6390",
                              fontSize: "12px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            Subtotal
                          </p>

                          <strong
                            style={{
                              fontFamily: "'Orbitron', sans-serif",
                              color: "#ff3fc7",
                              fontSize: "18px",
                            }}
                          >
                            {formatMoney(subtotal)}
                          </strong>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="coytoy-cart-btn coytoy-cart-remove-btn"
                          style={{
                            padding: "9px 13px",
                            borderRadius: "10px",
                            border: "1px solid #ff4d6d",
                            background: "rgba(255,77,109,0.08)",
                            color: "#ff4d6d",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>

              <aside
                className="coytoy-cart-summary"
                style={{
                  position: "sticky",
                  top: "20px",
                  padding: "22px",
                  borderRadius: "18px",
                  background: "rgba(15,20,38,0.78)",
                  border: "1px solid #1c2340",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "20px",
                    margin: "0 0 18px",
                  }}
                >
                  Order Summary
                </h2>

                <SummaryRow label="Selected Products" value={cartItems.length} />
                <SummaryRow label="Total Items" value={totalItems} />

                <div
                  style={{
                    height: "1px",
                    background: "#1c2340",
                    margin: "18px 0",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "14px",
                    marginBottom: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "#8993b8",
                      fontSize: "13px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    Total
                  </span>

                  <strong
                    style={{
                      fontFamily: "'Orbitron', sans-serif",
                      color: "#ff3fc7",
                      fontSize: "24px",
                      textAlign: "right",
                    }}
                  >
                    {formatMoney(totalPrice)}
                  </strong>
                </div>

                <button
                  onClick={handleCheckout}
                  className="coytoy-cart-btn"
                  style={mainButtonStyle}
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={clearCart}
                  className="coytoy-cart-btn"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "12px",
                    borderRadius: "11px",
                    border: "1px solid #ff4d6d",
                    background: "rgba(255,77,109,0.08)",
                    color: "#ff4d6d",
                    fontSize: "14px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Clear Cart
                </button>

                <Link
                  to="/"
                  className="coytoy-cart-link"
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "14px",
                    color: "#3fe3ff",
                    fontSize: "14px",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Continue Shopping
                </Link>

                <p
                  style={{
                    margin: "16px 0 0",
                    color: "#5b6390",
                    fontSize: "12px",
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}
                >
                  Your order will be saved securely after you complete the
                  checkout form.
                </p>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        border: "1px dashed #1c2340",
        borderRadius: "18px",
        background: "rgba(15,20,38,0.55)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ fontSize: "44px", marginBottom: "12px" }}>🛒</div>

      <h2
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: "#eef1fb",
          margin: "0 0 10px",
        }}
      >
        Cart is Empty
      </h2>

      <p
        style={{
          color: "#8993b8",
          margin: "0 auto 24px",
          maxWidth: "420px",
          lineHeight: 1.6,
        }}
      >
        Add some toys and collectibles before checkout.
      </p>

      <Link
        to="/"
        className="coytoy-cart-link"
        style={{
          display: "inline-block",
          padding: "12px 22px",
          borderRadius: "11px",
          border: "1px solid #3fe3ff",
          background: "rgba(63,227,255,0.1)",
          color: "#3fe3ff",
          fontWeight: 800,
          textDecoration: "none",
        }}
      >
        Continue Shopping
      </Link>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "14px",
        marginBottom: "12px",
        color: "#8993b8",
        fontSize: "14px",
      }}
    >
      <span>{label}</span>
      <strong style={{ color: "#eef1fb" }}>{value}</strong>
    </div>
  );
}

const quantityButtonStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "50%",
  border: "1px solid #3fe3ff",
  background: "rgba(63,227,255,0.1)",
  color: "#3fe3ff",
  fontWeight: 900,
  cursor: "pointer",
};

const mainButtonStyle = {
  width: "100%",
  padding: "13px",
  borderRadius: "11px",
  border: "1px solid #3fe3ff",
  background:
    "linear-gradient(135deg, rgba(63,227,255,0.18), rgba(255,63,199,0.12))",
  color: "#3fe3ff",
  fontSize: "14px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 0 20px rgba(63,227,255,0.18)",
};