import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>

        <p className="text-gray-600 leading-7 mb-6">
          The page you are looking for does not exist or may have been moved.
          Please return to the homepage to continue browsing the marketplace.
        </p>

        <Link
          to="/"
          className="btn btn-primary px-6 py-3 rounded-xl font-semibold inline-block shadow-sm hover:opacity-90 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;