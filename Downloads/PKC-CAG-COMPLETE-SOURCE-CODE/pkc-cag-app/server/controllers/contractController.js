// server/controllers/contractController.js
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const { sendContractCreatedEmail, sendContractCompletedEmail } = require('../utils/email');

// Platform commission rate (configurable)
const DEFAULT_COMMISSION_RATE = 10; // 10%

exports.createContract = async (req, res) => {
  try {
    const { jobId, applicationId } = req.body;

    // Get job and application
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Check authorization
    if (job.clientId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Calculate commission
    const totalAmount = application.proposedBudget;
    const platformCommission = Math.round((totalAmount * DEFAULT_COMMISSION_RATE) / 100);
    const freelancerAmount = totalAmount - platformCommission;

    // Create contract
    const contract = new Contract({
      jobId,
      clientId: job.clientId,
      freelancerId: application.freelancerId,
      totalAmount,
      commissionRate: DEFAULT_COMMISSION_RATE,
      platformCommission,
      freelancerAmount,
      deadline: new Date(new Date().getTime() + application.deliveryDays * 24 * 60 * 60 * 1000),
      freelancerApplication: {
        coverLetter: application.coverLetter,
        proposedBudget: application.proposedBudget,
        deliveryDays: application.deliveryDays,
        portfolio: application.portfolio,
        upiId: application.upiId,
        paymentDetails: application.paymentDetails,
        workReceivingEmail: application.workReceivingEmail,
        appliedAt: application.createdAt,
      },
    });

    await contract.save();

    // Update job
    job.contractId = contract._id;
    job.status = 'in-progress';
    await job.save();

    // Update application
    application.status = 'accepted';
    await application.save();

    // 📧 Send contract created email to both client and freelancer
    const client = await User.findById(job.clientId);
    const freelancer = await User.findById(application.freelancerId);
    if (client) {
      await sendContractCreatedEmail(client.email, client.name, job.title, application.proposedBudget, 'client');
    }
    if (freelancer) {
      await sendContractCreatedEmail(freelancer.email, freelancer.name, job.title, application.proposedBudget, 'freelancer');
      // 📧 Send application accepted email to freelancer
      await sendApplicationAcceptedEmail(freelancer.email, freelancer.name, job.title, client?.name || 'Client');
    }

    res.status(201).json({ success: true, message: 'Contract created successfully', contract });
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Error creating contract', error: error.message });
  }
};

exports.getMyContracts = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {
      $or: [{ clientId: req.user._id }, { freelancerId: req.user._id }],
    };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const contracts = await Contract.find(query)
      .select('+paymentWorkflow +totalAmount +freelancerAmount +platformCommission +deadline +status')
      .populate('jobId', 'title description category budget')
      .populate('clientId', 'name email avatar businessName')
      .populate('freelancerId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log('✅ Fetched', contracts.length, 'contracts');
    contracts.forEach(c => {
      console.log('Contract:', {
        _id: c._id,
        jobId: c.jobId?.title,
        totalAmount: c.totalAmount,
        paymentStatus: c.paymentWorkflow?.clientPaymentStatus,
        workStatus: c.paymentWorkflow?.workCompletionStatus,
        status: c.status,
        fullPaymentWorkflow: JSON.stringify(c.paymentWorkflow, null, 2)
      });
    });

    const total = await Contract.countDocuments(query);

    res.json({
      contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Error fetching contracts', error: error.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contractId = req.params.contractId;
    const userId = req.user._id.toString();
    const isAdmin = req.user.isAdmin;
    
    console.log('📍 [getContractById] Request received');
    console.log('   contractId:', contractId);
    console.log('   userId:', userId);
    console.log('   isAdmin:', isAdmin);
    
    // First, fetch the contract WITHOUT populate to see raw IDs
    const rawContract = await Contract.findById(contractId);
    if (!rawContract) {
      console.log('❌ Contract not found (raw)');
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    console.log('📋 Raw contract found');
    console.log('   raw clientId:', rawContract.clientId, 'Type:', typeof rawContract.clientId);
    console.log('   raw freelancerId:', rawContract.freelancerId, 'Type:', typeof rawContract.freelancerId);
    
    // Check authorization with raw IDs first (admin bypass)
    const rawClientId = rawContract.clientId.toString();
    const rawFreelancerId = rawContract.freelancerId.toString();
    
    console.log(`   Comparing: ${userId} vs ${rawClientId} vs ${rawFreelancerId}`);
    
    if (!isAdmin && userId !== rawClientId && userId !== rawFreelancerId) {
      console.log('❌ Authorization failed on raw IDs');
      console.log(`   userId=${userId}, rawClientId=${rawClientId}, rawFreelancerId=${rawFreelancerId}`);
      return res.status(403).json({ message: 'Unauthorized - you do not have access to this contract' });
    }
    
    console.log('✅ Authorization passed');
    
    // Now populate for response
    const contract = await Contract.findById(contractId)
      .populate('jobId')
      .populate('clientId', 'name email avatar')
      .populate('freelancerId', 'name email avatar');

    console.log('✅ Contract populated - returning');
    res.json(contract);
  } catch (error) {
    console.error('❌ Error fetching contract:', error);
    res.status(500).json({ message: 'Error fetching contract', error: error.message });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { contractId, transactionId, paymentMethod } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Check authorization
    if (contract.clientId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    contract.paymentStatus = 'completed';
    contract.transactionId = transactionId;
    contract.paymentMethod = paymentMethod;
    contract.paidAt = new Date();
    contract.status = 'active';

    await contract.save();

    // Update freelancer profile earnings
    await FreelancerProfile.findOneAndUpdate(
      { userId: contract.freelancerId },
      { $inc: { totalEarnings: contract.freelancerAmount } }
    );

    res.json({ message: 'Payment processed successfully', contract });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

exports.completeContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Client approves completion
    if (contract.clientId.toString() === req.user._id) {
      contract.clientApproved = true;
      contract.clientApprovedAt = new Date();
      contract.completedAt = new Date();
      contract.status = 'completed';
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await contract.save();

    // Update job status
    await Job.findByIdAndUpdate(contract.jobId, { status: 'completed' });

    // Update freelancer profile
    await FreelancerProfile.findOneAndUpdate(
      { userId: contract.freelancerId },
      { $inc: { completedJobs: 1 } }
    );

    res.json({ message: 'Contract completed successfully', contract });
  } catch (error) {
    console.error('Error completing contract:', error);
    res.status(500).json({ message: 'Error completing contract', error: error.message });
  }
};

exports.cancelContract = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { reason } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Check authorization
    if (
      contract.clientId.toString() !== req.user._id &&
      contract.freelancerId.toString() !== req.user._id
    ) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Can only cancel active contracts
    if (contract.status !== 'active' && contract.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel completed or disputed contracts' });
    }

    contract.status = 'cancelled';
    await contract.save();

    // Update job
    await Job.findByIdAndUpdate(contract.jobId, { status: 'cancelled' });

    res.json({ message: 'Contract cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling contract:', error);
    res.status(500).json({ message: 'Error cancelling contract', error: error.message });
  }
};

exports.rateFreelancer = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });

    // Only client can rate
    if (contract.clientId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get freelancer profile
    let profile = await FreelancerProfile.findOne({ userId: contract.freelancerId });

    if (!profile) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Update rating
    const totalRatings = profile.totalRatings + 1;
    const newAverage = (profile.averageRating * profile.totalRatings + rating) / totalRatings;

    profile.averageRating = newAverage;
    profile.totalRatings = totalRatings;

    await profile.save();

    res.json({ message: 'Freelancer rated successfully', profile });
  } catch (error) {
    console.error('Error rating freelancer:', error);
    res.status(500).json({ message: 'Error rating freelancer', error: error.message });
  }
};

// 💳 ADMIN: Mark payment as completed
exports.markPaymentDone = async (req, res) => {
  try {
    const { contractId } = req.params;

    // Verify admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admin can mark payment' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Update payment workflow
    contract.paymentWorkflow.clientFundsReleasedAt = new Date();
    await contract.save();

    console.log(`✅ Payment marked done for contract ${contractId} by admin ${req.user.email}`);
    
    res.json({ 
      success: true, 
      message: '✅ Payment marked as completed!',
      contract 
    });
  } catch (error) {
    console.error('Error marking payment done:', error);
    res.status(500).json({ success: false, message: 'Error marking payment', error: error.message });
  }
};

// ✅ ADMIN: Close contract
exports.closeContract = async (req, res) => {
  try {
    const { contractId } = req.params;

    // Verify admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Only admin can close contracts' });
    }

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    // Update contract status
    contract.status = 'completed';
    contract.paymentWorkflow.workCompletionStatus = 'completed';
    await contract.save();

    console.log(`✅ Contract closed: ${contractId} by admin ${req.user.email}`);
    
    res.json({ 
      success: true, 
      message: '✅ Contract closed successfully!',
      contract 
    });
  } catch (error) {
    console.error('Error closing contract:', error);
    res.status(500).json({ success: false, message: 'Error closing contract', error: error.message });
  }
};

