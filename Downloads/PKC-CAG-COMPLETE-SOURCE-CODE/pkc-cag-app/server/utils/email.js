const nodemailer = require("nodemailer");

// ======================================================
// 🚀 CREATE TRANSPORTER (GMAIL APP PASSWORD REQUIRED)
// ======================================================

// Check if environment variables are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error("❌ ERROR: Missing email configuration!");
  console.error("   EMAIL_USER:", process.env.EMAIL_USER ? "✅ Set" : "❌ NOT SET");
  console.error("   EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ NOT SET");
  console.error("\n📝 Please add these environment variables to Render:");
  console.error("   1. Go to Dashboard > Select your service");
  console.error("   2. Environment tab > Add Private Environment Variables");
  console.error("   3. Add: EMAIL_USER=pkccag@gmail.com");
  console.error("   4. Add: EMAIL_PASS=<Gmail App Password from Gmail Security settings>");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. pkccag@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
    console.error("⚠️  Email notifications will NOT work");
  } else {
    console.log("✅ Email transporter verified and ready");
  }
});

// ======================================================
// 1️⃣ SEND OTP EMAIL
// ======================================================
exports.sendOTPEmail = async (email, otp, name) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - PKC CAG",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; position: relative; }
          .header::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2, #667eea); }
          .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 10px; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
          .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 50px 40px; }
          .greeting { font-size: 24px; color: #2d3748; margin-bottom: 20px; }
          .greeting strong { color: #667eea; }
          .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .otp-container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3); position: relative; overflow: hidden; }
          .otp-container::before { content: '🔒'; position: absolute; top: 10px; right: 20px; font-size: 40px; opacity: 0.2; }
          .otp-label { color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
          .otp-code { background: white; color: #667eea; font-size: 42px; font-weight: bold; padding: 20px; border-radius: 12px; letter-spacing: 12px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.1); font-family: 'Courier New', monospace; }
          .validity { color: #718096; font-size: 14px; margin-top: 30px; padding: 15px; background: #f7fafc; border-left: 4px solid #667eea; border-radius: 8px; }
          .validity strong { color: #667eea; }
          .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
          .footer-title { color: #2d3748; font-weight: 600; margin-bottom: 10px; }
          .security-note { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 10px; margin-top: 30px; font-size: 13px; color: #856404; }
          .security-note strong { color: #cc5200; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">PKC CAG</div>
            <div class="header-subtitle">Email Verification</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello <strong>${name}</strong>,</div>
            <div class="message">
              Welcome to PKC CAG! To complete your registration and secure your account, please verify your email address using the One-Time Password (OTP) below.
            </div>
            
            <div class="otp-container">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${otp}</div>
            </div>
            
            <div class="validity">
              <strong>⏱️ Important:</strong> This OTP is valid for 10 minutes only. Please enter it promptly to complete your verification.
            </div>
            
            <div class="security-note">
              <strong>🔐 Security Reminder:</strong> Never share this code with anyone. PKC CAG will never ask for your OTP via phone or email.
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-title">Need Help?</div>
            <div>Contact us at <strong>${process.env.EMAIL_USER}</strong></div>
            <div style="margin-top: 15px; color: #a0aec0; font-size: 12px;">
              © 2024 PKC CAG. All Rights Reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Cannot send OTP email - EMAIL_USER or EMAIL_PASS not configured");
      throw new Error("Email credentials not configured on server");
    }
    
    console.log(`📧 Sending OTP email to: ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ OTP Email failed for ${email}:`, error.message);
    throw error;
  }
};

// ======================================================
// 2️⃣ SEND ORDER CONFIRMATION EMAIL (USER)
// ======================================================
exports.sendOrderConfirmationEmail = async (email, details) => {
  if (!email) {
    console.warn("sendOrderConfirmationEmail called without email");
    return;
  }

  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✔ Order Confirmed – ${details.serviceName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 40px 20px; }
    .email-wrapper { max-width: 650px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); padding: 50px 30px; text-align: center; position: relative; }
    .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path fill="rgba(255,255,255,0.1)" d="M0,0 Q300,40 600,20 T1200,10 L1200,120 L0,120 Z"/></svg>') no-repeat bottom; background-size: cover; opacity: 0.3; }
    .logo { font-size: 42px; font-weight: bold; color: white; margin-bottom: 15px; letter-spacing: 3px; position: relative; z-index: 1; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
    .success-icon { width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 20px auto; font-size: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); animation: scaleIn 0.5s ease; position: relative; z-index: 1; }
    @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
    .header-title { color: white; font-size: 28px; font-weight: 600; position: relative; z-index: 1; }
    .header-subtitle { color: rgba(255,255,255,0.95); font-size: 16px; margin-top: 10px; position: relative; z-index: 1; }
    .content { padding: 40px; }
    .section-title { color: #0f766e; font-size: 24px; font-weight: 600; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 3px solid #14b8a6; display: inline-block; }
    .order-card { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 30px; border-radius: 15px; margin: 25px 0; box-shadow: 0 5px 20px rgba(20, 184, 166, 0.15); border: 2px solid #99f6e4; }
    .order-item { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px dashed #5eead4; }
    .order-item:last-child { border-bottom: none; }
    .order-label { color: #0f766e; font-weight: 600; font-size: 15px; }
    .order-value { color: #134e4a; font-weight: 500; font-size: 15px; text-align: right; }
    .highlight { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 3px 12px; border-radius: 20px; font-size: 14px; }
    .message-box { background: #fff7ed; border-left: 4px solid #fb923c; padding: 20px; border-radius: 10px; margin-top: 30px; color: #7c2d12; }
    .message-box strong { color: #ea580c; }
    .timeline { margin: 30px 0; }
    .timeline-item { display: flex; align-items: flex-start; margin: 20px 0; }
    .timeline-dot { width: 40px; height: 40px; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-right: 15px; box-shadow: 0 4px 10px rgba(20, 184, 166, 0.3); flex-shrink: 0; }
    .timeline-content { flex: 1; padding-top: 8px; }
    .timeline-title { color: #0f766e; font-weight: 600; font-size: 16px; }
    .timeline-desc { color: #6b7280; font-size: 14px; margin-top: 5px; }
    .footer { background: linear-gradient(to right, #f0fdfa, #ccfbf1); padding: 35px; text-align: center; border-top: 1px solid #99f6e4; }
    .footer-title { color: #0f766e; font-weight: 600; font-size: 18px; margin-bottom: 15px; }
    .contact-info { display: inline-block; background: white; padding: 15px 30px; border-radius: 30px; margin-top: 10px; box-shadow: 0 4px 15px rgba(20, 184, 166, 0.2); }
    .contact-info strong { color: #0f766e; font-size: 18px; }
    .social-icons { margin-top: 20px; }
    .copyright { margin-top: 20px; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">PKC CAG</div>
      <div class="success-icon">✔</div>
      <div class="header-title">Order Confirmed!</div>
      <div class="header-subtitle">Your order has been successfully placed</div>
    </div>
    
    <div class="content">
      <h2 class="section-title">Order Summary</h2>
      
      <div class="order-card">
        <div class="order-item">
          <span class="order-label">🛍️ Service</span>
          <span class="order-value"><strong>${details.serviceName}</strong></span>
        </div>
        <div class="order-item">
          <span class="order-label">📦 Package</span>
          <span class="order-value"><span class="highlight">${details.packageType}</span></span>
        </div>
        <div class="order-item">
          <span class="order-label">💰 Amount Paid</span>
          <span class="order-value"><strong style="font-size: 20px; color: #0f766e;">₹${details.amount}</strong></span>
        </div>
        <div class="order-item">
          <span class="order-label">🆔 Order ID</span>
          <span class="order-value" style="font-family: monospace; background: #e0f2fe; padding: 5px 10px; border-radius: 5px;">${details.orderId}</span>
        </div>
        <div class="order-item">
          <span class="order-label">⏰ Delivery Time</span>
          <span class="order-value">${details.deliveryTime}</span>
        </div>
      </div>

      <h2 class="section-title" style="margin-top: 40px;">What's Next?</h2>
      
      <div class="timeline">
        <div class="timeline-item">
          <div class="timeline-dot">1</div>
          <div class="timeline-content">
            <div class="timeline-title">Order Processing</div>
            <div class="timeline-desc">Our team has started working on your order right away</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot">2</div>
          <div class="timeline-content">
            <div class="timeline-title">Regular Updates</div>
            <div class="timeline-desc">You'll receive progress updates via email & WhatsApp</div>
          </div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot">3</div>
          <div class="timeline-content">
            <div class="timeline-title">Order Delivery</div>
            <div class="timeline-desc">We'll deliver your order within the promised timeframe</div>
          </div>
        </div>
      </div>
      
      <div class="message-box">
        <strong>📢 Important:</strong> Our team has started working on your order. You'll receive updates via email & WhatsApp. Keep an eye on your inbox!
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-title">Need Assistance?</div>
      <div>We're here to help you 24/7</div>
      <div class="contact-info">
        📱 WhatsApp: <strong>+91 94815 13621</strong>
      </div>
      <div class="copyright">
        © 2024 PKC CAG. All Rights Reserved.
      </div>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Order Confirmation Email failed:", error);
  }
};

// ======================================================
// 3️⃣ SEND FULL ORDER DETAILS TO ADMIN
// ======================================================
exports.sendAdminOrderEmail = async (details) => {
  if (!process.env.ADMIN_EMAIL) {
    console.error("ADMIN_EMAIL not set in .env");
    return;
  }

  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🔥 New Order Received – ${details.serviceName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); padding: 40px 20px; }
    .email-wrapper { max-width: 750px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); padding: 50px 30px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px); animation: slide 20s linear infinite; }
    @keyframes slide { 0% { transform: translate(0, 0); } 100% { transform: translate(50px, 50px); } }
    .header-content { position: relative; z-index: 1; }
    .alert-badge { display: inline-block; background: white; color: #b91c1c; padding: 15px 30px; border-radius: 30px; font-size: 32px; font-weight: bold; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); animation: pulse 2s ease infinite; }
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .header-title { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
    .header-subtitle { color: rgba(255,255,255,0.95); font-size: 16px; }
    .content { padding: 40px; }
    .alert-box { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 5px solid #ef4444; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    .alert-box-title { color: #b91c1c; font-weight: bold; font-size: 18px; margin-bottom: 10px; }
    .alert-box-text { color: #7f1d1d; line-height: 1.6; }
    .section-header { background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); color: white; padding: 15px 25px; border-radius: 12px; margin: 30px 0 20px 0; font-size: 20px; font-weight: 600; box-shadow: 0 5px 15px rgba(239, 68, 68, 0.3); display: flex; align-items: center; justify-content: space-between; }
    .section-number { background: white; color: #b91c1c; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .data-card { background: #f9fafb; border: 2px solid #e5e7eb; padding: 25px; border-radius: 12px; margin-bottom: 25px; position: relative; overflow: hidden; }
    .data-card::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: linear-gradient(to bottom, #b91c1c, #ef4444); }
    .data-row { display: grid; grid-template-columns: 200px 1fr; gap: 15px; padding: 12px 0; border-bottom: 1px dashed #d1d5db; }
    .data-row:last-child { border-bottom: none; }
    .data-label { color: #6b7280; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .data-value { color: #1f2937; font-weight: 500; word-break: break-word; font-family: 'Courier New', monospace; background: white; padding: 8px 12px; border-radius: 6px; }
    .data-value.highlight { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); color: #b91c1c; font-weight: bold; }
    .json-block { background: #1f2937; color: #10b981; padding: 25px; border-radius: 12px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); white-space: pre-wrap; word-wrap: break-word; }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 30px 0; }
    .action-btn { background: white; border: 2px solid #ef4444; color: #b91c1c; padding: 15px; border-radius: 10px; text-align: center; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .action-btn:hover { background: #ef4444; color: white; }
    .footer { background: linear-gradient(to right, #1f2937, #374151); padding: 35px; text-align: center; color: white; }
    .footer-title { font-size: 20px; font-weight: 600; margin-bottom: 15px; }
    .footer-text { color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 10px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 25px 0; }
    .stat-box { background: white; border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #b91c1c; }
    .stat-label { font-size: 13px; color: #6b7280; margin-top: 5px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <div class="alert-badge">🔥 NEW ORDER</div>
        <div class="header-title">Order Received!</div>
        <div class="header-subtitle">PKC CAG Admin Notification</div>
      </div>
    </div>
    
    <div class="content">
      <div class="alert-box">
        <div class="alert-box-title">⚡ Action Required</div>
        <div class="alert-box-text">
          A new order has been placed and requires your attention. Please review the details below and take necessary action to process this order.
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">₹${details.amount}</div>
          <div class="stat-label">Order Value</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${details.quantity || 1}</div>
          <div class="stat-label">Quantity</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="font-size: 16px;">${details.paymentStatus}</div>
          <div class="stat-label">Payment</div>
        </div>
      </div>

      <div class="section-header">
        <span>👤 Customer Details</span>
        <span class="section-number">1</span>
      </div>
      
      <div class="data-card">
        ${Object.entries(details.customerDetails).map(([key, value]) => `
          <div class="data-row">
            <div class="data-label">${key}</div>
            <div class="data-value">${value}</div>
          </div>
        `).join('')}
      </div>

      <div class="section-header">
        <span>📦 Order Information</span>
        <span class="section-number">2</span>
      </div>
      
      <div class="data-card">
        <div class="data-row">
          <div class="data-label">Order ID</div>
          <div class="data-value highlight">${details.orderId}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Service Name</div>
          <div class="data-value">${details.serviceName}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Package Type</div>
          <div class="data-value">${details.packageType}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Amount</div>
          <div class="data-value highlight">₹${details.amount}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Quantity</div>
          <div class="data-value">${details.quantity || 1}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Payment ID</div>
          <div class="data-value">${details.paymentId}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Payment Status</div>
          <div class="data-value highlight">${details.paymentStatus}</div>
        </div>
        <div class="data-row">
          <div class="data-label">Created At</div>
          <div class="data-value">${details.createdAt}</div>
        </div>
      </div>

      <div class="section-header">
        <span>📄 Complete JSON Data</span>
        <span class="section-number">3</span>
      </div>
      
      <div class="json-block">${JSON.stringify({
        customerDetails: details.customerDetails,
        orderDetails: {
          orderId: details.orderId,
          serviceName: details.serviceName,
          package: details.packageType,
          amount: details.amount,
          quantity: details.quantity,
          paymentId: details.paymentId,
          paymentStatus: details.paymentStatus,
          createdAt: details.createdAt
        }
      }, null, 2)}</div>
    </div>
    
    <div class="footer">
      <div class="footer-title">🔐 PKC CAG Admin Panel</div>
      <div class="footer-text">
        This is an automated notification from your order management system.<br>
        Please do not reply to this email.
      </div>
      <div class="footer-text" style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
        © 2024 PKC CAG Admin Panel — All Rights Reserved
      </div>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Admin Order Email failed:", error);
  }
};

// ======================================================
// 4️⃣ SEND ORDER STATUS UPDATE EMAIL
// ======================================================
exports.sendOrderStatusEmail = async (email, details) => {
  const statusConfig = {
    'Processing': { icon: '⚙️', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    'Completed': { icon: '✅', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    'Shipped': { icon: '🚚', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    'Cancelled': { icon: '❌', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    'Pending': { icon: '⏳', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
  };

  const config = statusConfig[details.status] || statusConfig['Processing'];

  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📢 Order Status Updated – ${details.status}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: ${config.gradient}; padding: 40px 20px; }
    .email-wrapper { max-width: 650px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: ${config.gradient}; padding: 50px 30px; text-align: center; position: relative; }
    .header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120"><path fill="white" d="M0,0 Q300,60 600,50 T1200,40 L1200,120 L0,120 Z"/></svg>') no-repeat bottom; background-size: cover; }
    .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 20px; letter-spacing: 2px; position: relative; z-index: 1; text-shadow: 2px 2px 8px rgba(0,0,0,0.3); }
    .status-badge { display: inline-block; background: white; padding: 20px 40px; border-radius: 50px; margin: 20px 0; box-shadow: 0 10px 40px rgba(0,0,0,0.2); position: relative; z-index: 1; }
    .status-icon { font-size: 50px; margin-bottom: 10px; }
    .status-text { color: ${config.color}; font-size: 28px; font-weight: bold; }
    .header-subtitle { color: white; font-size: 18px; position: relative; z-index: 1; margin-top: 20px; }
    .content { padding: 50px 40px 40px 40px; }
    .greeting { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
    .greeting strong { color: ${config.color}; }
    .message { color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 30px; }
    .info-card { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; padding: 30px; border-radius: 15px; margin: 30px 0; position: relative; overflow: hidden; }
    .info-card::before { content: '${config.icon}'; position: absolute; right: 20px; top: 20px; font-size: 80px; opacity: 0.1; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px dashed #cbd5e1; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 600; font-size: 15px; }
    .info-value { color: #1e293b; font-weight: 600; font-size: 15px; text-align: right; }
    .status-highlight { background: ${config.gradient}; color: white; padding: 8px 20px; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .order-id { font-family: 'Courier New', monospace; background: #f1f5f9; padding: 8px 15px; border-radius: 8px; font-size: 14px; }
    .progress-section { margin: 40px 0; }
    .progress-title { color: #1f2937; font-size: 20px; font-weight: 600; margin-bottom: 25px; text-align: center; }
    .progress-bar-container { background: #e2e8f0; height: 12px; border-radius: 20px; overflow: hidden; margin: 20px 0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
    .progress-bar { background: ${config.gradient}; height: 100%; border-radius: 20px; transition: width 1s ease; box-shadow: 0 2px 8px ${config.color}66; }
    .status-stages { display: flex; justify-content: space-between; margin-top: 15px; }
    .stage { text-align: center; flex: 1; }
    .stage-dot { width: 40px; height: 40px; border-radius: 50%; background: #e2e8f0; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #94a3b8; transition: all 0.3s; }
    .stage.active .stage-dot { background: ${config.gradient}; color: white; box-shadow: 0 4px 15px ${config.color}66; transform: scale(1.1); }
    .stage-label { font-size: 12px; color: #64748b; font-weight: 500; }
    .stage.active .stage-label { color: ${config.color}; font-weight: 600; }
    .notification-box { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 12px; margin-top: 30px; }
    .notification-box-title { color: #92400e; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
    .notification-box-text { color: #78350f; line-height: 1.6; }
    .footer { background: linear-gradient(to right, #f8fafc, #f1f5f9); padding: 40px; text-align: center; border-top: 2px solid #e2e8f0; }
    .footer-title { color: #1e293b; font-weight: 600; font-size: 20px; margin-bottom: 15px; }
    .footer-subtitle { color: #64748b; margin-bottom: 20px; }
    .contact-box { display: inline-block; background: white; padding: 15px 35px; border-radius: 30px; margin-top: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 2px solid ${config.color}33; }
    .contact-box strong { color: ${config.color}; font-size: 18px; }
    .social-links { margin-top: 25px; }
    .social-link { display: inline-block; width: 40px; height: 40px; background: white; border-radius: 50%; margin: 0 8px; line-height: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); transition: all 0.3s; }
    .copyright { margin-top: 25px; color: #94a3b8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo">PKC CAG</div>
      <div class="status-badge">
        <div class="status-icon">${config.icon}</div>
        <div class="status-text">${details.status}</div>
      </div>
      <div class="header-subtitle">Your order status has been updated</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hello <strong>${details.name}</strong>,</div>
      <div class="message">
        We wanted to keep you informed about your order with PKC CAG. Your order status has been updated and we're excited to share the progress with you!
      </div>
      
      <div class="info-card">
        <div class="info-row">
          <span class="info-label">📊 Current Status</span>
          <span class="info-value"><span class="status-highlight">${details.status}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">🆔 Order ID</span>
          <span class="info-value"><span class="order-id">${details.orderId}</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">🛍️ Service</span>
          <span class="info-value">${details.serviceName}</span>
        </div>
      </div>

      <div class="progress-section">
        <div class="progress-title">Order Progress Tracking</div>
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${
            details.status === 'Pending' ? '25%' :
            details.status === 'Processing' ? '50%' :
            details.status === 'Shipped' ? '75%' :
            details.status === 'Completed' ? '100%' : '25%'
          };"></div>
        </div>
        <div class="status-stages">
          <div class="stage ${['Pending', 'Processing', 'Shipped', 'Completed'].includes(details.status) ? 'active' : ''}">
            <div class="stage-dot">1</div>
            <div class="stage-label">Pending</div>
          </div>
          <div class="stage ${['Processing', 'Shipped', 'Completed'].includes(details.status) ? 'active' : ''}">
            <div class="stage-dot">2</div>
            <div class="stage-label">Processing</div>
          </div>
          <div class="stage ${['Shipped', 'Completed'].includes(details.status) ? 'active' : ''}">
            <div class="stage-dot">3</div>
            <div class="stage-label">Shipped</div>
          </div>
          <div class="stage ${details.status === 'Completed' ? 'active' : ''}">
            <div class="stage-dot">4</div>
            <div class="stage-label">Completed</div>
          </div>
        </div>
      </div>
      
      <div class="notification-box">
        <div class="notification-box-title">📱 Stay Connected</div>
        <div class="notification-box-text">
          We will notify you of future updates via email and WhatsApp. You can track your order progress anytime by contacting our support team. Thank you for choosing PKC CAG! ❤
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-title">Need Help?</div>
      <div class="footer-subtitle">Our support team is here for you 24/7</div>
      <div class="contact-box">
        📱 WhatsApp: <strong>+91 94815 13621</strong>
      </div>
      <div class="copyright">
        © 2024 PKC CAG • All Rights Reserved
      </div>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Status Update Email failed:", error);
  }
};

// ======================================================
// 5️⃣ SEND PAYMENT VERIFICATION EMAIL (RAZORPAY)
// ======================================================
exports.sendPaymentVerificationEmail = async (email, details) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Payment Verified - Freelance Contract #${details.contractId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; }
    .email-wrapper { max-width: 700px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center; position: relative; }
    .header::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, #10b981, #059669, #10b981); }
    .success-badge { display: inline-block; font-size: 70px; margin-bottom: 20px; animation: bounce 1s ease infinite; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .header-title { color: white; font-size: 32px; font-weight: bold; margin-bottom: 10px; text-shadow: 2px 2px 8px rgba(0,0,0,0.2); }
    .header-subtitle { color: rgba(255,255,255,0.95); font-size: 16px; }
    .content { padding: 50px 40px; }
    .greeting { font-size: 24px; color: #1f2937; margin-bottom: 20px; }
    .greeting strong { color: #10b981; }
    .message { color: #4b5563; font-size: 16px; line-height: 1.8; margin-bottom: 30px; }
    .payment-card { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 2px solid #6ee7b7; padding: 30px; border-radius: 15px; margin: 30px 0; position: relative; overflow: hidden; }
    .payment-card::before { content: '💳'; position: absolute; right: 20px; top: 20px; font-size: 70px; opacity: 0.2; }
    .payment-row { display: grid; grid-template-columns: 200px 1fr; gap: 15px; padding: 15px 0; border-bottom: 1px solid #a7f3d0; }
    .payment-row:last-child { border-bottom: none; }
    .payment-label { color: #059669; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    .payment-value { color: #065f46; font-weight: 600; font-size: 15px; word-break: break-word; }
    .payment-value.amount { background: white; padding: 10px 15px; border-radius: 8px; color: #10b981; font-size: 20px; font-weight: bold; }
    .payment-value.id { background: white; padding: 8px 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 13px; }
    .contract-details { background: #f0fdf4; border: 2px solid #bbf7d0; padding: 25px; border-radius: 12px; margin: 25px 0; }
    .details-header { color: #059669; font-size: 18px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; }
    .details-header::before { content: '📋'; margin-right: 10px; font-size: 20px; }
    .detail-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #a7f3d0; }
    .detail-item:last-child { border-bottom: none; }
    .detail-label { color: #047857; font-weight: 500; }
    .detail-value { color: #065f46; font-weight: 600; }
    .next-steps { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 25px; border-radius: 12px; margin: 30px 0; }
    .next-steps-title { color: #92400e; font-size: 18px; font-weight: 600; margin-bottom: 20px; display: flex; align-items: center; }
    .next-steps-title::before { content: '📌'; margin-right: 10px; }
    .step-item { display: flex; align-items: flex-start; margin-bottom: 15px; }
    .step-item:last-child { margin-bottom: 0; }
    .step-number { background: #f59e0b; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
    .step-content { color: #78350f; line-height: 1.6; }
    .step-content strong { color: #92400e; }
    .security-note { background: #ecfdf5; border: 2px dashed #6ee7b7; padding: 20px; border-radius: 10px; text-align: center; color: #047857; }
    .security-note strong { color: #059669; }
    .footer { background: linear-gradient(to right, #f0fdf4, #ecfdf5); padding: 40px; text-align: center; border-top: 2px solid #d1fae5; }
    .footer-title { color: #065f46; font-weight: 600; font-size: 20px; margin-bottom: 15px; }
    .footer-text { color: #047857; margin-bottom: 20px; }
    .contact-info { display: inline-block; background: white; padding: 15px 30px; border-radius: 30px; margin-top: 15px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); border: 2px solid #10b981; }
    .contact-info strong { color: #059669; font-size: 16px; }
    .copyright { margin-top: 20px; color: #6b7280; font-size: 13px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="success-badge">✅</div>
      <div class="header-title">Payment Verified!</div>
      <div class="header-subtitle">Your payment has been successfully processed and verified</div>
    </div>
    
    <div class="content">
      <div class="greeting">Hello <strong>${details.clientName}</strong>,</div>
      <div class="message">
        Great news! Your payment for the freelance contract has been successfully verified and processed through Razorpay. 
        Your funds are now securely held by our platform and will be released to the freelancer once you confirm the work completion.
      </div>

      <div class="payment-card">
        <div class="payment-row">
          <span class="payment-label">💰 Amount Paid</span>
          <span class="payment-value amount">₹${details.amount}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">🆔 Payment ID</span>
          <span class="payment-value id">${details.paymentId}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">📦 Order ID</span>
          <span class="payment-value id">${details.orderId}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">🕐 Payment Date & Time</span>
          <span class="payment-value">${details.date} at ${details.time}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">✅ Status</span>
          <span class="payment-value" style="color: #10b981; font-weight: bold;">VERIFIED & CONFIRMED</span>
        </div>
      </div>

      <div class="contract-details">
        <div class="details-header">Contract Details</div>
        <div class="detail-item">
          <span class="detail-label">Contract ID</span>
          <span class="detail-value">${details.contractId}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Job/Project</span>
          <span class="detail-value">${details.jobTitle}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Freelancer</span>
          <span class="detail-value">${details.freelancerName}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Amount</span>
          <span class="detail-value" style="color: #10b981; font-weight: bold;">₹${details.amount}</span>
        </div>
      </div>

      <div class="next-steps">
        <div class="next-steps-title">What Happens Next?</div>
        <div class="step-item">
          <div class="step-number">1</div>
          <div class="step-content">
            <strong>Freelancer Begins Work:</strong> The freelancer has been notified and will start working on your project immediately.
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">2</div>
          <div class="step-content">
            <strong>Regular Updates:</strong> You'll receive progress updates via email and WhatsApp throughout the project duration.
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">3</div>
          <div class="step-content">
            <strong>Work Completion:</strong> Once the freelancer completes the work, you'll be notified to review and approve it.
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">4</div>
          <div class="step-content">
            <strong>Release Funds:</strong> After verifying the work quality, you can release the funds to the freelancer through our platform.
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">5</div>
          <div class="step-content">
            <strong>Admin Approval:</strong> Our admin team reviews and approves the fund release, ensuring everything is in order.
          </div>
        </div>
        <div class="step-item">
          <div class="step-number">6</div>
          <div class="step-content">
            <strong>Project Complete:</strong> The freelancer receives their payment and the project is marked as complete!
          </div>
        </div>
      </div>

      <div class="security-note">
        <strong>🔒 Security & Safety:</strong> Your payment is protected and held securely by PKC CAG. You have full control over fund release, and you can request a refund if the work is not satisfactory.
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-title">Thank You!</div>
      <div class="footer-text">
        We appreciate your trust in PKC CAG. If you have any questions about your payment or contract, please don't hesitate to reach out.
      </div>
      <div class="contact-info">
        📱 <strong>+91 94815 13621</strong> (WhatsApp Available)
      </div>
      <div class="copyright">
        © 2024 PKC CAG • All Rights Reserved<br>
        Payment processed by Razorpay (PCI-DSS Compliant)
      </div>
    </div>
  </div>
</body>
</html>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment verification email sent to:', email);
  } catch (error) {
    console.error('❌ Payment Verification Email failed:', error);
  }
};

// ======================================================
// 🎉 SEND PAYMENT SENT NOTIFICATION EMAIL
// ======================================================
exports.sendPaymentSentEmail = async (email, paymentDetails) => {
  const { freelancerName, amount, transactionId, notes } = paymentDetails;
  
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💰 Payment Received! ₹${amount} - PKC CAG`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 40px 30px; text-align: center; position: relative; }
          .header::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #4CAF50, #45a049, #4CAF50); }
          .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 10px; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
          .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 50px 40px; }
          .greeting { font-size: 24px; color: #2d3748; margin-bottom: 20px; }
          .greeting strong { color: #4CAF50; }
          .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .amount-box { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3); position: relative; overflow: hidden; }
          .amount-box::before { content: '💰'; position: absolute; top: 10px; right: 20px; font-size: 50px; opacity: 0.2; }
          .amount-label { color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
          .amount-value { color: white; font-size: 48px; font-weight: bold; display: block; margin-bottom: 15px; }
          .transaction-id { background: white; color: #4CAF50; font-size: 14px; padding: 10px; border-radius: 8px; display: inline-block; font-family: 'Courier New', monospace; word-break: break-all; }
          .details-box { background: #f0f7f4; border-left: 4px solid #4CAF50; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .detail-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d4edda; font-size: 15px; }
          .detail-item:last-child { border-bottom: none; }
          .detail-label { color: #4a5568; font-weight: 600; }
          .detail-value { color: #2d3748; }
          .notes-box { background: #fff8e1; border-left: 4px solid #FFC107; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .notes-title { color: #FF6F00; font-weight: 600; margin-bottom: 8px; }
          .notes-text { color: #666; line-height: 1.5; }
          .next-steps { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 25px 0; }
          .next-steps-title { color: #2d3748; font-weight: 600; margin-bottom: 15px; }
          .steps { list-style: none; }
          .steps li { padding: 8px 0; color: #4a5568; display: flex; align-items: center; }
          .steps li::before { content: '✓'; color: #4CAF50; font-weight: bold; margin-right: 10px; font-size: 18px; }
          .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
          .footer-title { color: #2d3748; font-weight: 600; margin-bottom: 10px; }
          .contact-info { color: #4a5568; margin: 10px 0; }
          .support-text { color: #718096; font-size: 13px; margin-top: 10px; }
          .copyright { color: #a0aec0; font-size: 12px; margin-top: 15px; }
          .checkmark { color: #4CAF50; font-weight: bold; font-size: 20px; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">✅ PKC CAG</div>
            <div class="header-subtitle">Payment Received Successfully</div>
          </div>

          <div class="content">
            <div class="greeting">Hello <strong>${freelancerName}</strong>,</div>
            
            <div class="message">
              Great news! Your payment has been successfully sent to your registered account. The admin has processed your fund release and transferred the amount to your payment method.
            </div>

            <div class="amount-box">
              <div class="amount-label">💵 Amount Received</div>
              <span class="amount-value">₹${amount}</span>
              <div class="amount-label">Transaction Reference</div>
              <div class="transaction-id">${transactionId}</div>
            </div>

            <div class="details-box">
              <div class="detail-item">
                <span class="detail-label">Payment Status:</span>
                <span class="detail-value" style="color: #4CAF50; font-weight: bold;">✓ Completed</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Received By:</span>
                <span class="detail-value">Your registered payment method</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Platform:</span>
                <span class="detail-value">PKC CAG</span>
              </div>
            </div>

            ${notes ? `
              <div class="notes-box">
                <div class="notes-title">📝 Admin Notes:</div>
                <div class="notes-text">${notes}</div>
              </div>
            ` : ''}

            <div class="next-steps">
              <div class="next-steps-title">📋 What's Next?</div>
              <ul class="steps">
                <li>Check your bank account or UPI app for the transferred amount</li>
                <li>It may take 1-3 business days to appear depending on your bank</li>
                <li>Keep the transaction ID for your records</li>
                <li>You can now submit your next project or apply for more jobs</li>
              </ul>
            </div>

            <div class="message">
              Thank you for your excellent work on the project! We hope to work with you again soon.
            </div>
          </div>

          <div class="footer">
            <div class="footer-title">Need Help?</div>
            <div class="contact-info">
              📱 <strong>+91 94815 13621</strong> (WhatsApp Available)
            </div>
            <div class="support-text">
              If you have any questions about your payment or experience any issues, please reach out to our support team.
            </div>
            <div class="copyright">
              © 2024 PKC CAG • All Rights Reserved
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment sent notification email sent to:', email);
  } catch (error) {
    console.error('❌ Payment Sent Email failed:', error);
  }
};

// ======================================================
// 📝 SEND WORK SUBMISSION EMAIL TO ADMIN
// ======================================================
exports.sendWorkSubmissionEmail = async (adminEmail, workDetails) => {
  const {
    contractId,
    jobTitle,
    clientName,
    freelancerName,
    freelancerEmail,
    workDetails: details,
    amount,
  } = workDetails;

  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `📝 New Work Submission - ${jobTitle} (₹${amount})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f7fafc; padding: 40px 20px; }
          .email-wrapper { max-width: 800px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 10px; }
          .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 40px; }
          .section-title { font-size: 18px; color: #2d3748; font-weight: 600; margin-top: 25px; margin-bottom: 15px; }
          .section-title:first-child { margin-top: 0; }
          .detail-box { background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f59e0b; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #718096; font-weight: 600; }
          .detail-value { color: #2d3748; }
          .work-content { background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          .work-content h5 { color: #d97706; margin-bottom: 10px; font-size: 14px; }
          .work-content p { color: #4a5568; line-height: 1.6; margin: 8px 0; }
          .action-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 20px; 
            font-weight: 600; 
          }
          .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
          .copyright { color: #a0aec0; font-size: 12px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">📝 PKC CAG</div>
            <div class="header-subtitle">New Work Submission Received</div>
          </div>

          <div class="content">
            <p style="color: #2d3748; font-size: 16px; margin-bottom: 20px;">
              A client has submitted work details for a payment. Please review and process.
            </p>

            <div class="section-title">📋 Contract Information</div>
            <div class="detail-box">
              <div class="detail-row">
                <span class="detail-label">Contract ID:</span>
                <span class="detail-value" style="font-family: monospace;">${contractId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Job:</span>
                <span class="detail-value">${jobTitle}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Client:</span>
                <span class="detail-value">${clientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Freelancer:</span>
                <span class="detail-value">${freelancerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Freelancer Email:</span>
                <span class="detail-value">${freelancerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value" style="color: #f59e0b; font-weight: bold;">₹${amount}</span>
              </div>
            </div>

            <div class="section-title">📝 Work Details Submitted</div>
            
            <div class="work-content">
              <h5>Description:</h5>
              <p>${details.description}</p>
            </div>

            <div class="work-content">
              <h5>Deliverables:</h5>
              <p>${details.deliverables}</p>
            </div>

            <div class="work-content">
              <h5>Timeline:</h5>
              <p>${details.timeline}</p>
            </div>

            ${details.additionalNotes ? `
              <div class="work-content">
                <h5>Additional Notes:</h5>
                <p>${details.additionalNotes}</p>
              </div>
            ` : ''}

            ${details.attachmentUrl ? `
              <div class="work-content">
                <h5>Reference/Attachment:</h5>
                <p><a href="${details.attachmentUrl}" target="_blank" style="color: #f59e0b; text-decoration: none;">View Attachment →</a></p>
              </div>
            ` : ''}

            <p style="color: #718096; font-size: 14px; margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 8px;">
              ✅ Next Steps: Review this submission and contact the freelancer about the work scope. Once freelancer completes the work, you can approve and release payment.
            </p>
          </div>

          <div class="footer">
            <p style="margin-bottom: 10px;">
              📌 <strong>Action Required:</strong> Review the submitted work details and contact the freelancer if needed.
            </p>
            <div class="copyright">
              © 2024 PKC CAG • All Rights Reserved
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Work submission email sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Work Submission Email failed:', error);
  }
};

// ======================================================
// 8️⃣ WORK APPROVED EMAIL (To Freelancer)
// ======================================================
exports.sendWorkApprovedEmail = async (freelancerEmail, freelancerName, jobTitle, contractId) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `✅ Your Work Has Been Approved! - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 22px; color: #2d3748; margin-bottom: 15px; }
          .message { color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .success-box { background: #f0fdf4; border-left: 4px solid #51cf66; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .success-box strong { color: #37b24d; }
          .next-steps { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .next-steps h3 { color: #667eea; margin-bottom: 10px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 13px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">✅ APPROVED!</div>
            <p style="color: white; margin-top: 10px;">Your work has been approved</p>
          </div>

          <div class="content">
            <div class="greeting">Hello <strong>${freelancerName}</strong>,</div>

            <div class="message">
              Great news! Your work for <strong>"${jobTitle}"</strong> has been reviewed and <strong>APPROVED by the admin</strong>! 🎉
            </div>

            <div class="success-box">
              <strong>✅ Work Status:</strong> APPROVED<br>
              <strong>📋 Next:</strong> Waiting for client to verify and release payment<br>
              <strong>Contract ID:</strong> ${contractId}
            </div>

            <div class="next-steps">
              <h3>What Happens Next?</h3>
              <ol style="color: #4a5568; margin-left: 20px;">
                <li>Client reviews your work</li>
                <li>Client confirms quality and releases funds</li>
                <li>Admin transfers your payment</li>
                <li>You receive payment in your account</li>
              </ol>
            </div>

            <p style="color: #718096; font-size: 14px; margin-top: 20px;">
              💡 Your work is now ready for client verification. You should receive payment within 2-3 business days after the client confirms.
            </p>
          </div>

          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Work approved email sent to freelancer:', freelancerEmail);
  } catch (error) {
    console.error('❌ Work Approved Email failed:', error);
  }
};

// ======================================================
// 9️⃣ WORK REJECTED EMAIL (To Freelancer)
// ======================================================
exports.sendWorkRejectedEmail = async (freelancerEmail, freelancerName, jobTitle, rejectionNotes, contractId) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `📝 Work Review Feedback - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #ffa94d 0%, #ff922b 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 22px; color: #2d3748; margin-bottom: 15px; }
          .message { color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
          .feedback-box { background: #fffbeb; border-left: 4px solid #ffa94d; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feedback-box strong { color: #ff922b; }
          .revision-steps { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .revision-steps h3 { color: #667eea; margin-bottom: 10px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 13px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">📝 FEEDBACK</div>
            <p style="color: white; margin-top: 10px;">Admin review feedback received</p>
          </div>

          <div class="content">
            <div class="greeting">Hello <strong>${freelancerName}</strong>,</div>

            <div class="message">
              Your work for <strong>"${jobTitle}"</strong> has been reviewed. The admin has some feedback and would like you to make revisions.
            </div>

            <div class="feedback-box">
              <strong>📋 Admin Feedback:</strong><br><br>
              ${rejectionNotes || 'Please review your submission and make improvements based on the job requirements.'}
            </div>

            <div class="revision-steps">
              <h3>How to Proceed</h3>
              <ol style="color: #4a5568; margin-left: 20px;">
                <li>Review the feedback above carefully</li>
                <li>Make the necessary revisions to your work</li>
                <li>Resubmit your updated work</li>
                <li>Admin will review again</li>
              </ol>
            </div>

            <p style="color: #718096; font-size: 14px; margin-top: 20px;">
              💪 Don't worry! Revisions are a normal part of the process. Most freelancers get approval on their second submission.
            </p>
          </div>

          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Work rejected email sent to freelancer:', freelancerEmail);
  } catch (error) {
    console.error('❌ Work Rejected Email failed:', error);
  }
};

// ======================================================
// 🔟 FUND RELEASE REQUEST EMAIL (To Admin)
// ======================================================
exports.sendFundReleaseRequestEmail = async (adminEmail, clientName, freelancerName, jobTitle, amount, contractId, verificationNotes) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `💰 Fund Release Request - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #ffd700 0%, #ffb100 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 36px; font-weight: bold; color: #2d3748; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .request-box { background: linear-gradient(135deg, #ffd700 0%, #ffb100 100%); padding: 25px; border-radius: 12px; margin: 20px 0; color: white; }
          .amount { font-size: 42px; font-weight: bold; margin: 15px 0; }
          .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .details-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
          .details-table .label { background: #f7fafc; font-weight: 600; color: #2d3748; width: 30%; }
          .details-table .value { color: #4a5568; }
          .verification { background: #f0fdf4; border-left: 4px solid #51cf66; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .action-box { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 13px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">💰 FUND RELEASE REQUEST</div>
            <p style="color: #2d3748; margin-top: 10px;">Action Required: Transfer Funds to Freelancer</p>
          </div>

          <div class="content">
            <p style="color: #2d3748; font-size: 16px; margin-bottom: 15px;">
              The client has verified the work and is requesting fund release to the freelancer.
            </p>

            <div class="request-box">
              <div style="font-size: 14px; opacity: 0.9;">Freelancer Earnings</div>
              <div class="amount">₹${amount.toLocaleString()}</div>
              <div style="font-size: 14px; opacity: 0.9;">Ready for Transfer</div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">Job Title</td>
                <td class="value"><strong>${jobTitle}</strong></td>
              </tr>
              <tr>
                <td class="label">Client</td>
                <td class="value">${clientName}</td>
              </tr>
              <tr>
                <td class="label">Freelancer</td>
                <td class="value">${freelancerName}</td>
              </tr>
              <tr>
                <td class="label">Contract ID</td>
                <td class="value">${contractId}</td>
              </tr>
            </table>

            <div class="verification">
              <strong>✅ Client Verification:</strong><br>
              "${verificationNotes || 'Work quality verified and approved.'}"
            </div>

            <div class="action-box">
              <p style="color: #2d3748; font-weight: 600; margin-bottom: 10px;">Next Steps:</p>
              <ol style="color: #4a5568; text-align: left; display: inline-block; margin-left: 20px;">
                <li>Transfer ₹${amount.toLocaleString()} to the freelancer's payment method</li>
                <li>Login to dashboard and click "Payment Done"</li>
                <li>Close the contract</li>
              </ol>
            </div>

            <p style="color: #718096; font-size: 14px; margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
              ⏱️ <strong>Important:</strong> Transfer funds within 24 hours to maintain high satisfaction ratings.
            </p>
          </div>

          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Fund release request email sent to admin:', adminEmail);
  } catch (error) {
    console.error('❌ Fund Release Request Email failed:', error);
  }
};

// ======================================================
// 1️⃣1️⃣ PAYMENT RECEIVED EMAIL (To Freelancer)
// ======================================================
exports.sendPaymentReceivedEmail = async (freelancerEmail, freelancerName, amount, jobTitle, contractId) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `✅ Payment Received! - ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%); padding: 40px 30px; text-align: center; }
          .logo { font-size: 48px; font-weight: bold; color: white; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .payment-box { background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%); padding: 30px; border-radius: 12px; margin: 20px 0; color: white; text-align: center; }
          .amount { font-size: 48px; font-weight: bold; margin: 15px 0; }
          .details { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #718096; font-size: 14px; }
          .detail-value { color: #2d3748; font-weight: 600; margin-top: 5px; }
          .success-msg { background: #f0fdf4; border-left: 4px solid #51cf66; padding: 15px; border-radius: 8px; margin: 20px 0; color: #065f46; }
          .next-work { background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 13px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">🎉</div>
            <p style="color: white; margin-top: 10px; font-size: 24px; font-weight: 600;">Payment Received!</p>
          </div>

          <div class="content">
            <p style="color: #2d3748; font-size: 16px; margin-bottom: 15px;">
              Hello <strong>${freelancerName}</strong>,
            </p>

            <p style="color: #4a5568; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
              Great news! Your payment for <strong>"${jobTitle}"</strong> has been successfully transferred to your account! 🚀
            </p>

            <div class="payment-box">
              <div style="font-size: 16px; opacity: 0.95;">Amount Received</div>
              <div class="amount">₹${amount.toLocaleString()}</div>
              <div style="font-size: 14px; opacity: 0.95;">Check your bank/UPI account</div>
            </div>

            <div class="details">
              <div class="detail-row">
                <div class="detail-label">Job</div>
                <div class="detail-value">${jobTitle}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Amount</div>
                <div class="detail-value">₹${amount.toLocaleString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Contract ID</div>
                <div class="detail-value">${contractId}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Payment Date</div>
                <div class="detail-value">${new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div class="success-msg">
              ✅ <strong>Payment Confirmed:</strong> Funds have been transferred to your registered payment method. Please allow 1-2 business days for the amount to reflect in your account if transferred via bank.
            </div>

            <div class="next-work">
              <h3 style="color: #667eea; margin-bottom: 10px;">Ready for More Work?</h3>
              <p style="color: #4a5568; margin-bottom: 10px;">
                Great work on completing this job! Your excellent work quality helps us match you with better projects in the future.
              </p>
              <p style="color: #4a5568;">
                Login to your dashboard to browse more available jobs and build your reputation. 🌟
              </p>
            </div>

            <p style="color: #718096; font-size: 13px; margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
              Have questions? Reply to this email or contact our support team anytime. We're here to help!
            </p>
          </div>

          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Payment received email sent to freelancer:', freelancerEmail);
  } catch (error) {
    console.error('❌ Payment Received Email failed:', error);
  }
};

// ======================================================
// NEW USER ACTIVITY EMAIL NOTIFICATIONS
// ======================================================

// 📌 JOB POSTED NOTIFICATION
exports.sendJobPostedEmail = async (freelancerEmail, freelancerName, jobTitle, jobCategory, budget, skills) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `🎯 New Job Posted: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .title { font-size: 20px; color: #2d3748; margin-bottom: 20px; }
          .detail { background: #f7fafc; padding: 15px; border-left: 4px solid #667eea; margin: 10px 0; border-radius: 6px; }
          .label { font-weight: 600; color: #667eea; }
          .value { color: #4a5568; margin-top: 5px; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Job Opportunity</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${freelancerName}</strong>,</p>
            <p>A new job matching your skills has been posted on PKC CAG! Here are the details:</p>
            
            <div class="detail">
              <div class="label">Job Title</div>
              <div class="value">${jobTitle}</div>
            </div>
            <div class="detail">
              <div class="label">Category</div>
              <div class="value">${jobCategory}</div>
            </div>
            <div class="detail">
              <div class="label">Budget</div>
              <div class="value">₹${budget.toLocaleString()}</div>
            </div>
            <div class="detail">
              <div class="label">Required Skills</div>
              <div class="value">${skills.join(', ')}</div>
            </div>
            
            <p style="margin-top: 20px; color: #4a5568;">
              Don't miss this opportunity! Login to your dashboard to view the full job details and submit your application.
            </p>
            
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/marketplace/browse" class="cta-btn">View Job Details</a>
            </center>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Job posted notification sent to:', freelancerEmail);
  } catch (error) {
    console.error('❌ Job posted email failed:', error);
  }
};

// 📋 APPLICATION RECEIVED NOTIFICATION
exports.sendApplicationReceivedEmail = async (clientEmail, clientName, freelancerName, jobTitle, applicationId) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: clientEmail,
    subject: `📋 New Application: ${freelancerName} applied for "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .applicant-card { background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Application Received!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${clientName}</strong>,</p>
            <p>Good news! A freelancer has applied for your job <strong>"${jobTitle}"</strong>.</p>
            
            <div class="applicant-card">
              <strong style="color: #667eea;">Applicant Details:</strong>
              <p style="margin-top: 10px; color: #4a5568;"><strong>${freelancerName}</strong></p>
              <p style="color: #718096; font-size: 14px;">Review their profile and decide if they're the right fit for your project.</p>
            </div>
            
            <p style="color: #4a5568;">
              Respond quickly to secure top talent! The faster you communicate, the more likely you'll find the perfect match.
            </p>
            
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/marketplace/my-jobs" class="cta-btn">Review Applications</a>
            </center>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Application received notification sent to:', clientEmail);
  } catch (error) {
    console.error('❌ Application received email failed:', error);
  }
};

// ✅ APPLICATION ACCEPTED NOTIFICATION
exports.sendApplicationAcceptedEmail = async (freelancerEmail, freelancerName, jobTitle, clientName) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `✅ Congratulations! Your Application for "${jobTitle}" was Accepted!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .success-badge { background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #10b981; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Application Accepted!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${freelancerName}</strong>,</p>
            
            <div class="success-badge">
              <strong style="color: #10b981;">Your application for "${jobTitle}" has been ACCEPTED! 🎊</strong>
            </div>
            
            <p style="color: #4a5568;">
              <strong>${clientName}</strong> has selected you for this project. A contract will be created and you'll receive payment instructions shortly.
            </p>
            
            <p style="color: #4a5568; margin-top: 15px;">
              Next steps:
              <br/>1️⃣ Review the contract details
              <br/>2️⃣ Client makes payment
              <br/>3️⃣ Submit your work
              <br/>4️⃣ Get paid upon completion
            </p>
            
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/marketplace/contracts" class="cta-btn">View Contract</a>
            </center>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Application accepted notification sent to:', freelancerEmail);
  } catch (error) {
    console.error('❌ Application accepted email failed:', error);
  }
};

// ❌ APPLICATION REJECTED NOTIFICATION
exports.sendApplicationRejectedEmail = async (freelancerEmail, freelancerName, jobTitle, reason) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: freelancerEmail,
    subject: `Application Update: "${jobTitle}"`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .feedback { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 Application Update</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${freelancerName}</strong>,</p>
            
            <p style="color: #4a5568;">
              Thank you for your interest in the job <strong>"${jobTitle}"</strong>. Unfortunately, the client has selected another freelancer for this project.
            </p>
            
            ${reason ? `
            <div class="feedback">
              <strong style="color: #d97706;">Feedback:</strong>
              <p style="margin-top: 8px; color: #4a5568;">${reason}</p>
            </div>
            ` : ''}
            
            <p style="color: #4a5568; margin-top: 20px;">
              Don't get discouraged! There are many more opportunities waiting for you. Keep improving your skills and applying to jobs that match your expertise. You've got this! 💪
            </p>
            
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/marketplace/browse" class="cta-btn">Browse More Jobs</a>
            </center>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Application rejected notification sent to:', freelancerEmail);
  } catch (error) {
    console.error('❌ Application rejected email failed:', error);
  }
};

// 💳 CONTRACT CREATED NOTIFICATION
exports.sendContractCreatedEmail = async (email, name, jobTitle, amount, role) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📋 Contract Created: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .info-box { background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Contract Created</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>A new contract has been created for the job <strong>"${jobTitle}"</strong>.</p>
            
            <div class="info-box">
              <strong style="color: #667eea;">Contract Amount:</strong>
              <p style="margin-top: 8px; color: #4a5568; font-size: 20px; font-weight: bold;">₹${amount.toLocaleString()}</p>
            </div>
            
            ${role === 'client' ? `
            <p style="color: #4a5568;">
              You're all set! The freelancer is ready to start. Please proceed with payment to initiate the contract. Once payment is made, the freelancer will begin working on your project.
            </p>
            ` : `
            <p style="color: #4a5568;">
              Once the client makes the payment, you can start working on this project. Be ready to deliver quality work within the agreed timeline!
            </p>
            `}
            
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/marketplace/contracts" class="cta-btn">View Contract</a>
            </center>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Contract created notification sent to:', email);
  } catch (error) {
    console.error('❌ Contract created email failed:', error);
  }
};

// 🎉 CONTRACT COMPLETED NOTIFICATION
exports.sendContractCompletedEmail = async (email, name, jobTitle, amount) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🎉 Contract Completed: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .success-badge { background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Contract Completed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            
            <div class="success-badge">
              <strong style="color: #10b981;">Congratulations! Contract "${jobTitle}" is Complete!</strong>
            </div>
            
            <p style="color: #4a5568;">
              Excellent work! The contract for <strong>"${jobTitle}"</strong> has been successfully completed. Amount earned: <strong>₹${amount.toLocaleString()}</strong>
            </p>
            
            <p style="color: #4a5568; margin-top: 15px;">
              ⭐ Rate each other to help build trust in the community. Great feedback helps future clients find you faster!
            </p>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Contract completed notification sent to:', email);
  } catch (error) {
    console.error('❌ Contract completed email failed:', error);
  }
};

// ⚖️ DISPUTE FILED NOTIFICATION
exports.sendDisputeFiledEmail = async (email, name, jobTitle, reason) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚖️ Dispute Filed: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .dispute-info { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚖️ Dispute Notification</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>A dispute has been filed for the contract <strong>"${jobTitle}"</strong>.</p>
            
            <div class="dispute-info">
              <strong style="color: #d97706;">Reason:</strong>
              <p style="margin-top: 8px; color: #4a5568;">${reason}</p>
            </div>
            
            <p style="color: #4a5568;">
              Our admin team has been notified and will review the dispute within 24 hours. Both parties will be contacted with updates. 
              Please keep all communication professional and provide any supporting evidence if needed.
            </p>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Dispute filed notification sent to:', email);
  } catch (error) {
    console.error('❌ Dispute filed email failed:', error);
  }
};

// ✅ DISPUTE RESOLVED NOTIFICATION
exports.sendDisputeResolvedEmail = async (email, name, jobTitle, resolution) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Dispute Resolved: ${jobTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .resolution { background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Dispute Resolved</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>The dispute for <strong>"${jobTitle}"</strong> has been resolved by our admin team.</p>
            
            <div class="resolution">
              <strong style="color: #10b981;">Resolution:</strong>
              <p style="margin-top: 8px; color: #4a5568;">${resolution}</p>
            </div>
            
            <p style="color: #4a5568;">
              Thank you for your patience. If you have any questions about this resolution, please contact our support team.
            </p>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Dispute resolved notification sent to:', email);
  } catch (error) {
    console.error('❌ Dispute resolved email failed:', error);
  }
};

// 💸 WITHDRAWAL APPROVED NOTIFICATION
exports.sendWithdrawalApprovedEmail = async (email, name, amount) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Withdrawal Approved: ₹${amount.toLocaleString()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .amount-box { background: #d1fae5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #10b981; }
          .amount-value { font-size: 28px; color: #10b981; font-weight: bold; margin-top: 10px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Withdrawal Approved!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Great news! Your withdrawal request has been approved.</p>
            
            <div class="amount-box">
              <strong style="color: #10b981;">Amount Approved</strong>
              <div class="amount-value">₹${amount.toLocaleString()}</div>
            </div>
            
            <p style="color: #4a5568;">
              The funds will be transferred to your registered payment method within 1-2 business days. You'll receive a confirmation once the transfer is complete.
            </p>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Withdrawal approved notification sent to:', email);
  } catch (error) {
    console.error('❌ Withdrawal approved email failed:', error);
  }
};

// ❌ WITHDRAWAL REJECTED NOTIFICATION
exports.sendWithdrawalRejectedEmail = async (email, name, amount, reason) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `❌ Withdrawal Request Rejected`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .reason-box { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Withdrawal Request Rejected</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Unfortunately, your withdrawal request for <strong>₹${amount.toLocaleString()}</strong> has been rejected.</p>
            
            <div class="reason-box">
              <strong style="color: #d97706;">Reason:</strong>
              <p style="margin-top: 8px; color: #4a5568;">${reason}</p>
            </div>
            
            <p style="color: #4a5568;">
              If you believe this is a mistake, please contact our support team with your withdrawal request ID. We're here to help!
            </p>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Withdrawal rejected notification sent to:', email);
  } catch (error) {
    console.error('❌ Withdrawal rejected email failed:', error);
  }
};

// 👤 PROFILE UPDATE NOTIFICATION
exports.sendProfileUpdateEmail = async (email, name) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📝 Profile Updated Successfully`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Profile Updated</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Your profile has been successfully updated! Your changes are now live on PKC CAG.</p>
            
            <p style="color: #4a5568; margin-top: 20px;">
              ✨ A better profile means better job opportunities! Keep your profile up-to-date with your latest skills and experience to attract more clients.
            </p>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Profile update notification sent to:', email);
  } catch (error) {
    console.error('❌ Profile update email failed:', error);
  }
};

// ⭐ MESSAGE RECEIVED NOTIFICATION
exports.sendMessageNotificationEmail = async (email, name, senderName, subject) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💬 New Message from ${senderName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center; }
          .content { padding: 30px; }
          .message-box { background: #f7fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
          .cta-btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
          .footer { background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${name}</strong>,</p>
            <p>You have a new message from <strong>${senderName}</strong>.</p>
            
            <div class="message-box">
              <strong style="color: #667eea;">Subject:</strong>
              <p style="margin-top: 8px; color: #4a5568;">${subject}</p>
            </div>
            
            <p style="color: #4a5568;">
              Reply promptly to maintain good communication and build trust with your clients/freelancers.
            </p>
            
            <center>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/messaging" class="cta-btn">View Message</a>
            </center>
          </div>
          <div class="footer">
            © 2025 PKC CAG • All Rights Reserved
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Message notification sent to:', email);
  } catch (error) {
    console.error('❌ Message notification email failed:', error);
  }
};

// ======================================================
// 🔐 SEND PASSWORD RESET EMAIL (with temporary password)
// ======================================================
exports.sendPasswordResetEmail = async (email, name, temporaryPassword) => {
  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset - PKC CAG",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; }
          .email-wrapper { max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; position: relative; }
          .header::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #f093fb, #f5576c, #f093fb); }
          .logo { font-size: 36px; font-weight: bold; color: white; margin-bottom: 10px; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
          .header-subtitle { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 50px 40px; }
          .greeting { font-size: 24px; color: #2d3748; margin-bottom: 20px; }
          .greeting strong { color: #f5576c; }
          .message { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .password-container { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0; box-shadow: 0 10px 30px rgba(245, 87, 108, 0.3); position: relative; overflow: hidden; }
          .password-container::before { content: '🔑'; position: absolute; top: 10px; right: 20px; font-size: 40px; opacity: 0.2; }
          .password-label { color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; }
          .password-code { background: white; color: #f5576c; font-size: 36px; font-weight: bold; padding: 20px; border-radius: 12px; letter-spacing: 6px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.1); font-family: 'Courier New', monospace; word-break: break-all; }
          .next-steps { color: #2d3748; background: #f7fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #f5576c; }
          .next-steps h3 { color: #f5576c; margin-bottom: 15px; font-size: 16px; }
          .next-steps ol { padding-left: 20px; }
          .next-steps li { color: #4a5568; font-size: 14px; line-height: 1.8; margin: 10px 0; }
          .security-note { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 10px; margin-top: 30px; font-size: 13px; color: #856404; }
          .security-note strong { color: #cc5200; }
          .footer { background: #f7fafc; padding: 30px; text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; }
          .footer-title { color: #2d3748; font-weight: 600; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header">
            <div class="logo">🔐 PKC CAG</div>
            <div class="header-subtitle">Password Reset</div>
          </div>
          
          <div class="content">
            <div class="greeting">Hello <strong>${name}</strong>,</div>
            <div class="message">
              We received a request to reset your password. Your temporary password has been generated below. Use this to log in, then change it to a new password of your choice in your profile.
            </div>
            
            <div class="password-container">
              <div class="password-label">Your Temporary Password</div>
              <div class="password-code">${temporaryPassword}</div>
            </div>
            
            <div class="next-steps">
              <h3>📋 Next Steps:</h3>
              <ol>
                <li><strong>Log In:</strong> Use this temporary password to log into your account at ${process.env.CLIENT_URL || 'https://pkccag.com'}</li>
                <li><strong>Go to Profile:</strong> Click on your profile in the top right corner</li>
                <li><strong>Change Password:</strong> Go to "Security & Data" tab and click "Change Password"</li>
                <li><strong>Enter New Password:</strong> Enter your current temporary password and your new password</li>
                <li><strong>Save:</strong> Click "Change Password" button</li>
              </ol>
            </div>
            
            <div class="security-note">
              <strong>🔐 Security Reminder:</strong> 
              <ul style="margin-top: 10px; margin-left: 20px;">
                <li>Never share this password with anyone</li>
                <li>Change this password immediately after logging in</li>
                <li>If you didn't request this reset, your account may be compromised. Change your password immediately</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-title">Need Help?</div>
            <div>Contact us at <strong>${process.env.EMAIL_USER}</strong></div>
            <div style="margin-top: 15px; color: #a0aec0; font-size: 12px;">
              © 2024 PKC CAG. All Rights Reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Password reset email failed:', error);
    return { success: false, error: error.message };
  }
};

// ======================================================
// 🎲 GENERATE RANDOM TEMPORARY PASSWORD
// ======================================================
exports.generateTemporaryPassword = () => {
  const length = 12;
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  
  // Ensure at least one uppercase, one lowercase, one number, one special char
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
  password += '0123456789'[Math.floor(Math.random() * 10)];
  password += '!@#$%'[Math.floor(Math.random() * 5)];
  
  // Fill remaining characters
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// ======================================================
// E-BOOK DELIVERY EMAIL
// ======================================================
exports.sendEbookDeliveryEmail = async (email, name, ebook, purchaseId) => {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">📚 Your E-Book is Ready!</h1>
        </div>

        <!-- Body -->
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for purchasing <strong>${ebook.title}</strong>! 🎉
          </p>

          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Your e-book PDF is attached to this email. Please download and save it for your records.
          </p>

          <!-- Book Details -->
          <div style="background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #667eea; margin-top: 0;">📖 E-Book Details</h3>
            <table style="width: 100%; font-size: 14px; color: #555;">
              <tr>
                <td style="padding: 8px; font-weight: bold;">Title:</td>
                <td style="padding: 8px;">${ebook.title}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 8px; font-weight: bold;">Author:</td>
                <td style="padding: 8px;">${ebook.author || 'Admin'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Category:</td>
                <td style="padding: 8px;">${ebook.category}</td>
              </tr>
              <tr style="background: #f5f5f5;">
                <td style="padding: 8px; font-weight: bold;">Pages:</td>
                <td style="padding: 8px;">${ebook.pages || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Language:</td>
                <td style="padding: 8px;">${ebook.language || 'English'}</td>
              </tr>
            </table>
          </div>

          <!-- Alternative Download Link -->
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            <strong>Access your e-book anytime:</strong> You can also download it from your library:
          </p>
          <p style="font-size: 14px;">
            <a href="${process.env.FRONTEND_URL}/my-ebooks" style="color: #667eea; text-decoration: none;">Visit My E-Books Library</a>
          </p>

          <!-- Important Info -->
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>⚠️ Important:</strong> This e-book is for personal use only. Sharing or redistributing this content is prohibited.
            </p>
          </div>

          <!-- Support -->
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #333; color: white; text-align: center; padding: 20px; font-size: 12px; border-radius: 0;">
          <p style="margin: 0;">© 2025 PKC CAG. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Thank you for supporting us! 🙏</p>
        </div>
      </div>
    `;

    // Prepare PDF attachment from uploaded file
    const attachments = [];
    if (ebook.pdfFile) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        // Construct full path to the PDF file
        const pdfPath = path.join(__dirname, '..', ebook.pdfFile);
        
        console.log('📂 Looking for PDF at:', pdfPath);
        
        if (fs.existsSync(pdfPath)) {
          const pdfBuffer = fs.readFileSync(pdfPath);
          attachments.push({
            filename: `${ebook.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          });
          console.log('✅ PDF file attached to email from:', pdfPath);
        } else {
          console.warn('⚠️ PDF file not found at:', pdfPath);
          console.warn('   Note: File path in DB:', ebook.pdfFile);
        }
      } catch (err) {
        console.warn('⚠️ Could not attach PDF:', err.message);
        // Continue sending email without attachment
      }
    } else {
      console.warn('⚠️ No PDF file found in ebook object');
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `📚 Your E-Book: "${ebook.title}" is Ready!`,
      html: htmlContent,
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ E-Book delivery email sent to:', email, attachments.length > 0 ? '✅ with PDF' : '(no attachment)');
  } catch (err) {
    console.error('❌ E-Book email error:', err);
    throw err;
  }
};

transporter.verify((err, success) => {
  console.log("SMTP TEST:", err || "SMTP Connected");
});

// ======================================================
// GENERIC SEND EMAIL WITH ATTACHMENT SUPPORT
// ======================================================
exports.sendEmail = async (emailData) => {
  const { email, subject, html, attachments } = emailData;

  // Validate email configuration
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const errorMsg = "Email credentials not configured on server (EMAIL_USER or EMAIL_PASS missing)";
    console.error("❌", errorMsg);
    throw new Error(errorMsg);
  }

  const mailOptions = {
    from: `PKC CAG <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: html,
    attachments: attachments || undefined,
  };

  try {
    console.log(`📧 Sending email to: ${email} | Subject: ${subject}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${email} | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email sending failed for ${email}:`, error.message);
    throw error;
  }
};