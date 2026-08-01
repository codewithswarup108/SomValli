import React from 'react';
import { Link } from 'react-router-dom';

const Policy: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-cream text-primary font-poppins">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-playfair font-black text-primary mb-4">Our Policy</h1>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            SomValli Foods' official policy statement is shown below. The exact statement is preserved in the text content.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 space-y-10">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-700 font-bold">SOMVALLI FOODS</p>
            <h2 className="text-4xl md:text-5xl font-playfair font-black text-primary mt-4">Quality, Purity, and Trust Policy Statement</h2>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-primary">1. Our Commitment</h3>
              <p>
                In today’s highly competitive market, many food products are often sold with compromises in quality and purity in the pursuit of higher profits. Unfortunately, such practices can have a significant impact on consumers’ health. At SomValli Foods, our mission is to provide customers with healthy, pure, and premium-quality products. We firmly believe that “Good health is one of life’s greatest assets.”
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-primary">2. Our Core Pillars</h3>
              <p>We place the highest priority on the following three principles in every product we offer:</p>
              <ul className="space-y-3 pl-5 list-disc">
                <li><strong>Absolute Purity:</strong> Products completely free from any adulteration, contamination, or harmful elements.</li>
                <li><strong>Premium Quality:</strong> Strict adherence to high-quality standards at every stage, from raw materials to the final product.</li>
                <li><strong>Exceptional Taste &amp; Health:</strong> Delivering delicious products that promote better health and complete customer satisfaction.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-xl font-bold text-primary">3. Customer Satisfaction &amp; Responsibility</h3>
              <p>
                We warmly welcome all our valued customers and assure you that SomValli Foods is deeply committed to providing healthy, trustworthy, and premium-quality products. You can enjoy and use every product of ours with absolute confidence and peace of mind.
              </p>
            </section>

            <div className="text-center py-6 px-5 bg-amber-50 rounded-3xl border border-amber-200">
              <p className="text-2xl font-playfair font-black text-primary">“Your Trust, Our Responsibility.”</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-4 font-bold">Contact &amp; Manufacturing Details</p>
                <p className="text-sm text-gray-700"><strong>Company Name:</strong> SomValli Foods</p>
                <p className="text-sm text-gray-700"><strong>Registered Address:</strong> Cherpoli, Tal. Shahapur – 421601, Dist. Thane, Maharashtra, India.</p>
                <p className="text-sm text-gray-700"><strong>Helpline No.:</strong> +91 6307048821</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-700 mb-3"><strong>Authorized Signatory</strong></p>
                <p className="text-sm text-gray-600">SomValli Foods</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
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
