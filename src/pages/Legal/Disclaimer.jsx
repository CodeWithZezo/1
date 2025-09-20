import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Disclaimer = () => {
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
          Disclaimer
        </motion.h1>

        {/* Intro */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed text-center max-w-3xl mx-auto">
          The information, tools, and resources provided on this platform are
          intended for **educational and informational purposes only**. They are
          not a substitute for professional medical advice, diagnosis, or
          treatment.
        </p>

        {/* Sections */}
        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. No Medical Advice
            </h2>
            <p>
              Our calculators, articles, and tools are not intended to replace
              consultation with a licensed healthcare professional. Always seek
              medical advice from your doctor or qualified provider regarding
              any medical condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. Accuracy of Information
            </h2>
            <p>
              While we strive to keep all content accurate and up-to-date, we
              make no guarantees about the completeness, reliability, or
              accuracy of the information. Use at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Limitation of Liability
            </h2>
            <p>
              We are not liable for any outcomes, losses, or damages that may
              occur from the use of our services, including misuse of tools or
              reliance on provided data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. External Links
            </h2>
            <p>
              Our website may contain links to external websites. We are not
              responsible for the content, accuracy, or reliability of any
              third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Consent
            </h2>
            <p>
              By using our website, you hereby consent to this Disclaimer and
              agree to its terms.
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

export default Disclaimer;
