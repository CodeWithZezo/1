import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Infant & Pediatric Tylenol (Paracetamol) Dose Calculator
 * - Advanced, fully responsive React component
 * - Weight & age inputs (kg/g/lb and yrs/mo/days)
 * - Standard dosing: 15 mg/kg per dose (configurable), frequency guidance, and max single/daily caps
 * - Multiple formulations (syrup strengths) with automatic mg->mL conversion
 * - Practical rounding options for syringe volumes (0.1 / 0.5 mL)
 * - Age-based warnings (neonates / infants), max dose enforcement, history, copy, CSV export, print
 * - Tailwind-friendly styling, Framer Motion animations, Toast messages
 *
 * Educational only — verify with treating clinician and local guidelines.
 */

export default function PediatricTylenolCalculator() {
  const [age, setAge] = useState(2);
  const [ageUnit, setAgeUnit] = useState("years"); // years, months, days

  const [weight, setWeight] = useState(12);
  const [weightUnit, setWeightUnit] = useState("kg"); // kg, g, lb

  // dosing defaults
  const [mgPerKg, setMgPerKg] = useState(15); // typical single dose 15 mg/kg
  const [minIntervalHours, setMinIntervalHours] = useState(6); // typical dosing interval
  const [maxDosesPerDay, setMaxDosesPerDay] = useState(4);

  // max caps (can be adjusted)
  const [maxSingleMg, setMaxSingleMg] = useState(1000); // adult cap often 1000 mg single
  const [maxDailyMg, setMaxDailyMg] = useState(4000); // conservative upper cap

  // formulations
  const formulations = {
    "Syrup 125 mg/5 mL": 125, // mg per 5 mL
    "Syrup 160 mg/5 mL": 160,
    "Tablet 500 mg": 500,
  };
  const [formulation, setFormulation] = useState("Syrup 125 mg/5 mL");

  const [roundingStep, setRoundingStep] = useState(0.5); // mL rounding
  const [history, setHistory] = useState([]);

  const [doseResult, setDoseResult] = useState(null);

  // Helpers
  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "g") return n / 1000;
    if (unit === "lb") return n * 0.45359237;
    return null;
  };

  const roundTo = (val, step) => {
    if (val === null || isNaN(val)) return val;
    if (!step || step <= 0) return Math.round(val * 100) / 100;
    return Math.round(val / step) * step;
  };

  const calculate = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) {
      toast.error("Please enter a valid weight.");
      return;
    }

    // age warning
    const ageMonths = ageUnit === "years" ? age * 12 : ageUnit === "months" ? age : age / 30;

    // basic dose calculation
    const rawMg = wKg * parseFloat(mgPerKg);
    const appliedSingleMg = Math.min(rawMg, parseFloat(maxSingleMg));

    // compute daily total if given maximum doses/day
    const dailyMg = appliedSingleMg * parseInt(maxDosesPerDay || 4);
    const exceedsDaily = dailyMg > parseFloat(maxDailyMg);

    // convert to formulation
    const formMgPer5ml = formulations[formulation] || null;
    let mlPerDose = null;
    if (formMgPer5ml) {
      const ml = (appliedSingleMg / formMgPer5ml) * 5; // mL per dose
      mlPerDose = roundTo(ml, roundingStep);
    }

    // practical advice
    const warnings = [];
    if (ageMonths < 1) {
      warnings.push("Neonate: dosing differs and organ immaturity affects metabolism — use neonatal-specific guidance.");
    }
    if (appliedSingleMg >= maxSingleMg) {
      warnings.push(`Calculated single dose (${Math.round(rawMg)} mg) exceeds configured max single dose (${maxSingleMg} mg) and was capped.`);
    }
    if (exceedsDaily) {
      warnings.push(`Estimated total daily dose (${Math.round(dailyMg)} mg) exceeds configured max daily dose (${maxDailyMg} mg). Review dosing.`);
    }

    const res = {
      timestamp: new Date().toISOString(),
      age,
      ageUnit,
      weightKg: Math.round(wKg * 100) / 100,
      mgPerKg: parseFloat(mgPerKg),
      rawMg: Math.round(rawMg * 100) / 100,
      appliedSingleMg: Math.round(appliedSingleMg * 100) / 100,
      mlPerDose,
      formulation,
      minIntervalHours,
      maxDosesPerDay,
      dailyMg: Math.round(dailyMg * 100) / 100,
      warnings,
    };

    setDoseResult(res);
    setHistory((h) => [res, ...h]);

    toast.success("Dose calculated (educational). Verify with clinician.");
  };

  const copyResult = async () => {
    if (!doseResult) return toast.error("No result to copy.");
    const lines = [];
    lines.push(`Tylenol dose result — ${new Date(doseResult.timestamp).toLocaleString()}`);
    lines.push(`Age: ${doseResult.age} ${doseResult.ageUnit} • Weight: ${doseResult.weightKg} kg`);
    lines.push(`Dose: ${doseResult.appliedSingleMg} mg per dose (≈ ${doseResult.mlPerDose ?? "—"} mL of ${doseResult.formulation})`);
    lines.push(`Interval: every ${doseResult.minIntervalHours} hours • Max ${doseResult.maxDosesPerDay} doses/day (≈ ${doseResult.dailyMg} mg/day)`);
    if (doseResult.warnings && doseResult.warnings.length) {
      lines.push("Warnings:");
      doseResult.warnings.forEach((w) => lines.push(`- ${w}`));
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Result copied to clipboard.");
    } catch (e) {
      toast.error("Copy failed.");
    }
  };

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","age","ageUnit","weightKg","mgPerKg","appliedSingleMg","mlPerDose","formulation","minIntervalHours","maxDosesPerDay","dailyMg"];
    const rows = history.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tylenol_history_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-amber-700">Infant & Pediatric Tylenol (Paracetamol) Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Calculate weight‑based paracetamol doses. Educational only — verify with clinician and product labeling.</p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Age</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border rounded" />
              <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value)} className="p-2 border rounded">
                <option value="years">yrs</option>
                <option value="months">mo</option>
                <option value="days">days</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Weight</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded" />
              <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="p-2 border rounded">
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Formulation</label>
            <select value={formulation} onChange={(e) => setFormulation(e.target.value)} className="w-full p-2 border rounded mt-1">
              {Object.keys(formulations).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Dose (mg/kg)</label>
            <input type="number" value={mgPerKg} onChange={(e) => setMgPerKg(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Min interval (hours)</label>
            <input type="number" value={minIntervalHours} onChange={(e) => setMinIntervalHours(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Max doses/day</label>
            <input type="number" value={maxDosesPerDay} onChange={(e) => setMaxDosesPerDay(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Max single dose (mg)</label>
            <input type="number" value={maxSingleMg} onChange={(e) => setMaxSingleMg(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Max daily dose (mg)</label>
            <input type="number" value={maxDailyMg} onChange={(e) => setMaxDailyMg(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Round syringe volumes to</label>
            <select value={roundingStep} onChange={(e) => setRoundingStep(parseFloat(e.target.value))} className="w-full p-2 border rounded mt-1">
              <option value={0.1}>0.1 mL</option>
              <option value={0.25}>0.25 mL</option>
              <option value={0.5}>0.5 mL</option>
              <option value={1}>1 mL</option>
            </select>
          </div>
        </motion.div>

        <div className="mt-6 flex gap-3 flex-wrap">
          <button onClick={calculate} className="px-4 py-2 bg-amber-600 text-white rounded">Calculate Dose</button>
          <button onClick={() => { setDoseResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
          <button onClick={() => { setHistory([]); toast.info('History cleared.'); }} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {doseResult && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-amber-50 rounded border border-amber-100">
            <h3 className="text-lg font-semibold text-amber-700">Recommended Dose</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
              <div><strong>Weight:</strong> {doseResult.weightKg} kg</div>
              <div><strong>Dose:</strong> {doseResult.appliedSingleMg} mg per dose</div>

              <div><strong>Formulation:</strong> {doseResult.formulation}</div>
              <div><strong>Volume/dose:</strong> {doseResult.mlPerDose ?? '—'} mL</div>

              <div><strong>Interval:</strong> every {doseResult.minIntervalHours} hours</div>
              <div><strong>Max per day:</strong> {doseResult.maxDosesPerDay} doses (~{doseResult.dailyMg} mg/day)</div>

              {doseResult.warnings && doseResult.warnings.length ? (
                <div className="col-span-2 text-sm text-yellow-800">
                  <strong>Warnings:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {doseResult.warnings.map((w, i) => (<li key={i}>{w}</li>))}
                  </ul>
                </div>
              ) : null}

            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-amber-600 text-white rounded">Copy</button>
              <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        <div className="mt-6">
          <h3 className="font-semibold">Session history</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No calculations yet</p> : (
            <div className="mt-2 space-y-2">
              {history.map((h) => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">{h.appliedSingleMg} mg per dose — {h.mlPerDose ?? '—'} mL — every {h.minIntervalHours}h</div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h, null, 2)); toast.success('Copied'); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded border text-sm text-gray-700">
          <strong>Disclaimer:</strong> This calculator is for educational use only. Confirm dosing, formulation concentration and administration instructions with the treating clinician and product labeling. Avoid repeated/staggered overdoses and seek specialist advice for complex cases or toxicity concerns.
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
