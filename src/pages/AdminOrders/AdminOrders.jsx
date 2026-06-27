import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/orderService";

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
.coytoy-orders-root *,
.coytoy-orders-root *::before,
.coytoy-orders-root *::after {
  box-sizing: border-box;
}

.coytoy-orders-root *::selection {
  background: #ff3fc7;
  color: #06080f;
}

.coytoy-orders-card {
  animation: coytoy-orders-fade-up 0.45s ease both;
}

.coytoy-orders-card:hover {
  transform: translateY(-4px);
  border-color: rgba(63, 227, 255, 0.45) !important;
  box-shadow: 0 0 24px rgba(63, 227, 255, 0.1);
}

.coytoy-orders-btn,
.coytoy-orders-link,
.coytoy-orders-select,
.coytoy-orders-input {
  transition: all 0.2s ease;
}

.coytoy-orders-btn:focus-visible,
.coytoy-orders-link:focus-visible,
.coytoy-orders-select:focus-visible,
.coytoy-orders-input:focus-visible {
  outline: 2px solid #3fe3ff;
  outline-offset: 2px;
}

.coytoy-orders-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.coytoy-orders-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed !important;
}

.coytoy-orders-select:focus,
.coytoy-orders-input:focus {
  border-color: #3fe3ff !important;
  box-shadow: 0 0 18px rgba(63,227,255,0.16);
}

@keyframes coytoy-orders-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes coytoy-orders-flicker-in {
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

@media (max-width: 760px) {
  .coytoy-orders-header {
    padding: 42px 18px 28px !important;
  }

  .coytoy-orders-title {
    font-size: 34px !important;
    letter-spacing: 2px !important;
  }

  .coytoy-orders-content {
    padding: 24px 16px 70px !important;
  }

  .coytoy-orders-topbar {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .coytoy-orders-card-header {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .coytoy-orders-items-grid {
    grid-template-columns: 1fr !important;
  }

  .coytoy-orders-actions {
    grid-template-columns: 1fr !important;
  }
}
`;

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "delivered",
  "cancelled",
];

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_COLORS = {
  pending: "#ffb14e",
  confirmed: "#3fe3ff",
  processing: "#a78bfa",
  delivered: "#22c55e",
  cancelled: "#ff4d6d",
};

export default function AdminOrders() {
  useInjectFonts();

  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = async () => {
    setPageLoading(true);

    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      alert(error.message || "Failed to load orders.");
      setOrders([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const formatMoney = (amount) => {
    return `${Number(amount || 0).toLocaleString("en-BD")} BDT`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    const date =
      typeof timestamp.toDate === "function"
        ? timestamp.toDate()
        : new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filteredOrders = useMemo(() => {
    const cleanSearch = searchText.trim().toLowerCase();

    return orders.filter((order) => {
      const statusMatch =
        statusFilter === "all" || order.status === statusFilter;

      const searchMatch =
        !cleanSearch ||
        String(order.id || "").toLowerCase().includes(cleanSearch) ||
        String(order.customerName || "").toLowerCase().includes(cleanSearch) ||
        String(order.phone || "").toLowerCase().includes(cleanSearch) ||
        String(order.address || "").toLowerCase().includes(cleanSearch);

      return statusMatch && searchMatch;
    });
  }, [orders, statusFilter, searchText]);

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const processingOrders = orders.filter(
    (order) => order.status === "processing"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find((item) => item.id === orderId);

    if (!order) return;

    if (order.status === newStatus) return;

    try {
      setActionLoadingId(orderId);

      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, status: newStatus } : item
        )
      );

      showNotice("Order status updated");
    } catch (error) {
      console.error("Failed to update order:", error);
      alert(error.message || "Failed to update order.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      setActionLoadingId(orderId);

      await deleteOrder(orderId);

      setOrders((prev) => prev.filter((order) => order.id !== orderId));

      showNotice("Order deleted");
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert(error.message || "Failed to delete order.");
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div
      className="coytoy-orders-root"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 80% 45% at 20% -10%, rgba(255,63,199,0.12), transparent), radial-gradient(ellipse 65% 45% at 90% 5%, rgba(63,227,255,0.1), transparent), #06080f",
        color: "#eef1fb",
        fontFamily: "'Inter', system-ui, sans-serif",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <style>{STYLES}</style>

      {notice && (
        <div
          style={{
            position: "fixed",
            top: "18px",
            right: "18px",
            zIndex: 20,
            padding: "13px 18px",
            borderRadius: "12px",
            background: "rgba(15,20,38,0.95)",
            border: "1px solid #3fe3ff",
            color: "#3fe3ff",
            fontWeight: 800,
            boxShadow: "0 0 24px rgba(63,227,255,0.35)",
          }}
        >
          {notice}
        </div>
      )}

      <header
        className="coytoy-orders-header"
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
          Order Control
        </p>

        <h1
          className="coytoy-orders-title"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "48px",
            fontWeight: 800,
            letterSpacing: "3px",
            margin: 0,
            color: "#ff3fc7",
            textShadow:
              "0 0 8px rgba(255,63,199,0.9), 0 0 24px rgba(255,63,199,0.5)",
            animation: "coytoy-orders-flicker-in 1.2s ease-out both",
          }}
        >
          ADMIN ORDERS
        </h1>

        <p
          style={{
            margin: "16px auto 0",
            color: "#8993b8",
            maxWidth: "650px",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          View customer orders, update order status, and manage the order
          pipeline from Firebase.
        </p>

        <div
          style={{
            marginTop: "22px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/admin-dashboard"
            className="coytoy-orders-link"
            style={outlineLinkStyle}
          >
            ← Product Dashboard
          </Link>

          <button
            type="button"
            onClick={loadOrders}
            className="coytoy-orders-btn"
            style={refreshButtonStyle}
          >
            Refresh Orders
          </button>
        </div>
      </header>

      <main
        className="coytoy-orders-content"
        style={{
          maxWidth: "1180px",
          marginInline: "auto",
          padding: "30px 32px 80px",
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "24px",
          }}
        >
          <StatCard title="Total Orders" value={totalOrders} color="#3fe3ff" />
          <StatCard title="Pending" value={pendingOrders} color="#ffb14e" />
          <StatCard title="Processing" value={processingOrders} color="#a78bfa" />
          <StatCard title="Delivered" value={deliveredOrders} color="#22c55e" />
        </section>

        <section
          className="coytoy-orders-topbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "center",
            marginBottom: "18px",
            padding: "16px",
            borderRadius: "16px",
            background: "rgba(15,20,38,0.72)",
            border: "1px solid #1c2340",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Orbitron', sans-serif",
                margin: "0 0 6px",
                fontSize: "18px",
              }}
            >
              Order List
            </h2>

            <p
              style={{
                margin: 0,
                color: "#8993b8",
                fontSize: "13px",
              }}
            >
              Showing {filteredOrders.length} of {orders.length} orders. Revenue
              excluding cancelled:{" "}
              <strong style={{ color: "#3fe3ff" }}>
                {formatMoney(totalRevenue)}
              </strong>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <input
              className="coytoy-orders-input"
              type="text"
              placeholder="Search name, phone, address..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={inputStyle}
            />

            <select
              className="coytoy-orders-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={selectStyle}
            >
              <option value="all">All Status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
        </section>

        {pageLoading ? (
          <LoadingBox />
        ) : filteredOrders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <section style={{ display: "grid", gap: "16px" }}>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                actionLoadingId={actionLoadingId}
                formatMoney={formatMoney}
                formatDate={formatDate}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteOrder}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function OrderCard({
  order,
  actionLoadingId,
  formatMoney,
  formatDate,
  onStatusChange,
  onDelete,
}) {
  const items = Array.isArray(order.items) ? order.items : [];
  const currentStatus = order.status || "pending";
  const statusColor = STATUS_COLORS[currentStatus] || "#8993b8";
  const isLoading = actionLoadingId === order.id;

  return (
    <article
      className="coytoy-orders-card"
      style={{
        border: "1px solid #1c2340",
        borderRadius: "18px",
        background: "rgba(15,20,38,0.76)",
        backdropFilter: "blur(10px)",
        padding: "18px",
        transition: "all 0.25s ease",
      }}
    >
      <div
        className="coytoy-orders-card-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 7px",
              color: "#5b6390",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Order ID
          </p>

          <h3
            style={{
              margin: 0,
              color: "#eef1fb",
              fontSize: "17px",
              wordBreak: "break-all",
            }}
          >
            {order.id}
          </h3>

          <p
            style={{
              margin: "8px 0 0",
              color: "#8993b8",
              fontSize: "13px",
            }}
          >
            Created: {formatDate(order.createdAt)}
          </p>
        </div>

        <span
          style={{
            padding: "7px 11px",
            borderRadius: "999px",
            border: `1px solid ${statusColor}`,
            color: statusColor,
            background: `${statusColor}14`,
            fontSize: "12px",
            fontWeight: 900,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {STATUS_LABELS[currentStatus] || currentStatus}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        <InfoBox label="Customer" value={order.customerName || "N/A"} />
        <InfoBox label="Phone" value={order.phone || "N/A"} />
        <InfoBox label="Address" value={order.address || "N/A"} />
        <InfoBox label="Note" value={order.note || "None"} />
      </div>

      <div
        style={{
          border: "1px solid #1c2340",
          borderRadius: "14px",
          background: "rgba(6,8,15,0.35)",
          padding: "14px",
          marginBottom: "16px",
        }}
      >
        <h4
          style={{
            margin: "0 0 12px",
            fontSize: "14px",
            color: "#3fe3ff",
          }}
        >
          Ordered Items
        </h4>

        {items.length === 0 ? (
          <p style={{ color: "#8993b8", margin: 0 }}>No items found.</p>
        ) : (
          <div
            className="coytoy-orders-items-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "12px",
            }}
          >
            {items.map((item, index) => {
              const subtotal =
                Number(item.price || 0) * Number(item.quantity || 0);

              return (
                <div
                  key={`${item.productId || item.name}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "58px 1fr",
                    gap: "10px",
                    padding: "10px",
                    borderRadius: "12px",
                    background: "rgba(15,20,38,0.65)",
                    border: "1px solid #1c2340",
                  }}
                >
                  <div
                    style={{
                      width: "58px",
                      height: "58px",
                      borderRadius: "10px",
                      background: "#070a14",
                      border: "1px solid #1c2340",
                      overflow: "hidden",
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
                    <h5
                      style={{
                        margin: "0 0 5px",
                        fontSize: "13px",
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name || "Unnamed Product"}
                    </h5>

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#8993b8",
                        fontSize: "12px",
                      }}
                    >
                      {Number(item.quantity || 0)} ×{" "}
                      {formatMoney(item.price)}
                    </p>

                    <strong
                      style={{
                        color: "#ff3fc7",
                        fontSize: "13px",
                      }}
                    >
                      {formatMoney(subtotal)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="coytoy-orders-actions"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto auto",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 5px",
              color: "#8993b8",
              fontSize: "12px",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Order Total
          </p>

          <strong
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: "#ff3fc7",
              fontSize: "22px",
            }}
          >
            {formatMoney(order.total)}
          </strong>
        </div>

        <select
          className="coytoy-orders-select"
          value={currentStatus}
          disabled={isLoading}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          style={{
            ...selectStyle,
            minWidth: "170px",
          }}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => onDelete(order.id)}
          className="coytoy-orders-btn"
          style={deleteButtonStyle}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "13px",
        border: "1px solid #1c2340",
        background: "rgba(6,8,15,0.28)",
      }}
    >
      <p
        style={{
          margin: "0 0 6px",
          color: "#5b6390",
          fontSize: "11px",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {label}
      </p>

      <p
        style={{
          margin: 0,
          color: "#eef1fb",
          fontSize: "13px",
          lineHeight: 1.5,
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "rgba(15,20,38,0.72)",
        border: "1px solid #1c2340",
        borderRadius: "16px",
        padding: "17px",
        boxShadow: `0 0 22px ${color}22`,
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#8993b8",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0.8px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>

      <h3
        style={{
          margin: 0,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "26px",
          color,
          textShadow: `0 0 12px ${color}66`,
        }}
      >
        {value}
      </h3>
    </div>
  );
}

function LoadingBox() {
  return (
    <div
      style={{
        padding: "70px 0",
        textAlign: "center",
        color: "#8993b8",
        border: "1px dashed #1c2340",
        borderRadius: "18px",
        background: "rgba(15,20,38,0.55)",
      }}
    >
      Loading orders...
    </div>
  );
}

function EmptyOrders() {
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
      <div style={{ fontSize: "44px", marginBottom: "12px" }}>📦</div>

      <h2
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: "#eef1fb",
          margin: "0 0 10px",
        }}
      >
        No Orders Found
      </h2>

      <p
        style={{
          color: "#8993b8",
          margin: "0 auto",
          maxWidth: "420px",
          lineHeight: 1.6,
        }}
      >
        New checkout orders will appear here after customers place orders.
      </p>
    </div>
  );
}

const inputStyle = {
  minWidth: "240px",
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #1c2340",
  background: "#0c1020",
  color: "#eef1fb",
  fontSize: "13px",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const selectStyle = {
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #1c2340",
  background: "#0c1020",
  color: "#eef1fb",
  fontSize: "13px",
  fontFamily: "'Inter', system-ui, sans-serif",
  cursor: "pointer",
};

const outlineLinkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "11px 16px",
  borderRadius: "11px",
  border: "1px solid #3fe3ff",
  background: "rgba(63,227,255,0.08)",
  color: "#3fe3ff",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: 900,
};

const refreshButtonStyle = {
  padding: "11px 16px",
  borderRadius: "11px",
  border: "1px solid #ff3fc7",
  background: "rgba(255,63,199,0.1)",
  color: "#ff3fc7",
  fontSize: "14px",
  fontWeight: 900,
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "11px 14px",
  borderRadius: "10px",
  border: "1px solid #ff4d6d",
  background: "rgba(255,77,109,0.08)",
  color: "#ff4d6d",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
};