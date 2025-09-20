"use client";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail } from "lucide-react";

const Footer = () => {
  // All data in one place
  const footerInfo = {
    brand: {
      name: "MedCalc Pro",
      desc: "Evidence-based medical dose calculators trusted by healthcare professionals worldwide. Safe, accurate, and easy-to-use tools for better patient care.",
    },
    social: [
      { name: "LinkedIn", icon: Linkedin, link: "https://linkedin.com" },
      { name: "Twitter", icon: Twitter, link: "https://twitter.com" },
      { name: "Email", icon: Mail, link: "mailto:info@medcalcpro.com" },
    ],
  };

  const footerLinks = {
    quick: [
      { name: "Home", path: "/" },
      { name: "All Calculators", path: "/calculators" },
      { name: "About", path: "/about" },
      { name: "FAQS", path: '/faqs' },
      { name: "Contact", path: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Disclaimer", path: "/disclaimer" },
      { name: "Cookie Policy", path: "/cookies" },
    ],
  };

  const footerDisclaimer = {
    title: "Important Medical Disclaimer",
    text: "These calculators are for professional reference only. Always verify doses with your local guidelines and use clinical judgment. Not intended to replace professional medical advice, diagnosis, or treatment.",
  };

  return (
    <footer className="bg-gray-50 text-gray-800 mt-16 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-black text-white font-bold">
              M
            </span>
            {footerInfo.brand.name}
          </h2>
          <p className="mt-3 text-sm text-gray-600">{footerInfo.brand.desc}</p>

          <div className="flex space-x-4 mt-4">
            {footerInfo.social.map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="hover:text-blue-600 transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                <item.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-md font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            {footerLinks.quick.map((link, i) => (
              <li key={i}>
                <a
                  href={link.path}
                  className="hover:text-blue-600 transition"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Legal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-md font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            {footerLinks.legal.map((link, i) => (
              <li key={i}>
                <a
                  href={link.path}
                  className="hover:text-blue-600 transition"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Disclaimer */}
      <motion.div
        className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md mx-6 my-6 p-4 flex items-start gap-3 text-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <span className="text-yellow-600 font-bold text-lg">⚠</span>
        <div>
          <h4 className="font-semibold">{footerDisclaimer.title}</h4>
          <p>{footerDisclaimer.text}</p>
        </div>
      </motion.div>

      {/* Bottom Bar */}
      <div className="text-center text-xs text-gray-500 pb-6">
        © {new Date().getFullYear()} MedCalc Pro. All rights reserved. Built with care for healthcare professionals.
      </div>
      <div className="text-center text-xs text-gray-500 pb-6">
        Made By CodeWithZezo ❤
      </div>
    </footer>
  );
};

export default Footer;
