// scripts/seedServices.js
require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../server/models/Service');

// Load from .env
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGODB_URI missing in .env');
  process.exit(1);
}

// ALL SERVICES
const services = [
  // INSTAGRAM
  { name: "Instagram Followers (Non-Drop Premium)", slug: "instagram-followers-nondrop-premium", pricePer1000: 450, category: "instagram", description: "High-quality non-drop Instagram followers with premium retention.", icon: "fab fa-instagram", features: ["Non-drop", "Premium"], deliveryTime: "24-72 hours", isActive: true },
  { name: "Instagram Likes (Non-Drop Premium)", slug: "instagram-likes-nondrop-premium", pricePer1000: 120, category: "instagram", description: "Premium non-drop Instagram likes.", icon: "fas fa-heart", features: ["Premium likes"], isActive: true },
  { name: "Instagram Views (Reels/Video)", slug: "instagram-views-reels-premium", pricePer1000: 20, category: "instagram", description: "Premium reel/video views.", icon: "fas fa-eye", features: ["High retention"], isActive: true },
  { name: "Instagram Story Views", slug: "instagram-story-views-premium", pricePer1000: 80, category: "instagram", description: "Premium non-drop story views.", icon: "fas fa-book-open", features: ["Story views"], isActive: true },
  { name: "Instagram Comments (Custom)", slug: "instagram-comments-premium", pricePer1000: 700, category: "instagram", description: "Custom Instagram comments.", icon: "far fa-comment", features: ["Custom text"], isActive: true },
  { name: "Instagram Saves", slug: "instagram-saves-premium", pricePer1000: 120, category: "instagram", icon: "fas fa-bookmark", isActive: true },
  { name: "Instagram Profile Visits", slug: "instagram-profile-visits-premium", pricePer1000: 120, category: "instagram", icon: "fas fa-user", isActive: true },
  { name: "Instagram Impressions / Reach", slug: "instagram-impressions-premium", pricePer1000: 50, category: "instagram", icon: "fas fa-bullhorn", isActive: true },
  { name: "Instagram Live Views", slug: "instagram-live-views-premium", pricePer1000: 200, category: "instagram", icon: "fas fa-video", isActive: true },
  { name: "Instagram Live Comments", slug: "instagram-live-comments-premium", pricePer1000: 500, category: "instagram", icon: "fas fa-comments", isActive: true },

  // FACEBOOK
  { name: "Facebook Page Likes", slug: "facebook-page-likes-premium", pricePer1000: 600, category: "facebook", icon: "fab fa-facebook", isActive: true },
  { name: "Facebook Post Likes", slug: "facebook-post-likes-premium", pricePer1000: 200, category: "facebook", icon: "fas fa-thumbs-up", isActive: true },
  { name: "Facebook Followers", slug: "facebook-followers-premium", pricePer1000: 550, category: "facebook", icon: "fas fa-users", isActive: true },
  { name: "Facebook Views", slug: "facebook-video-views-premium", pricePer1000: 30, category: "facebook", icon: "fas fa-play", isActive: true },
  { name: "Facebook Comments", slug: "facebook-comments-custom", pricePer1000: 800, category: "facebook", icon: "far fa-comment-dots", isActive: true },

  // YOUTUBE
  { name: "YouTube Views", slug: "youtube-views-premium", pricePer1000: 400, category: "youtube", icon: "fab fa-youtube", isActive: true },
  { name: "YouTube Subscribers", slug: "youtube-subscribers-nondrop", pricePer1000: 1200, category: "youtube", icon: "fas fa-user-plus", isActive: true },
  { name: "YouTube Likes", slug: "youtube-likes-premium", pricePer1000: 300, category: "youtube", icon: "fas fa-thumbs-up", isActive: true },
  { name: "YouTube Watch Time", slug: "youtube-watch-time", pricePer1000: 100, category: "youtube", icon: "fas fa-clock", isActive: true },
  { name: "YouTube Comments", slug: "youtube-comments-custom", pricePer1000: 1000, category: "youtube", icon: "far fa-comment", isActive: true },

  // TWITTER
  { name: "Twitter Followers", slug: "twitter-followers-nondrop", pricePer1000: 700, category: "twitter", icon: "fab fa-twitter", isActive: true },
  { name: "Twitter Likes", slug: "twitter-likes", pricePer1000: 300, category: "twitter", icon: "fas fa-heart", isActive: true },
  { name: "Twitter Retweets", slug: "twitter-retweets", pricePer1000: 400, category: "twitter", icon: "fas fa-retweet", isActive: true },
  { name: "Twitter Views", slug: "twitter-views", pricePer1000: 50, category: "twitter", icon: "fas fa-eye", isActive: true },

  // TELEGRAM
  { name: "Telegram Channel Members", slug: "telegram-channel-members", pricePer1000: 500, category: "telegram", icon: "fab fa-telegram", isActive: true },
  { name: "Telegram Group Members", slug: "telegram-group-members", pricePer1000: 550, category: "telegram", icon: "fas fa-users", isActive: true },
  { name: "Telegram Post Views", slug: "telegram-post-views", pricePer1000: 30, category: "telegram", icon: "fas fa-eye", isActive: true },
  { name: "Telegram Reactions", slug: "telegram-reactions", pricePer1000: 150, category: "telegram", icon: "fas fa-thumbs-up", isActive: true },

  // GOOGLE REVIEWS
  { name: "Google Review — Indian", slug: "google-review-indian", pricePerUnit: 70, category: "reviews", icon: "fas fa-star", isActive: true },
  { name: "Google Review — International", slug: "google-review-international", pricePerUnit: 120, category: "reviews", icon: "fas fa-globe", isActive: true },
  { name: "Google Review — Keyword Based", slug: "google-review-keyword", pricePerUnit: 150, category: "reviews", icon: "fas fa-search", isActive: true },
  { name: "Google Review — Custom Text", slug: "google-review-custom", pricePerUnit: 0, category: "reviews", icon: "fas fa-pen", isActive: true },

  // GMB
  { name: "GMB Profile Visits", slug: "gmb-profile-visits", pricePerUnit: 3, category: "gmb", icon: "fas fa-eye", isActive: true },
  { name: "GMB Saves", slug: "gmb-saves", pricePerUnit: 5, category: "gmb", icon: "fas fa-bookmark", isActive: true },
  { name: "GMB Ranking Signals", slug: "gmb-ranking-signals", pricePerUnit: 12, category: "gmb", icon: "fas fa-chart-line", isActive: true },
  { name: "GMB Full Setup", slug: "gmb-new-setup-full", pricePerUnit: 9000, category: "gmb", icon: "fas fa-building", isActive: true },

  // WEBSITE & SEO
  { name: "Website Design (5–7 pages)", slug: "website-design", pricePerUnit: 10000, category: "website", icon: "fas fa-laptop-code", isActive: true },
  { name: "SEO Services (Monthly)", slug: "seo-services", pricePerUnit: 7000, category: "seo", icon: "fas fa-search", isActive: true }
];

async function seed() {
  try {
    console.log("📌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected!");

    // First, clear any services with null serviceId to prevent duplicate key errors
    try {
      await Service.deleteMany({ serviceId: null });
      console.log("🧹 Cleaned up null serviceIds");
    } catch (err) {
      console.log("⚠️  No null serviceIds to clean");
    }

    let serviceIdCounter = 1001; // Start from 1001

    for (const svc of services) {
      // AUTO-CONVERT pricePer1000 → unitPrice
      if (svc.pricePer1000) {
        svc.unitPrice = svc.pricePer1000 / 1000;
      }

      // Generate serviceId if not present
      if (!svc.serviceId) {
        svc.serviceId = serviceIdCounter.toString();
        serviceIdCounter++;
      }

      try {
        await Service.updateOne(
          { slug: svc.slug },
          { $set: svc },
          { upsert: true }
        );
        console.log(`✔ Updated: ${svc.slug} (ID: ${svc.serviceId})`);
      } catch (err) {
        if (err.code === 11000) {
          console.log(`⚠️  Duplicate serviceId for ${svc.slug}, skipping...`);
        } else {
          throw err;
        }
      }
    }

    console.log("🎉 Seed completed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
}

seed();
