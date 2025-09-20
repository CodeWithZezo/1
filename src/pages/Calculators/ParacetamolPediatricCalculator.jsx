// ParacetamolPediatricCalculator.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Advanced Paracetamol (Acetaminophen) Pediatric Dose Calculator
 *
 * Clinical defaults used (educational/demo):
 * - Standard single dose: 15 mg/kg
 * - Max single dose cap: 1000 mg
 * - Max daily dose cap: 4000 mg (or max 4 doses/day at 6-hourly)
 * - Frequency guidance: Every 6 hours (max 4 doses/day)
 *
 * NOTE: Always confirm with local guidelines/clinician before using clinically.
 */

export default function ParacetamolPediatricCalculator() {
  // Inputs
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg"); // kg, g, lb
  const [age, setAge] = useState("");
  const [ageUnit, setAgeUnit] = useState("years"); // years, months, days

  const [mgPerKg, setMgPerKg] = useState(15); // default 15 mg/kg
  const [customMgPerKg, setCustomMgPerKg] = useState("");
  const [useCustomMgPerKg, setUseCustomMgPerKg] = useState(false);

  const [formulation, setFormulation] = useState("Syrup 120 mg/5 mL");
  const formulationData = {
    "Syrup 120 mg/5 mL": { mgPer5ml: 120, type: "syrup" },
    "Syrup 125 mg/5 mL": { mgPer5ml: 125, type: "syrup" },
    "Syrup 160 mg/5 mL": { mgPer5ml: 160, type: "syrup" },
    "Tablet 250 mg": { mgPerTablet: 250, type: "tablet" },
    "Tablet 500 mg": { mgPerTablet: 500, type: "tablet" },
  };

  // Results + history
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Safety constants
  const MAX_SINGLE_MG = 1000; // single dose cap
  const MAX_DAILY_MG = 4000; // daily cap
  const RECOMMENDED_INTERVAL_HOURS = 6; // guidance (every 6h)

  // Helpers
  function toKg(value, unit) {
    const n = parseFloat(value);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "g") return n / 1000;
    if (unit === "lb") return n * 0.45359237;
    return null;
  }
  function round(v, d = 2) {
    if (isNaN(v) || v === null) return v;
    const p = Math.pow(10, d);
    return Math.round(v * p) / p;
  }

  // Main calculation
  const calculate = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) {
      toast.error("Enter a valid weight.");
      return;
    }

    const perKg = useCustomMgPerKg ? parseFloat(customMgPerKg) : parseFloat(mgPerKg);
    if (!perKg || perKg <= 0) {
      toast.error("Enter a valid mg/kg dose.");
      return;
    }

    // single dose by mg/kg
    let singleDoseMg = wKg * perKg;
    let cappedSingle = false;
    if (singleDoseMg > MAX_SINGLE_MG) {
      singleDoseMg = MAX_SINGLE_MG;
      cappedSingle = true;
    }

    // per-dose tablet / mL conversions
    const form = formulationData[formulation];
    let mLPerDose = null;
    let tabletsPerDose = null;
    if (form.type === "syrup") {
      // mg per 5mL -> mL for required mg
      mLPerDose = (singleDoseMg / form.mgPer5ml) * 5;
    } else if (form.type === "tablet") {
      tabletsPerDose = singleDoseMg / form.mgPerTablet; // may be fractional
    }

    // daily totals and checks
    // assume typical maximum of 4 doses/day (every 6h)
    const maxDosesPerDay = 4;
    const dailyIfUsedAsRecommended = singleDoseMg * maxDosesPerDay;
    const exceedsDailyCap = dailyIfUsedAsRecommended > MAX_DAILY_MG;

    // Frequency guidance text
    const frequencyText = `Every ${RECOMMENDED_INTERVAL_HOURS} hours (max ${maxDosesPerDay} doses/day)`;

    const now = new Date();
    const record = {
      timestamp: now.toISOString(),
      weightInput: `${weight} ${weightUnit}`,
      ageInput: age ? `${age} ${ageUnit}` : "—",
      mgPerKgUsed: perKg,
      singleDoseMg: round(singleDoseMg, 2),
      cappedSingle,
      mLPerDose: mLPerDose !== null ? round(mLPerDose, 1) : null,
      tabletsPerDose: tabletsPerDose !== null ? round(tabletsPerDose, 3) : null,
      dailyIfUsedAsRecommended: round(dailyIfUsedAsRecommended, 2),
      exceedsDailyCap,
      formulation,
      frequencyText,
    };

    setResult(record);
    setHistory((h) => [record, ...h]);
    // Toast messages for warnings
    if (cappedSingle) {
      toast.warning(`Single dose capped at ${MAX_SINGLE_MG} mg (safety limit).`);
    } else {
      toast.success("Dose calculated.");
    }
    if (exceedsDailyCap) {
      toast.error(
        `If repeated ${maxDosesPerDay} times/day this dose would exceed the daily cap of ${MAX_DAILY_MG} mg.`
      );
    }
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
    toast.info("History cleared.");
  };

  // Download history as CSV
  const downloadCSV = () => {
    if (!history.length) {
      toast.error("No history to download.");
      return;
    }
    const headers = [
      "timestamp",
      "weight",
      "age",
      "mg_per_kg_used",
      "single_dose_mg",
      "capped_single",
      "mL_per_dose",
      "tablets_per_dose",
      "daily_if_used_as_recommended",
      "exceeds_daily_cap",
      "formulation",
      "frequency",
    ];
    const rows = history.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paracetamol_history_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded history CSV.");
  };

  // Copy current result summary to clipboard
  const copyResult = async () => {
    if (!result) {
      toast.error("No result to copy.");
      return;
    }
    const lines = [
      `Paracetamol dose result (${new Date(result.timestamp).toLocaleString()}):`,
      `Weight: ${result.weightInput}`,
      `Age: ${result.ageInput}`,
      `Dose used: ${result.mgPerKgUsed} mg/kg`,
      `Single dose: ${result.singleDoseMg} mg${result.cappedSingle ? " (capped)" : ""}`,
      result.mLPerDose ? `Volume: ${result.mLPerDose} mL (${result.formulation})` : "",
      result.tabletsPerDose ? `Tablets: ${result.tabletsPerDose} of ${result.formulation}` : "",
      `Frequency: ${result.frequencyText}`,
      `Daily if used as recommended: ${result.dailyIfUsedAsRecommended} mg${result.exceedsDailyCap ? " (exceeds daily cap!)" : ""}`,
    ].filter(Boolean).join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Result copied to clipboard.");
    } catch (e) {
      toast.error("Copy failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-bold text-center text-indigo-700 mb-1">
        Paracetamol (Acetaminophen) — Pediatric Dose Calculator
      </h2>
      <p className="text-center text-gray-500 mb-6">
        Educational tool: calculates weight-based dose, converts to mL/tablets, and warns about limits.
      </p>

      {/* Inputs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 12.5"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Weight unit</label>
          <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="w-full p-2 border rounded">
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="lb">Pounds (lb)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Age (optional)</label>
          <div className="flex gap-2">
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 2" className="w-full p-2 border rounded" />
            <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value)} className="p-2 border rounded">
              <option value="years">yrs</option>
              <option value="months">mo</option>
              <option value="days">days</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium mb-1">Dose (mg/kg)</label>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center">
              <input type="checkbox" checked={useCustomMgPerKg} onChange={() => setUseCustomMgPerKg(!useCustomMgPerKg)} />
              <span className="ml-2 text-sm">Use custom mg/kg</span>
            </label>

            {useCustomMgPerKg ? (
              <input type="number" value={customMgPerKg} onChange={(e) => setCustomMgPerKg(e.target.value)} placeholder="e.g., 12" className="p-2 border rounded w-32" />
            ) : (
              <select value={mgPerKg} onChange={(e) => setMgPerKg(parseFloat(e.target.value))} className="p-2 border rounded w-40">
                <option value={10}>10 mg/kg</option>
                <option value={12.5}>12.5 mg/kg</option>
                <option value={15}>15 mg/kg (standard)</option>
                <option value={20}>20 mg/kg</option>
              </select>
            )}

            <div className="ml-auto">
              <label className="block text-sm font-medium mb-1">Formulation</label>
              <select value={formulation} onChange={(e) => setFormulation(e.target.value)} className="p-2 border rounded">
                {Object.keys(formulationData).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 flex gap-3">
        <button onClick={calculate} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Calculate Dose</button>
        <button onClick={() => { setResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
        <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Download History CSV</button>
        <button onClick={clearHistory} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
      </div>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-indigo-50 rounded border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-700">Recommended Dose</h3>
          <p className="mt-2"><strong>Weight:</strong> {result.weightInput} &nbsp; <strong>Age:</strong> {result.ageInput}</p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><strong>Used:</strong> {result.mgPerKgUsed} mg/kg</div>
            <div><strong>Single dose:</strong> {result.singleDoseMg} mg {result.cappedSingle ? " (capped)" : ""}</div>
            <div>{result.mLPerDose !== null ? <><strong>Volume:</strong> {result.mLPerDose} mL ({result.formulation})</> : <strong>Tablets:</strong>}</div>
            <div>{result.tabletsPerDose !== null ? <>{result.tabletsPerDose} × ({result.formulation})</> : null}</div>
            <div><strong>Frequency:</strong> {result.frequencyText}</div>
            <div><strong>Daily if given x4:</strong> {result.dailyIfUsedAsRecommended} mg {result.exceedsDailyCap ? " (exceeds daily cap!)" : ""}</div>
          </div>

          <div className="mt-3 flex gap-2">
            <button onClick={copyResult} className="px-3 py-1 bg-blue-600 text-white rounded">Copy Result</button>
            <button onClick={() => toast.info("Print/Save not implemented — use browser print.")} className="px-3 py-1 bg-gray-100 rounded">Print</button>
          </div>
        </motion.div>
      )}

      {/* History */}
      <div className="mt-6">
        <h4 className="text-md font-semibold">Calculation History (session)</h4>
        {history.length === 0 ? (
          <p className="text-gray-500 mt-2">No history yet — perform a calculation.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {history.map((h, i) => (
              <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-600">{new Date(h.timestamp).toLocaleString()}</div>
                  <div className="mt-1 text-sm">
                    <strong>{h.singleDoseMg} mg</strong> — {h.mgPerKgUsed} mg/kg — {h.formulation}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{h.frequencyText} — daily if x4: {h.dailyIfUsedAsRecommended} mg {h.exceedsDailyCap ? "(exceeds daily cap)" : ""}</div>
                </div>
                <div className="text-right">
                  <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h, null, 2)); toast.success("History item copied."); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Safety note */}
      <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200 text-sm text-gray-700">
        <strong>Safety notes:</strong>
        <ul className="list-disc ml-5 mt-2">
          <li>This tool is for education/demo. Verify doses with local clinical guidelines or a clinician.</li>
          <li>Do not exceed recommended maximums (single-dose cap {MAX_SINGLE_MG} mg, daily cap {MAX_DAILY_MG} mg).</li>
          <li>For infants/neonates or hepatic impairment, consult specialist dosing guidance.</li>
        </ul>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
