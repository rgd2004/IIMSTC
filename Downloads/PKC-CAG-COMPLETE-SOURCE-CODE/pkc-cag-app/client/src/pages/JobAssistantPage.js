import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './JobAssistantPage.css';

const JobAssistantPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedRoles: '',
    experience: '',
    currentRole: '',
    skills: '',
    linkedinProfile: '',
    portfolio: '',
    bio: '',
  });
  const [resume, setResume] = useState(null);

  const experiences = ['0-1 years', '1-2 years', '2-5 years', '5-10 years', '10+ years'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, and DOCX files are allowed');
        return;
      }
      setResume(file);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Valid email is required');
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Valid phone number is required');
      return false;
    }
    if (!formData.interestedRoles.trim()) {
      toast.error('Please enter your interested job roles');
      return false;
    }
    if (!formData.skills.trim()) {
      toast.error('Please list your skills');
      return false;
    }
    if (!resume) {
      toast.error('Please upload your resume/CV');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('interestedRoles', formData.interestedRoles);
      data.append('experience', formData.experience);
      data.append('currentRole', formData.currentRole);
      data.append('skills', formData.skills);
      data.append('linkedinProfile', formData.linkedinProfile);
      data.append('portfolio', formData.portfolio);
      data.append('bio', formData.bio);
      data.append('resume', resume);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/job-assistant/submit`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Application submitted successfully! Redirecting to status page...');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          interestedRoles: '',
          experience: '',
          currentRole: '',
          skills: '',
          linkedinProfile: '',
          portfolio: '',
          bio: '',
        });
        setResume(null);

        // Redirect to status page with application ID
        setTimeout(() => {
          navigate(`/job-application-status/${result.application._id}`);
        }, 1500);
      } else {
        toast.error(result.message || 'Error submitting application');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-assistant-container">
      <div className="job-assistant-wrapper">
        {/* Header Section */}
        <div className="job-assistant-header">
          <h1>💼 Job Assistance Application</h1>
          <p>Apply for job assistance and get matched with WorkViaTech opportunities</p>
        </div>

        {/* Disclaimer Section */}
        <div className="disclaimer-box">
          <h3>⚠️ Important Information</h3>
          <ul>
            <li>WorkViaTech members may contact you if your resume/CV is shortlisted</li>
            <li><strong>PKC CAG is NOT responsible</strong> for any financial activities</li>
            <li><strong>Verify identity of WorkViaTech</strong> before making any payments</li>
            <li>For concerns, contact <strong>pkccag@gmail.com</strong></li>
          </ul>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="job-assistant-form">
          {/* Personal Information Section */}
          <fieldset className="form-section">
            <legend>👤 Personal Information</legend>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Job Preference Section */}
          <fieldset className="form-section">
            <legend>🎯 Job Preference</legend>

            <div className="form-group">
              <label htmlFor="interestedRoles">Interested Job Roles *</label>
              <textarea
                id="interestedRoles"
                name="interestedRoles"
                value={formData.interestedRoles}
                onChange={handleInputChange}
                placeholder="e.g., Frontend Developer, Full Stack Developer, React Developer"
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience">Experience Level (Optional)</label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Experience --</option>
                  {experiences.map((exp) => (
                    <option key={exp} value={exp}>
                      {exp}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currentRole">Current Role</label>
                <input
                  type="text"
                  id="currentRole"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleInputChange}
                  placeholder="e.g., Junior Developer / Student"
                />
              </div>
            </div>
          </fieldset>

          {/* Skills & Experience Section */}
          <fieldset className="form-section">
            <legend>⚙️ Skills & Experience</legend>

            <div className="form-group">
              <label htmlFor="skills">
                Skills *
                <span className="hint">(comma-separated, e.g., JavaScript, React, Node.js)</span>
              </label>
              <textarea
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="List your technical skills..."
                rows="4"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">About You</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself, your goals, and achievements..."
                rows="4"
              />
            </div>
          </fieldset>

          {/* Links Section */}
          <fieldset className="form-section">
            <legend>🔗 Online Profiles (Optional)</legend>

            <div className="form-group">
              <label htmlFor="linkedinProfile">LinkedIn Profile</label>
              <input
                type="url"
                id="linkedinProfile"
                name="linkedinProfile"
                value={formData.linkedinProfile}
                onChange={handleInputChange}
                placeholder="https://www.linkedin.com/in/yourprofile"
              />
            </div>

            <div className="form-group">
              <label htmlFor="portfolio">Portfolio / GitHub</label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleInputChange}
                placeholder="https://github.com/yourprofile or https://yourportfolio.com"
              />
            </div>
          </fieldset>

          {/* Resume Upload Section */}
          <fieldset className="form-section">
            <legend>📄 Resume / CV Upload</legend>

            <div className="form-group file-upload">
              <label htmlFor="resume">Upload Resume/CV * (PDF, DOC, DOCX - Max 5MB)</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                />
                <label htmlFor="resume" className="file-input-label">
                  {resume ? (
                    <>
                      <span className="icon">✅</span>
                      <span className="text">{resume.name}</span>
                    </>
                  ) : (
                    <>
                      <span className="icon">📄</span>
                      <span className="text">Click to upload or drag and drop</span>
                      <span className="hint">PDF, DOC, or DOCX (Max 5MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </fieldset>

          {/* Submit Section */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>

          <p className="form-note">
            By submitting this form, you agree to our terms and acknowledge the disclaimer above.
          </p>
        </form>
      </div>
    </div>
  );
};

export default JobAssistantPage;