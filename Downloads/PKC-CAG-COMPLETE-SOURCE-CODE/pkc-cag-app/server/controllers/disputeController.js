// server/controllers/disputeController.js
const Dispute = require('../models/Dispute');
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendDisputeFiledEmail, sendDisputeResolvedEmail } = require('../utils/email');

exports.createDispute = async (req, res) => {
  try {
    const { contractId, reason, description, attachments } = req.body;

    // Validation
    if (!contractId || !reason || !description) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Get contract
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization - only client or freelancer can create dispute
    if (
      contract.clientId.toString() !== req.user._id.toString() &&
      contract.freelancerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({
      contractId,
      status: { $in: ['open', 'in-review'] },
    });

    if (existingDispute) {
      return res.status(400).json({ message: 'A dispute is already open for this contract' });
    }

    // Create dispute
    const dispute = new Dispute({
      contractId,
      jobId: contract.jobId,
      clientId: contract.clientId,
      freelancerId: contract.freelancerId,
      raisedBy: req.user._id,
      reason,
      description,
      attachments: attachments || [],
    });

    await dispute.save();

    // Update contract status
    contract.status = 'disputed';
    await contract.save();

    // 📧 Send dispute filed email to both client and freelancer
    const client = await User.findById(contract.clientId);
    const freelancer = await User.findById(contract.freelancerId);
    const job = await Job.findById(contract.jobId);
    
    if (client) {
      await sendDisputeFiledEmail(client.email, client.name, job?.title || 'Contract', reason);
    }
    if (freelancer) {
      await sendDisputeFiledEmail(freelancer.email, freelancer.name, job?.title || 'Contract', reason);
    }

    res.status(201).json({ success: true, message: 'Dispute created successfully', dispute });
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(500).json({ message: 'Error creating dispute', error: error.message });
  }
};

exports.getMyDisputes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      $or: [{ clientId: req.user._id }, { freelancerId: req.user._id }],
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const disputes = await Dispute.find(query)
      .populate('contractId')
      .populate('jobId', 'title description')
      .populate('raisedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ message: 'Error fetching disputes', error: error.message });
  }
};

exports.getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.disputeId)
      .populate('contractId')
      .populate('jobId')
      .populate('raisedBy', 'firstName lastName email avatar');

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check authorization
    if (
      dispute.clientId.toString() !== req.user._id.toString() &&
      dispute.freelancerId.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(dispute);
  } catch (error) {
    console.error('Error fetching dispute:', error);
    res.status(500).json({ message: 'Error fetching dispute', error: error.message });
  }
};

exports.submitResponse = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { response, attachments } = req.body;

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    // Check authorization
    if (
      dispute.clientId.toString() !== req.user._id.toString() &&
      dispute.freelancerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Add response (this would be stored differently in a real system)
    // For now, we're just updating the status to in-review
    dispute.status = 'in-review';
    await dispute.save();

    res.json({ message: 'Response submitted successfully', dispute });
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ message: 'Error submitting response', error: error.message });
  }
};

// ============ ADMIN: DISPUTE MANAGEMENT ============

exports.getAllDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const disputes = await Dispute.find(query)
      .populate('contractId')
      .populate('jobId', 'title')
      .populate('clientId', 'firstName lastName email')
      .populate('freelancerId', 'firstName lastName email')
      .populate('raisedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Dispute.countDocuments(query);

    res.json({
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    res.status(500).json({ message: 'Error fetching disputes', error: error.message });
  }
};

exports.assignDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { adminId } = req.body;

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    dispute.assignedTo = adminId;
    dispute.status = 'in-review';
    await dispute.save();

    res.json({ message: 'Dispute assigned successfully', dispute });
  } catch (error) {
    console.error('Error assigning dispute:', error);
    res.status(500).json({ message: 'Error assigning dispute', error: error.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution, amount, reason, adminNotes } = req.body;

    if (!resolution || !['refund', 'pay', 'partial-refund', 'no-action'].includes(resolution)) {
      return res.status(400).json({ message: 'Invalid resolution type' });
    }

    const dispute = await Dispute.findById(disputeId);

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    const contract = await Contract.findById(dispute.contractId);

    // Process resolution
    dispute.resolution = resolution;
    dispute.status = 'resolved';
    dispute.adminNotes = adminNotes;
    dispute.resolutionDetails = {
      amount: amount || 0,
      reason,
      decidedAt: new Date(),
    };

    // Update contract based on resolution
    if (resolution === 'refund') {
      contract.paymentStatus = 'refunded';
      contract.status = 'cancelled';
    } else if (resolution === 'pay') {
      // Payment already made, just mark as resolved
      contract.status = 'completed';
    } else if (resolution === 'partial-refund') {
      // Handle partial refund
      contract.paymentStatus = 'processing';
    }

    await dispute.save();
    await contract.save();

    // 📧 Send dispute resolved email to both client and freelancer
    const client = await User.findById(dispute.clientId);
    const freelancer = await User.findById(dispute.freelancerId);
    const job = await Job.findById(dispute.jobId);
    const resolutionText = `Your dispute has been ${resolution === 'refund' ? 'resolved with a refund' : resolution === 'pay' ? 'resolved - payment to freelancer' : resolution === 'partial-refund' ? 'resolved with partial refund' : 'resolved'}. ${reason || ''}`;
    
    if (client) {
      await sendDisputeResolvedEmail(client.email, client.name, job?.title || 'Contract', resolutionText);
    }
    if (freelancer) {
      await sendDisputeResolvedEmail(freelancer.email, freelancer.name, job?.title || 'Contract', resolutionText);
    }

    res.json({ success: true, message: 'Dispute resolved successfully', dispute });
  } catch (error) {
    console.error('Error resolving dispute:', error);
    res.status(500).json({ message: 'Error resolving dispute', error: error.message });
  }
};

exports.getDisputeStats = async (req, res) => {
  try {
    const totalDisputes = await Dispute.countDocuments();
    const openDisputes = await Dispute.countDocuments({ status: 'open' });
    const inReviewDisputes = await Dispute.countDocuments({ status: 'in-review' });
    const resolvedDisputes = await Dispute.countDocuments({ status: 'resolved' });

    res.json({
      total: totalDisputes,
      open: openDisputes,
      inReview: inReviewDisputes,
      resolved: resolvedDisputes,
    });
  } catch (error) {
    console.error('Error fetching dispute stats:', error);
    res.status(500).json({ message: 'Error fetching dispute stats', error: error.message });
  }
};

