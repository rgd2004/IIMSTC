// server/controllers/jobController.js
const Job = require('../models/Job');
const Application = require('../models/Application');
const Contract = require('../models/Contract');
const User = require('../models/User');
const { sendJobPostedEmail, sendApplicationReceivedEmail, sendApplicationAcceptedEmail, sendApplicationRejectedEmail } = require('../utils/email');

// ============ CLIENT: POST JOBS ============

exports.createJob = async (req, res) => {
  try {
    const { title, description, category, skills, budget, duration, deliveryTime, urgency, deadline } = req.body;

    console.log(`[createJob] Creating job for user: ${req.user._id}`);
    console.log(`[createJob] Payload:`, { title, description, category, skills, budget, duration, deliveryTime });

    // Validation
    if (!title || !description || !category || !budget || !deliveryTime) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const newJob = new Job({
      clientId: req.user._id,
      title,
      description,
      category,
      skills: skills || [],
      budget,
      duration: duration || 'one-time',
      deliveryTime,
      urgency: urgency || 'medium',
      deadline: deadline ? new Date(deadline) : null,
    });

    await newJob.save();
    console.log(`[createJob] Job created with ID: ${newJob._id}`);
    res.status(201).json({ success: true, message: 'Job posted successfully', data: newJob });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Error posting job', error: error.message });
  }
};

exports.getMyJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = { clientId: req.user._id };

    console.log(`[getMyJobs] User ID: ${req.user._id}, Status filter: ${status}, Page: ${page}`);

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('selectedFreelancer', 'firstName lastName email avatar')
      .populate('applications')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    console.log(`[getMyJobs] Found ${jobs.length} jobs for user ${req.user._id}`);

    res.json({
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId)
      .populate('clientId', 'firstName lastName email avatar businessName')
      .populate({
        path: 'applications',
        select: '-applicationsCount',
        populate: {
          path: 'freelancerId',
          select: 'firstName lastName email avatar',
        },
      });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Error fetching job', error: error.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { title, description, category, skills, budget, duration, deliveryTime, urgency, deadline } = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this job' });
    }

    // Can only edit open jobs
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Cannot edit jobs that are not open' });
    }

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (category) job.category = category;
    if (skills) job.skills = skills;
    if (budget) job.budget = budget;
    if (duration) job.duration = duration;
    if (deliveryTime) job.deliveryTime = deliveryTime;
    if (urgency) job.urgency = urgency;
    if (deadline) job.deadline = new Date(deadline);

    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' });
    }

    // Allow deletion of any job posted by the owner
    // Jobs with active contracts cannot be deleted
    const hasActiveContract = await require('../models/Contract').findOne({
      jobId: jobId,
      status: { $in: ['active', 'in-progress'] }
    });

    if (hasActiveContract) {
      return res.status(400).json({ message: 'Cannot delete jobs with active contracts. Please close the contract first.' });
    }

    await Job.findByIdAndDelete(jobId);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ message: 'Error deleting job', error: error.message });
  }
};

// ============ FREELANCER: BROWSE JOBS ============

exports.browseJobs = async (req, res) => {
  try {
    const { category, skills, minBudget, maxBudget, search, sortBy, page = 1, limit = 20 } = req.query;

    let query = { status: 'open' };

    // Category filter
    if (category && category !== '') query.category = category;

    // Budget range filter
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseInt(minBudget);
      if (maxBudget) query.budget.$lte = parseInt(maxBudget);
    }

    // Skills filter
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillArray };
    }

    // Search filter (search in title and description)
    if (search && search !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (sortBy === 'budget-high') sort = { budget: -1 };
    if (sortBy === 'budget-low') sort = { budget: 1 };
    if (sortBy === 'deadline-soon') sort = { deadline: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const jobs = await Job.find(query)
      .populate('clientId', 'firstName lastName email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    console.log(`[browseJobs] Query: ${JSON.stringify(query)}, Found: ${jobs.length}/${total}`);

    res.json({
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error browsing jobs:', error);
    res.status(500).json({ message: 'Error browsing jobs', error: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.query;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization - only client can view
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view applications' });
    }

    let query = { jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('freelancerId', 'firstName lastName email avatar')
      .sort({ createdAt: -1 });

    console.log(`[getJobApplications] Found ${applications.length} applications for job ${jobId}`);

    res.json({ 
      data: applications,
      pagination: {
        total: applications.length
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

exports.selectFreelancer = async (req, res) => {
  try {
    const { jobId, applicationId } = req.body;
    console.log('🔄 [selectFreelancer] Starting with:', { jobId, applicationId, userId: req.user._id });

    const job = await Job.findById(jobId);
    if (!job) {
      console.error('❌ Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check authorization
    if (job.clientId.toString() !== req.user._id.toString()) {
      console.error('❌ Unauthorized - User is not the job client');
      return res.status(403).json({ message: 'Unauthorized - You are not the job client' });
    }

    // Get application
    const application = await Application.findById(applicationId);
    if (!application) {
      console.error('❌ Application not found:', applicationId);
      return res.status(404).json({ message: 'Application not found' });
    }

    console.log('✅ Found job and application, updating statuses...');

    // Update application status using findByIdAndUpdate to avoid validation issues
    await Application.findByIdAndUpdate(
      applicationId,
      { status: 'accepted' },
      { new: true, runValidators: false }
    );

    // Update job
    job.selectedFreelancer = application.freelancerId;
    job.status = 'in-progress';
    await job.save();

    console.log('✅ Job and application updated, creating contract...');

    // ✅ CREATE CONTRACT WHEN FREELANCER IS SELECTED
    const commissionRate = 10; // 10% admin commission
    const platformCommission = Math.round((job.budget * commissionRate) / 100);
    const freelancerAmount = job.budget - platformCommission;

    console.log('💰 Budget breakdown:', { 
      totalAmount: job.budget, 
      platformCommission, 
      freelancerAmount 
    });

    // Determine payment method from application
    let paymentMethod = 'not_provided';
    if (application.upiId) {
      paymentMethod = 'upi';
    } else if (application.paymentDetails) {
      paymentMethod = 'bank_transfer';
    }

    const contract = new Contract({
      jobId: job._id,
      clientId: job.clientId,
      freelancerId: application.freelancerId,
      totalAmount: job.budget,
      commissionRate: commissionRate,
      platformCommission: platformCommission,
      freelancerAmount: freelancerAmount,
      deadline: job.deadline,
      // 🔥 COPY ALL PAYMENT DETAILS FROM APPLICATION TO CONTRACT
      freelancerPaymentDetails: {
        upiId: application.upiId || undefined,
        paymentMethod: paymentMethod,
        addedAt: new Date(),
      },
      // 🔥 ALSO STORE COMPLETE APPLICATION DETAILS
      freelancerApplication: {
        coverLetter: application.coverLetter,
        proposedBudget: application.proposedBudget,
        deliveryDays: application.deliveryDays,
        portfolio: application.portfolio,
        paymentMethod: paymentMethod,
        upiId: application.upiId,
        workReceivingEmail: application.workReceivingEmail,
        appliedAt: application.createdAt,
      },
      paymentWorkflow: {
        clientPaymentStatus: 'awaiting_payment',
        workCompletionStatus: 'not_started',
        adminApprovalStatus: 'pending_approval',
        refundStatus: 'no_refund',
      },
    });

    await contract.save();
    console.log('✅ Contract saved:', { contractId: contract._id, createdAt: contract.createdAt });
    console.log('✅ Payment details copied from application:', {
      upiId: application.upiId,
      paymentMethod: paymentMethod
    });

    // Reject other applications
    const rejectedCount = await Application.updateMany(
      { jobId, _id: { $ne: applicationId } },
      { status: 'rejected', rejectionReason: 'Another freelancer was selected' }
    );
    console.log('✅ Rejected other applications:', rejectedCount.modifiedCount);

    // Return full contract object
    const fullContract = await Contract.findById(contract._id)
      .populate('jobId', 'title description budget')
      .populate('freelancerId', 'firstName lastName email');

    console.log('✅ Contract created successfully:', fullContract._id);

    res.json({ 
      message: 'Freelancer selected successfully and contract created!', 
      data: {
        success: true,
        job,
        contract: fullContract
      }
    });
  } catch (error) {
    console.error('❌ Error selecting freelancer:', error.message);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error selecting freelancer', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check authorization - client completes job
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    job.status = 'completed';
    job.completedAt = new Date();
    await job.save();

    res.json({ message: 'Job marked as completed', job });
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ message: 'Error completing job', error: error.message });
  }
};

exports.cancelJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check authorization
    if (job.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    job.status = 'cancelled';
    await job.save();

    // Create dispute if job was in progress
    if (job.selectedFreelancer && job.status === 'in-progress') {
      console.log('Job cancelled - may need dispute resolution');
    }

    res.json({ message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({ message: 'Error cancelling job', error: error.message });
  }
};
