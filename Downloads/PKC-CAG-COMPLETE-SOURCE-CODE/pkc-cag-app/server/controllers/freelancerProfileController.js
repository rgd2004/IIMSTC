// server/controllers/freelancerProfileController.js
const FreelancerProfile = require('../models/FreelancerProfile');
const User = require('../models/User');
const Contract = require('../models/Contract');
const { sendProfileUpdateEmail } = require('../utils/email');

exports.getMyProfile = async (req, res) => {
  try {
    console.log(`[getMyProfile] Fetching profile for user: ${req.user._id}`);
    
    let profile = await FreelancerProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'firstName lastName email phone avatar'
    );

    if (!profile) {
      console.log(`[getMyProfile] Profile not found for user: ${req.user._id}`);
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }

    console.log(`✅ [getMyProfile] Profile found for user: ${req.user._id}`);
    res.status(200).json({ 
      success: true,
      message: 'Profile retrieved successfully',
      data: profile 
    });
  } catch (error) {
    console.error('❌ [getMyProfile] Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const { 
      bio, 
      skills, 
      hourlyRate, 
      experience,
      expertise,
      location,
      languages,
      availability,
      workExperience
    } = req.body;

    console.log(`[createProfile] Creating profile for user: ${req.user._id}`);
    console.log(`[createProfile] Request data:`, { 
      bio, 
      skills, 
      hourlyRate, 
      experience,
      expertise,
      location,
      languages,
      availability,
      workExperience
    });

    // Check if profile already exists
    let profile = await FreelancerProfile.findOne({ userId: req.user._id });
    
    if (profile) {
      console.warn(`[createProfile] Profile already exists for user: ${req.user._id}`);
      return res.status(400).json({ message: 'Profile already exists' });
    }

    profile = new FreelancerProfile({
      userId: req.user._id,
      bio,
      skills: skills || [],
      hourlyRate: hourlyRate || 500,
      experience: experience || 'junior',
      expertise: expertise || [],
      location: location || '',
      languages: languages || [],
      availability: availability || 'Part-time',
      workExperience: workExperience || [],
    });

    const savedProfile = await profile.save();
    console.log(`✅ [createProfile] Profile created successfully:`, savedProfile);

    res.status(201).json({ 
      success: true,
      message: 'Profile created successfully',
      data: savedProfile 
    });
  } catch (error) {
    console.error('❌ [createProfile] Error creating profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating profile', 
      error: error.message 
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { 
      bio, 
      skills, 
      hourlyRate, 
      experience,
      expertise,
      location,
      languages,
      availability,
      workExperience
    } = req.body;

    console.log(`[updateProfile] Updating profile for user: ${req.user._id}`);
    console.log(`[updateProfile] Request data:`, { 
      bio, 
      skills, 
      hourlyRate, 
      experience,
      expertise,
      location,
      languages,
      availability,
      workExperience
    });

    let profile = await FreelancerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      console.warn(`[updateProfile] Profile not found for user: ${req.user._id}`);
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Update fields
    if (bio !== undefined) {
      profile.bio = bio;
      console.log(`[updateProfile] Updated bio`);
    }
    if (skills !== undefined) {
      profile.skills = skills;
      console.log(`[updateProfile] Updated skills:`, skills);
    }
    if (hourlyRate !== undefined) {
      profile.hourlyRate = hourlyRate;
      console.log(`[updateProfile] Updated hourlyRate:`, hourlyRate);
    }
    if (experience !== undefined) {
      profile.experience = experience;
      console.log(`[updateProfile] Updated experience:`, experience);
    }
    if (expertise !== undefined) {
      profile.expertise = expertise;
      console.log(`[updateProfile] Updated expertise:`, expertise);
    }
    if (location !== undefined) {
      profile.location = location;
      console.log(`[updateProfile] Updated location:`, location);
    }
    if (languages !== undefined) {
      profile.languages = languages;
      console.log(`[updateProfile] Updated languages:`, languages);
    }
    if (availability !== undefined) {
      profile.availability = availability;
      console.log(`[updateProfile] Updated availability:`, availability);
    }
    if (workExperience !== undefined) {
      profile.workExperience = workExperience;
      console.log(`[updateProfile] Updated workExperience:`, workExperience);
    }

    const savedProfile = await profile.save();
    console.log(`✅ [updateProfile] Profile saved successfully:`, savedProfile);

    // 📧 Send profile update email notification
    const user = await User.findById(req.user._id);
    if (user) {
      await sendProfileUpdateEmail(user.email, user.name);
    }

    res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully',
      data: savedProfile 
    });
  } catch (error) {
    console.error('❌ [updateProfile] Error updating profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`[getProfileById] Fetching profile for userId:`, userId);
    
    // Validate ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn(`[getProfileById] Invalid user ID format:`, userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const profile = await FreelancerProfile.findOne({ userId }).populate(
      'userId',
      'firstName lastName email avatar phone'
    );

    if (!profile) {
      console.warn(`[getProfileById] Profile not found for userId:`, userId);
      return res.status(404).json({ 
        success: false,
        message: 'Profile not found' 
      });
    }

    console.log(`✅ [getProfileById] Profile found:`, profile._id);
    res.status(200).json({ 
      success: true,
      message: 'Profile retrieved successfully',
      data: profile 
    });
  } catch (error) {
    console.error('❌ [getProfileById] Error fetching profile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

exports.addPortfolio = async (req, res) => {
  try {
    const { title, description, image, url, category } = req.body;

    let profile = await FreelancerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.portfolio.push({
      title,
      description,
      image,
      url,
      category,
    });

    await profile.save();

    res.json({ message: 'Portfolio item added successfully', profile });
  } catch (error) {
    console.error('Error adding portfolio:', error);
    res.status(500).json({ message: 'Error adding portfolio', error: error.message });
  }
};

exports.removePortfolio = async (req, res) => {
  try {
    const { portfolioId } = req.params;

    let profile = await FreelancerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.portfolio = profile.portfolio.filter((item) => item._id.toString() !== portfolioId);

    await profile.save();

    res.json({ message: 'Portfolio item removed successfully' });
  } catch (error) {
    console.error('Error removing portfolio:', error);
    res.status(500).json({ message: 'Error removing portfolio', error: error.message });
  }
};

exports.addCertification = async (req, res) => {
  try {
    const { name, issuer, issueDate, expiryDate, url } = req.body;

    let profile = await FreelancerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    profile.certifications.push({
      name,
      issuer,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      url,
    });

    await profile.save();

    res.json({ message: 'Certification added successfully', profile });
  } catch (error) {
    console.error('Error adding certification:', error);
    res.status(500).json({ message: 'Error adding certification', error: error.message });
  }
};

exports.browseTalent = async (req, res) => {
  try {
    const { skills, verified, minRating, page = 1, limit = 20 } = req.query;

    let query = {};

    if (verified === 'true') {
      query.verified = true;
    }

    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    if (skills) {
      const skillArray = skills.split(',');
      query.skills = { $in: skillArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const profiles = await FreelancerProfile.find(query)
      .populate('userId', 'firstName lastName email avatar')
      .sort({ averageRating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FreelancerProfile.countDocuments(query);

    res.json({
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error browsing talent:', error);
    res.status(500).json({ message: 'Error browsing talent', error: error.message });
  }
};

exports.getFreelancerStats = async (req, res) => {
  try {
    const profile = await FreelancerProfile.findOne({ userId: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Calculate success rate
    const completedContracts = await Contract.countDocuments({
      freelancerId: req.user._id,
      status: 'completed',
    });

    const totalContracts = await Contract.countDocuments({
      freelancerId: req.user._id,
    });

    const successRate = totalContracts > 0 ? (completedContracts / totalContracts) * 100 : 0;

    res.json({
      completedJobs: profile.completedJobs,
      totalEarnings: profile.totalEarnings,
      averageRating: profile.averageRating,
      totalRatings: profile.totalRatings,
      successRate: Math.round(successRate),
      responseRate: profile.responseRate,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

