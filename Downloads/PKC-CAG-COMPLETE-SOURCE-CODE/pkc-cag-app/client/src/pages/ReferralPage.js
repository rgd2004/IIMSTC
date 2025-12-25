import React from "react";
import { useAuth } from "../context/AuthContext";
import { withdrawalAPI } from "../utils/api";
import toast from "react-hot-toast";
import "./ReferralPage.css";

const ReferralPage = () => {
  const { user } = useAuth();

  const referralCode = user?.referralCode;
  const earnings = user?.referralEarnings || 0;

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const [upi, setUpi] = React.useState("");

  const requestWithdrawal = async () => {
    if (earnings < 100) {
      return toast.error("You need minimum ₹100 to withdraw.");
    }
    if (!upi) {
      return toast.error("Enter UPI ID");
    }

    try {
      await withdrawalAPI.requestWithdrawal({ upi });
      toast.success("Withdrawal request sent!");
      setUpi("");
    } catch (err) {
      toast.error("Failed to send withdrawal request");
    }
  };

  return (
    <div className="referral-container">
      <div className="container">
        <h1 className="ref-title">
          <i className="fas fa-gift"></i> Referral Rewards
        </h1>

        {/* Referral Code & Earnings Section */}
        <div className="glass ref-card">
          <h2>
            <i className="fas fa-tag"></i> Your Referral Details
          </h2>
          
          <div className="code-section">
            <label className="section-label">Your Referral Code</label>
            <div className="code-box">
              {referralCode || "N/A"}
            </div>
          </div>

          <div className="earnings-section">
            <label className="section-label">Total Earnings</label>
            <div className="earn-box">
              <i className="fas fa-rupee-sign"></i> {earnings}
            </div>
          </div>

          <div className="link-section">
            <label className="section-label">Share Your Referral Link</label>
            <div className="link-input-group">
              <input 
                className="ref-link" 
                value={referralLink} 
                readOnly 
              />
              <button className="copy-btn" onClick={copyLink}>
                <i className="fas fa-copy"></i> Copy
              </button>
            </div>
          </div>

          <div className="share-buttons">
            <button 
              className="share-btn whatsapp"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(referralLink)}`, '_blank')}
            >
              <i className="fab fa-whatsapp"></i> WhatsApp
            </button>
            <button 
              className="share-btn telegram"
              onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, '_blank')}
            >
              <i className="fab fa-telegram"></i> Telegram
            </button>
            <button 
              className="share-btn twitter"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(referralLink)}`, '_blank')}
            >
              <i className="fab fa-twitter"></i> Twitter
            </button>
          </div>
        </div>

        {/* Withdrawal Section */}
        <div className="glass withdrawal-card">
          <h2>
            <i className="fas fa-wallet"></i> Withdraw Earnings
          </h2>
          
          <div className="withdrawal-info">
            <div className="info-item">
              <i className="fas fa-info-circle"></i>
              <span>Minimum withdrawal amount: ₹100</span>
            </div>
            <div className="info-item">
              <i className="fas fa-clock"></i>
              <span>Processing time: 24-48 hours</span>
            </div>
          </div>

          <div className="upi-input-section">
            <label className="section-label">Enter UPI ID</label>
            <div className="input-wrapper">
              <i className="fas fa-mobile-alt input-icon"></i>
              <input
                className="upi-input"
                placeholder="yourname@paytm"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
            </div>
          </div>

          <button 
            className="withdraw-btn" 
            onClick={requestWithdrawal}
            disabled={earnings < 100}
          >
            <i className="fas fa-paper-plane"></i> 
            Withdraw Now {earnings < 100 && "(Min ₹100)"}
          </button>

          {earnings < 100 && (
            <div className="note">
              <i className="fas fa-exclamation-triangle"></i> 
              You need ₹{100 - earnings} more to withdraw
            </div>
          )}
        </div>

        {/* How it Works Section */}
        <div className="glass how-it-works">
          <h2>
            <i className="fas fa-question-circle"></i> How It Works
          </h2>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <i className="fas fa-share-alt"></i>
              </div>
              <h3>Share Your Link</h3>
              <p>Share your unique referral link with friends and family</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>They Sign Up</h3>
              <p>Your friends register using your referral code</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <h3>They Make Purchase</h3>
              <p>When they make their first order, you earn rewards</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-icon">
                <i className="fas fa-coins"></i>
              </div>
              <h3>Earn & Withdraw</h3>
              <p>Accumulate earnings and withdraw via UPI anytime</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass stats-section">
          <h2>
            <i className="fas fa-chart-line"></i> Your Referral Stats
          </h2>
          
          <div className="stats-grid-ref">
            <div className="stat-box">
              <div className="stat-icon-ref">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-content-ref">
                <div className="stat-value-ref">
                  {user?.referredUsers?.length || 0}
                </div>
                <div className="stat-label-ref">Total Referrals</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-ref success">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-content-ref">
                <div className="stat-value-ref">
                  {user?.referredUsers?.filter(u => u.status === 'completed')?.length || 0}
                </div>
                <div className="stat-label-ref">Successful</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-ref pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content-ref">
                <div className="stat-value-ref">
                  {user?.referredUsers?.filter(u => u.status === 'pending')?.length || 0}
                </div>
                <div className="stat-label-ref">Pending</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon-ref earnings">
                <i className="fas fa-rupee-sign"></i>
              </div>
              <div className="stat-content-ref">
                <div className="stat-value-ref">₹{earnings}</div>
                <div className="stat-label-ref">Total Earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;