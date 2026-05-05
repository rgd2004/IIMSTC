import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">About Us</h1>

        <div className="bg-white shadow-md rounded-xl p-8 space-y-6">
          <p className="text-gray-700 leading-7">
            VIVID Marketplace is a digital platform built to empower local
            artisans by helping them showcase handmade products to a wider
            audience while connecting directly with customers who value
            authenticity, creativity, and craftsmanship.
          </p>

          <p className="text-gray-700 leading-7">
            We believe every handmade creation tells a story. Our platform
            supports rural creators, preserves traditional art forms, and helps
            small businesses grow through digital opportunities and fair access
            to the marketplace.
          </p>

          <p className="text-gray-700 leading-7">
            From handcrafted decor to traditional fashion and unique lifestyle
            products, we aim to create a trusted ecosystem where artisans grow
            and customers discover meaningful products with real cultural value.
          </p>

          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="border rounded-lg p-5">
              <h2 className="font-semibold mb-2">Our Mission</h2>
              <p className="text-sm text-gray-600">
                Empower artisans through digital commerce and direct customer
                access.
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h2 className="font-semibold mb-2">Our Vision</h2>
              <p className="text-sm text-gray-600">
                Promote handmade products globally while preserving tradition.
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <h2 className="font-semibold mb-2">Our Goal</h2>
              <p className="text-sm text-gray-600">
                Build a trusted artisan-first marketplace for sustainable growth.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 flex-wrap">
            <Link
              to="/contact"
              className="btn btn-primary px-6 py-3 rounded-xl font-semibold shadow-sm hover:opacity-90 transition"
            >
              Contact Us
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
    </div>
    
  );
};

export default About;
