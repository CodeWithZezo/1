import React from 'react'
import { motion } from 'framer-motion'
import { Link } from "react-router-dom";
import {
  Stethoscope, Pill, Activity, TestTube, FlaskRound, Syringe, Thermometer, FileText, CheckCircle,
  Clock,
  MonitorSmartphone,
  Shield,
  BookOpen,
} from "lucide-react";


const Home = () => {

  const categories = [
    {
      title: "Pediatrics",
      count: "6 calculators",
      items: [
        { name: "Pediatric Dose Calculator", link: "/calculators/Pediatric-Dose-Calculator" },
        { name: "Paracetamol Pediatric Calculator", link: "/calculators/Paracetamol-Pediatric-Calculator" },
        { name: "Pediatric Tylenol Calculator", link: "/calculators/Pediatric-Tylenol-Calculator" },
        { name: "Prednisolone Pediatric Calculator", link: "/calculators/Prednisolone-Pediatric-Calculator" },
        { name: "Pediatric Dexamethasone Calculator", link: "/calculators/Pediatric-Dexamethasone-Calculator" },
        { name: "Acetaminophen Lethal Dose Calculator", link: "/calculators/Acetaminophen-Lethal-Dose-Calculator" },
      ],
    },
    {
      title: "Antibiotics",
      count: "3 calculators",
      items: [
        { name: "Augmentin Pediatric Dose Calculator", link: "/calculators/Augmentin-Pediatric-Dose-Calculator" },
        { name: "Amoxicillin Dose Calculator", link: "/calculators/Amoxicillin-Dose-Calculator" },
        { name: "Azithromycin Dose Calculator", link: "/calculators/Azithromycin-Dose-Calculator" },
      ],
    },
    {
      title: "Dermatology",
      count: "1 calculator",
      items: [
        { name: "Accutane Cumulative Dose Calculator", link: "/calculators/Accutane-Cumulative-Dose-Calculator" },
      ],
    },
    {
      title: "Endocrinology",
      count: "1 calculator",
      items: [
        { name: "Insulin Dose Calculator", link: "/calculators/Insulin-Dose-Calculator" },
      ],
    },
    {
      title: "Pharmacology",
      count: "1 calculator",
      items: [
        { name: "Opioid Conversion Calculator", link: "/calculators/Opioid-Conversion-Calculator" },
      ],
    },
    {
      title: "Laboratory",
      count: "1 calculator",
      items: [
        { name: "Anion Gap Calculator", link: "/calculators/Anion-Gap-Calculator" },
      ],
    },
    {
      title: "Hormone Therapy",
      count: "1 calculator",
      items: [
        { name: "TSH Levothyroxine Dose Calculator", link: "/calculators/TSH-Levothyroxine-Dose-Calculator" },
      ],
    },
  ];
  const calculators = [
    {
      name: "Pediatric Dose Calculator",
      category: "Pediatrics",
      desc: "Weight-based pediatric dosing with safety checks",
      popular: true,
      link: "/calculators/Pediatric-Dose-Calculator",
    },
    {
      name: "Paracetamol Pediatric Calculator",
      category: "Pediatrics",
      desc: "Safe acetaminophen dosing for children",
      popular: true,
      link: "/calculators/Paracetamol-Pediatric-Calculator",
    },
    {
      name: "Pediatric Tylenol Calculator",
      category: "Pediatrics",
      desc: "Calculate accurate Tylenol doses for children",
      popular: false,
      link: "/calculators/Pediatric-Tylenol-Calculator",
    },
    {
      name: "Prednisolone Pediatric Calculator",
      category: "Pediatrics",
      desc: "Prednisolone dosing calculator for pediatrics",
      popular: false,
      link: "/calculators/Prednisolone-Pediatric-Calculator",
    },
    {
      name: "Pediatric Dexamethasone Calculator",
      category: "Pediatrics",
      desc: "Dexamethasone dose calculator for children",
      popular: false,
      link: "/calculators/Pediatric-Dexamethasone-Calculator",
    },
    {
      name: "Acetaminophen Lethal Dose Calculator",
      category: "Pediatrics",
      desc: "Estimate toxic acetaminophen doses in pediatrics",
      popular: false,
      link: "/calculators/Acetaminophen-Lethal-Dose-Calculator",
    },
    {
      name: "Augmentin Pediatric Dose Calculator",
      category: "Antibiotics",
      desc: "Amoxicillin/clavulanate dosing for children",
      popular: false,
      link: "/calculators/Augmentin-Pediatric-Dose-Calculator",
    },
    {
      name: "Amoxicillin Dose Calculator",
      category: "Antibiotics",
      desc: "Amoxicillin dosing for pediatrics",
      popular: false,
      link: "/calculators/Amoxicillin-Dose-Calculator",
    },
    {
      name: "Azithromycin Dose Calculator",
      category: "Antibiotics",
      desc: "Calculate safe azithromycin doses",
      popular: false,
      link: "/calculators/Azithromycin-Dose-Calculator",
    },
    {
      name: "Accutane Cumulative Dose Calculator",
      category: "Dermatology",
      desc: "Isotretinoin cumulative dose tracking",
      popular: false,
      link: "/calculators/Accutane-Cumulative-Dose-Calculator",
    },
    {
      name: "Insulin Dose Calculator",
      category: "Endocrinology",
      desc: "Insulin-to-carb ratio & correction factors",
      popular: true,
      link: "/calculators/Insulin-Dose-Calculator",
    },
    {
      name: "Opioid Conversion Calculator",
      category: "Pharmacology",
      desc: "Safe opioid conversion calculations",
      popular: false,
      link: "/calculators/Opioid-Conversion-Calculator",
    },
    {
      name: "Anion Gap Calculator",
      category: "Laboratory",
      desc: "Calculate serum anion gap quickly",
      popular: false,
      link: "/calculators/Anion-Gap-Calculator",
    },
    {
      name: "TSH Levothyroxine Dose Calculator",
      category: "Hormone Therapy",
      desc: "Levothyroxine dose based on TSH level",
      popular: false,
      link: "/calculators/TSH-Levothyroxine-Dose-Calculator",
    },
  ];
  const features = [
    {
      title: "Accurate & Evidence-Based",
      desc: "All formulas are based on peer-reviewed research and clinical guidelines",
      icon: CheckCircle,
    },
    {
      title: "Time-Saving",
      desc: "Get instant results without manual calculations or complex formulas",
      icon: Clock,
    },
    {
      title: "Mobile & Desktop Ready",
      desc: "Access from any device, anywhere - fully responsive design",
      icon: MonitorSmartphone,
    },
    {
      title: "Safe & Secure",
      desc: "No personal data stored - calculations happen locally on your device",
      icon: Shield,
    },
    {
      title: "Guideline-Backed",
      desc: "Backed by WHO, AAP, BNF, and other trusted medical organizations",
      icon: BookOpen,
    },
  ];
  const searchKeywords = [
    "Pediatrics",
    "Antibiotics",
    "Endocrinology",
    "Dermatology",
    "Pharmacology",
    "Laboratory",
    "Toxicology",
    "Hormone Therapy",
  ];

  return (
    <>
      <main>
        <section className="flex justify-center itmes-center h-[100vh] relative bg-gradient-to-r from-blue-50 via-white to-blue-50 py-20 px-6 md:px-12 lg:px-20">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-6">
                Smart, Evidence-Based <span className="text-blue-600">Medical Dose Calculators</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Accurate, safe, and easy-to-use tools for healthcare professionals and parents.
                Calculate medication doses with confidence using evidence-based formulas.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to={'/calculators'}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
                  >
                  Browse Calculators
                </motion.button>
                  </Link>
                  <Link to={'/faqs'}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-blue-50 transition"
                  >
                  Learn More
                </motion.button>
                  </Link>
              </div>

              {/* Stats */}
              <ul className="flex flex-col sm:flex-row gap-6 mt-10 text-gray-700 font-medium justify-center lg:justify-start">
                <li className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-bold text-blue-600">15+</span>
                  <span className="text-sm">Calculators</span>
                </li>
                <li className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-bold text-blue-600">12</span>
                  <span className="text-sm">Specialties</span>
                </li>
                <li className="flex flex-col items-center lg:items-start">
                  <span className="text-2xl font-bold text-blue-600">5k+</span>
                  <span className="text-sm">Trusted Users</span>
                </li>
              </ul>
            </motion.div>

            {/* Right Side Illustration (Optional) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="hidden lg:block"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/2927/2927347.png"
                alt="Medical Illustration"
                className="w-[400px] drop-shadow-lg"
              />
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 px-6 md:px-12 lg:px-20">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-gray-800">
              Medical Specialties & Tools
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              Comprehensive calculators organized by medical specialty for quick access to the tools you need.
            </p>
          </div>

          {/* Grid of Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
              >
                {/* Icon */}
                <div className="mb-4">{cat.icon}</div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {cat.title}
                </h2>

                {/* Items Preview with direct links */}
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  {cat.items.slice(0, 3).map((item, i) => (
                    <li key={i}>
                      <Link
                        to={item.link}
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                  {cat.items.length > 3 && (
                    <li className="text-gray-400">+{cat.items.length - 3} more…</li>
                  )}
                </ul>

                {/* Bottom Row */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-medium text-blue-600">
                    {cat.count}
                  </span>
                  <Link to={cat.items[0]?.link || "#"}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                      Explore
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl font-bold text-gray-800">
              Most Popular Calculators
            </h1>
            <p className="text-lg text-gray-600 mt-4">
              Quick access to our most frequently used medical calculation tools.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calc, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.03, y: -5 }}
                className="relative bg-blue-50 rounded-xl shadow-md p-6 flex flex-col justify-between"
              >
                {/* Popular Badge */}
                {calc.popular && (
                  <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}

                {/* Title */}
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  {calc.name}
                </h2>

                {/* Category */}
                <span className="text-sm font-medium text-gray-500 mb-3">
                  {calc.category}
                </span>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6 flex-1">{calc.desc}</p>

                {/* Button */}
                <Link to={calc.link}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Open Calculator
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link to="/calculators">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
              >
                View All Calculators
              </motion.button>
            </Link>
          </div>
        </section>

        <section className="py-12 px-6 bg-gray-50">
          <h1 className="text-3xl font-bold text-center mb-4">Why Choose MedCalc Pro?</h1>
          <p className="text-center text-gray-600 mb-10">
            Trusted by healthcare professionals worldwide for safe, accurate medical calculations.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-xl shadow-md bg-white flex flex-col items-center text-center hover:shadow-lg transition"
                >
                  <Icon className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-gray-600 mt-2">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>


        <section className="py-12 px-6 bg-white">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Find the Right Calculator Fast</h1>
            <p className="text-gray-600">
              Search our comprehensive database or filter by medical specialty.
            </p>
          </div>

          {/* Search Form */}
          <form className="flex justify-center mb-6">
            <input
              type="search"
              placeholder="Search calculators..."
              className="w-full max-w-lg px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>

          {/* Keyword Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {searchKeywords.map((keyword, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100 transition"
              >
                {keyword}
              </button>
            ))}
          </div>
        </section>

        <section className="bg-gray-900 text-center text-white py-16 px-6 rounded-2xl shadow-lg overflow-hidden">
          <motion.h1
            className="text-3xl md:text-4xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Start Calculating Safely and Confidently
          </motion.h1>

          <motion.p
            className="text-gray-300 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            Join thousands of healthcare professionals who trust our
            evidence-based calculators for accurate medical dosing.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          >
            <Link to={'/calculators'}>
            <motion.button
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              >
              View All Calculators
            </motion.button>
              </Link>

              <Link to={'/faqs'}>
            <motion.button
              className="px-6 py-3 bg-transparent border border-blue-400 text-blue-400 font-semibold rounded-lg hover:bg-blue-500 hover:text-white transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              >
              Explore FAQS
            </motion.button>
              </Link>
          </motion.div>
        </section>
      </main>
    </>
  )
}

export default Home