import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-20 px-6">
      <motion.div
        className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Title */}
        <motion.h1
          className="text-5xl font-extrabold text-gray-900 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Terms of Service
        </motion.h1>

        {/* Intro */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed text-center max-w-3xl mx-auto">
          These Terms of Service govern your use of our platform. By accessing
          or using our services, you agree to be bound by the following terms
          and conditions. Please read them carefully.
        </p>

        {/* Sections */}
        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using this platform, you confirm that you
              understand, accept, and agree to these Terms. If you do not agree,
              please discontinue use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. User Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and truthful information when requested.</li>
              <li>Use the platform only for lawful purposes.</li>
              <li>
                Avoid activities that could harm, disrupt, or exploit the
                platform or other users.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Intellectual Property Rights
            </h2>
            <p>
              All content, trademarks, designs, code, and features are owned by
              us or our licensors. Unauthorized reproduction, modification, or
              distribution is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Service Availability
            </h2>
            <p>
              We strive to ensure uninterrupted access to our services but make
              no guarantees of uptime or error-free operation. Scheduled
              maintenance and unforeseen issues may result in temporary outages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Limitation of Liability
            </h2>
            <p>
              We are not liable for any damages, direct or indirect, arising
              from the use or inability to use the platform, including data
              loss, business interruption, or financial loss.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              6. Privacy & Data Protection
            </h2>
            <p>
              Your privacy is important to us. Please refer to our{' '}
              <Link to="/privacy" className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              7. Modifications
            </h2>
            <p>
              We may update these Terms at any time. Any changes will be posted
              on this page with an updated “Last Revised” date. Continued use of
              our services indicates acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              8. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of your jurisdiction. Any
              disputes shall be resolved exclusively in the courts of competent
              jurisdiction.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <Link
            to="/contact"
            className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition font-medium"
          >
            Contact Us
          </Link>
        </div>
      </motion.div>
    </section>
  );
};

export default TermsOfService;