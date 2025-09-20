import React from "react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "1. Introduction",
      content:
        "This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform. By accessing our services, you agree to the practices described in this policy.",
    },
    {
      title: "2. Information We Collect",
      content:
        "We may collect personal details (such as name, email, phone number), technical information (like IP address, browser type, device details), and usage data to enhance your experience.",
    },
    {
      title: "3. How We Use Your Information",
      content:
        "Your information is used to provide and improve our services, process transactions, personalize user experience, ensure security, and comply with legal obligations.",
    },
    {
      title: "4. Cookies & Tracking Technologies",
      content:
        "We use cookies, web beacons, and similar technologies to improve functionality, analyze site traffic, and tailor content. You can control cookies through your browser settings.",
    },
    {
      title: "5. Data Security",
      content:
        "We implement industry-standard encryption, firewalls, and secure servers to protect your data. However, no method of transmission over the Internet is 100% secure.",
    },
    {
      title: "6. Sharing of Information",
      content:
        "We do not sell your personal data. Information may be shared with trusted third parties (such as payment processors or analytics providers) strictly for service delivery.",
    },
    {
      title: "7. Your Rights",
      content:
        "You have the right to access, update, or delete your personal information. You may also opt-out of marketing communications at any time.",
    },
    {
      title: "8. Third-Party Services",
      content:
        "Our platform may include links to third-party sites. We are not responsible for their privacy practices, and we encourage you to review their policies.",
    },
    {
      title: "9. Changes to This Policy",
      content:
        "We may update this Privacy Policy from time to time. All changes will be posted here with an updated revision date.",
    },
    {
      title: "10. Contact Us",
      content:
        "If you have any questions or concerns about this Privacy Policy, please reach out via our Contact Page.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-6 md:px-20 lg:px-40">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl p-10 border border-gray-200"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Privacy Policy
        </h1>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          We are committed to safeguarding your privacy and ensuring that your personal information is protected. Please read this policy carefully.
        </p>
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border-l-4 border-blue-500 pl-6"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">{section.content}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <a
            href="/contact"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium px-8 py-3 rounded-xl shadow-md transition"
          >
            Contact Us
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;