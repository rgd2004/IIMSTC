import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marketplaceAPI } from '../../utils/api';
import './FreelancerProfileViewPage.css';
import toast from 'react-hot-toast';

const FreelancerProfileViewPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching profile for user:', userId);
      const res = await marketplaceAPI.getProfileById(userId);
      console.log('✅ API Response:', res);
      console.log('✅ Profile data:', res.data?.data);
      const profileData = res.data?.data;
      
      if (profileData) {
        setProfile(profileData);
        console.log('✅ Profile loaded successfully');
      } else {
        console.error('❌ No profile data in response');
        toast.error('Failed to load profile data');
      }
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      console.error('❌ Error response:', err.response?.data);
      toast.error(err.response?.data?.message || 'Failed to load profile');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="freelancer-profile-view-page">
        <div className="loading-state">
          <div className="loader-spinner"></div>
          <p>Loading freelancer profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="freelancer-profile-view-page">
        <div className="error-state">
          <p>❌ Profile not found</p>
          <button className="btn-back" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="freelancer-profile-view-page">
      {/* Header */}
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>👤 Freelancer Profile</h1>
      </div>

      <div className="profile-container">
        {/* Main Profile Card */}
        <div className="profile-main">
          {/* Cover Section */}
          <div className="profile-cover">
            <div className="cover-image" />
          </div>

          {/* Profile Info */}
          <div className="profile-info">
            <div className="avatar-section">
              {profile.userId?.avatar ? (
                <img src={profile.userId.avatar} alt={profile.userId.firstName} className="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {profile.userId?.firstName?.charAt(0)}{profile.userId?.lastName?.charAt(0)}
                </div>
              )}
            </div>

            <div className="name-section">
              <h2>{profile.userId?.firstName} {profile.userId?.lastName}</h2>
              <p className="email">📧 {profile.userId?.email}</p>
              {profile.userId?.phone && (
                <p className="phone">📱 {profile.userId.phone}</p>
              )}
            </div>

            {/* Stats */}
            <div className="profile-stats">
              <div className="stat">
                <div className="stat-value">
                  {profile.totalEarnings ? `₹${profile.totalEarnings.toLocaleString()}` : '₹0'}
                </div>
                <div className="stat-label">Total Earnings</div>
              </div>
              <div className="stat">
                <div className="stat-value">{profile.completedProjects || 0}</div>
                <div className="stat-label">Projects</div>
              </div>
              <div className="stat">
                <div className="stat-value">{profile.rating || 0}/5</div>
                <div className="stat-label">Rating</div>
              </div>
            </div>
          </div>

          {/* Bio & Professional Info */}
          <div className="profile-section">
            <h3>💼 Professional Summary</h3>
            <div className="section-content">
              {profile.bio ? (
                <p className="bio">{profile.bio}</p>
              ) : (
                <p className="empty-message">No bio added yet</p>
              )}
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="profile-section">
              <h3>🎯 Skills</h3>
              <div className="skills-container">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expertise */}
          {profile.expertise && profile.expertise.length > 0 && (
            <div className="profile-section">
              <h3>🏆 Expertise</h3>
              <div className="expertise-container">
                {profile.expertise.map((exp, idx) => (
                  <div key={idx} className="expertise-item">
                    <span className="expertise-name">{exp.title || exp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {profile.portfolio && profile.portfolio.length > 0 && (
            <div className="profile-section">
              <h3>🎨 Portfolio</h3>
              <div className="portfolio-container">
                {profile.portfolio.map((item, idx) => (
                  <div key={idx} className="portfolio-card">
                    {item.image && (
                      <div className="portfolio-image">
                        <img src={item.image} alt={item.title || 'Portfolio item'} />
                      </div>
                    )}
                    <div className="portfolio-info">
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                          View Project →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div className="profile-section">
              <h3>📜 Certifications</h3>
              <div className="certifications-container">
                {profile.certifications.map((cert, idx) => (
                  <div key={idx} className="certification-card">
                    <div className="cert-header">
                      <h4>{cert.name}</h4>
                      {cert.expiryDate && (
                        <span className="cert-date">
                          {new Date(cert.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {cert.issuingOrganization && (
                      <p className="cert-org">by {cert.issuingOrganization}</p>
                    )}
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cert-link">
                        View Credential →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {profile.workExperience && Array.isArray(profile.workExperience) && profile.workExperience.length > 0 && (
            <div className="profile-section">
              <h3>💻 Experience</h3>
              <div className="experience-container">
                {profile.workExperience.map((exp, idx) => (
                  <div key={idx} className="experience-card">
                    <div className="exp-header">
                      <h4>{exp.role}</h4>
                      <span className="exp-period">{exp.duration}</span>
                    </div>
                    <p className="exp-company">{exp.company}</p>
                    {exp.description && <p className="exp-description">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience Level */}
          {profile.experience && (
            <div className="profile-section">
              <h3>📊 Experience Level</h3>
              <div className="exp-level-badge">
                {profile.experience.charAt(0).toUpperCase() + profile.experience.slice(1)}
              </div>
            </div>
          )}

          {/* Hourly Rate */}
          <div className="profile-section">
            <h3>💰 Pricing</h3>
            <div className="pricing-info">
              <div className="price-item">
                <span className="price-label">Hourly Rate:</span>
                <span className="price-value">₹{profile.hourlyRate || 'Not specified'}</span>
              </div>
              {profile.availability && (
                <div className="price-item">
                  <span className="price-label">Availability:</span>
                  <span className="price-value">{profile.availability}</span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Languages */}
          <div className="profile-section">
            <h3>🌍 Details</h3>
            <div className="details-grid">
              {profile.location && (
                <div className="detail-item">
                  <span className="detail-label">📍 Location:</span>
                  <span className="detail-value">{profile.location}</span>
                </div>
              )}
              {profile.languages && profile.languages.length > 0 && (
                <div className="detail-item">
                  <span className="detail-label">🗣️ Languages:</span>
                  <span className="detail-value">{profile.languages.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfileViewPage;
