const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/auth");
const {
  createUpdate,
  getUpdates,
} = require("../controllers/updateController");
const { getAdminUpdates, deleteUpdate } = require("../controllers/updateController");

/* Admin */
router.post("/admin", protect, admin, createUpdate);
router.get("/admin", protect, admin, getAdminUpdates);
router.delete("/admin/:id", protect, admin, deleteUpdate);

/* User */
router.get("/", protect, getUpdates);

module.exports = router;
