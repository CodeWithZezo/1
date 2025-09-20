import React from "react";
import { motion } from "framer-motion";
import { Globe, Heart, Shield, Zap, Users } from "lucide-react";

export default function About() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6 },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-12"
      >
        {/* Intro */}
        <div className="text-center mb-14">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 text-transparent bg-clip-text">
            About Us
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We’re building the most trusted platform for medical dose
            calculations — combining science, technology, and human-centered
            design to make healthcare safer, faster, and more reliable.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-gray-100 shadow bg-gradient-to-br from-indigo-50 to-white"
          >
            <h2 className="text-2xl font-bold text-indigo-600">Our Mission</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              To empower healthcare professionals and students with
              evidence-based, accurate, and easy-to-use dose calculators. By
              reducing manual errors, we aim to support safer and more efficient
              patient care globally.
            </p>
          </motion.div>

          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-gray-100 shadow bg-gradient-to-br from-violet-50 to-white"
          >
            <h2 className="text-2xl font-bold text-indigo-600">Our Vision</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              To be the world’s most trusted and innovative resource for
              clinical dosage calculations, bridging the gap between medical
              knowledge and technology to improve healthcare outcomes.
            </p>
          </motion.div>
        </div>

        {/* Our Story */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold text-indigo-700 mb-3">
            Our Story
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We started as a small initiative to help medical students calculate
            doses faster. Over time, we evolved into a platform trusted by
            thousands of professionals worldwide. With continuous improvements,
            real-world feedback, and dedication to quality, we have grown into a
            global medical resource.
          </p>
        </motion.div>

        {/* Core Values */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-indigo-700 text-center mb-8">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: <Shield />, title: "Accuracy", desc: "Evidence-based, reliable formulas." },
              { icon: <Heart />, title: "Integrity", desc: "Transparent, ethical practices." },
              { icon: <Zap />, title: "Innovation", desc: "Smart, modern digital tools." },
              { icon: <Users />, title: "Accessibility", desc: "Free and open for everyone." },
            ].map((val, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border shadow-sm text-center"
              >
                <div className="flex justify-center text-indigo-600 mb-3 text-3xl">
                  {val.icon}
                </div>
                <h3 className="font-semibold text-lg text-indigo-700">
                  {val.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center mb-14">
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white border rounded-2xl shadow"
          >
            <h3 className="text-4xl font-extrabold text-indigo-600">15+</h3>
            <p className="text-gray-600 mt-2">Medical Calculators</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white border rounded-2xl shadow"
          >
            <h3 className="text-4xl font-extrabold text-indigo-600">10K+</h3>
            <p className="text-gray-600 mt-2">Monthly Users</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white border rounded-2xl shadow"
          >
            <h3 className="text-4xl font-extrabold text-indigo-600">30+</h3>
            <p className="text-gray-600 mt-2">Countries Reached</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -5 }}
            className="p-6 bg-white border rounded-2xl shadow"
          >
            <h3 className="text-4xl font-extrabold text-indigo-600">100%</h3>
            <p className="text-gray-600 mt-2">Free & Secure</p>
          </motion.div>
        </div>

        {/* Global Reach */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-14"
        >
          <h2 className="text-2xl font-bold text-indigo-700 mb-3">
            Global Reach
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Our tools are used by doctors, nurses, pharmacists, and students in
            over 30 countries. With multilingual support and a commitment to
            accessibility, we’re making safe healthcare tools available to
            everyone, everywhere.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="inline-flex gap-4"
          >
            <a
              href="/contact"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow hover:opacity-95"
            >
              Contact Us
            </a>
            <a
              href="/calculators"
              className="px-6 py-3 bg-gray-100 text-indigo-700 rounded-xl font-semibold shadow hover:bg-gray-200"
            >
              Explore Calculators
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
