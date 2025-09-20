import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PediatricDoseCalculator = () => {
  const tabs = ["Calculator", "Drug Reference", "Dose Comparison"];
  const [activeTab, setActiveTab] = useState("Calculator");

  // === All drugs from your screenshot + reference info ===
  const medications = [
    {
      name: "Amoxicillin",
      mgPerKg: 20,
      maxDose: 1000,
      frequency: 8,
      category: "Beta-lactam Antibiotic",
      dosing: "20–50 mg/kg/day",
      maxDaily: "3000 mg/day",
      forms: ["syrup: 250mg/5mL", "tablet: 250mg", "tablet: 500mg"],
      notes: "Take after meals. Use in respiratory and ear infections.",
    },
    {
      name: "Amoxicillin-Clavulanate",
      mgPerKg: 25,
      maxDose: 875,
      frequency: 12,
      category: "Beta-lactam Antibiotic",
      dosing: "25 mg/kg/dose",
      maxDaily: "—",
      forms: ["tablet: 875mg", "suspension: 400mg/5mL"],
      notes: "Good for resistant otitis media or sinusitis.",
    },
    {
      name: "Paracetamol (Acetaminophen)",
      mgPerKg: 15,
      maxDose: 1000,
      frequency: 6,
      category: "Analgesic/Antipyretic",
      dosing: "15 mg/kg/dose",
      maxDaily: "4000 mg/day",
      forms: ["syrup: 120mg/5mL", "tablet: 500mg"],
      notes: "Do not exceed 4g/day. Adjust for liver disease.",
    },
    {
      name: "Ibuprofen",
      mgPerKg: 10,
      maxDose: 400,
      frequency: 6,
      category: "NSAID",
      dosing: "10 mg/kg/dose",
      maxDaily: "1200 mg/day",
      forms: ["syrup: 100mg/5mL", "tablet: 200mg"],
      notes: "Give with food to minimize gastric irritation.",
    },
    {
      name: "Other (Custom…)",
      mgPerKg: 0,
      maxDose: 0,
      frequency: 0,
      category: "Custom",
      dosing: "Enter manually",
      maxDaily: "—",
      forms: [],
      notes: "Provide custom dosing if needed.",
    },
  ];

  const [age, setAge] = useState("");
  const [ageUnit, setAgeUnit] = useState("Years");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("Kilograms (kg)");
  const [drug, setDrug] = useState("");
  const [route, setRoute] = useState("Oral (PO)");
  const [formulation, setFormulation] = useState("");
  const [frequency, setFrequency] = useState("Twice daily (BID)");
  const [dose, setDose] = useState(null);

  const calculateDose = () => {
    if (!age || !weight || !drug) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const med = medications.find((m) => m.name === drug);
    if (!med) {
      toast.warning("Selected drug is not in reference list.");
      return;
    }

    if (!med.mgPerKg || med.mgPerKg === 0) {
      toast.info("Please enter a custom dose for this medication.");
      return;
    }

    let w = parseFloat(weight);
    if (weightUnit === "Grams (g)") w = w / 1000;
    if (weightUnit === "Pounds (lb)") w = w * 0.4536;

    const calc = w * med.mgPerKg;
    const finalDose = med.maxDose ? Math.min(calc, med.maxDose) : calc;

    setDose(finalDose.toFixed(2));
  };

  const selectedDrug = medications.find((m) => m.name === drug);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-1">
        Pediatric Dose Calculator
      </h2>
      <p className="text-center text-gray-500 mb-6">
        Accurate dosing calculations for pediatric patients
      </p>

      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px font-medium text-sm rounded-t-lg ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* === Calculator Tab === */}
      {activeTab === "Calculator" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Age Unit</label>
            <select
              value={ageUnit}
              onChange={(e) => setAgeUnit(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Years</option>
              <option>Months</option>
              <option>Days</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Weight</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Weight Unit</label>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Kilograms (kg)</option>
              <option>Grams (g)</option>
              <option>Pounds (lb)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Drug</label>
            <select
              value={drug}
              onChange={(e) => setDrug(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select a drug...</option>
              {medications.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Route</label>
            <select
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Oral (PO)</option>
              <option>Intravenous (IV)</option>
              <option>Intramuscular (IM)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Formulation Strength
            </label>
            <select
              value={formulation}
              onChange={(e) => setFormulation(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select formulation...</option>
              <option>Tablet 250 mg</option>
              <option>Tablet 500 mg</option>
              <option>Syrup 125 mg/5ml</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>Once daily (QD)</option>
              <option>Twice daily (BID)</option>
              <option>Three times daily (TID)</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* === Drug Reference Tab === */}
      {activeTab === "Drug Reference" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-blue-700">Drug Information</h3>
          {selectedDrug ? (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p><strong>Drug Name:</strong> {selectedDrug.name}</p>
              <p><strong>Category:</strong> {selectedDrug.category}</p>
              <p><strong>Dosing:</strong> {selectedDrug.dosing}</p>
              <p><strong>Max Daily Dose:</strong> {selectedDrug.maxDaily}</p>
              {selectedDrug.forms.length > 0 && (
                <p><strong>Available Forms:</strong> {selectedDrug.forms.join(", ")}</p>
              )}
              <p><strong>Clinical Notes:</strong> {selectedDrug.notes}</p>
            </div>
          ) : (
            <p className="text-gray-500">
              Please select a drug in the Calculator tab to view its reference.
            </p>
          )}
        </motion.div>
      )}

      {/* === Dose Comparison Tab === */}
      {activeTab === "Dose Comparison" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600"
        >
          <p className="text-center">
            (Coming soon) Compare doses between medications or guidelines.
          </p>
        </motion.div>
      )}

      {/* Calculate & Result */}
      {activeTab === "Calculator" && (
        <>
          <button
            onClick={calculateDose}
            className="mt-6 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Calculate Dose
          </button>

          {dose && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-center"
            >
              <h3 className="text-xl font-bold text-blue-700 mb-2">
                Recommended Dose: {dose} mg
              </h3>
              <p className="text-gray-700">{frequency}</p>
            </motion.div>
          )}
        </>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        theme="colored"
      />
    </div>
  );
};

export default PediatricDoseCalculator;
