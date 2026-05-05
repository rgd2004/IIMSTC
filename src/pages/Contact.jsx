import React from "react";
import { Link } from "react-router-dom";

const Contact = () => {
  return (
      <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">
          <p className="text-gray-700 leading-7">
            For seller registration, order support, payment help, account
            assistance, or any platform-related queries, please contact our
            support team using the details below.
          </p>

          <div className="border rounded-lg p-6 space-y-3">
            <p><span className="font-semibold">Email:</span> support@vivid.com</p>
            <p><span className="font-semibold">Phone:</span> +91 98765 43210</p>
            <p><span className="font-semibold">Location:</span> Bengaluru, Karnataka, India</p>
          </div>

          <p className="text-gray-600 leading-7">
            Please send your queries directly to the above email address. Our
            team will review your request and respond as soon as possible.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Link
              to="/"
              className="btn btn-primary px-6 py-3 rounded-xl font-semibold inline-block shadow-sm hover:opacity-90 transition"
            >
              Back to Home
            </Link>

            <Link
              to="/"
              className="btn btn-secondary px-6 py-3 rounded-xl font-semibold shadow-sm transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;