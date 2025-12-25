// server/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/auth");
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  getOrderById,      // 👈 add
  updateOrderStatus,
} = require("../controllers/orderController");

const { exportOrdersCSV } = require("../controllers/orderController");

// Frontend uses: /orders/create
router.post("/create", protect, createOrder);

// Frontend uses: /orders/verify
router.post("/verify", protect, verifyPayment);

// User orders
router.get("/my-orders", protect, getMyOrders);

// ⭐ Get single order (for Order Details page)
router.get("/:id", protect, getOrderById);

// Admin: all orders
router.get("/admin/all", protect, admin, getAllOrders);

// Admin: export CSV
router.get("/admin/export-csv", protect, admin, exportOrdersCSV);

// Admin: update status
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
