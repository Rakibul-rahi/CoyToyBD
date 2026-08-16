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

// Only used to detect "backward" moves for a warning - every transition is
// still allowed, since admins occasionally need to correct a mistake.
const STATUS_PIPELINE_ORDER = ["pending", "confirmed", "processing", "delivered"];

/**
 * Surfaces the real, non-obvious consequences of a status change so the
 * admin isn't guessing. Cancelling restocks products automatically; moving
 * an order back out of "cancelled" does NOT reverse that, since there's no
 * way to know if the stock is still available.
 */
function getStatusChangeWarning(fromStatus, toStatus) {
  if (fromStatus === toStatus) return null;

  if (toStatus === "cancelled") {
    return {
      tone: "warning",
      message:
        "Cancelling returns every item in this order back to product stock automatically.",
    };
  }

  if (fromStatus === "cancelled") {
    return {
      tone: "danger",
      message:
        "This order's stock was already returned when it was cancelled. Moving it out of Cancelled will NOT re-deduct stock automatically - check inventory before confirming.",
    };
  }

  const fromIndex = STATUS_PIPELINE_ORDER.indexOf(fromStatus);
  const toIndex = STATUS_PIPELINE_ORDER.indexOf(toStatus);

  if (fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex) {
    return {
      tone: "warning",
      message: `This moves the order backward, from "${STATUS_LABELS[fromStatus]}" to "${STATUS_LABELS[toStatus]}".`,
    };
  }

  return null;
}

export default function AdminOrders() {
  useInjectFonts();

  const [orders, setOrders] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState(null); // { order, newStatus }
  const [statusNoteDraft, setStatusNoteDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null); // order

  const statusChangeLoading =
    !!pendingStatusChange && actionLoadingId === pendingStatusChange.order.id;
  const deleteLoading = !!pendingDelete && actionLoadingId === pendingDelete.id;

  // Let Escape dismiss whichever modal is open, but not mid-request.
  useEffect(() => {
    if (!pendingStatusChange && !pendingDelete) return undefined;

    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (pendingStatusChange && !statusChangeLoading) setPendingStatusChange(null);
      if (pendingDelete && !deleteLoading) setPendingDelete(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingStatusChange, pendingDelete, statusChangeLoading, deleteLoading]);

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

  // Returns whether the update actually succeeded, so callers can decide
  // whether it's safe to dismiss their confirmation modal.
  const handleStatusChange = async (orderId, newStatus, adminNote) => {
    const order = orders.find((item) => item.id === orderId);

    if (!order) return false;
    if (order.status === newStatus) return false;

    try {
      setActionLoadingId(orderId);

      await updateOrderStatus(orderId, newStatus, adminNote);

      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, status: newStatus, adminNote } : item
        )
      );

      showNotice("Order status updated");
      return true;
    } catch (error) {
      console.error("Failed to update order:", error);
      alert(error.message || "Failed to update order.");
      return false;
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      setActionLoadingId(orderId);

      await deleteOrder(orderId);

      setOrders((prev) => prev.filter((order) => order.id !== orderId));

      showNotice("Order deleted");
      return true;
    } catch (error) {
      console.error("Failed to delete order:", error);
      alert(error.message || "Failed to delete order.");
      return false;
    } finally {
      setActionLoadingId("");
    }
  };

  const requestStatusChange = (order, newStatus) => {
    if (!newStatus || newStatus === order.status) return;
    setPendingStatusChange({ order, newStatus });
    setStatusNoteDraft(order.adminNote || "");
  };

  const cancelStatusChange = () => {
    if (statusChangeLoading) return;
    setPendingStatusChange(null);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;

    const ok = await handleStatusChange(
      pendingStatusChange.order.id,
      pendingStatusChange.newStatus,
      statusNoteDraft.trim()
    );

    if (ok) setPendingStatusChange(null);
  };

  const requestDelete = (order) => setPendingDelete(order);

  const cancelDelete = () => {
    if (deleteLoading) return;
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    const ok = await handleDeleteOrder(pendingDelete.id);

    if (ok) setPendingDelete(null);
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
                onRequestStatusChange={requestStatusChange}
                onRequestDelete={requestDelete}
              />
            ))}
          </section>
        )}
      </main>

      {pendingStatusChange && (
        <StatusChangeModal
          order={pendingStatusChange.order}
          newStatus={pendingStatusChange.newStatus}
          note={statusNoteDraft}
          onNoteChange={setStatusNoteDraft}
          onCancel={cancelStatusChange}
          onConfirm={confirmStatusChange}
          loading={statusChangeLoading}
          formatMoney={formatMoney}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          order={pendingDelete}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
          loading={deleteLoading}
          formatMoney={formatMoney}
        />
      )}
    </div>
  );
}

function OrderCard({
  order,
  actionLoadingId,
  formatMoney,
  formatDate,
  onRequestStatusChange,
  onRequestDelete,
}) {
  const items = Array.isArray(order.items) ? order.items : [];
  const currentStatus = order.status || "pending";
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

        <StatusBadge status={currentStatus} />
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
        {order.secondaryPhone && (
          <InfoBox label="Secondary Phone" value={order.secondaryPhone} />
        )}
        <InfoBox label="Address" value={order.address || "N/A"} />
        <InfoBox label="Note" value={order.note || "None"} />
        <InfoBox label="Admin Note" value={order.adminNote || "None"} />
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
          onChange={(e) => onRequestStatusChange(order, e.target.value)}
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
          onClick={() => onRequestDelete(order)}
          className="coytoy-orders-btn"
          style={deleteButtonStyle}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || "#8993b8";

  return (
    <span
      style={{
        padding: "7px 11px",
        borderRadius: "999px",
        border: `1px solid ${color}`,
        color,
        background: `${color}14`,
        fontSize: "12px",
        fontWeight: 900,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function ModalOverlay({ children, onDismiss }) {
  return (
    <div
      role="presentation"
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(6,8,15,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
        {children}
      </div>
    </div>
  );
}

function StatusChangeModal({
  order,
  newStatus,
  note,
  onNoteChange,
  onCancel,
  onConfirm,
  loading,
  formatMoney,
}) {
  const currentStatus = order.status || "pending";
  const warning = getStatusChangeWarning(currentStatus, newStatus);

  return (
    <ModalOverlay onDismiss={loading ? undefined : onCancel}>
      <p style={modalEyebrowStyle}>Confirm Status Change</p>

      <h3 style={modalTitleStyle}>Order {order.id}</h3>

      <p style={modalSubtitleStyle}>
        {order.customerName || "N/A"} · {formatMoney(order.total)}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          margin: "18px 0",
        }}
      >
        <StatusBadge status={currentStatus} />
        <span style={{ color: "#5b6390" }}>→</span>
        <StatusBadge status={newStatus} />
      </div>

      {warning && (
        <div style={warningBoxStyle(warning.tone)}>
          <span aria-hidden="true">
            {warning.tone === "danger" ? "⛔" : "⚠"}
          </span>
          <span>{warning.message}</span>
        </div>
      )}

      <label style={fieldLabelStyle} htmlFor="status-admin-note">
        Admin Note (optional)
      </label>
      <textarea
        id="status-admin-note"
        value={note}
        maxLength={500}
        disabled={loading}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Add context for this status change..."
        style={{
          ...inputStyle,
          minWidth: "100%",
          minHeight: "80px",
          resize: "vertical",
          marginBottom: "22px",
        }}
      />

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="coytoy-orders-btn"
          style={secondaryButtonStyle}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="coytoy-orders-btn"
          style={confirmButtonStyle}
        >
          {loading ? "Updating…" : "Confirm Change"}
        </button>
      </div>
    </ModalOverlay>
  );
}

function DeleteConfirmModal({ order, onCancel, onConfirm, loading, formatMoney }) {
  return (
    <ModalOverlay onDismiss={loading ? undefined : onCancel}>
      <p style={modalEyebrowStyle}>Confirm Delete</p>

      <h3 style={modalTitleStyle}>Order {order.id}</h3>

      <p style={modalSubtitleStyle}>
        {order.customerName || "N/A"} · {formatMoney(order.total)}
      </p>

      <div style={{ ...warningBoxStyle("danger"), marginTop: "18px" }}>
        <span aria-hidden="true">⛔</span>
        <span>
          This permanently deletes the order record and can&apos;t be undone.
          It does <strong>not</strong> return stock - cancel the order first
          if you need its items returned to inventory.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "22px",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="coytoy-orders-btn"
          style={secondaryButtonStyle}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="coytoy-orders-btn"
          style={deleteButtonStyle}
        >
          {loading ? "Deleting…" : "Delete Order"}
        </button>
      </div>
    </ModalOverlay>
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

const modalCardStyle = {
  width: "100%",
  maxWidth: "460px",
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: "18px",
  border: "1px solid #1c2340",
  background: "rgba(15,20,38,0.97)",
  boxShadow: "0 0 60px rgba(0,0,0,0.5)",
  padding: "26px",
  boxSizing: "border-box",
};

const modalEyebrowStyle = {
  fontFamily: "'Orbitron', sans-serif",
  color: "#3fe3ff",
  letterSpacing: "3px",
  fontSize: "11px",
  fontWeight: 700,
  margin: "0 0 10px",
  textTransform: "uppercase",
};

const modalTitleStyle = {
  margin: "0 0 4px",
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "18px",
  color: "#eef1fb",
  wordBreak: "break-all",
};

const modalSubtitleStyle = {
  margin: 0,
  color: "#8993b8",
  fontSize: "13px",
};

const fieldLabelStyle = {
  display: "block",
  margin: "0 0 8px",
  color: "#8993b8",
  fontSize: "12px",
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

function warningBoxStyle(tone) {
  const color = tone === "danger" ? "#ff4d6d" : "#ffb14e";

  return {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    padding: "12px 13px",
    borderRadius: "12px",
    border: `1px solid ${color}55`,
    background: `${color}14`,
    color,
    fontSize: "13px",
    lineHeight: 1.5,
    marginBottom: "18px",
  };
}

const secondaryButtonStyle = {
  padding: "11px 16px",
  borderRadius: "10px",
  border: "1px solid #1c2340",
  background: "rgba(255,255,255,0.03)",
  color: "#8993b8",
  fontSize: "13px",
  fontWeight: 800,
  cursor: "pointer",
};

const confirmButtonStyle = {
  padding: "11px 18px",
  borderRadius: "10px",
  border: "1px solid #3fe3ff",
  background: "rgba(63,227,255,0.14)",
  color: "#3fe3ff",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
};