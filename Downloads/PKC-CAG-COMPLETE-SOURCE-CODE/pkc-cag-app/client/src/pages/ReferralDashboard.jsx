// client/src/pages/ReferralDashboard.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './ReferralDashboard.css';

const ReferralDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [rank, setRank] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [marketingMaterials, setMarketingMaterials] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [analyticsRes, rankRes, achievementsRes, materialsRes, leaderboardRes] = await Promise.all([
        API.get('/referral-advanced/analytics'),
        API.get('/referral-advanced/rank'),
        API.get('/referral-advanced/achievements'),
        API.get('/referral-advanced/marketing-materials'),
        API.get('/referral-advanced/leaderboard'),
      ]);

      setAnalytics(analyticsRes.data.data);
      setRank(rankRes.data.data);
      setAchievements(achievementsRes.data.data);
      setMarketingMaterials(materialsRes.data.data);
      setLeaderboard(leaderboardRes.data.data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Referral code copied!');
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Referral link copied!');
  };

  if (loading) return <div className="referral-dashboard">Loading...</div>;

  return (
    <div className="referral-dashboard">
      <h1>🚀 Referral Dashboard</h1>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Your Rank</h3>
          <p className="big-number">{rank?.rank || '-'}</p>
          <span className="rank-label">on leaderboard</span>
        </div>
        <div className="stat-card">
          <h3>Direct Referrals</h3>
          <p className="big-number">{analytics?.referralStats?.tier1Count || 0}</p>
          <span className="rank-label">Tier 1</span>
        </div>
        <div className="stat-card">
          <h3>Sub-Referrals</h3>
          <p className="big-number">{analytics?.referralStats?.tier2Count || 0}</p>
          <span className="rank-label">Tier 2+</span>
        </div>
        <div className="stat-card">
          <h3>Total Earnings</h3>
          <p className="big-number">₹{parseFloat(analytics?.commissions?.total || 0).toFixed(2)}</p>
          <span className="rank-label">All commissions</span>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <p className="big-number">₹{parseFloat(analytics?.available || 0).toFixed(2)}</p>
          <span className="rank-label">Ready to withdraw</span>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="big-number">₹{parseFloat(analytics?.pending || 0).toFixed(2)}</p>
          <span className="rank-label">Not yet earned</span>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="commission-breakdown">
        <h2>Commission Breakdown</h2>
        <div className="breakdown-cards">
          <div className="breakdown-card">
            <span>Tier 1 (Direct)</span>
            <p>₹{parseFloat(analytics?.commissions?.tier1 || 0).toFixed(2)}</p>
            <small>10% commission</small>
          </div>
          <div className="breakdown-card">
            <span>Tier 2</span>
            <p>₹{parseFloat(analytics?.commissions?.tier2 || 0).toFixed(2)}</p>
            <small>3% commission</small>
          </div>
          <div className="breakdown-card">
            <span>Tier 3+</span>
            <p>₹{parseFloat(analytics?.commissions?.tier3 || 0).toFixed(2)}</p>
            <small>1% commission</small>
          </div>
        </div>
      </div>

      {/* Marketing Materials */}
      <div className="marketing-section">
        <h2>📣 Marketing Materials</h2>
        <div className="marketing-materials">
          <div className="material-box">
            <h3>Your Referral Code</h3>
            <div className="code-display">
              <code>{marketingMaterials?.referralCode}</code>
              <button onClick={() => handleCopyCode(marketingMaterials?.referralCode)}>
                Copy
              </button>
            </div>
          </div>

          <div className="material-box">
            <h3>Referral Link</h3>
            <div className="code-display">
              <code>{marketingMaterials?.referralUrl}</code>
              <button onClick={() => handleCopyLink(marketingMaterials?.referralUrl)}>
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="social-texts">
          <h3>Social Media Templates</h3>
          <div className="template-grid">
            {marketingMaterials?.socialTexts &&
              Object.entries(marketingMaterials.socialTexts).map(([platform, text]) => (
                <div key={platform} className="template-box">
                  <strong>{platform.charAt(0).toUpperCase() + platform.slice(1)}</strong>
                  <p>{text}</p>
                  <button onClick={() => navigator.clipboard.writeText(text)}>
                    Copy Text
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2>🏆 Achievements & Badges</h2>
        <div className="badges-grid">
          {achievements.length === 0 ? (
            <p>No achievements unlocked yet. Keep referencing!</p>
          ) : (
            achievements.map((badge, idx) => (
              <div key={idx} className={`badge badge-${badge.tier}`}>
                <span className="badge-icon">{badge.icon}</span>
                <span className="badge-name">{badge.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2>🏅 Leaderboard</h2>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Referrals</th>
              <th>Total Commission</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, idx) => (
              <tr key={idx} className={entry.userId === JSON.parse(localStorage.getItem('user') || '{}')._id ? 'current-user' : ''}>
                <td>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                </td>
                <td>{entry.userName}</td>
                <td>{entry.referralCount}</td>
                <td>₹{parseFloat(entry.totalCommission || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralDashboard;
