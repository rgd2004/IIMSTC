const JobAssistant = require('../models/JobAssistant');
const { sendEmail } = require('../utils/email');
const path = require('path');
const fs = require('fs');


// Submit Job Application
exports.submitJobApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      interestedRoles,
      experience,
      currentRole,
      skills,
      linkedinProfile,
      portfolio,
      bio,
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !interestedRoles || !skills) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      });
    }

    // Check if resume is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume/CV',
      });
    }

    // Store local file path
    let resumeUrl = `/uploads/job-assistant/${req.file.filename}`;
    let resumeFileName = req.file.originalname;

    // Create job application
    const jobApplication = await JobAssistant.create({
      fullName,
      email,
      phone,
      interestedRoles,
      experience,
      currentRole: currentRole || 'Student/Fresher',
      skills,
      linkedinProfile: linkedinProfile || '',
      portfolio: portfolio || '',
      bio: bio || '',
      resumeUrl,
      resumeFileName,
      status: 'pending',
    });

    // Send confirmation email to user
    const userEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank You for Your Job Assistance Application! 🎉</h2>
        
        <p>Hi <strong>${fullName}</strong>,</p>
        
        <p>We have successfully received your job assistance application. Our team will review your profile and get back to you soon.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Application Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Interested Roles:</strong> ${interestedRoles}</li>
            <li><strong>Experience:</strong> ${experience}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Phone:</strong> ${phone}</li>
          </ul>
        </div>

        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #d97706; margin-top: 0;">⚠️ Important Information:</h3>
          <p><strong>Verify identity of WorkViaTech before making any payments</strong></p>
          <p>For concerns, contact <strong>pkccag@gmail.com</strong></p>
        </div>

        <p>We wish you all the best! 🌟</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated email. Please do not reply to this email. For queries, contact pkccag@gmail.com
        </p>
      </div>
    `;

    // Prepare resume attachment
    const attachments = [];
    if (req.file && req.file.path) {
      try {
        const resumeBuffer = fs.readFileSync(req.file.path);
        attachments.push({
          filename: req.file.originalname,
          content: resumeBuffer,
          contentType: req.file.mimetype
        });
        console.log('✅ Resume file attached to email');
      } catch (err) {
        console.warn('⚠️ Could not attach resume file:', err.message);
      }
    }

    await sendEmail({
      email,
      subject: 'Job Assistance Application Received - PKC CAG',
      html: userEmailHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Job Assistance Application 📋</h2>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Applicant Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Interested Roles:</strong> ${interestedRoles}</p>
          <p><strong>Experience:</strong> ${experience}</p>
          <p><strong>Skills:</strong> ${skills}</p>
          <p><strong>Current Role:</strong> ${currentRole}</p>
          ${linkedinProfile ? `<p><strong>LinkedIn:</strong> ${linkedinProfile}</p>` : ''}
          ${portfolio ? `<p><strong>Portfolio:</strong> ${portfolio}</p>` : ''}
          <p style="color: #666;"><em>Resume file is attached to this email</em></p>
        </div>

        <p style="margin-top: 20px;">
          <a href="${process.env.FRONTEND_URL}/admin/job-applications" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View in Admin Panel
          </a>
        </p>
      </div>
    `;

    // Prepare resume attachment for admin email
    const adminAttachments = [];
    if (req.file && req.file.path) {
      try {
        const resumeBuffer = fs.readFileSync(req.file.path);
        adminAttachments.push({
          filename: req.file.originalname,
          content: resumeBuffer,
          contentType: req.file.mimetype
        });
      } catch (err) {
        console.warn('⚠️ Could not attach resume to admin email:', err.message);
      }
    }

    await sendEmail({
      email: process.env.ADMIN_EMAIL || 'pkccag@gmail.com',
      subject: `New Job Application - ${fullName}`,
      html: adminEmailHtml,
      attachments: adminAttachments.length > 0 ? adminAttachments : undefined,
    });

    res.status(201).json({
      success: true,
      message:
        'Application submitted successfully! Check your email for confirmation.',
      application: jobApplication,
    });
  } catch (error) {
    console.error('Job application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message,
    });
  }
};

// Get all job applications (admin only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await JobAssistant.find()
      .sort({ submittedAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
    });
  }
};

// Get single application
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await JobAssistant.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application',
    });
  }
};

// Update application status (admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'shortlisted', 'rejected', 'contacted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    // First, fetch the existing application
    const existingApplication = await JobAssistant.findById(id);
    
    if (!existingApplication) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Update with new notes or keep existing notes
    const application = await JobAssistant.findByIdAndUpdate(
      id,
      { status, notes: notes || existingApplication.notes },
      { new: true, runValidators: true }
    );

    // If status changed to shortlisted, send email
    if (status === 'shortlisted') {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations! 🎉</h2>
          
          <p>Hi <strong>${application.fullName}</strong>,</p>
          
          <p>Great news! Your profile has been <strong>shortlisted</strong> for the ${application.position} position.</p>
          
          <p>A WorkViaTech member will contact you soon on <strong>${application.phone}</strong> or <strong>${application.email}</strong>.</p>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #d97706; margin-top: 0;">⚠️ Important Disclaimer:</h3>
            <p>
              <strong>If they ask for any consultancy fee, payment, or financial transaction:</strong>
            </p>
            <ul>
              <li><strong>PKC CAG is NOT responsible</strong> for any financial activities</li>
              <li>Please verify identity before any payment</li>
              <li>Legitimate job opportunities do not require upfront fees</li>
              <li>For concerns, contact pkccag@gmail.com immediately</li>
            </ul>
          </div>

          <p>Best of luck! 🌟</p>
        </div>
      `;

      await sendEmail({
        email: application.email,
        subject: 'Profile Shortlisted - PKC CAG Job Assistance',
        html: emailHtml,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated',
      application,
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
    });
  }
};

// Mark as contacted
exports.markAsContacted = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobAssistant.findByIdAndUpdate(
      id,
      {
        isContacted: true,
        contactedAt: new Date(),
        status: 'contacted',
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Marked as contacted',
      application,
    });
  } catch (error) {
    console.error('Mark as contacted error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating application',
    });
  }
};

// Get statistics
exports.getApplicationStats = async (req, res) => {
  try {
    const total = await JobAssistant.countDocuments();
    const pending = await JobAssistant.countDocuments({ status: 'pending' });
    const shortlisted = await JobAssistant.countDocuments({
      status: 'shortlisted',
    });
    const rejected = await JobAssistant.countDocuments({ status: 'rejected' });
    const contacted = await JobAssistant.countDocuments({ status: 'contacted' });

    res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        shortlisted,
        rejected,
        contacted,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
    });
  }
};

// Get application status (public - users can check their own)
exports.getApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobAssistant.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching application status',
    });
  }
};

// Get user's own applications (authenticated users)
exports.getMyApplications = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User email not found',
      });
    }

    const applications = await JobAssistant.find({ email: userEmail }).sort({
      submittedAt: -1,
    });

    res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your applications',
    });
  }
};

// Delete application (admin only)
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobAssistant.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting application',
    });
  }
};

// Download resume
exports.downloadResume = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await JobAssistant.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    if (!application.resumeUrl) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Construct the full file path
    const filePath = path.join(__dirname, '..', application.resumeUrl);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath);
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    // Set proper headers to force download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${application.resumeFileName || 'resume.pdf'}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      res.status(500).json({
        success: false,
        message: 'Error downloading file',
      });
    });
  } catch (error) {
    console.error('Download resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading resume',
    });
  }
};
