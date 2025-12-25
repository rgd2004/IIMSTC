const Update = require("../models/Update");

/* ADMIN: create update */
exports.createUpdate = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const update = await Update.create({
      title,
      message,
      type,
      createdBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Update posted successfully",
      update,
    });
  } catch (err) {
    console.error("createUpdate error:", err);
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: err.message || "Failed to create update",
    });
  }
};

/* USER: get all updates */
exports.getUpdates = async (req, res) => {
  try {
    const updates = await Update.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      updates,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load updates",
    });
  }
};

/* ADMIN: get all updates (no limit) */
exports.getAdminUpdates = async (req, res) => {
  try {
    const updates = await Update.find()
      .sort({ createdAt: -1 });

    res.json({ success: true, updates });
  } catch (err) {
    console.error('getAdminUpdates error:', err);
    res.status(500).json({ success: false, message: 'Failed to load updates' });
  }
};

/* ADMIN: delete an update by id */
exports.deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    console.debug('deleteUpdate called by user:', req.user?._id, 'isAdmin:', req.user?.isAdmin, 'targetId:', id);
    const upd = await Update.findById(id);
    if (!upd) return res.status(404).json({ success: false, message: 'Update not found' });

    await Update.deleteOne({ _id: id });
    res.json({ success: true, message: 'Update deleted' });
  } catch (err) {
    console.error('deleteUpdate error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete update' });
  }
};
