// server/controllers/applicationController.js
const Application = require('../models/Application');
const Job = require('../models/Job');
const Contract = require('../models/Contract');
const User = require('../models/User');
const { sendApplicationReceivedEmail, sendApplicationAcceptedEmail, sendApplicationRejectedEmail } = require('../utils/email');

exports.submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter, proposedBudget, deliveryDays, portfolio, upiId, paymentDetails, workReceivingEmail } = req.body;

    console.log(`[submitApplication] Freelancer ${req.user._id} applying for job ${jobId}`);

    // Validation
    if (!jobId || !coverLetter || !proposedBudget || !deliveryDays || !upiId || !paymentDetails || !workReceivingEmail) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.warn(`[submitApplication] Job not found: ${jobId}`);
      return res.status(404).json({ message: 'Job not found' });
    }

    console.log(`[submitApplication] Job found: ${job.title}, Client ID: ${job.clientId}`);

    // Check if already applied
    const existingApp = await Application.findOne({
      jobId,
      freelancerId: req.user._id,
    });

    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Create application
    const application = new Application({
      jobId,
      freelancerId: req.user._id,
      coverLetter,
      proposedBudget,
      deliveryDays,
      portfolio: portfolio || [],
      upiId,
      paymentDetails,
      workReceivingEmail,
      applicationsCount: job.applications.length,
    });

    await application.save();
    console.log(`[submitApplication] Application created with ID: ${application._id}`);

    // Update job applications count
    job.applications.push(application._id);
    job.applicationsCount = job.applications.length;
    await job.save();
    console.log(`[submitApplication] Job updated with new application. Total: ${job.applicationsCount}`);

    // Send response immediately (don't wait for email)
    res.status(201).json({ 
      success: true,
      message: 'Application submitted successfully', 
      data: application 
    });

    // 📧 Send email notification to client (asynchronously, non-blocking)
    setImmediate(async () => {
      try {
        const freelancer = await User.findById(req.user._id);
        const client = await User.findById(job.clientId);
        if (freelancer && client) {
          await sendApplicationReceivedEmail(client.email, client.name, freelancer.name, job.title, application._id);
          console.log(`[submitApplication] Email sent to client ${client.email}`);
        }
      } catch (emailError) {
        console.error('[submitApplication] Email send failed (non-blocking):', emailError.message);
      }
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Error submitting application', error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = { freelancerId: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await Application.find(query)
      .populate({
        path: 'jobId',
        select: 'title description category budget deadline status',
        populate: {
          path: 'clientId',
          select: 'firstName lastName email avatar',
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate('jobId')
      .populate('freelancerId', 'firstName lastName email avatar');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ message: 'Error fetching application', error: error.message });
  }
};

exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check authorization
    if (application.freelancerId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot withdraw non-pending applications' });
    }

    application.status = 'withdrawn';
    await application.save();

    // Update job applications count
    const job = await Job.findById(application.jobId);
    job.applicationsCount = Math.max(0, job.applicationsCount - 1);
    await job.save();

    res.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ message: 'Error withdrawing application', error: error.message });
  }
};

exports.rateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only accepted applications can be rated
    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted applications can be rated' });
    }

    application.rating = {
      score,
      review: review || '',
      ratedBy: req.user._id,
      ratedAt: new Date(),
    };

    await application.save();
    res.json({ message: 'Rating submitted successfully', application });
  } catch (error) {
    console.error('Error rating application:', error);
    res.status(500).json({ message: 'Error rating application', error: error.message });
  }
};

exports.rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if freelancer is withdrawing or client is rejecting
    const job = await Job.findById(application.jobId);
    if (job.clientId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    application.status = 'rejected';
    application.rejectionReason = reason || 'Application was not selected';
    await application.save();

    res.json({ success: true, message: 'Application rejected successfully' });

    // 📧 Send email notification to freelancer (asynchronously, non-blocking)
    setImmediate(async () => {
      try {
        const freelancer = await User.findById(application.freelancerId);
        if (freelancer) {
          await sendApplicationRejectedEmail(freelancer.email, freelancer.name, job.title, reason || 'Your application was not selected');
          console.log(`[rejectApplication] Email sent to freelancer ${freelancer.email}`);
        }
      } catch (emailError) {
        console.error('[rejectApplication] Email send failed (non-blocking):', emailError.message);
      }
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Error rejecting application', error: error.message });
  }
};

