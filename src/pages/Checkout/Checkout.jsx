import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { createOrder } from "../../services/orderService";

export default function Checkout() {
  const navigate = useNavigate();

  const {
    cartItems,
    clearCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const items = cartItems || [];

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const orderItems = useMemo(() => {
    return items.map((item) => ({
      productId: item.id,
      name: item.name || "Unnamed Product",
      price: Number(item.price) || 0,
      quantity: Number(item.quantityInCart || 1),
      imageUrl: item.imageUrl || item.images?.[0] || item.image || "",
    }));
  }, [items]);

  const total = useMemo(() => {
    return orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [orderItems]);

  const validateForm = () => {
    const cleanName = customerName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    if (orderItems.length === 0) {
      return "Your cart is empty.";
    }

    if (!cleanName) {
      return "Please enter your name.";
    }

    if (cleanName.length > 100) {
      return "Name must be 100 characters or less.";
    }

    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      return "Phone number must be 11 digits and start with 01.";
    }

    if (!cleanAddress) {
      return "Please enter your delivery address.";
    }

    if (cleanAddress.length > 500) {
      return "Address must be 500 characters or less.";
    }

    if (note.length > 500) {
      return "Note must be 500 characters or less.";
    }

    if (total <= 0) {
      return "Invalid order total.";
    }

    return "";
  };

  const openWhatsAppOrderSummary = (orderId) => {
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER;

    if (!whatsappNumber) {
      console.warn("VITE_WHATSAPP_NUMBER is missing.");
      return false;
    }

    const productLines = orderItems
      .map((item, index) => {
        const subtotal = Number(item.price || 0) * Number(item.quantity || 0);

        return `${index + 1}. ${item.name}
Product ID: ${item.productId}
Quantity: ${item.quantity}
Unit Price: ${item.price} BDT
Subtotal: ${subtotal} BDT`;
      })
      .join("\n\n");

    const message = `Hello CoyToy,

A new order has been placed.

Order ID: ${orderId}

Customer Information:
Name: ${customerName.trim()}
Phone: ${phone.trim()}
Address: ${address.trim()}
Note: ${note.trim() || "None"}

Order Details:

${productLines}

Total: ${total} BDT

Please confirm delivery details.`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    try {
      setLoading(true);

      const orderRef = await createOrder({
        customerName,
        phone,
        address,
        note,
        items: orderItems,
      });

      const whatsappOpened = openWhatsAppOrderSummary(orderRef.id);

sessionStorage.setItem(
  "coytoy_last_order",
  JSON.stringify({
    orderId: orderRef.id,
    whatsappOpened,
  })
);

clearCart();

setTimeout(() => {
  navigate("/order-success", {
    replace: true,
    state: {
      orderId: orderRef.id,
      whatsappOpened,
    },
  });
}, 100);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if (value === "") {
      setPhone("");
      return;
    }

    if (!/^\d{0,11}$/.test(value)) return;

    setPhone(value);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 45% at 20% -10%, rgba(255,63,199,0.12), transparent), radial-gradient(ellipse 65% 45% at 90% 5%, rgba(63,227,255,0.1), transparent), #06080f",
        color: "#eef1fb",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "34px clamp(18px, 5vw, 42px)",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/cart")}
          style={{
            border: "1px solid #1c2340",
            background: "rgba(12,16,32,0.8)",
            color: "#8993b8",
            padding: "10px 14px",
            borderRadius: "10px",
            cursor: "pointer",
            marginBottom: "22px",
            fontWeight: 700,
          }}
        >
          ← Back to Cart
        </button>

        <header style={{ marginBottom: "28px" }}>
          <p
            style={{
              margin: "0 0 8px",
              color: "#3fe3ff",
              letterSpacing: "4px",
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            CoyToy Checkout
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(30px, 5vw, 48px)",
              color: "#ff3fc7",
              fontWeight: 900,
            }}
          >
            Place Your Order
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#8993b8",
              lineHeight: 1.6,
              maxWidth: "620px",
            }}
          >
            Enter your delivery information. Your order will be saved in Firebase
            and WhatsApp will open with the order summary.
          </p>
        </header>

        {orderItems.length === 0 ? (
          <div
            style={{
              padding: "34px",
              border: "1px solid #1c2340",
              borderRadius: "18px",
              background: "rgba(12,16,32,0.8)",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: "0 0 10px" }}>Your cart is empty</h2>

            <p style={{ color: "#8993b8", margin: "0 0 22px" }}>
              Add products to cart before checkout.
            </p>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              style={{
                border: "1px solid #3fe3ff",
                background: "rgba(63,227,255,0.1)",
                color: "#3fe3ff",
                padding: "12px 22px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Go to Shop
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 390px",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                border: "1px solid #1c2340",
                borderRadius: "18px",
                background: "rgba(12,16,32,0.86)",
                padding: "22px",
                boxShadow: "0 0 32px rgba(0,0,0,0.25)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 18px",
                  fontSize: "22px",
                }}
              >
                Delivery Information
              </h2>

              <FormGroup label="Customer Name">
                <input
                  type="text"
                  value={customerName}
                  maxLength={100}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  style={inputStyle}
                />
              </FormGroup>

              <FormGroup label="Phone Number">
                <input
                  type="tel"
                  value={phone}
                  maxLength={11}
                  onChange={handlePhoneChange}
                  placeholder="01XXXXXXXXX"
                  style={inputStyle}
                />
              </FormGroup>

              <FormGroup label="Delivery Address">
                <textarea
                  value={address}
                  maxLength={500}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, road, area, city"
                  style={{
                    ...inputStyle,
                    minHeight: "110px",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </FormGroup>

              <FormGroup label="Note Optional">
                <textarea
                  value={note}
                  maxLength={500}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special instruction?"
                  style={{
                    ...inputStyle,
                    minHeight: "80px",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </FormGroup>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  border: "1px solid #ff3fc7",
                  background: loading
                    ? "rgba(255,63,199,0.08)"
                    : "linear-gradient(135deg, rgba(255,63,199,0.25), rgba(63,227,255,0.12))",
                  color: loading ? "#8993b8" : "#ff3fc7",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: 900,
                  fontSize: "15px",
                  boxShadow: loading
                    ? "none"
                    : "0 0 22px rgba(255,63,199,0.22)",
                }}
              >
                {loading ? "Placing Order..." : "Confirm Order"}
              </button>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#5b6390",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                After saving your order, WhatsApp will open with the order
                summary.
              </p>
            </form>

            <aside
              style={{
                border: "1px solid #1c2340",
                borderRadius: "18px",
                background: "rgba(12,16,32,0.86)",
                padding: "20px",
                position: "sticky",
                top: "20px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px",
                  fontSize: "21px",
                }}
              >
                Order Summary
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {orderItems.map((item) => (
                  <div
                    key={item.productId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "58px 1fr",
                      gap: "12px",
                      borderBottom: "1px solid #1c2340",
                      paddingBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "58px",
                        height: "58px",
                        borderRadius: "10px",
                        background: "#070a14",
                        overflow: "hidden",
                        border: "1px solid #1c2340",
                      }}
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : null}
                    </div>

                    <div>
                      <h3
                        style={{
                          margin: "0 0 5px",
                          fontSize: "14px",
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: "#8993b8",
                          fontSize: "13px",
                        }}
                      >
                        {item.quantity} × {item.price} BDT
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.productId)}
                          style={smallButtonStyle}
                        >
                          −
                        </button>

                        <span
                          style={{
                            minWidth: "24px",
                            textAlign: "center",
                            color: "#eef1fb",
                            fontWeight: 800,
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.productId)}
                          style={smallButtonStyle}
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          style={{
                            ...smallButtonStyle,
                            width: "auto",
                            paddingInline: "10px",
                            marginLeft: "auto",
                            borderColor: "#ff4d6d",
                            color: "#ff4d6d",
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "8px",
                          color: "#3fe3ff",
                          fontSize: "13px",
                        }}
                      >
                        {item.quantity * item.price} BDT
                      </strong>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "18px",
                  borderTop: "1px solid #1c2340",
                  paddingTop: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    color: "#8993b8",
                    fontWeight: 800,
                  }}
                >
                  Total
                </span>

                <strong
                  style={{
                    color: "#ff3fc7",
                    fontSize: "24px",
                  }}
                >
                  {total} BDT
                </strong>
              </div>

              <p
                style={{
                  margin: "14px 0 0",
                  color: "#5b6390",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                Delivery charge can be confirmed manually by admin after order
                review.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "11px",
  border: "1px solid #1c2340",
  background: "#0c1020",
  color: "#eef1fb",
  fontSize: "14px",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const smallButtonStyle = {
  width: "30px",
  height: "30px",
  borderRadius: "8px",
  border: "1px solid #3fe3ff",
  background: "rgba(63,227,255,0.08)",
  color: "#3fe3ff",
  cursor: "pointer",
  fontWeight: 900,
};

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label
        style={{
          display: "block",
          color: "#8993b8",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.7px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}