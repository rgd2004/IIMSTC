// client/src/pages/UserLevelPage.jsx
import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import Toast from 'react-hot-toast';
import '../pages/UserLevelPage.css';

const UserLevelPage = () => {
  const [userLevel, setUserLevel] = useState(null);
  const [benefits, setBenefits] = useState(null);
  const [allLevels, setAllLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevelData();
  }, []);

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      const [levelRes, benefitsRes, allLevelsRes] = await Promise.all([
        API.get('/level/my-level'),
        API.get('/level/benefits'),
        API.get('/level/all-levels'),
      ]);

      setUserLevel(levelRes.data.data);
      setBenefits(benefitsRes.data.data);
      setAllLevels(allLevelsRes.data.data);
    } catch (error) {
      Toast.error('Failed to fetch level data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelIcon = (level) => {
    const icons = {
      1: '🌱',
      2: '🌿',
      3: '🍀',
      4: '🌳',
      5: '🏆',
      6: '👑',
      7: '⭐',
      8: '🌟',
      9: '✨',
      10: '🚀',
    };
    return icons[level] || '🎯';
  };

  const getLevelColor = (level) => {
    const colors = {
      1: '#10b981',
      2: '#34d399',
      3: '#14b8a6',
      4: '#06b6d4',
      5: '#3b82f6',
      6: '#8b5cf6',
      7: '#a855f7',
      8: '#d946ef',
      9: '#ec4899',
      10: '#f43f5e',
    };
    return colors[level] || '#6366f1';
  };

  const getBenefitDescription = (level) => {
    const descriptions = {
      1: 'Getting started with PKC-CAG',
      2: 'Beginning your journey',
      3: 'Building momentum',
      4: 'Growing steadily',
      5: 'Champion tier',
      6: 'Elite member',
      7: 'Superstar status',
      8: 'Legendary tier',
      9: 'Mythical status',
      10: 'Ultimate mastery',
    };
    return descriptions[level] || '';
  };

  if (loading) {
    return (
      <div className="level-page-loading">
        <div className="loader-container">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <span className="loader-text">Loading your progress...</span>
        </div>
      </div>
    );
  }

  if (!userLevel || !benefits) {
    return (
      <div className="level-page-error">
        <div className="error-content">
          <span className="error-icon">❌</span>
          <h2>Oops! Something went wrong</h2>
          <p>Failed to load your level data</p>
          <button onClick={fetchLevelData} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  const currentBenefits = benefits.currentBenefits;
  const nextLevel = benefits.nextLevelBenefits;
  const progress = benefits.progressToNextLevel;

  return (
    <div className="user-level-page-redesign">
      {/* Hero Section */}
      <div className="level-hero">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="particle" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}></div>
            ))}
          </div>
        </div>
        
        <div className="hero-content">
          <div className="level-badge-hero" style={{ '--level-color': getLevelColor(userLevel.currentLevel) }}>
            <div className="badge-glow"></div>
            <span className="level-icon-hero">{getLevelIcon(userLevel.currentLevel)}</span>
            <div className="badge-text">
              <span className="badge-label">LEVEL</span>
              <span className="badge-number">{userLevel.currentLevel}</span>
            </div>
          </div>
          
          <h1 className="hero-title">{getBenefitDescription(userLevel.currentLevel)}</h1>
          <p className="hero-subtitle">Keep grinding to unlock amazing rewards! 🚀</p>
        </div>
      </div>

      <div className="level-content-wrapper">
        {/* Progress Section */}
        {progress && (
          <div className="progress-card-modern">
            <div className="progress-header">
              <div>
                <h3>Your Progress Journey</h3>
                <p>Next level: {nextLevel?.level || userLevel.currentLevel + 1}</p>
              </div>
              <div className="progress-percentage" style={{ '--percent': progress.percentProgress }}>
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${progress.percentProgress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="percentage">{Math.round(progress.percentProgress)}%</text>
                </svg>
              </div>
            </div>
            
            <div className="progress-bar-modern">
              <div className="progress-fill-modern" style={{ width: `${progress.percentProgress}%` }}>
                <div className="progress-shine"></div>
              </div>
            </div>
            
            <div className="xp-details">
              <div className="xp-current">
                <span className="xp-label">Current XP</span>
                <span className="xp-value">{progress.currentXP.toLocaleString()}</span>
              </div>
              <div className="xp-divider"></div>
              <div className="xp-needed">
                <span className="xp-label">Needed XP</span>
                <span className="xp-value">{progress.totalXPNeeded.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="xp-remaining">
              <span className="remaining-icon">🎯</span>
              <span>{Math.round(progress.totalXPNeeded - progress.currentXP).toLocaleString()} XP to next level!</span>
            </div>
          </div>
        )}

        {/* Benefits Grid */}
        <div className="benefits-section-modern">
          <h2 className="section-title">
            <span className="title-icon">✨</span>
            Your Current Benefits
          </h2>
          
          <div className="benefits-grid-modern">
            <div className="benefit-card-modern discount">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon-modern">💰</span>
              </div>
              <div className="benefit-content">
                <h4>Discount</h4>
                <p className="benefit-value-large">{currentBenefits.discountPercentage}%</p>
                <p className="benefit-desc">On all purchases</p>
              </div>
              <div className="benefit-badge">Active</div>
            </div>

            <div className="benefit-card-modern multiplier">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon-modern">⭐</span>
              </div>
              <div className="benefit-content">
                <h4>XP Multiplier</h4>
                <p className="benefit-value-large">{currentBenefits.pointsMultiplier}x</p>
                <p className="benefit-desc">Earn XP faster</p>
              </div>
              <div className="benefit-badge">Active</div>
            </div>

            <div className="benefit-card-modern support">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon-modern">🎯</span>
              </div>
              <div className="benefit-content">
                <h4>Support</h4>
                <p className="benefit-value-large">{currentBenefits.prioritySupport ? '⚡' : '📧'}</p>
                <p className="benefit-desc">{currentBenefits.prioritySupport ? 'Priority' : 'Standard'}</p>
              </div>
              {currentBenefits.prioritySupport && <div className="benefit-badge">Premium</div>}
            </div>

            <div className="benefit-card-modern exclusive">
              <div className="benefit-icon-wrapper">
                <span className="benefit-icon-modern">🎁</span>
              </div>
              <div className="benefit-content">
                <h4>Exclusive Access</h4>
                <p className="benefit-value-large">{currentBenefits.exclusiveServices ? '✅' : '🔒'}</p>
                <p className="benefit-desc">{currentBenefits.exclusiveServices ? 'Unlocked' : 'Locked'}</p>
              </div>
              {currentBenefits.exclusiveServices && <div className="benefit-badge">VIP</div>}
            </div>
          </div>
        </div>

        {/* Next Level Preview */}
        {nextLevel && (
          <div className="next-level-card">
            <div className="next-level-header">
              <span className="next-level-icon">{getLevelIcon(nextLevel.level)}</span>
              <div>
                <h3>Unlock Level {nextLevel.level}</h3>
                <p>Here's what you'll get next</p>
              </div>
            </div>
            
            <div className="next-level-benefits">
              <div className="next-benefit-item">
                <span className="next-benefit-icon">💰</span>
                <div className="next-benefit-text">
                  <span className="next-benefit-label">Discount</span>
                  <span className="next-benefit-upgrade">
                    {currentBenefits.discountPercentage}% → {nextLevel.discountPercentage}%
                    <span className="upgrade-arrow">↑</span>
                  </span>
                </div>
              </div>
              
              <div className="next-benefit-item">
                <span className="next-benefit-icon">⭐</span>
                <div className="next-benefit-text">
                  <span className="next-benefit-label">XP Multiplier</span>
                  <span className="next-benefit-upgrade">
                    {currentBenefits.pointsMultiplier}x → {nextLevel.pointsMultiplier}x
                    <span className="upgrade-arrow">↑</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Levels Roadmap */}
        <div className="levels-roadmap-section">
          <h2 className="section-title">
            <span className="title-icon">🗺️</span>
            Level Progression Roadmap
          </h2>
          
          <div className="levels-roadmap">
            {allLevels.map((level, index) => (
              <div
                key={level.level}
                className={`roadmap-item ${level.level <= userLevel.currentLevel ? 'achieved' : 'locked'} ${level.level === userLevel.currentLevel ? 'current' : ''}`}
                style={{ '--level-color': getLevelColor(level.level) }}
              >
                {level.level === userLevel.currentLevel && (
                  <div className="current-level-pulse"></div>
                )}
                
                <div className="roadmap-connector">
                  {index < allLevels.length - 1 && (
                    <div className={`connector-line ${level.level < userLevel.currentLevel ? 'completed' : ''}`}></div>
                  )}
                </div>
                
                <div className="roadmap-content">
                  <div className="roadmap-icon-wrapper">
                    <span className="roadmap-icon">{getLevelIcon(level.level)}</span>
                    {level.level <= userLevel.currentLevel && (
                      <div className="achievement-check">✓</div>
                    )}
                  </div>
                  
                  <div className="roadmap-info">
                    <h4>Level {level.level}</h4>
                    <div className="roadmap-stats">
                      <span className="roadmap-stat">💰 {level.discountPercentage}%</span>
                      <span className="roadmap-stat">⭐ {level.multiplier}x</span>
                    </div>
                    <span className="roadmap-xp">{level.minXP.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* XP Guide */}
        <div className="xp-guide-modern">
          <h2 className="section-title">
            <span className="title-icon">📚</span>
            How to Earn XP
          </h2>
          
          <div className="xp-methods-grid">
            <div className="xp-method-card">
              <div className="method-icon-bg purchase">
                <span className="method-icon">🛍️</span>
              </div>
              <h4>Make Purchases</h4>
              <p className="method-value">10 XP per ₹100</p>
              <p className="method-desc">Earn XP on every purchase you make</p>
            </div>

            <div className="xp-method-card">
              <div className="method-icon-bg review">
                <span className="method-icon">⭐</span>
              </div>
              <h4>Write Reviews</h4>
              <p className="method-value">5 XP per review</p>
              <p className="method-desc">Share your experience with others</p>
            </div>

            <div className="xp-method-card">
              <div className="method-icon-bg referral">
                <span className="method-icon">👥</span>
              </div>
              <h4>Refer Friends</h4>
              <p className="method-value">15 XP per referral</p>
              <p className="method-desc">Invite friends to join the platform</p>
            </div>

            <div className="xp-method-card">
              <div className="method-icon-bg bonus">
                <span className="method-icon">🎉</span>
              </div>
              <h4>Daily Bonuses</h4>
              <p className="method-value">Variable XP</p>
              <p className="method-desc">Complete daily challenges</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements-modern">
          <h2 className="section-title">
            <span className="title-icon">🏆</span>
            Your Achievements
          </h2>
          
          {userLevel.achievements && userLevel.achievements.length > 0 ? (
            <div className="achievements-grid-modern">
              {userLevel.achievements.map((achievement, idx) => (
                <div key={idx} className="achievement-card">
                  <div className="achievement-glow"></div>
                  <span className="achievement-icon-modern">{achievement.icon || '🎖️'}</span>
                  <h4>{achievement.name}</h4>
                  <span className="achievement-date">
                    {new Date(achievement.unlockedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-achievements-card">
              <span className="no-achievements-icon">🎯</span>
              <h3>No Achievements Yet</h3>
              <p>Start earning XP to unlock your first achievement!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserLevelPage;
