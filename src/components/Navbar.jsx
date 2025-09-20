import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "All Calculators", path: "/calculators" },
    { name: "About", path: "/about" },
    { name: "FAQS", path: '/faqs' },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="w-full sticky top-0 left-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-blue-600 tracking-wide"
          >
            MedCalc Pro
          </motion.h1>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
            {navItems.map((item, idx) => (
              <motion.li
                key={idx}
                whileHover={{ scale: 1.1, color: "#2563eb" }}
                className={`${
                  location.pathname === item.path
                    ? "text-blue-600 font-semibold"
                    : "hover:text-blue-500"
                } transition-colors`}
              >
                <Link to={item.path}>{item.name}</Link>
              </motion.li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="md:hidden bg-white shadow-md"
          >
            <ul className="flex flex-col space-y-4 py-6 px-6 text-gray-700 font-medium">
              {navItems.map((item, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ scale: 1.05, x: 5, color: "#2563eb" }}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    location.pathname === item.path
                      ? "text-blue-600 font-semibold"
                      : "hover:text-blue-500"
                  } transition-colors`}
                >
                  <Link to={item.path}>{item.name}</Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
