import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ordersAPI } from "../utils/api";
import "./OrderDetailsPage.css";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await ordersAPI.getOrderById(id);
        setOrder(res.data.order);
      } catch (err) {
        toast.error("Failed to load order details");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id, navigate]);

  if (loading) return <div className="order-loading">Loading Order...</div>;
  if (!order) return <div className="order-loading">Order Not Found</div>;

  return (
    <div className="order-details-page">
      <div className="container">

        {/* TOP HEADER */}
        <div className="order-header">
          <h1>Order Details</h1>
          <p>Order ID: {order._id}</p>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ⬅ Back to Dashboard
          </button>
        </div>

        {/* ORDER STATUS */}
        <div className="status-card glass-card">
          <h2>Current Status</h2>
          <span className={`status-badge status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>

          <div className="status-timeline">
            <div className={`step ${order.status !== "pending" ? "active" : ""}`}>
              <span>🟡</span>
              <p>Pending</p>
            </div>
            <div className={`step ${order.status === "processing" || order.status === "completed" ? "active" : ""}`}>
              <span>🔵</span>
              <p>Processing</p>
            </div>
            <div className={`step ${order.status === "completed" ? "active" : ""}`}>
              <span>🟢</span>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="glass-card">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Service:</span>
            <strong>{order.service?.name}</strong>
          </div>
          <div className="summary-row">
            <span>Amount:</span>
            <strong>₹{order.amount}</strong>
          </div>
          <div className="summary-row">
            <span>Quantity:</span>
            <strong>{order.quantity}</strong>
          </div>
          <div className="summary-row">
            <span>Ordered On:</span>
            <strong>{order.createdAt.split("T")[0]}</strong>
          </div>
          <div className="summary-row">
            <span>Payment Status:</span>
            <strong>{order.paymentStatus}</strong>
          </div>
        </div>

        {/* CUSTOMER DETAILS */}
        <div className="glass-card">
          <h2>Your Information</h2>
          <div className="summary-row">
            <span>Name:</span>
            <strong>{order.customerDetails?.name}</strong>
          </div>
          <div className="summary-row">
            <span>Phone:</span>
            <strong>{order.customerDetails?.phone}</strong>
          </div>
          <div className="summary-row">
            <span>Link:</span>
            <strong>{order.customerDetails?.link || "—"}</strong>
          </div>
          <div className="summary-row">
            <span>Requirements:</span>
            <strong>{order.customerDetails?.requirements || "—"}</strong>
          </div>
        </div>

        {/* GMB FULL SETUP SPECIAL FIELDS */}
        {order.customerDetails.businessName && (
          <div className="glass-card">
            <h2>Business Details</h2>

            <div className="summary-row">
              <span>Business Name:</span>
              <strong>{order.customerDetails.businessName}</strong>
            </div>

            <div className="summary-row">
              <span>Category:</span>
              <strong>{order.customerDetails.businessCategory}</strong>
            </div>

            <div className="summary-row">
              <span>Map Location:</span>
              <strong>{order.customerDetails.mapLocation}</strong>
            </div>

            <div className="summary-row">
              <span>Address:</span>
              <strong>{order.customerDetails.address}</strong>
            </div>

            <div className="summary-row">
              <span>Website:</span>
              <strong>{order.customerDetails.website || "—"}</strong>
            </div>
          </div>
        )}

        {/* PHOTOS IF GMB SETUP */}
        {order.uploadedPhotos?.length > 0 && (
          <div className="glass-card">
            <h2>Uploaded Photos</h2>
            <div className="photos-grid">
              {order.uploadedPhotos.map((img, index) => (
                <img key={index} src={img} alt="GMB Upload" />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrderDetailsPage;
