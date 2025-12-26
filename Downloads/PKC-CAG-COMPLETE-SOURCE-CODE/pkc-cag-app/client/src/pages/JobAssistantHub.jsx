import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobAssistantHub.css';

const JobAssistantHub = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ submitted: 0, shortlisted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          const myAppsRes = await axios.get(
            `${process.env.REACT_APP_API_URL}/job-assistant/my-applications`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          const applications = myAppsRes.data.applications || myAppsRes.data.data || [];
          const shortlistedCount = applications.filter(app => app.status === 'shortlisted').length;
          
          setStats({ 
            submitted: applications.length, 
            shortlisted: shortlistedCount 
          });
        } catch (err) {
          console.warn('Could not fetch application stats:', err);
          setStats({ submitted: 0, shortlisted: 0 });
        }
      } else {
        setStats({ submitted: 0, shortlisted: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ submitted: 0, shortlisted: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-assistant-hub-container">
      {/* Header */}
      <div className="hub-header">
        <div className="header-content">
          <h1>💼 Job Assistance Hub</h1>
          <p>Submit your application and track your progress</p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="hub-nav-cards">
        {/* Submit Application Card */}
        <div className="nav-card submit-card" onClick={() => navigate('/job-assistant')}>
          <div className="card-icon">📝</div>
          <h2>Submit Application</h2>
          <p className="card-description">Fill out your job application form with your resume and details</p>
          <div className="card-count">
            <span className="count-label">Ready to Apply?</span>
          </div>
          <button className="card-btn">Apply Now →</button>
        </div>

        {/* Application Status Card */}
        <div className="nav-card status-card" onClick={() => navigate('/my-job-applications')}>
          <div className="card-icon">📊</div>
          <h2>Application Status</h2>
          <p className="card-description">View all your submitted applications and track their status</p>
          <div className="card-count">
            <div className="status-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.submitted}</span>
                <span className="stat-label">Submitted</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.shortlisted}</span>
                <span className="stat-label">Shortlisted</span>
              </div>
            </div>
          </div>
          <button className="card-btn">View Status →</button>
        </div>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>ℹ️ How It Works</h3>
        <div className="info-grid">
          <div className="info-card">
            <div className="step-number">1</div>
            <h4>Submit Form</h4>
            <p>Fill out the application form with your details and upload your resume</p>
          </div>
          <div className="info-card">
            <div className="step-number">2</div>
            <h4>Get Confirmation</h4>
            <p>Receive an email confirmation with your application ID</p>
          </div>
          <div className="info-card">
            <div className="step-number">3</div>
            <h4>Track Status</h4>
            <p>Monitor your application status in real-time from the dashboard</p>
          </div>
          <div className="info-card">
            <div className="step-number">4</div>
            <h4>Get Contacted</h4>
            <p>Receive updates when your application is reviewed or shortlisted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAssistantHub;