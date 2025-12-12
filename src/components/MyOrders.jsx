import React, { useEffect, useState } from "react";
import api from "../axios.jsx";

const TAX_RATE = 0.18; // 18% tax (change if needed)

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/my");
      setOrders(Array.isArray(response.data) ? response.data : []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch my orders:", error);
      setOrders([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const toggleDetails = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return "bg-info";
      case "ACCEPTED":
        return "bg-primary";
      case "PACKED":
        return "bg-secondary";
      case "SHIPPED":
        return "bg-warning text-dark";
      case "DELIVERED":
        return "bg-success";
      case "CANCELLED":
        return "bg-danger";
      default:
        return "bg-dark";
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);

  // subtotal = sum of item line totals
  const calculateSubtotal = (items) =>
    items.reduce((sum, item) => sum + item.totalPrice, 0);

  // returns { subtotal, tax, total }
  const calculateTotals = (items) => {
    const subtotal = calculateSubtotal(items);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  if (loading) {
    return (
      <div className="container mt-5 pt-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4 text-center">My Orders</h2>

      <div className="text-end mb-3">
        <button className="btn btn-outline-primary" onClick={fetchMyOrders}>
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="alert alert-info text-center">
          You have not placed any orders yet.
        </div>
      ) : (
        <div className="card shadow">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Items</th>
                  <th>Total (incl. tax)</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const { subtotal, tax, total } = calculateTotals(order.items);

                  return (
                    <React.Fragment key={order.orderId}>
                      <tr>
                        <td className="fw-bold">{order.orderId}</td>
                        <td>
                          {order.orderDate
                            ? new Date(order.orderDate).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td>
                          <span
                            className={`badge ${getStatusClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td>{order.items.length}</td>

                        {/* main table shows grand total (subtotal + tax) */}
                        <td className="fw-bold">{formatCurrency(total)}</td>

                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleDetails(order.orderId)}
                          >
                            {expandedOrder === order.orderId ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expandedOrder === order.orderId && (
                        <tr>
                          <td colSpan="6" className="p-0">
                            <div className="p-3 bg-light">
                              <h6>Order Items</h6>

                              <table className="table table-bordered table-sm mb-0">
                                <thead className="table-secondary">
                                  <tr>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Line Total</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {(order.items || []).map((item, index) => (
                                    <tr key={index}>
                                      <td>{item.productName}</td>
                                      <td>{item.quantity}</td>
                                      <td className="text-end">
                                        {formatCurrency(item.totalPrice)}
                                      </td>
                                    </tr>
                                  ))}

                                  <tr>
                                    <td
                                      colSpan="2"
                                      className="text-end fw-bold"
                                    >
                                      Subtotal
                                    </td>
                                    <td className="text-end">
                                      {formatCurrency(subtotal)}
                                    </td>
                                  </tr>
                                  <tr>
                                    <td
                                      colSpan="2"
                                      className="text-end fw-bold"
                                    >
                                      Tax ({Math.round(TAX_RATE * 100)}%)
                                    </td>
                                    <td className="text-end">
                                      {formatCurrency(tax)}
                                    </td>
                                  </tr>
                                  <tr className="table-info">
                                    <td
                                      colSpan="2"
                                      className="text-end fw-bold"
                                    >
                                      Total
                                    </td>
                                    <td className="text-end fw-bold">
                                      {formatCurrency(total)}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
