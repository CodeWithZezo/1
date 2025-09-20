import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Amoxicillin Advanced Pediatric Dose Calculator (React + Tailwind)
 * - Fully responsive layout
 * - Weight & age conversions
 * - Standard / High / Custom mg/kg/day strategies
 * - Interval selection (BID/TID/QID) and per-dose calculation
 * - Formulation-aware conversion to mL (syrups) and tablet equivalents
 * - Practical rounding for volumes (nearest 0.5 mL) and tablet rounding suggestions
 * - Max daily enforcement & warnings
 * - In-session history, copy & CSV export
 *
 * NOTE: Educational/demo only. Verify with local clinical guidance.
 */

export default function AmoxicillinAdvancedCalculator() {
  // --- Inputs ---
  const [weight, setWeight] = useState(12); // default 12 kg
  const [weightUnit, setWeightUnit] = useState("kg"); // kg, g, lb
  const [age, setAge] = useState(2);
  const [ageUnit, setAgeUnit] = useState("years"); // years, months, days

  const [strategy, setStrategy] = useState("standard"); // standard | high | custom
  const [customMgPerKgDay, setCustomMgPerKgDay] = useState(45);

  // strategy presets (mg/kg/day)
  const presets = {
    standardLow: 20,
    standardHigh: 50, // daily range
    standardSingle: 25, // for simple single-value standard (we'll use mid)
    high: 45,
  };

  const [selectedMgPerKgDay, setSelectedMgPerKgDay] = useState(presets.standardSingle);
  const [interval, setInterval] = useState("BID"); // BID, TID, QID
  const [formulation, setFormulation] = useState("Syrup 125 mg/5 mL");
  const [tabletStrength, setTabletStrength] = useState(250); // mg per tablet

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // safety constants (educational)
  const MAX_DAILY_MG = 3000; // example cap often cited for amoxicillin/day in pediatrics

  // available formulations
  const syrupOptions = {
    "Syrup 125 mg/5 mL": 125,
    "Syrup 250 mg/5 mL": 250,
    "Syrup 200 mg/5 mL": 200,
  };

  const tabletOptions = [125, 250, 500, 875];

  // --- Helpers ---
  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "g") return n / 1000;
    if (unit === "lb") return n * 0.45359237;
    return null;
  };

  const round = (v, d = 2) => {
    if (v === null || isNaN(v)) return v;
    const p = Math.pow(10, d);
    return Math.round(v * p) / p;
  };

  const roundToNearest = (value, step) => {
    // round to nearest step (eg 0.5 mL)
    const inv = 1 / step;
    return Math.round(value * inv) / inv;
  };

  // calculate doses
  const calculate = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) {
      toast.error("Enter a valid weight.");
      return;
    }

    // determine mg/kg/day to use
    let mgPerKgDay;
    if (strategy === "standard") {
      // use the midpoint of the standard range (20-50) => 35 mg/kg/day
      mgPerKgDay = 35;
    } else if (strategy === "high") {
      mgPerKgDay = presets.high; // 45 mg/kg/day (common high-dose regimens)
    } else {
      const n = parseFloat(customMgPerKgDay);
      if (!n || n <= 0) {
        toast.error("Enter a valid custom mg/kg/day.");
        return;
      }
      mgPerKgDay = n;
    }

    // allow override selection as single value (user can pick a precise value)
    if (selectedMgPerKgDay) {
      mgPerKgDay = parseFloat(selectedMgPerKgDay) || mgPerKgDay;
    }

    // doses per day
    const dosesPerDay = interval === "BID" ? 2 : interval === "TID" ? 3 : 4;

    // total daily mg and per-dose mg
    const totalDailyMg = wKg * mgPerKgDay;
    const perDoseMgRaw = totalDailyMg / dosesPerDay;

    // apply daily cap
    const exceedsDailyCap = totalDailyMg > MAX_DAILY_MG;
    const finalTotalDailyMg = exceedsDailyCap ? MAX_DAILY_MG : totalDailyMg;

    // if we applied daily cap, recompute per-dose
    const perDoseMg = finalTotalDailyMg / dosesPerDay;

    // formulation calculations
    let mLPerDose = null;
    if (formulation in syrupOptions) {
      const mgPer5ml = syrupOptions[formulation];
      const ml = (perDoseMg / mgPer5ml) * 5;
      // round to nearest 0.5 mL for practical dosing
      mLPerDose = roundToNearest(ml, 0.5);
    }

    // tablet suggestion
    const tabletsPerDose = round(perDoseMg / tabletStrength, 2);
    const tabletsRounded = Math.max(0, Math.round(tabletsPerDose));

    // results object
    const res = {
      timestamp: new Date().toISOString(),
      weightKg: round(wKg, 2),
      mgPerKgDay: round(mgPerKgDay, 2),
      totalDailyMg: round(totalDailyMg, 2),
      finalTotalDailyMg: round(finalTotalDailyMg, 2),
      perDoseMg: round(perDoseMg, 2),
      perDoseMgRaw: round(perDoseMgRaw, 2),
      dosesPerDay,
      mLPerDose,
      tabletsPerDose: round(tabletsPerDose, 3),
      tabletsRounded,
      exceedsDailyCap,
      interval,
      formulation,
      tabletStrength,
      strategy,
    };

    setResult(res);
    setHistory((h) => [res, ...h]);

    // toasts
    if (exceedsDailyCap) {
      toast.error(`Calculated daily mg (${round(totalDailyMg)}) exceeds daily cap (${MAX_DAILY_MG} mg). Dose scaled to cap.`);
    } else {
      toast.success("Calculation complete.");
    }
  };

  // history utilities
  const clearHistory = () => {
    setHistory([]);
    toast.info("History cleared.");
  };

  const downloadCSV = () => {
    if (!history.length) {
      toast.error("No history to download.");
      return;
    }
    const headers = [
      "timestamp",
      "weightKg",
      "mgPerKgDay",
      "totalDailyMg",
      "finalTotalDailyMg",
      "perDoseMg",
      "dosesPerDay",
      "mLPerDose",
      "tabletsPerDose",
      "tabletsRounded",
      "formulation",
      "interval",
      "strategy",
    ];
    const rows = history.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amoxicillin_history_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CSV.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const text = `Amoxicillin dose result (${new Date(result.timestamp).toLocaleString()}):\nWeight: ${result.weightKg} kg\nStrategy: ${result.strategy} (${result.mgPerKgDay} mg/kg/day)\nTotal daily: ${result.finalTotalDailyMg} mg/day\nPer dose: ${result.perDoseMg} mg x ${result.dosesPerDay}/day\n${result.mLPerDose ? `Volume: ${result.mLPerDose} mL (${result.formulation})\n` : ''}${result.tabletsRounded ? `Tablets (approx): ${result.tabletsRounded} × ${result.tabletStrength} mg\n` : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Result copied to clipboard.");
    } catch (e) {
      toast.error("Copy failed.");
    }
  };

  // responsive layout notes: tailwind classes used
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-10">
      <div className="bg-white rounded-2xl shadow-md border p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700">Amoxicillin — Advanced Pediatric Dose Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Weight-based dosing, practical rounding, formulation conversions and safety checks.</p>

        {/* Inputs grid */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Weight unit</label>
            <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
              <option value="lb">Pounds (lb)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age (optional)</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border rounded" />
              <select value={ageUnit} onChange={(e) => setAgeUnit(e.target.value)} className="p-2 border rounded">
                <option value="years">yrs</option>
                <option value="months">mo</option>
                <option value="days">days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Strategy & interval */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Dosing strategy</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="strat" checked={strategy === 'standard'} onChange={() => { setStrategy('standard'); setSelectedMgPerKgDay(presets.standardSingle); }} />
                <span className="text-sm">Standard (20–50 mg/kg/day)</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="strat" checked={strategy === 'high'} onChange={() => { setStrategy('high'); setSelectedMgPerKgDay(presets.high); }} />
                <span className="text-sm">High-dose (45 mg/kg/day)</span>
              </label>

              <label className="flex items-center gap-2">
                <input type="radio" name="strat" checked={strategy === 'custom'} onChange={() => setStrategy('custom')} />
                <span className="text-sm">Custom</span>
              </label>

              {strategy === 'custom' && (
                <input type="number" value={customMgPerKgDay} onChange={(e) => setCustomMgPerKgDay(e.target.value)} placeholder="mg/kg/day" className="mt-2 p-2 border rounded w-full" />
              )}

              <label className="block text-xs text-gray-500 mt-1">Selected: {selectedMgPerKgDay} mg/kg/day</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Dosing interval</label>
            <select value={interval} onChange={(e) => setInterval(e.target.value)} className="w-full p-2 border rounded mt-2">
              <option value="BID">BID (every 12h)</option>
              <option value="TID">TID (every 8h)</option>
              <option value="QID">QID (every 6h)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Formulation</label>
            <select value={formulation} onChange={(e) => setFormulation(e.target.value)} className="w-full p-2 border rounded mt-2">
              {Object.keys(syrupOptions).map((k) => (<option key={k} value={k}>{k}</option>))}
              <optgroup label="Tablets">
                {tabletOptions.map((t) => (<option key={`t${t}`} value={`Tablet ${t} mg`}>Tablet {t} mg</option>))}
              </optgroup>
            </select>

            <label className="block text-sm font-medium text-gray-700 mt-3">Tablet strength (for tablet conversion)</label>
            <select value={tabletStrength} onChange={(e) => setTabletStrength(parseFloat(e.target.value))} className="w-full p-2 border rounded mt-2">
              {tabletOptions.map((t) => (<option key={t} value={t}>{t} mg</option>))}
            </select>
          </div>
        </motion.div>

        {/* Quick adjust slider for mg/kg/day (select exact) */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Exact mg/kg/day (adjust if needed)</label>
          <input type="range" min="10" max="90" step="1" value={selectedMgPerKgDay} onChange={(e) => setSelectedMgPerKgDay(e.target.value)} className="w-full mt-2" />
          <div className="text-sm text-gray-600 mt-1">Using {selectedMgPerKgDay} mg/kg/day</div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <button onClick={calculate} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Calculate Dose</button>
          <button onClick={() => { setResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Download CSV</button>
          <button onClick={clearHistory} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {/* Result card */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h2 className="text-lg font-semibold text-blue-700">Recommended Dosing</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>Weight:</strong> {result.weightKg} kg</div>
              <div><strong>Strategy:</strong> {result.strategy} ({result.mgPerKgDay} mg/kg/day)</div>

              <div><strong>Total daily (raw):</strong> {result.totalDailyMg} mg/day</div>
              <div><strong>Total daily (applied):</strong> {result.finalTotalDailyMg} mg/day {result.exceedsDailyCap ? <span className="text-red-600 font-semibold">(capped)</span> : null}</div>

              <div><strong>Doses/day:</strong> {result.dosesPerDay}</div>
              <div><strong>Per dose:</strong> {result.perDoseMg} mg</div>

              {result.mLPerDose !== null ? (
                <>
                  <div><strong>Volume per dose:</strong> {result.mLPerDose} mL</div>
                  <div className="text-sm text-gray-600">(rounded to nearest 0.5 mL)</div>
                </>
              ) : (
                <>
                  <div><strong>Tablets per dose (approx):</strong> {result.tabletsPerDose}</div>
                  <div><strong>Practical tablets to give:</strong> {result.tabletsRounded} × {result.tabletStrength} mg</div>
                </>
              )}

            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-blue-600 text-white rounded">Copy</button>
              <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        {/* History list */}
        <div className="mt-6">
          <h3 className="font-semibold">Session History</h3>
          {history.length === 0 ? (
            <p className="text-gray-500 mt-2">No calculations yet.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {history.map((h) => (
                <div key={h.timestamp} className="p-3 border rounded flex justify-between items-start bg-white">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">{h.perDoseMg} mg per dose × {h.dosesPerDay}/day — {h.finalTotalDailyMg} mg/day</div>
                    <div className="text-xs text-gray-500">{h.mLPerDose ? `${h.mLPerDose} mL per dose (${h.formulation})` : `~${h.tabletsRounded} × ${h.tabletStrength} mg`}</div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h, null, 2)); toast.success('Copied'); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footnote / safety */}
        <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-100 text-sm text-gray-700">
          <strong>Safety note:</strong> This calculator is educational only. Confirm dosing and duration with local clinical guidelines and the treating clinician. Dosing ranges used are illustrative; local formularies and resistance patterns may alter recommended regimens.
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
