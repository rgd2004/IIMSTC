const mongoose = require("mongoose");
const Service = require('../models/Service');

/* ============================================================
   @desc    Get all services
   @route   GET /api/services
   @access  Public
============================================================ */
exports.getAllServices = async (req, res) => {
  try {
    const { category, isActive, q } = req.query;

    const query = {};

    if (category) query.category = category;

    // convert "true"/"false" to boolean
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // Search by name (partial, case-insensitive) or exact serviceId
    if (q) {
      const regex = new RegExp(q, "i");
      query.$or = [{ name: regex }, { serviceId: q }];
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
};

/* ============================================================
   @desc    Get single service
   @route   GET /api/services/:id
   @access  Public
============================================================ */
exports.getService = async (req, res) => {
  try {
    const { id } = req.params;

    // ⭐ FIX 1 – prevent CastError from undefined ID
    if (!id || id === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Service ID missing",
      });
    }

    // ⭐ FIX 2 – validate ObjectId before DB query
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Service ID",
      });
    }

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
};

/* ============================================================
   @desc    Create service (Admin)
   @route   POST /api/services
   @access  Private/Admin
============================================================ */
exports.createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create service",
      error: error.message,
    });
  }
};

/* ============================================================
   @desc    Update service (Admin)
   @route   PUT /api/services/:id
   @access  Private/Admin
============================================================ */
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;

    // ⭐ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Service ID",
      });
    }

    const service = await Service.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: error.message,
    });
  }
};

/* ============================================================
   @desc    Delete service (Admin)
   @route   DELETE /api/services/:id
   @access  Private/Admin
============================================================ */
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // ⭐ Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Service ID",
      });
    }

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

/* ============================================================
   @desc    Admin: backfill missing 4-digit serviceId for existing services
   @route   POST /api/services/admin/backfill-ids
   @access  Private/Admin
============================================================ */
exports.backfillServiceIds = async (req, res) => {
  try {
    const services = await Service.find({ $or: [{ serviceId: { $exists: false } }, { serviceId: null }, { serviceId: "" }] });
    let updated = 0;
    for (const s of services) {
      // reuse model pre-save logic: assign unique 4-digit id
      let attempts = 0;
      let assigned = false;
      while (attempts < 6 && !assigned) {
        const candidate = String(Math.floor(1000 + Math.random() * 9000));
        // eslint-disable-next-line no-await-in-loop
        const exists = await Service.exists({ serviceId: candidate });
        if (!exists) {
          s.serviceId = candidate;
          assigned = true;
          break;
        }
        attempts += 1;
      }
      if (!assigned) s.serviceId = String(Date.now()).slice(-4);
      // eslint-disable-next-line no-await-in-loop
      await s.save();
      updated += 1;
    }

    res.json({ success: true, updated });
  } catch (err) {
    console.error('backfillServiceIds error:', err);
    res.status(500).json({ success: false, message: 'Failed to backfill serviceIds', error: err.message });
  }
};
