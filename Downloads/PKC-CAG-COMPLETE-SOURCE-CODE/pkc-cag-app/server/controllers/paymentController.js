const Contract = require('../models/Contract');
const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendPaymentVerificationEmail } = require('../utils/email');

// Initialize Razorpay
let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    console.warn('⚠️ WARNING: Razorpay credentials not set. Payment features will not work.');
    console.warn('Set RAZORPAY_KEY_ID and RAZORPAY_SECRET in .env file');
  } else {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    console.log('✅ Razorpay initialized successfully');
  }
} catch (error) {
  console.error('❌ Error initializing Razorpay:', error.message);
}

// Test endpoint to verify Razorpay configuration
exports.testRazorpay = async (req, res) => {
  try {
    const hasKeys = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET);
    const isInitialized = !!razorpay;
    
    res.json({
      razorpayConfigured: hasKeys,
      razorpayInitialized: isInitialized,
      keyIdSet: !!process.env.RAZORPAY_KEY_ID,
      secretSet: !!process.env.RAZORPAY_SECRET,
      message: hasKeys ? 'Razorpay is configured' : 'Razorpay credentials not set'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Test payment endpoint - simulates payment for development/testing
exports.testPaymentComplete = async (req, res) => {
  try {
    const { contractId } = req.params;
    const clientId = req.user.id;

    console.log('🧪 [testPaymentComplete] Processing test payment for contract:', contractId);

    // Find contract
    const contract = await Contract.findById(contractId).populate('clientId freelancerId jobId');
    if (!contract) {
      console.error('❌ Contract not found:', contractId);
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify client owns contract
    if (contract.clientId._id.toString() !== clientId) {
      console.error('❌ Unauthorized test payment');
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if already paid
    if (contract.paymentWorkflow.clientPaymentStatus === 'paid_to_admin') {
      console.warn('⚠️ Contract already paid');
      return res.status(400).json({ message: 'Payment already made for this contract' });
    }

    // Update contract with TEST payment info
    contract.paymentWorkflow.clientPaymentStatus = 'paid_to_admin';
    contract.paymentWorkflow.clientPaymentDate = new Date();
    contract.paymentWorkflow.clientTransactionId = 'TEST_' + Date.now();
    contract.paymentWorkflow.clientPaymentMethod = 'test_mode';

    // Legacy fields
    contract.paymentStatus = 'completed';
    contract.paidAt = new Date();
    contract.transactionId = 'TEST_' + Date.now();

    await contract.save();
    console.log('✅ Test payment recorded. Contract payment status updated to paid_to_admin');

    // Send payment verification email
    try {
      await sendPaymentVerificationEmail(
        contract.clientId.email,
        {
          clientName: contract.clientId.firstName,
          contractId: contract._id,
          jobTitle: contract.jobId?.title,
          amount: contract.totalAmount,
          paymentId: 'TEST_' + Date.now(),
          orderId: 'TEST_ORDER',
          freelancerName: contract.freelancerId?.firstName,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        }
      );
      console.log('✅ Test payment verification email sent to:', contract.clientId.email);
    } catch (emailErr) {
      console.error('⚠️ Failed to send verification email:', emailErr.message);
      // Continue even if email fails
    }

    // Log audit
    await AuditLog.create({
      userId: clientId,
      action: 'test_payment_verified',
      details: `TEST MODE: Payment ₹${contract.totalAmount} verified for contract ${contractId}`,
      contractId,
      ipAddress: req.ip,
    });

    console.log('✅ Test payment complete.');

    res.json({
      message: 'Test payment verified successfully',
      success: true,
      contract,
      payment: {
        id: 'TEST_' + Date.now(),
        amount: contract.totalAmount,
        currency: 'INR',
        status: 'verified',
        mode: 'test'
      }
    });
  } catch (error) {
    console.error('❌ Error processing test payment:', error);
    res.status(500).json({ 
      message: 'Error processing test payment',
      error: error.message 
    });
  }
};

// Record client payment to admin
exports.recordClientPayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { transactionId, paymentMethod } = req.body;
    const clientId = req.user.id;

    // Find contract
    const contract = await Contract.findById(contractId).populate('clientId freelancerId');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify client owns contract
    if (contract.clientId._id.toString() !== clientId) {
      return res.status(403).json({ message: 'Not authorized to pay for this contract' });
    }

    // Check if already paid
    if (contract.paymentWorkflow.clientPaymentStatus === 'paid_to_admin') {
      return res.status(400).json({ message: 'Payment already made for this contract' });
    }

    // Update contract with payment info
    contract.paymentWorkflow.clientPaymentStatus = 'paid_to_admin';
    contract.paymentWorkflow.clientPaymentDate = new Date();
    contract.paymentWorkflow.clientTransactionId = transactionId;
    contract.paymentWorkflow.clientPaymentMethod = paymentMethod;

    // Legacy field update
    contract.paymentStatus = 'completed';
    contract.paidAt = new Date();
    contract.transactionId = transactionId;

    await contract.save();

    // Log audit
    await AuditLog.create({
      userId: clientId,
      action: 'payment_made',
      details: `Paid ₹${contract.totalAmount} to admin for contract ${contractId}`,
      contractId,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Payment recorded successfully',
      contract,
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Error processing payment' });
  }
};

// Create Razorpay order
exports.createPaymentOrder = async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      console.error('❌ Razorpay not initialized - credentials missing');
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please contact admin.',
        error: 'Razorpay credentials not set in environment'
      });
    }

    const { contractId } = req.params;
    const { amount, currency, freelancerPaymentDetails } = req.body;
    const clientId = req.user.id;

    console.log('🔄 [createPaymentOrder] Creating Razorpay order for:', { contractId, amount });

    // Verify contract exists
    const contract = await Contract.findById(contractId).populate('clientId freelancerId');
    if (!contract) {
      console.error('❌ Contract not found:', contractId);
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify client owns contract
    if (contract.clientId._id.toString() !== clientId) {
      console.error('❌ Unauthorized - User is not contract client');
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Save freelancer payment details if provided
    if (freelancerPaymentDetails) {
      contract.freelancerPaymentDetails = {
        ...freelancerPaymentDetails,
        addedAt: new Date(),
      };
      await contract.save();
      console.log('✅ Freelancer payment details saved');
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency || 'INR',
      receipt: `${contractId.slice(-20)}`,
      notes: {
        contractId,
        clientId,
        freelancerId: contract.freelancerId._id.toString(),
      },
    };

    const order = await razorpay.orders.create(options);
    console.log('✅ Razorpay order created:', order.id);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('❌ Error creating payment order:', error);
    res.status(500).json({ 
      message: 'Error creating payment order',
      error: error.message 
    });
  }
};

// Verify Razorpay payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { orderId, paymentId, signature } = req.body;
    const clientId = req.user._id.toString();

    console.log('🔄 [verifyRazorpayPayment] Verifying payment:', { contractId, orderId, paymentId, clientId });

    // Verify signature
    const text = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('❌ Invalid payment signature');
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    console.log('✅ Signature verified');

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    console.log('✅ Payment details fetched:', { status: payment.status, amount: payment.amount });

    if (payment.status !== 'captured') {
      console.error('❌ Payment not captured. Status:', payment.status);
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Find contract
    const contract = await Contract.findById(contractId)
      .select('+paymentWorkflow +totalAmount +freelancerAmount')
      .populate('clientId freelancerId jobId');
    if (!contract) {
      console.error('❌ Contract not found:', contractId);
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify client
    const contractClientId = contract.clientId._id.toString();
    if (contractClientId !== clientId) {
      console.error('❌ Unauthorized payment verification:', { contractClientId, clientId });
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update contract with payment info
    contract.paymentWorkflow.clientPaymentStatus = 'paid_to_admin';
    contract.paymentWorkflow.clientPaymentDate = new Date();
    contract.paymentWorkflow.clientTransactionId = paymentId;
    contract.paymentWorkflow.clientPaymentMethod = 'razorpay';

    // Legacy fields
    contract.paymentStatus = 'completed';
    contract.paidAt = new Date();
    contract.transactionId = paymentId;

    console.log('🔄 About to save contract with updated payment status:', {
      clientPaymentStatus: contract.paymentWorkflow.clientPaymentStatus,
      workCompletionStatus: contract.paymentWorkflow.workCompletionStatus,
      contractId: contract._id
    });

    await contract.save();
    
    console.log('✅ Contract saved successfully. Updated payment status:', { 
      newStatus: contract.paymentWorkflow.clientPaymentStatus,
      contractId: contract._id,
      workCompletionStatus: contract.paymentWorkflow.workCompletionStatus
    });

    // Send payment verification email
    try {
      await sendPaymentVerificationEmail(
        contract.clientId.email,
        {
          clientName: contract.clientId.firstName,
          contractId: contract._id,
          jobTitle: contract.jobId?.title,
          amount: contract.totalAmount,
          paymentId: paymentId,
          orderId: orderId,
          freelancerName: contract.freelancerId?.firstName,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
        }
      );
      console.log('✅ Payment verification email sent to:', contract.clientId.email);
    } catch (emailErr) {
      console.error('⚠️ Failed to send verification email:', emailErr.message);
      // Continue even if email fails
    }

    // Log audit
    await AuditLog.create({
      userId: clientId,
      action: 'razorpay_payment_verified',
      details: `Razorpay payment ₹${contract.totalAmount} verified for contract ${contractId}. Payment ID: ${paymentId}`,
      contractId,
      ipAddress: req.ip,
    });

    console.log('✅ Payment verification complete. Notification email sent.');

    res.json({
      message: 'Payment verified successfully',
      success: true,
      contract,
      payment: {
        id: paymentId,
        amount: contract.totalAmount,
        currency: 'INR',
        status: 'verified',
      }
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ 
      message: 'Error verifying payment',
      error: error.message 
    });
  }
};

// Client requests fund release to freelancer (after work completion)
exports.requestFundRelease = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { notes } = req.body;
    const clientId = req.user.id;

    // Find contract
    const contract = await Contract.findById(contractId).populate('clientId freelancerId');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify client owns contract
    if (contract.clientId._id.toString() !== clientId) {
      return res.status(403).json({ message: 'Not authorized to release funds for this contract' });
    }

    // Check if payment was made
    if (contract.paymentWorkflow.clientPaymentStatus !== 'paid_to_admin') {
      return res.status(400).json({ message: 'Payment must be completed first' });
    }

    // Check if already released
    if (contract.paymentWorkflow.clientFundsReleasedAt) {
      return res.status(400).json({ message: 'Funds already released for this contract' });
    }

    // Calculate amounts (90% to freelancer, 10% admin commission)
    const freelancerAmount = Math.round(contract.totalAmount * 0.9);
    const adminCommission = contract.totalAmount - freelancerAmount;

    // Update contract
    contract.paymentWorkflow.clientFundsReleasedAt = new Date();
    contract.paymentWorkflow.clientReleaseNotes = notes;
    contract.paymentWorkflow.adminApprovalStatus = 'pending_approval';
    contract.paymentWorkflow.workCompletionStatus = 'completed';
    contract.paymentWorkflow.workCompletedAt = new Date();

    await contract.save();

    // Create payment request for admin
    const paymentRequest = await PaymentRequest.create({
      contractId,
      clientId: contract.clientId._id,
      freelancerId: contract.freelancerId._id,
      type: 'fund_release',
      amount: contract.totalAmount,
      freelancerAmount,
      adminCommission,
      reason: notes,
      status: 'pending',
    });

    // Log audit
    await AuditLog.create({
      userId: clientId,
      action: 'fund_release_requested',
      details: `Released funds for contract ${contractId} to freelancer`,
      contractId,
      ipAddress: req.ip,
    });

    // Send notification email to admin
    const { sendFundReleaseRequestEmail } = require('../utils/email');
    const admin = await require('../models/User').findOne({ role: 'admin' });
    if (admin?.email) {
      await sendFundReleaseRequestEmail(
        admin.email,
        contract.clientId.firstName || 'Client',
        contract.freelancerId.firstName || 'Freelancer',
        contract.jobId?.title || 'Job',
        contract.totalAmount,
        contractId,
        notes || 'Work verified and approved'
      );
    }

    res.json({
      message: 'Fund release requested. Admin will review and process.',
      paymentRequest,
    });
  } catch (error) {
    console.error('Error requesting fund release:', error);
    res.status(500).json({ message: 'Error processing fund release request' });
  }
};

// Client requests refund for incomplete work
exports.requestRefund = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { reason } = req.body;
    const clientId = req.user.id;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ message: 'Please provide a detailed reason (minimum 10 characters)' });
    }

    // Find contract
    const contract = await Contract.findById(contractId).populate('clientId freelancerId');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Verify client owns contract
    if (contract.clientId._id.toString() !== clientId) {
      return res.status(403).json({ message: 'Not authorized to request refund for this contract' });
    }

    // Check if payment was made
    if (contract.paymentWorkflow.clientPaymentStatus !== 'paid_to_admin') {
      return res.status(400).json({ message: 'No payment to refund' });
    }

    // Check if already released
    if (contract.paymentWorkflow.clientFundsReleasedAt) {
      return res.status(400).json({ message: 'Cannot request refund after funds released' });
    }

    // Check if refund already requested
    if (contract.paymentWorkflow.refundRequested) {
      return res.status(400).json({ message: 'Refund already requested for this contract' });
    }

    // Update contract
    contract.paymentWorkflow.refundRequested = true;
    contract.paymentWorkflow.refundRequestedAt = new Date();
    contract.paymentWorkflow.refundReason = reason;
    contract.paymentWorkflow.refundStatus = 'pending_review';
    contract.paymentWorkflow.refundAmount = contract.totalAmount;

    await contract.save();

    // Create payment request for admin
    const paymentRequest = await PaymentRequest.create({
      contractId,
      clientId: contract.clientId._id,
      freelancerId: contract.freelancerId._id,
      type: 'refund',
      amount: contract.totalAmount,
      reason,
      status: 'pending',
    });

    // Log audit
    await AuditLog.create({
      userId: clientId,
      action: 'refund_requested',
      details: `Refund requested for contract ${contractId}: ${reason}`,
      contractId,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Refund request submitted for admin review',
      paymentRequest,
    });
  } catch (error) {
    console.error('Error requesting refund:', error);
    res.status(500).json({ message: 'Error processing refund request' });
  }
};

// Admin views all payment requests
exports.getPaymentRequests = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Get requests with pagination
    const skip = (page - 1) * limit;
    const requests = await PaymentRequest.find(filter)
      .populate({
        path: 'contractId',
        select: 'jobId clientId freelancerId status freelancerPaymentDetails adminPaymentSent',
        populate: [
          { path: 'jobId', select: 'title description budget' },
          { path: 'clientId', select: 'name email phone' },
          { path: 'freelancerId', select: 'name email phone' }
        ]
      })
      .populate('clientId', 'name email phone')
      .populate('freelancerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add contract details and payment details to each request
    const requestsWithDetails = requests.map(req => {
      const reqObj = req.toObject();
      if (req.contractId) {
        reqObj.jobId = req.contractId.jobId;
        reqObj.contractStatus = req.contractId.status;
        reqObj.freelancerPaymentDetails = req.contractId.freelancerPaymentDetails;
        reqObj.adminPaymentSent = req.contractId.adminPaymentSent;
      }
      return reqObj;
    });

    const total = await PaymentRequest.countDocuments(filter);

    res.json({
      requests: requestsWithDetails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching payment requests:', error);
    res.status(500).json({ message: 'Error fetching payment requests' });
  }
};

// Admin approves fund release - pays freelancer
exports.approveFundRelease = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    // Find payment request
    const paymentRequest = await PaymentRequest.findById(requestId).populate(
      'contractId clientId freelancerId'
    );
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    if (paymentRequest.type !== 'fund_release') {
      return res.status(400).json({ message: 'This is not a fund release request' });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    const contract = paymentRequest.contractId;

    // Update payment request
    paymentRequest.status = 'approved';
    paymentRequest.approvedAt = new Date();
    paymentRequest.adminNotes = notes;
    await paymentRequest.save();

    // Update contract
    contract.paymentWorkflow.adminApprovalStatus = 'approved';
    contract.paymentWorkflow.adminApprovedAt = new Date();
    contract.paymentWorkflow.adminApprovalNotes = notes;
    contract.paymentWorkflow.paymentCompleted = true;
    contract.paymentWorkflow.paymentCompletedAt = new Date();
    contract.status = 'completed';
    contract.completedAt = new Date();
    await contract.save();

    // Update admin's balance (add commission)
    const admin = await User.findById(adminId);
    admin.platformBalance = (admin.platformBalance || 0) + paymentRequest.adminCommission;
    admin.totalCommissionEarned = (admin.totalCommissionEarned || 0) + paymentRequest.adminCommission;
    await admin.save();

    // Update freelancer's balance (add amount owed)
    const freelancer = paymentRequest.freelancerId;
    freelancer.platformBalance = (freelancer.platformBalance || 0) + paymentRequest.freelancerAmount;
    await freelancer.save();

    // Log audit
    await AuditLog.create({
      userId: adminId,
      action: 'fund_release_approved',
      details: `Approved fund release: ₹${paymentRequest.amount} for contract ${contract._id}. Freelancer gets ₹${paymentRequest.freelancerAmount}, Admin gets ₹${paymentRequest.adminCommission}`,
      contractId: contract._id,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Fund release approved. Freelancer payment processed.',
      paymentRequest,
      freelancerAmount: paymentRequest.freelancerAmount,
      adminCommission: paymentRequest.adminCommission,
    });
  } catch (error) {
    console.error('Error approving fund release:', error);
    res.status(500).json({ message: 'Error processing approval' });
  }
};

// Admin rejects fund release
exports.rejectFundRelease = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: 'Please provide a rejection reason' });
    }

    // Find payment request
    const paymentRequest = await PaymentRequest.findById(requestId).populate(
      'contractId clientId freelancerId'
    );
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    if (paymentRequest.type !== 'fund_release') {
      return res.status(400).json({ message: 'This is not a fund release request' });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    const contract = paymentRequest.contractId;

    // Update payment request
    paymentRequest.status = 'rejected';
    paymentRequest.adminNotes = reason;
    await paymentRequest.save();

    // Reset contract status
    contract.paymentWorkflow.adminApprovalStatus = 'rejected';
    contract.paymentWorkflow.workCompletionStatus = 'disputed';
    await contract.save();

    // Log audit
    await AuditLog.create({
      userId: adminId,
      action: 'fund_release_rejected',
      details: `Rejected fund release for contract ${contract._id}. Reason: ${reason}`,
      contractId: contract._id,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Fund release rejected. Contract marked for review.',
      paymentRequest,
    });
  } catch (error) {
    console.error('Error rejecting fund release:', error);
    res.status(500).json({ message: 'Error processing rejection' });
  }
};

// Admin approves refund
exports.approveRefund = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    // Find payment request
    const paymentRequest = await PaymentRequest.findById(requestId).populate(
      'contractId clientId freelancerId'
    );
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    if (paymentRequest.type !== 'refund') {
      return res.status(400).json({ message: 'This is not a refund request' });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    const contract = paymentRequest.contractId;

    // Update payment request
    paymentRequest.status = 'approved';
    paymentRequest.approvedAt = new Date();
    paymentRequest.adminNotes = notes;
    await paymentRequest.save();

    // Update contract
    contract.paymentWorkflow.refundStatus = 'approved';
    contract.paymentWorkflow.refundApprovedAt = new Date();
    contract.paymentStatus = 'refunded';
    contract.status = 'cancelled';
    await contract.save();

    // Return money to client wallet
    const client = paymentRequest.clientId;
    client.platformBalance = (client.platformBalance || 0) + paymentRequest.amount;
    await client.save();

    // Log audit
    await AuditLog.create({
      userId: adminId,
      action: 'refund_approved',
      details: `Approved refund of ₹${paymentRequest.amount} for contract ${contract._id}. Reason: ${paymentRequest.reason}`,
      contractId: contract._id,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Refund approved. Amount returned to client wallet.',
      paymentRequest,
      refundAmount: paymentRequest.amount,
    });
  } catch (error) {
    console.error('Error approving refund:', error);
    res.status(500).json({ message: 'Error processing refund' });
  }
};

// Admin denies refund
exports.denyRefund = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ message: 'Please provide a denial reason' });
    }

    // Find payment request
    const paymentRequest = await PaymentRequest.findById(requestId).populate(
      'contractId clientId freelancerId'
    );
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    if (paymentRequest.type !== 'refund') {
      return res.status(400).json({ message: 'This is not a refund request' });
    }

    if (paymentRequest.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    const contract = paymentRequest.contractId;

    // Update payment request
    paymentRequest.status = 'rejected';
    paymentRequest.adminNotes = reason;
    await paymentRequest.save();

    // Update contract
    contract.paymentWorkflow.refundStatus = 'rejected';
    await contract.save();

    // Log audit
    await AuditLog.create({
      userId: adminId,
      action: 'refund_denied',
      details: `Denied refund for contract ${contract._id}. Reason: ${reason}`,
      contractId: contract._id,
      ipAddress: req.ip,
    });

    res.json({
      message: 'Refund request denied.',
      paymentRequest,
    });
  } catch (error) {
    console.error('Error denying refund:', error);
    res.status(500).json({ message: 'Error processing denial' });
  }
};

// Admin marks payment as sent to freelancer
exports.markPaymentSent = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { transactionId, notes } = req.body;
    const adminId = req.user.id;

    // Validate required fields
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }

    // Find payment request
    const paymentRequest = await PaymentRequest.findById(requestId).populate('contractId freelancerId');
    if (!paymentRequest) {
      return res.status(404).json({ message: 'Payment request not found' });
    }

    // Update contract with payment sent status
    const contract = paymentRequest.contractId;
    contract.adminPaymentSent = {
      status: 'sent',
      transactionId,
      sentAt: new Date(),
      sentBy: adminId,
      notes: notes || '',
    };
    await contract.save();

    // Log the payment send action
    const { AuditLog } = require('../models/AuditLog');
    await AuditLog.create({
      userId: adminId,
      action: 'mark_payment_sent',
      entityType: 'PaymentRequest',
      entityId: requestId,
      details: {
        contractId: contract._id,
        freelancerId: paymentRequest.freelancerId._id,
        transactionId,
        amount: paymentRequest.freelancerAmount,
      },
    });

    // Send notification email to freelancer
    try {
      const { sendPaymentSentEmail } = require('../utils/email');
      await sendPaymentSentEmail(
        paymentRequest.freelancerId.email,
        {
          freelancerName: paymentRequest.freelancerId.name,
          amount: paymentRequest.freelancerAmount,
          transactionId,
          notes,
        }
      );
    } catch (emailErr) {
      console.error('Error sending payment sent email:', emailErr);
    }

    res.json({
      message: 'Payment marked as sent successfully',
      contract,
    });
  } catch (error) {
    console.error('Error marking payment as sent:', error);
    res.status(500).json({ message: 'Error marking payment as sent' });
  }
};

// Get contract payment status for freelancer/client
exports.getContractPaymentStatus = async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.id;

    const contract = await Contract.findById(contractId).populate('clientId freelancerId');
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check authorization
    if (
      contract.clientId._id.toString() !== userId &&
      contract.freelancerId._id.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized to view this contract' });
    }

    res.json({
      contractId: contract._id,
      status: contract.paymentWorkflow,
      totalAmount: contract.totalAmount,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ message: 'Error fetching payment status' });
  }
};
// Submit work details (after payment)
exports.submitWorkDetails = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { description, deliverables, timeline, additionalNotes, attachmentUrl } = req.body;
    const freelancerId = req.user._id.toString();

    console.log('📝 Work submission attempt:', { contractId, freelancerId });
    console.log('   Authenticated user:', { id: req.user._id, name: req.user.name, email: req.user.email });

    // Find contract
    const contract = await Contract.findById(contractId).populate('clientId freelancerId jobId');
    if (!contract) {
      console.log('❌ Contract not found:', contractId);
      return res.status(404).json({ message: 'Contract not found' });
    }

    const contractClientId = contract.clientId?._id ? contract.clientId._id.toString() : contract.clientId?.toString();
    const contractFreelancerId = contract.freelancerId?._id 
      ? contract.freelancerId._id.toString() 
      : contract.freelancerId?.toString();

    console.log('✅ Contract found:', {
      contractId: contract._id,
      clientId: contractClientId,
      freelancerId: contractFreelancerId,
      currentUserId: freelancerId,
      clientName: contract.clientId?.name,
      freelancerName: contract.freelancerId?.name,
    });

    // Verify user is either the client OR the assigned freelancer
    const isClient = contractClientId === freelancerId;
    const isAssignedFreelancer = contractFreelancerId === freelancerId;

    if (!isClient && !isAssignedFreelancer) {
      console.log('❌ Authorization failed - user is neither client nor assigned freelancer:', {
        contractClientId,
        contractFreelancerId,
        freelancerId
      });
      return res.status(403).json({
        message: 'Not authorized. Only the client or assigned freelancer can submit work.',
        details: {
          yourUserId: freelancerId,
          contractAssignedFreelancer: contractFreelancerId,
          contractClient: contractClientId,
        }
      });
    }

    // IMPORTANT: Only CLIENT can submit work order (not freelancer)
    if (!isClient) {
      console.log('❌ Authorization failed - only client can submit work order. Freelancer tried to submit.');
      return res.status(403).json({
        message: 'Only the client can submit the work order. As the freelancer, please wait for the client to submit the work order, then it will be sent for admin approval.',
        userRole: isAssignedFreelancer ? 'freelancer' : 'other',
        contractClient: contractClientId,
      });
    }

    // Verify payment is made
    if (contract.paymentWorkflow?.clientPaymentStatus !== 'paid_to_admin') {
      return res.status(400).json({ message: 'Payment not completed. Please make payment first.' });
    }

    // Update contract with work details
    contract.workSubmission = {
      description,
      deliverables,
      timeline,
      additionalNotes: additionalNotes || '',
      attachmentUrl: attachmentUrl || '',
      submittedAt: new Date(),
      submittedBy: freelancerId,
    };

    // Update work completion status to 'in_progress' (waiting for admin review)
    contract.paymentWorkflow.workCompletionStatus = 'in_progress';

    await contract.save();

    console.log('✅ Work details submitted for contract:', contractId);

    // Send email to admin with work details
    try {
      const { sendWorkSubmissionEmail } = require('../utils/email');
      await sendWorkSubmissionEmail('pkccag@gmail.com', {
        contractId: contract._id,
        jobTitle: contract.jobId?.title,
        clientName: contract.clientId?.name,
        freelancerName: contract.freelancerId?.name,
        freelancerEmail: contract.freelancerApplication?.workReceivingEmail || contract.freelancerId?.email,
        workDetails: {
          description,
          deliverables,
          timeline,
          additionalNotes,
          attachmentUrl,
        },
        amount: contract.totalAmount,
      });
    } catch (emailErr) {
      console.error('Error sending work submission email:', emailErr);
    }

    res.json({
      message: 'Work details submitted successfully. Admin will review shortly.',
      contract,
    });
  } catch (error) {
    console.error('Error submitting work details:', error);
    res.status(500).json({ message: 'Error submitting work details' });
  }
};

// Submit freelancer application with payment details
exports.submitFreelancerApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      coverLetter,
      proposedBudget,
      deliveryDays,
      portfolio,
      paymentMethod,
      upiId,
      bankName,
      accountHolderName,
      accountNumber,
      ifscCode,
      workReceivingEmail,
    } = req.body;
    const freelancerId = req.user.id;

    // Find job
    const Job = require('../models/Job');
    const job = await Job.findById(jobId).populate('clientId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if freelancer already applied
    const existingApplication = await Contract.findOne({
      jobId,
      freelancerId,
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create or update contract with freelancer details
    const contract = new Contract({
      jobId,
      clientId: job.clientId._id,
      freelancerId,
      totalAmount: job.budget,
      platformCommission: Math.round(job.budget * 0.1),
      status: 'application_submitted',
      freelancerApplication: {
        coverLetter,
        proposedBudget,
        deliveryDays,
        portfolio: portfolio || '',
        paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : '',
        bankName: paymentMethod === 'bank_transfer' ? bankName : '',
        accountHolderName: paymentMethod === 'bank_transfer' ? accountHolderName : '',
        accountNumber: paymentMethod === 'bank_transfer' ? accountNumber : '',
        ifscCode: paymentMethod === 'bank_transfer' ? ifscCode : '',
        workReceivingEmail,
        appliedAt: new Date(),
      },
    });

    await contract.save();

    console.log('✅ Freelancer application submitted:', contract._id);

    // Create audit log
    await AuditLog.create({
      userId: freelancerId,
      action: 'freelancer_application_submitted',
      entityType: 'Contract',
      entityId: contract._id,
      details: {
        jobId,
        proposedBudget,
        deliveryDays,
        paymentMethod,
      },
    });

    res.json({
      message: 'Application submitted successfully! Waiting for client approval.',
      contract,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ message: 'Error submitting application' });
  }
};

// Get all contracts for admin (for Work Submissions page)
exports.getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title description budget')
      .sort({ createdAt: -1 })
      .lean();

    res.json(contracts || []);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ message: 'Error fetching contracts', error: error.message });
  }
};

// Get single contract by ID for admin
exports.getContractById = async (req, res) => {
  try {
    const { contractId } = req.params;
    console.log('📋 [getContractById] Fetching contract:', contractId);
    
    const contract = await Contract.findById(contractId)
      .populate('clientId', 'name email phone')
      .populate('freelancerId', 'name email phone')
      .populate('jobId', 'title description budget category');

    if (!contract) {
      console.log('❌ Contract not found:', contractId);
      return res.status(404).json({ message: 'Contract not found' });
    }

    console.log('✅ Contract found, returning:', { id: contract._id, status: contract.paymentWorkflow?.adminApprovalStatus });
    res.json(contract);
  } catch (error) {
    console.error('❌ Error fetching contract:', error);
    res.status(500).json({ message: 'Error fetching contract', error: error.message });
  }
};

// Admin updates contract status (approve/reject work)
exports.updateContractStatus = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { 
      workCompletionStatus, 
      revisionReason, 
      adminApprovalStatus,
      clientFundsReleasedAt,
      clientReleaseNotes,
      paymentCompleted,
      paymentCompletedAt
    } = req.body;
    const adminId = req.user._id;

    const contract = await Contract.findById(contractId);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Update work completion status
    if (workCompletionStatus) {
      contract.paymentWorkflow.workCompletionStatus = workCompletionStatus;
      
      if (workCompletionStatus === 'completed') {
        contract.paymentWorkflow.workCompletedAt = new Date();
      }
      
      if (workCompletionStatus === 'disputed' && revisionReason) {
        contract.paymentWorkflow.revisionReason = revisionReason;
      }
    }

    // Update admin approval status
    if (adminApprovalStatus) {
      contract.paymentWorkflow.adminApprovalStatus = adminApprovalStatus;
      if (adminApprovalStatus === 'approved') {
        contract.paymentWorkflow.adminApprovedAt = new Date();
        
        // Send approval email to freelancer
        const { sendWorkApprovedEmail } = require('../utils/email');
        if (contract.freelancerId?.email) {
          await sendWorkApprovedEmail(
            contract.freelancerId.email,
            contract.freelancerId.firstName || 'Freelancer',
            contract.jobId?.title || 'Your Job',
            contract._id
          );
        }
      } else if (adminApprovalStatus === 'rejected') {
        // Send rejection email to freelancer
        const { sendWorkRejectedEmail } = require('../utils/email');
        const rejectionNotes = req.body.revisionReason || 'Your work needs revisions. Please review the feedback and resubmit.';
        if (contract.freelancerId?.email) {
          await sendWorkRejectedEmail(
            contract.freelancerId.email,
            contract.freelancerId.firstName || 'Freelancer',
            contract.jobId?.title || 'Your Job',
            rejectionNotes,
            contract._id
          );
        }
      }
    }

    // Handle fund release (when work is marked complete by admin)
    if (clientFundsReleasedAt) {
      contract.paymentWorkflow.clientFundsReleasedAt = new Date(clientFundsReleasedAt);
      if (clientReleaseNotes) {
        contract.paymentWorkflow.clientReleaseNotes = clientReleaseNotes;
      }
    }

    // Handle payment completion (funds released and paid to freelancer)
    if (paymentCompleted) {
      contract.paymentWorkflow.paymentCompleted = true;
      contract.paymentWorkflow.paymentCompletedAt = new Date(paymentCompletedAt);
      contract.status = 'completed';
      contract.completedAt = new Date();
      
      // Mark admin payment as sent
      contract.adminPaymentSent = {
        status: 'sent',
        sentAt: new Date(),
        sentBy: adminId,
        notes: 'Payment released to freelancer',
      };
      
      // Update freelancer user to add earnings
      const freelancer = await require('../models/User').findById(contract.freelancerId);
      if (freelancer) {
        freelancer.totalEarnings = (freelancer.totalEarnings || 0) + contract.freelancerAmount;
        await freelancer.save();
        
        // Send payment received email to freelancer
        const { sendPaymentReceivedEmail } = require('../utils/email');
        await sendPaymentReceivedEmail(
          freelancer.email,
          freelancer.firstName || 'Freelancer',
          contract.freelancerAmount,
          contract.jobId?.title || 'Your Job',
          contract._id
        );
      }
    }

    await contract.save();

    // Log the action
    let logAction = 'contract_status_updated';
    let logDetails = '';
    
    if (workCompletionStatus) {
      logAction = `work_status_updated_to_${workCompletionStatus}`;
      logDetails += `Work status: ${workCompletionStatus}`;
    }
    
    if (adminApprovalStatus) {
      logAction = `admin_approval_${adminApprovalStatus}`;
      logDetails += (logDetails ? ' | ' : '') + `Admin approval: ${adminApprovalStatus}`;
    }
    
    if (paymentCompleted) {
      logAction = 'contract_completed_funds_released';
      logDetails += (logDetails ? ' | ' : '') + `Payment completed. Freelancer amount: ₹${contract.freelancerAmount}`;
    }

    await AuditLog.create({
      userId: adminId,
      action: logAction,
      details: logDetails || `Contract ${contractId} status updated`,
      entityType: 'Contract',
      entityId: contractId,
    });

    res.json({
      success: true,
      message: paymentCompleted ? 'Work completed! Funds released and payment processed.' : 'Contract status updated',
      contract,
    });
  } catch (error) {
    console.error('Error updating contract status:', error);
    res.status(500).json({ message: 'Error updating contract status', error: error.message });
  }
};

// TEST ENDPOINT: Reassign freelancer on a contract (for fixing test data)
exports.reassignFreelancer = async (req, res) => {
  try {
    const { contractId } = req.params;
    const { freelancerId } = req.body;

    console.log('🔄 Reassigning freelancer:', { contractId, freelancerId });

    const contract = await Contract.findByIdAndUpdate(
      contractId,
      { freelancerId },
      { new: true }
    ).populate(['clientId', 'freelancerId', 'jobId']);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    console.log('✅ Freelancer reassigned:', { 
      contractId, 
      newFreelancerId: contract.freelancerId._id 
    });

    res.json({
      success: true,
      message: 'Freelancer reassigned successfully',
      contract,
    });
  } catch (error) {
    console.error('Error reassigning freelancer:', error);
    res.status(500).json({ message: 'Error reassigning freelancer', error: error.message });
  }
};