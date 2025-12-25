const AuditLog = require('../models/AuditLog');

// GET /api/admin/logs
exports.getLogs = async (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (Math.max(0, page - 1)) * Number(limit);

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, logs });
  } catch (err) {
    console.error('Get logs error', err);
    res.status(500).json({ success: false, message: 'Failed to fetch logs' });
  }
};

// Helper to create a log entry
exports.logAction = async ({ actor, actorEmail, action, resourceType, resourceId, details }) => {
  try {
    await AuditLog.create({ actor, actorEmail, action, resourceType, resourceId, details });
  } catch (err) {
    console.error('Failed to create audit log', err);
  }
};
