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

    if (orderItems.length === 0) return "Your cart is empty.";
    if (!cleanName) return "Please enter your name.";
    if (cleanName.length > 100) return "Name must be 100 characters or less.";

    if (!/^01[0-9]{9}$/.test(cleanPhone)) {
      return "Phone number must be 11 digits and start with 01.";
    }

    if (!cleanAddress) return "Please enter your delivery address.";
    if (cleanAddress.length > 500) {
      return "Address must be 500 characters or less.";
    }

    if (note.length > 500) return "Note must be 500 characters or less.";
    if (total <= 0) return "Invalid order total.";

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
    <div className="checkout-page">
      <style>{checkoutStyles}</style>

      <div className="checkout-container">
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="checkout-back-btn"
        >
          ← Back to Cart
        </button>

        <header className="checkout-header">
          <p className="checkout-eyebrow">CoyToy Checkout</p>

          <h1>Place Your Order</h1>

          <p>
            Enter your delivery information. Your order will be saved in Firebase
            and WhatsApp will open with the order summary.
          </p>
        </header>

        {orderItems.length === 0 ? (
          <div className="empty-cart-card">
            <h2>Your cart is empty</h2>

            <p>Add products to cart before checkout.</p>

            <button type="button" onClick={() => navigate("/shop")}>
              Go to Shop
            </button>
          </div>
        ) : (
          <div className="checkout-layout">
            <form onSubmit={handleSubmit} className="checkout-form">
              <h2>Delivery Information</h2>

              <FormGroup label="Customer Name">
                <input
                  type="text"
                  value={customerName}
                  maxLength={100}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="checkout-input"
                />
              </FormGroup>

              <FormGroup label="Phone Number">
                <input
                  type="tel"
                  value={phone}
                  maxLength={11}
                  onChange={handlePhoneChange}
                  placeholder="01XXXXXXXXX"
                  className="checkout-input"
                />
              </FormGroup>

              <FormGroup label="Delivery Address">
                <textarea
                  value={address}
                  maxLength={500}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House, road, area, city"
                  className="checkout-input checkout-textarea-lg"
                />
              </FormGroup>

              <FormGroup label="Note Optional">
                <textarea
                  value={note}
                  maxLength={500}
                   onChange={(e) => setNote(e.target.value.slice(0, 500))}
                  placeholder="Any special instruction?"
                  className="checkout-input checkout-textarea-sm"
                />
              </FormGroup>

              <button
                type="submit"
                disabled={loading}
                className={`checkout-submit-btn ${loading ? "is-loading" : ""}`}
              >
                {loading ? "Placing Order..." : "Confirm Order"}
              </button>

              <p className="checkout-helper-text">
                After saving your order, WhatsApp will open with the order
                summary.
              </p>
            </form>

            <aside className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {orderItems.map((item) => (
                  <div key={item.productId} className="summary-item">
                    <div className="summary-image-box">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : null}
                    </div>

                    <div className="summary-info">
                      <h3>{item.name}</h3>

                      <p>
                        {item.quantity} × {item.price} BDT
                      </p>

                      <div className="summary-actions">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(item.productId)}
                          className="summary-small-btn"
                        >
                          −
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.productId)}
                          className="summary-small-btn"
                        >
                          +
                        </button>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="summary-remove-btn"
                        >
                          Remove
                        </button>
                      </div>

                      <strong>{item.quantity * item.price} BDT</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span>Total</span>
                <strong>{total} BDT</strong>
              </div>

              <p className="summary-note">
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

function FormGroup({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

const checkoutStyles = `
.checkout-page {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 45% at 20% -10%, rgba(255,63,199,0.12), transparent),
    radial-gradient(ellipse 65% 45% at 90% 5%, rgba(63,227,255,0.1), transparent),
    #06080f;
  color: #eef1fb;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 34px clamp(14px, 5vw, 42px);
  box-sizing: border-box;
}

.checkout-container {
  max-width: 1180px;
  margin: 0 auto;
}

.checkout-back-btn {
  border: 1px solid #1c2340;
  background: rgba(12,16,32,0.8);
  color: #8993b8;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 22px;
  font-weight: 700;
}

.checkout-header {
  margin-bottom: 28px;
}

.checkout-eyebrow {
  margin: 0 0 8px;
  color: #3fe3ff;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 800;
}

.checkout-header h1 {
  margin: 0;
  font-size: clamp(30px, 5vw, 48px);
  color: #ff3fc7;
  font-weight: 900;
  line-height: 1.1;
}

.checkout-header p {
  margin: 12px 0 0;
  color: #8993b8;
  line-height: 1.6;
  max-width: 620px;
}

.empty-cart-card {
  padding: 34px;
  border: 1px solid #1c2340;
  border-radius: 18px;
  background: rgba(12,16,32,0.8);
  text-align: center;
}

.empty-cart-card h2 {
  margin: 0 0 10px;
}

.empty-cart-card p {
  color: #8993b8;
  margin: 0 0 22px;
}

.empty-cart-card button {
  border: 1px solid #3fe3ff;
  background: rgba(63,227,255,0.1);
  color: #3fe3ff;
  padding: 12px 22px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 24px;
  align-items: start;
}

.checkout-form,
.order-summary {
  border: 1px solid #1c2340;
  border-radius: 18px;
  background: rgba(12,16,32,0.86);
  box-shadow: 0 0 32px rgba(0,0,0,0.25);
  box-sizing: border-box;
}

.checkout-form {
  padding: 22px;
}

.checkout-form h2,
.order-summary h2 {
  margin: 0 0 18px;
  font-size: 22px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #8993b8;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.checkout-input {
  width: 100%;
  padding: 13px 14px;
  border-radius: 11px;
  border: 1px solid #1c2340;
  background: #0c1020;
  color: #eef1fb;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  outline: none;
}

.checkout-input:focus {
  border-color: #3fe3ff;
  box-shadow: 0 0 0 3px rgba(63,227,255,0.08);
}

.checkout-textarea-lg {
  min-height: 110px;
  resize: vertical;
  line-height: 1.5;
}

.checkout-textarea-sm {
  min-height: 80px;
  resize: vertical;
  line-height: 1.5;
}

.checkout-submit-btn {
  width: 100%;
  border: 1px solid #ff3fc7;
  background: linear-gradient(135deg, rgba(255,63,199,0.25), rgba(63,227,255,0.12));
  color: #ff3fc7;
  padding: 14px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 900;
  font-size: 15px;
  box-shadow: 0 0 22px rgba(255,63,199,0.22);
}

.checkout-submit-btn.is-loading {
  background: rgba(255,63,199,0.08);
  color: #8993b8;
  cursor: not-allowed;
  box-shadow: none;
}

.checkout-helper-text {
  margin: 12px 0 0;
  color: #5b6390;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

.order-summary {
  padding: 20px;
  position: sticky;
  top: 20px;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 12px;
  border-bottom: 1px solid #1c2340;
  padding-bottom: 12px;
}

.summary-image-box {
  width: 58px;
  height: 58px;
  border-radius: 10px;
  background: #070a14;
  overflow: hidden;
  border: 1px solid #1c2340;
  flex-shrink: 0;
}

.summary-image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.summary-info {
  min-width: 0;
}

.summary-info h3 {
  margin: 0 0 5px;
  font-size: 14px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.summary-info p {
  margin: 0;
  color: #8993b8;
  font-size: 13px;
}

.summary-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.summary-actions span {
  min-width: 24px;
  text-align: center;
  color: #eef1fb;
  font-weight: 800;
}

.summary-small-btn,
.summary-remove-btn {
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 900;
  font-family: inherit;
}

.summary-small-btn {
  width: 30px;
  border: 1px solid #3fe3ff;
  background: rgba(63,227,255,0.08);
  color: #3fe3ff;
}

.summary-remove-btn {
  width: auto;
  padding: 0 10px;
  border: 1px solid #ff4d6d;
  background: rgba(255,77,109,0.08);
  color: #ff4d6d;
  margin-left: auto;
}

.summary-info strong {
  display: block;
  margin-top: 8px;
  color: #3fe3ff;
  font-size: 13px;
}

.summary-total {
  margin-top: 18px;
  border-top: 1px solid #1c2340;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.summary-total span {
  color: #8993b8;
  font-weight: 800;
}

.summary-total strong {
  color: #ff3fc7;
  font-size: 24px;
  text-align: right;
}

.summary-note {
  margin: 14px 0 0;
  color: #5b6390;
  font-size: 12px;
  line-height: 1.5;
}

/* Tablet */
@media (max-width: 920px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

/* Mobile */
@media (max-width: 560px) {
  .checkout-page {
    padding: 22px 12px;
  }

  .checkout-back-btn {
    width: 100%;
    margin-bottom: 18px;
  }

  .checkout-eyebrow {
    letter-spacing: 2.5px;
    font-size: 11px;
  }

  .checkout-header {
    margin-bottom: 20px;
  }

  .checkout-header h1 {
    font-size: 32px;
  }

  .checkout-header p {
    font-size: 14px;
  }

  .checkout-form,
  .order-summary,
  .empty-cart-card {
    border-radius: 15px;
  }

  .checkout-form,
  .order-summary {
    padding: 16px;
  }

  .checkout-form h2,
  .order-summary h2 {
    font-size: 19px;
  }

  .checkout-input {
    font-size: 16px;
    padding: 12px 13px;
  }

  .summary-item {
    grid-template-columns: 52px minmax(0, 1fr);
    gap: 10px;
  }

  .summary-image-box {
    width: 52px;
    height: 52px;
  }

  .summary-remove-btn {
    margin-left: 0;
  }

  .summary-total {
    align-items: flex-start;
  }

  .summary-total strong {
    font-size: 21px;
  }
}

/* Very small phones */
@media (max-width: 380px) {
  .checkout-page {
    padding-inline: 10px;
  }

  .summary-item {
    grid-template-columns: 1fr;
  }

  .summary-image-box {
    width: 100%;
    height: 150px;
  }

  .summary-actions {
    gap: 7px;
  }

  .summary-small-btn {
    width: 34px;
    height: 34px;
  }

  .summary-remove-btn {
    height: 34px;
  }
}
`;