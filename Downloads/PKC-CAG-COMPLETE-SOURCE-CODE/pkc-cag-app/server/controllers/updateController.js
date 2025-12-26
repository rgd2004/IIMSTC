const Update = require("../models/Update");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

/* ADMIN: create update */
exports.createUpdate = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }

    const update = await Update.create({
      title,
      message,
      type,
      createdBy: req.user._id,
    });

    console.log("✅ Update created:", update._id);

    // 📧 SEND EMAIL TO ALL USERS
    try {
      const users = await User.find({ isVerified: true }).select("email name").lean();
      
      if (users.length > 0) {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
              .header h2 { margin: 0; font-size: 24px; }
              .content { padding: 30px; }
              .message-box { background: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .message-box h3 { margin-top: 0; color: #667eea; }
              .message-box p { margin: 10px 0; color: #374151; line-height: 1.6; }
              .footer { background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>📢 New Update from PKC CAG</h2>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>We have a new update for you!</p>
                <div class="message-box">
                  <h3>${title}</h3>
                  <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                <p>Stay updated with the latest news and announcements. Login to your dashboard to see more details.</p>
                <center>
                  <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/updates" class="cta-button">View All Updates</a>
                </center>
              </div>
              <div class="footer">
                <p>© 2025 PKC CAG • All Rights Reserved</p>
                <p>You received this email because you're a member of PKC CAG</p>
              </div>
            </div>
          </body>
          </html>
        `;

        // Send emails in batches
        const batchSize = 50;
        for (let i = 0; i < users.length; i += batchSize) {
          const batch = users.slice(i, i + batchSize);
          const emailPromises = batch.map(user =>
            sendEmail({
              email: user.email,
              subject: `📢 ${title} - PKC CAG Update`,
              html: emailHtml,
            }).catch(err => {
              console.error(`⚠️ Failed to send email to ${user.email}:`, err.message);
            })
          );

          await Promise.all(emailPromises);
          console.log(`✅ Sent update emails to ${Math.min(batchSize, users.length - i)} users`);
        }

        console.log(`✅ Update notification emails sent to ${users.length} users`);
      } else {
        console.warn("⚠️ No verified users found to send update emails");
      }
    } catch (emailErr) {
      console.error("⚠️ Error sending update notification emails:", emailErr.message);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: "Update posted successfully",
      update,
    });
  } catch (err) {
    console.error("createUpdate error:", err);
    const status = err.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({
      success: false,
      message: err.message || "Failed to create update",
    });
  }
};

/* USER: get all updates */
exports.getUpdates = async (req, res) => {
  try {
    const updates = await Update.find()
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      updates,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load updates",
    });
  }
};

/* ADMIN: get all updates (no limit) */
exports.getAdminUpdates = async (req, res) => {
  try {
    const updates = await Update.find()
      .sort({ createdAt: -1 });

    res.json({ success: true, updates });
  } catch (err) {
    console.error('getAdminUpdates error:', err);
    res.status(500).json({ success: false, message: 'Failed to load updates' });
  }
};

/* ADMIN: delete an update by id */
exports.deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    console.debug('deleteUpdate called by user:', req.user?._id, 'isAdmin:', req.user?.isAdmin, 'targetId:', id);
    const upd = await Update.findById(id);
    if (!upd) return res.status(404).json({ success: false, message: 'Update not found' });

    await Update.deleteOne({ _id: id });
    res.json({ success: true, message: 'Update deleted' });
  } catch (err) {
    console.error('deleteUpdate error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to delete update' });
  }
};
