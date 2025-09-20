import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
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
          Cookie Policy
        </motion.h1>

        {/* Intro */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed text-center max-w-3xl mx-auto">
          This Cookie Policy explains how we use cookies and similar tracking
          technologies to improve your browsing experience, personalize content,
          analyze traffic, and deliver relevant services.
        </p>

        {/* Sections */}
        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your device when you visit
              a website. They help websites function effectively, remember your
              preferences, and enhance overall user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. Types of Cookies We Use
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Required for the website to
                function properly (e.g., login, security, form submissions).
              </li>
              <li>
                <strong>Performance Cookies:</strong> Collect anonymous data to
                improve website speed, navigation, and responsiveness.
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your settings,
                preferences, and choices for a personalized experience.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how users
                interact with the site, measure visits, and improve services.
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Track browsing habits to
                deliver relevant ads and limit repetitive promotions.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Why We Use Cookies
            </h2>
            <p>
              We use cookies to: (a) provide secure login and account features,
              (b) analyze website traffic and usage, (c) store user preferences,
              (d) improve user experience, and (e) deliver tailored
              advertisements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Third-Party Cookies
            </h2>
            <p>
              We may allow trusted third-party services (e.g., Google Analytics,
              Facebook Pixel) to set cookies that help us analyze usage,
              marketing effectiveness, and improve services. These third parties
              have their own cookie policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Managing and Disabling Cookies
            </h2>
            <p>
              You can manage or disable cookies in your browser settings. Please
              note that disabling cookies may affect the functionality of our
              website and limit certain features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              6. Data Retention
            </h2>
            <p>
              Cookies are stored for varying durations depending on their type.
              Some expire once you close your browser, while others remain until
              manually deleted or automatically expire after a set period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              7. Your Consent
            </h2>
            <p>
              By continuing to use our website, you consent to our use of
              cookies as outlined in this Cookie Policy. If you do not agree,
              please disable cookies via your browser or discontinue using our
              site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              8. Updates to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time to reflect
              changes in technology, regulations, or our practices. Updates will
              be posted on this page with a revised “Last Updated” date.
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

export default CookiePolicy;
