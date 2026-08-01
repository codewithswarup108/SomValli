import React from 'react';
import { Link } from 'react-router-dom';

const Policy: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream text-primary font-poppins">
      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-playfair font-black text-primary mb-4">Our Policy</h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            This page displays SomValli Foods' official policy statement exactly as requested by the client.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <img
            src="/images/policy.jpg"
            alt="SomValli Foods Policy Statement"
            className="w-full object-cover"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-xs">
            If the policy image does not appear, please place the exact approved policy image file at <span className="font-mono">/frontend/public/images/policy.jpg</span>.
          </p>
          <Link
            to="/"
            className="inline-block mt-6 bg-primary text-cream px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-accent transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Policy;
