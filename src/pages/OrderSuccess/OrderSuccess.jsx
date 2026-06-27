import { Link, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();

  const savedOrder = JSON.parse(
  sessionStorage.getItem("coytoy_last_order") || "{}"
);

const orderId = location.state?.orderId || savedOrder.orderId || "N/A";

const whatsappOpened =
  location.state?.whatsappOpened ?? savedOrder.whatsappOpened ?? true;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 45% at 20% -10%, rgba(34,197,94,0.14), transparent), radial-gradient(ellipse 65% 45% at 90% 5%, rgba(63,227,255,0.1), transparent), #06080f",
        color: "#eef1fb",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "40px clamp(18px, 5vw, 42px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "620px",
          width: "100%",
          border: "1px solid #1c2340",
          borderRadius: "22px",
          background: "rgba(12,16,32,0.88)",
          padding: "34px",
          textAlign: "center",
          boxShadow: "0 0 38px rgba(0,0,0,0.28)",
        }}
      >
        <div
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "50%",
            margin: "0 auto 20px",
            border: "1px solid #22c55e",
            background: "rgba(34,197,94,0.12)",
            color: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "38px",
            fontWeight: 900,
            boxShadow: "0 0 26px rgba(34,197,94,0.2)",
          }}
        >
          ✓
        </div>

        <p
          style={{
            margin: "0 0 8px",
            color: "#3fe3ff",
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontSize: "12px",
            fontWeight: 900,
          }}
        >
          Order Confirmed
        </p>

        <h1
          style={{
            margin: 0,
            color: "#ff3fc7",
            fontSize: "clamp(30px, 5vw, 46px)",
            fontWeight: 900,
          }}
        >
          Thank You!
        </h1>

        <p
          style={{
            margin: "14px auto 0",
            color: "#8993b8",
            lineHeight: 1.7,
            maxWidth: "480px",
          }}
        >
          Your order has been saved successfully. Admin will review your order
          and confirm delivery details.
        </p>

        <div
          style={{
            margin: "24px 0",
            padding: "16px",
            borderRadius: "16px",
            border: "1px solid #1c2340",
            background: "#0c1020",
          }}
        >
          <p
            style={{
              margin: "0 0 7px",
              color: "#5b6390",
              fontSize: "12px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Your Order ID
          </p>

          <strong
            style={{
              display: "block",
              color: "#3fe3ff",
              fontSize: "18px",
              wordBreak: "break-all",
            }}
          >
            {orderId}
          </strong>
        </div>

        <p
          style={{
            margin: "0 0 24px",
            color: whatsappOpened ? "#22c55e" : "#ffb14e",
            fontSize: "13px",
            lineHeight: 1.6,
            fontWeight: 700,
          }}
        >
          {whatsappOpened
            ? "WhatsApp should open with your order summary. Please send the message to complete communication."
            : "WhatsApp number was not configured, but your order was saved successfully."}
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/"
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid #3fe3ff",
              background: "rgba(63,227,255,0.1)",
              color: "#3fe3ff",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Continue Shopping
          </Link>

          <Link
            to="/shop"
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid #ff3fc7",
              background: "rgba(255,63,199,0.1)",
              color: "#ff3fc7",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Go to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}