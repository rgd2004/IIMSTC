// server/controllers/exportController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const ExportHistory = require('../models/ExportHistory');
const json2csv = require('json2csv').parse;
const PDFDocument = require('pdfkit');

// =============================
// REQUEST DATA EXPORT
// =============================
exports.requestExport = async (req, res) => {
  try {
    const { exportType, dataIncluded, isScheduled, scheduleFrequency } = req.body;

    if (!['json', 'csv', 'pdf'].includes(exportType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid export type',
      });
    }

    // Create export record
    const exportRecord = new ExportHistory({
      userId: req.user.id,
      exportType,
      dataIncluded: dataIncluded || ['orders', 'reviews', 'profile'],
      isScheduled,
      scheduleFrequency,
      status: 'pending',
    });

    await exportRecord.save();

    // Trigger export (in production, use queue system like Bull/RabbitMQ)
    generateExport(req.user.id, exportRecord._id, exportType, dataIncluded);

    res.json({
      success: true,
      message: 'Export request received. You will receive email when ready.',
      data: exportRecord,
    });
  } catch (error) {
    console.error('Error requesting export:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request export',
    });
  }
};

// =============================
// GENERATE EXPORT DATA
// =============================
async function generateExport(userId, exportId, exportType, dataIncluded) {
  try {
    const user = await User.findById(userId).select('-password');
    let data = { user };

    // Fetch data based on selection
    if (dataIncluded.includes('orders')) {
      data.orders = await Order.find({ userId }).populate('service');
    }
    if (dataIncluded.includes('reviews')) {
      data.reviews = await Review.find({ userId }).populate('serviceId');
    }
    if (dataIncluded.includes('referrals')) {
      data.referralStats = {
        referralEarnings: user.referralEarnings,
        totalReferrals: user.referredUsers?.length || 0,
      };
    }

    // Generate file based on type
    let content, fileName, mimeType;

    if (exportType === 'json') {
      content = JSON.stringify(data, null, 2);
      fileName = `account-data-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else if (exportType === 'csv') {
      const csvData = flattenForCSV(data);
      content = json2csv(csvData);
      fileName = `account-data-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    } else if (exportType === 'pdf') {
      // PDF generation would be more complex - using simple text for now
      content = generatePDFContent(data);
      fileName = `account-data-${new Date().toISOString().split('T')[0]}.pdf`;
      mimeType = 'application/pdf';
    }

    // Save to storage (in production, use S3/Firebase Storage)
    // For now, save file path
    const downloadUrl = `/api/exports/download/${exportId}`;

    // Update export record
    await ExportHistory.findByIdAndUpdate(exportId, {
      status: 'completed',
      downloadUrl,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      fileName,
      fileSize: content.length,
    });

    // Send email to user (implement email service)
    console.log(`Export ready for ${user.email}: ${downloadUrl}`);
  } catch (error) {
    console.error('Error generating export:', error);
    await ExportHistory.findByIdAndUpdate(exportId, {
      status: 'failed',
      error: error.message,
    });
  }
}

// =============================
// FLATTEN DATA FOR CSV
// =============================
function flattenForCSV(data) {
  const flat = [
    {
      category: 'Profile',
      field: 'Name',
      value: data.user.name,
    },
    {
      category: 'Profile',
      field: 'Email',
      value: data.user.email,
    },
    {
      category: 'Profile',
      field: 'Phone',
      value: data.user.phone,
    },
  ];

  if (data.orders) {
    data.orders.forEach((order) => {
      flat.push({
        category: 'Orders',
        field: order.service?.name,
        value: order.amount,
        date: new Date(order.createdAt).toLocaleDateString(),
      });
    });
  }

  if (data.reviews) {
    data.reviews.forEach((review) => {
      flat.push({
        category: 'Reviews',
        field: review.serviceId?.name,
        value: `${review.rating} stars - ${review.title}`,
        date: new Date(review.createdAt).toLocaleDateString(),
      });
    });
  }

  return flat;
}

// =============================
// GENERATE PDF CONTENT
// =============================
function generatePDFContent(data) {
  let content = 'ACCOUNT DATA EXPORT\n';
  content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  content += `Name: ${data.user.name}\n`;
  content += `Email: ${data.user.email}\n`;
  content += `Phone: ${data.user.phone}\n\n`;

  if (data.orders) {
    content += `ORDERS (${data.orders.length})\n`;
    data.orders.forEach((o) => {
      content += `- ${o.service?.name}: ₹${o.amount} (${new Date(o.createdAt).toLocaleDateString()})\n`;
    });
  }

  if (data.reviews) {
    content += `\nREVIEWS (${data.reviews.length})\n`;
    data.reviews.forEach((r) => {
      content += `- ${r.serviceId?.name}: ${r.rating}⭐ - ${r.title}\n`;
    });
  }

  return content;
}

// =============================
// GET EXPORT HISTORY
// =============================
exports.getExportHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const exports = await ExportHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ExportHistory.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: exports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch export history',
    });
  }
};

// =============================
// SETUP SCHEDULED EXPORT
// =============================
exports.setupScheduledExport = async (req, res) => {
  try {
    const { frequency, dataIncluded } = req.body; // 'weekly', 'monthly', 'quarterly'

    const nextDate = calculateNextScheduleDate(frequency);

    const exportRecord = new ExportHistory({
      userId: req.user.id,
      exportType: 'json',
      dataIncluded,
      isScheduled: true,
      scheduleFrequency: frequency,
      nextScheduledDate: nextDate,
      status: 'pending',
    });

    await exportRecord.save();

    res.json({
      success: true,
      message: `Scheduled export set for ${frequency}`,
      data: exportRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to setup scheduled export',
    });
  }
};

// =============================
// CALCULATE NEXT SCHEDULE DATE
// =============================
function calculateNextScheduleDate(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'quarterly':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

// =============================
// CANCEL SCHEDULED EXPORT
// =============================
exports.cancelScheduledExport = async (req, res) => {
  try {
    const { exportId } = req.params;

    await ExportHistory.findByIdAndUpdate(exportId, {
      isScheduled: false,
    });

    res.json({
      success: true,
      message: 'Scheduled export cancelled',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel export',
    });
  }
};
