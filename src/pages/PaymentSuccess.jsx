import React from "react";
import { Link } from "react-router-dom";

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white shadow-md rounded-xl p-8 max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Payment Successful</h1>

        <p className="text-gray-600 leading-7 mb-6">
          Your order has been placed successfully. Thank you for supporting
          local artisans and choosing authentic handmade products.
        </p>

        <div className="border rounded-lg p-4 mb-6 text-left">
          <p><span className="font-semibold">Order Status:</span> Confirmed</p>
          <p><span className="font-semibold">Payment:</span> Completed</p>
          <p><span className="font-semibold">Delivery:</span> Processing</p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            to="/"
            className="btn btn-primary px-6 py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition"
          >
            Continue Shopping
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
  );
};

export default PaymentSuccess;
