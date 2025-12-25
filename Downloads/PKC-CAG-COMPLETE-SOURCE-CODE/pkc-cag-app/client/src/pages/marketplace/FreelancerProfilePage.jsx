// client/src/pages/marketplace/FreelancerProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import "./FreelancerProfilePage.css";
import toast from "react-hot-toast";

const FreelancerProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    hourlyRate: 500,
    experience: "junior",
    skills: [],
    expertise: [],
    location: "",
    languages: [],
    availability: "Part-time",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newExpertise, setNewExpertise] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log("🔄 [loadProfile] Fetching profile...");
      const res = await marketplaceAPI.getMyProfile();
      console.log("✅ [loadProfile] API Response status:", res.status);
      
      const profileData = res.data?.data;
      console.log("📍 [loadProfile] Profile data exists:", !!profileData);
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          bio: profileData?.bio || "",
          hourlyRate: profileData?.hourlyRate || 500,
          experience: profileData?.experience || "junior",
          skills: profileData?.skills || [],
          expertise: profileData?.expertise || [],
          location: profileData?.location || "",
          languages: profileData?.languages || [],
          availability: profileData?.availability || "Part-time",
        });
        setPortfolio(profileData?.portfolio || []);
        setCertifications(profileData?.certifications || []);
        setWorkExperience(profileData?.workExperience || []);
        console.log("✅ [loadProfile] Profile loaded and formData initialized");
      } else {
        setProfile(null);
        console.log("⚠️ [loadProfile] No profile data received from API");
      }
    } catch (err) {
      console.error("❌ [loadProfile] Error loading profile:", err.message);
      
      if (err.response?.status === 404) {
        setProfile(null);
        console.log("ℹ️ [loadProfile] Profile doesn't exist yet - user needs to create one");
      } else if (err.response?.status === 429) {
        console.error("⚠️ [loadProfile] Rate limited - too many requests");
        toast.error("Server busy - please try again in a moment");
      } else {
        console.error("❌ [loadProfile] Error:", err.response?.data?.message || err.message);
        toast.error("Failed to load profile: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.bio || !formData.hourlyRate || formData.skills.length === 0) {
        toast.error("Please fill in all required fields (bio, hourly rate, at least 1 skill)");
        return;
      }

      console.log("🔄 Saving profile with data:", formData);
      console.log("🔄 formData keys:", Object.keys(formData));
      console.log("🔄 formData.expertise:", formData.expertise);
      console.log("🔄 formData.location:", formData.location);
      console.log("🔄 formData.languages:", formData.languages);
      console.log("🔄 formData.availability:", formData.availability);
      console.log("🔄 formData.workExperience:", formData.workExperience);
      
      let res;
      
      if (!profile) {
        console.log("📝 Creating new profile...");
        res = await marketplaceAPI.createProfile(formData);
      } else {
        console.log("✏️ Updating existing profile...");
        res = await marketplaceAPI.updateProfile(formData);
      }

      // Check response
      console.log("✅ API Response:", res);
      console.log("✅ API Response status:", res?.status);
      console.log("✅ API Response data:", res?.data);
      
      if (res?.status === 201 || res?.status === 200) {
        // Response structure from create/update: { success: true, message: '...', data: profile }
        const savedProfile = res.data?.data;
        console.log("📍 Saved profile from API:", savedProfile);
        
        if (savedProfile) {
          // Update local state with saved data
          setProfile(savedProfile);
          console.log("✅ Profile state updated with:", savedProfile);
        }
        
        toast.success(profile ? "✅ Profile updated successfully!" : "✅ Profile created successfully!");
        setEditing(false);
        
        // Reload to ensure fresh data from server
        setTimeout(() => {
          loadProfile();
        }, 500);
      } else {
        console.warn("⚠️ Unexpected response status:", res?.status);
        toast.error("Response received but status unclear");
      }
    } catch (err) {
      console.error("❌ Error saving profile:", err);
      console.error("📋 Error response:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Failed to save profile";
      toast.error(errorMsg);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()],
      }));
      setNewExpertise("");
    }
  };

  const removeExpertise = (exp) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((e) => e !== exp),
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  if (loading) {
    return (
      <div className="freelancer-profile-container loading">
        <div className="loader-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="freelancer-profile-container">
      {/* Header */}
      <div className="profile-header">
        <h1>👨‍💻 Freelancer Profile</h1>
        <p>Build your professional portfolio and get hired</p>
      </div>

      <div className="profile-content">
        {!profile && !editing ? (
          <div className="no-profile">
            <div className="icon">📋</div>
            <h3>Create Your Freelancer Profile</h3>
            <p>Set up your profile to start receiving job offers</p>
            <button className="primary-btn" onClick={() => setEditing(true)}>
              Create Profile →
            </button>
          </div>
        ) : (
          <>
            {/* Profile Info */}
            <div className="profile-card">
              <div className="card-header">
                <h2>Profile Information</h2>
                <button
                  className="edit-btn"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? "✕ Cancel" : "✏️ Edit"}
                </button>
              </div>

              {editing ? (
                <div className="edit-form">
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell clients about yourself..."
                      rows="4"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hourly Rate (₹)</label>
                      <input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hourlyRate: Number(e.target.value),
                          })
                        }
                        min="100"
                      />
                    </div>

                    <div className="form-group">
                      <label>Experience Level</label>
                      <select
                        value={formData.experience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience: e.target.value,
                          })
                        }
                      >
                        <option value="junior">Junior</option>
                        <option value="mid">Mid-level</option>
                        <option value="senior">Senior</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                  </div>

                  <div className="skills-section">
                    <h4>🎯 Skills</h4>
                    <div className="skill-input">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                      />
                      <button onClick={addSkill}>Add</button>
                    </div>
                    <div className="skills-list">
                      {formData.skills.map((skill) => (
                        <div key={skill} className="skill-tag">
                          {skill}
                          <button onClick={() => removeSkill(skill)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="skills-section">
                    <h4>🏆 Expertise Areas</h4>
                    <div className="skill-input">
                      <input
                        type="text"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        placeholder="Add expertise area..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addExpertise())
                        }
                      />
                      <button onClick={addExpertise}>Add</button>
                    </div>
                    <div className="skills-list">
                      {formData.expertise.map((exp) => (
                        <div key={exp} className="skill-tag">
                          {exp}
                          <button onClick={() => removeExpertise(exp)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>📍 Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({...formData, location: e.target.value})
                        }
                        placeholder="e.g., New Delhi, India"
                      />
                    </div>

                    <div className="form-group">
                      <label>🌐 Availability</label>
                      <select
                        value={formData.availability}
                        onChange={(e) =>
                          setFormData({...formData, availability: e.target.value})
                        }
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <div className="skills-section">
                    <h4>🗣️ Languages</h4>
                    <div className="skill-input">
                      <input
                        type="text"
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Add language..."
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addLanguage())
                        }
                      />
                      <button onClick={addLanguage}>Add</button>
                    </div>
                    <div className="skills-list">
                      {formData.languages.map((lang) => (
                        <div key={lang} className="skill-tag">
                          {lang}
                          <button onClick={() => removeLanguage(lang)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="save-btn" onClick={handleSave}>
                      Save Changes
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-view">
                  <div className="info-item">
                    <span className="label">💼 Bio:</span>
                    <p>{profile.bio || "No bio yet"}</p>
                  </div>
                  
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">💰 Hourly Rate:</span>
                      <p>₹{profile.hourlyRate}/hr</p>
                    </div>
                    <div className="info-item">
                      <span className="label">Experience:</span>
                      <p className="capitalize">{profile.experience}</p>
                    </div>
                    <div className="info-item">
                      <span className="label">🌐 Availability:</span>
                      <p>{profile.availability || "Not specified"}</p>
                    </div>
                    <div className="info-item">
                      <span className="label">📍 Location:</span>
                      <p>{profile.location || "Not specified"}</p>
                    </div>
                  </div>

                  {profile.languages && profile.languages.length > 0 && (
                    <div className="skills-display">
                      <h4>🗣️ Languages</h4>
                      <div className="skills-list">
                        {profile.languages.map((lang) => (
                          <span key={lang} className="skill-badge">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="skills-display">
                    <h4>🎯 Skills</h4>
                    <div className="skills-list">
                      {profile.skills?.map((skill) => (
                        <span key={skill} className="skill-badge">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {profile.expertise && profile.expertise.length > 0 && (
                    <div className="skills-display">
                      <h4>🏆 Expertise</h4>
                      <div className="skills-list">
                        {profile.expertise.map((exp) => (
                          <span key={exp} className="skill-badge expertise-badge">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="stats-section">
                    <div className="stat">
                      <span className="stat-value">₹{profile.totalEarnings?.toLocaleString() || 0}</span>
                      <span className="stat-label">Total Earnings</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{profile.completedJobs || 0}</span>
                      <span className="stat-label">Jobs Completed</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {profile.averageRating?.toFixed(1) || "N/A"}
                      </span>
                      <span className="stat-label">Rating</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {profile.successRate || 0}%
                      </span>
                      <span className="stat-label">Success Rate</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Portfolio Section */}
            <div className="portfolio-card">
              <h2>Portfolio</h2>
              {portfolio.length === 0 ? (
                <p className="empty">No portfolio items yet</p>
              ) : (
                <div className="portfolio-grid">
                  {portfolio.map((item) => (
                    <div key={item._id} className="portfolio-item">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          View Project →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications Section */}
            <div className="certifications-card">
              <h2>Certifications</h2>
              {certifications.length === 0 ? (
                <p className="empty">No certifications yet</p>
              ) : (
                <div className="certifications-list">
                  {certifications.map((cert) => (
                    <div key={cert._id} className="cert-item">
                      <h4>{cert.name}</h4>
                      <p>{cert.issuer}</p>
                      <small>{cert.dateObtained}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreelancerProfilePage;
