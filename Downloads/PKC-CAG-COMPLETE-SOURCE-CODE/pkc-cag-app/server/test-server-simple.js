// SIMPLE TEST SERVER to diagnose issues
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  console.log("✅ Health check hit");
  res.json({ success: true, message: "Server is alive" });
});

app.post("/api/test", (req, res) => {
  console.log("📨 Test endpoint hit");
  res.json({ success: true, message: "Test OK", email: process.env.EMAIL_USER });
});

const PORT = 8888;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Test server running on http://127.0.0.1:${PORT}`);
  console.log("✅ EMAIL_USER:", process.env.EMAIL_USER ? "SET" : "NOT SET");
  console.log("✅ EMAIL_PASS:", process.env.EMAIL_PASS ? "SET (length: " + process.env.EMAIL_PASS.length + ")" : "NOT SET");
});

server.on("error", (err) => {
  console.error("❌ Server error:", err);
  process.exit(1);
});

server.on("listening", () => {
  console.log("✅ Server is now actively listening on all interfaces");
  console.log("✅ Server address:", server.address());
});
