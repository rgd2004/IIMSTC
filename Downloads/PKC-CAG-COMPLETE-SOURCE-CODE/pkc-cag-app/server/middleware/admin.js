// server/middleware/admin.js

module.exports = async function (req, res, next) {
  try {
    // 1️⃣ Check authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // 2️⃣ Support both formats:
    // req.user = { id, isAdmin } OR req.user = { _id, isAdmin }
    const isAdmin =
      req.user.isAdmin ||
      req.user.role === "admin" ||
      req.user?.data?.isAdmin;

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    next();
  } catch (err) {
    console.error("ADMIN MIDDLEWARE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Admin authorization failed",
    });
  }
};
