// =============================
// Footer.jsx
// Path: src/components/Footer.jsx
// =============================

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-3">VIVID Marketplace</h2>
          <p className="text-sm text-gray-300 leading-6">
            Supporting local artisans by connecting handmade creators directly
            with customers through a trusted digital marketplace.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>Home</li>
            <li>About</li>
            <li>FAQ</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <p className="text-sm text-gray-300">Email: support@vivid.com</p>
          <p className="text-sm text-gray-300">Phone: +91 98765 43210</p>
          <p className="text-sm text-gray-300">Bengaluru, Karnataka, India</p>
        </div>
      </div>

      <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-400">
        © 2026 VIVID Marketplace | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;