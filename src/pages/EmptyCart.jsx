import React from "react";
import { Link } from "react-router-dom";

const EmptyCart = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>

        <p className="text-gray-600 leading-7 mb-6">
          You haven’t added any handmade products yet. Explore the marketplace
          and discover unique creations crafted by talented local artisans.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/"
            className="btn btn-primary px-6 py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition"
          >
            Browse Products
          </Link>

          <Link
            to="/"
            className="btn btn-secondary px-6 py-3 rounded-xl font-semibold shadow-sm transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;