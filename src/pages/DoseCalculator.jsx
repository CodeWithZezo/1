import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Calculator,
  Stethoscope,
  Activity,
  Syringe,
  ClipboardCheck,
} from "lucide-react"; // you can pick icons as needed

// ---- Put your calculators array here (from previous message) ----
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

const iconForCategory = (category) => {
  switch (category) {
    case "Pediatrics":
      return <Stethoscope className="w-6 h-6 text-blue-600" />;
    case "Antibiotics":
      return <Syringe className="w-6 h-6 text-green-600" />;
    case "Dermatology":
      return <Activity className="w-6 h-6 text-pink-600" />;
    case "Endocrinology":
      return <ClipboardCheck className="w-6 h-6 text-purple-600" />;
    default:
      return <Calculator className="w-6 h-6 text-gray-600" />;
  }
};

const CalculatorsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          All Medical Calculators
        </h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculators.map((calc, index) => (
            <motion.div
              key={calc.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow hover:shadow-lg p-5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 mb-3">
                {iconForCategory(calc.category)}
                <h2 className="font-semibold text-lg text-gray-700">
                  {calc.name}
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">{calc.desc}</p>
              <Link
                to={calc.link}
                className="mt-auto inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg text-center transition"
              >
                Open Calculator
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;
