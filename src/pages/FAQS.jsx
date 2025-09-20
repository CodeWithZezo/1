// src/pages/FAQ.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import faqs from "../data/faqs";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <motion.div
        className="max-w-5xl mx-auto text-center mb-14"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Clear, clinically informed answers to common questions on accuracy,
          safety, features, privacy, technical details, and responsibilities.
        </p>
      </motion.div>

      {/* FAQ Categories */}
      <motion.div
        className="max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {faqs.map((section, categoryIndex) => (
          <motion.div
            key={section.category}
            className="mb-12"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b border-gray-300 pb-2">
              {section.category}
            </h2>

            <div className="space-y-4">
              {section.items.map((faq, itemIndex) => {
                const key = `${categoryIndex}-${itemIndex}`;
                const isOpen = openIndex === key;
                return (
                  <motion.div
                    key={faq.question}
                    className={`rounded-xl shadow-md border transition-all duration-300 ${
                      isOpen
                        ? "bg-white border-indigo-300"
                        : "bg-white border-gray-200 hover:shadow-lg"
                    }`}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* Question */}
                    <button
                      onClick={() => toggleFAQ(categoryIndex, itemIndex)}
                      className="w-full flex justify-between items-center px-6 py-5 text-left focus:outline-none"
                    >
                      <span className="font-medium text-gray-800 text-lg">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {/* Answer with Smooth Animation */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                          }}
                          transition={{
                            duration: 0.5,
                            ease: "easeInOut",
                          }}
                        >
                          <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FAQPage;
