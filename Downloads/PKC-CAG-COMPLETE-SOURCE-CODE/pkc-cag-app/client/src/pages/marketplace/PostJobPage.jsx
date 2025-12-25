// client/src/pages/marketplace/PostJobPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { marketplaceAPI } from "../../utils/api";
import "./PostJobPage.css";
import toast from "react-hot-toast";

const PostJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "development",
    budget: 5000,
    duration: "one-time",
    requiredSkills: [],
    estimatedDays: 7,
  });
  const [skillInput, setSkillInput] = useState("");

  const categories = [
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'writing', label: 'Writing' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'video', label: 'Video' },
    { value: 'data', label: 'Data' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "budget" || name === "estimatedDays" ? Number(value) : value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.requiredSkills.length === 0) {
      toast.error("Please add at least one required skill");
      return;
    }

    try {
      setLoading(true);
      const { requiredSkills, estimatedDays, ...restFormData } = formData;
      const jobPayload = {
        ...restFormData,
        skills: requiredSkills,
        deliveryTime: estimatedDays,
      };
      console.log('Posting job with payload:', jobPayload);
      const res = await marketplaceAPI.createJob(jobPayload);
      console.log('Job created successfully:', res.data);
      toast.success("✅ Job posted successfully!");
      // Navigate to browse jobs instead of detail page
      setTimeout(() => {
        navigate("/marketplace/jobs/browse");
      }, 1500);
    } catch (err) {
      console.error("Error posting job:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || "Failed to post job";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-job-container">
      {/* Header */}
      <div className="post-job-header">
        <h1>📝 Post a New Job</h1>
        <p>Find the perfect freelancer for your project</p>
      </div>

      <div className="post-job-form-wrapper">
        <form onSubmit={handleSubmit} className="post-job-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., Build a React Dashboard"
              value={formData.title}
              onChange={handleChange}
              maxLength="100"
              required
            />
            <small>{formData.title.length}/100 characters</small>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your project in detail..."
              value={formData.description}
              onChange={handleChange}
              rows="6"
              maxLength="5000"
              required
            />
            <small>{formData.description.length}/5000 characters</small>
          </div>

          <div className="form-row">
            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="duration">Duration *</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
              >
                <option value="one-time">One-time</option>
                <option value="short-term">Short-term (1-3 months)</option>
                <option value="long-term">Long-term (3+ months)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            {/* Budget */}
            <div className="form-group">
              <label htmlFor="budget">Budget (₹) *</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                max="10000000"
                required
              />
              <small>Freelancer receives 90%, platform keeps 10%</small>
            </div>

            {/* Estimated Days */}
            <div className="form-group">
              <label htmlFor="estimatedDays">Estimated Days *</label>
              <input
                type="number"
                id="estimatedDays"
                name="estimatedDays"
                value={formData.estimatedDays}
                onChange={handleChange}
                min="1"
                max="365"
                required
              />
            </div>
          </div>

          {/* Required Skills */}
          <div className="form-group">
            <label>Required Skills *</label>
            <div className="skill-input-group">
              <input
                type="text"
                placeholder="Add a skill (e.g., React, Node.js)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="add-skill-btn"
              >
                Add Skill
              </button>
            </div>

            <div className="skills-display">
              {formData.requiredSkills.map((skill) => (
                <div key={skill} className="skill-tag">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="remove-skill"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {formData.requiredSkills.length === 0 && (
              <small className="error">Add at least one skill</small>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="cost-breakdown">
            <h4>💰 Cost Breakdown</h4>
            <div className="cost-item">
              <span>Total Budget:</span>
              <span>₹{formData.budget.toLocaleString()}</span>
            </div>
            <div className="cost-item">
              <span>Platform Fee (10%):</span>
              <span>-₹{(formData.budget * 0.1).toLocaleString()}</span>
            </div>
            <div className="cost-item highlight">
              <span>Freelancer Gets:</span>
              <span>₹{(formData.budget * 0.9).toLocaleString()}</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/marketplace")}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.requiredSkills.length === 0}
              className="submit-btn"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </div>
        </form>

        {/* Tips Section */}
        <aside className="tips-section">
          <h3>💡 Tips for Success</h3>
          <div className="tips-list">
            <div className="tip">
              <span className="tip-icon">✓</span>
              <div>
                <strong>Be Clear</strong>
                <p>Describe your project requirements clearly</p>
              </div>
            </div>
            <div className="tip">
              <span className="tip-icon">✓</span>
              <div>
                <strong>Set Fair Budget</strong>
                <p>Offer competitive rates to attract talent</p>
              </div>
            </div>
            <div className="tip">
              <span className="tip-icon">✓</span>
              <div>
                <strong>Specify Skills</strong>
                <p>List all required skills for better matches</p>
              </div>
            </div>
            <div className="tip">
              <span className="tip-icon">✓</span>
              <div>
                <strong>Review Applicants</strong>
                <p>Check profiles before hiring</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default PostJobPage;
