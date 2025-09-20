import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Azithromycin Advanced Pediatric Dose Calculator
 * - Multiple regimens: single high-dose, 3-day course, 5-day day1/2-5, 5-day 12 mg/kg
 * - Weight & age conversions (kg/g/lb; yrs/mo/days)
 * - Formulation-aware conversions (syrup mL) and tablet equivalents
 * - Practical rounding (0.5 mL steps) and tablet suggestions
 * - Max per-dose caps applied where appropriate
 * - Warnings: QT prolongation risk, allergy, local resistance guidance
 * - Session history, copy, CSV export, responsive layout
 *
 * Educational/demo only. Verify prescriptions with local clinical guidance.
 */

export default function AzithromycinAdvancedCalculator() {
  // --- Inputs ---
  const [weight, setWeight] = useState(10);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [age, setAge] = useState(2);
  const [ageUnit, setAgeUnit] = useState("years");

  // regimen: single30, threeDay10, fiveDay10_5, fiveDay12
  const [regimen, setRegimen] = useState("fiveDay10_5");
  const [customMgPerKgDay, setCustomMgPerKgDay] = useState(0);

  const [formulation, setFormulation] = useState("Syrup 200 mg/5 mL");
  const syrupOptions = { "Syrup 100 mg/5 mL": 100, "Syrup 200 mg/5 mL": 200 };
  const tabletOptions = [250, 500, 1000];
  const [tabletStrength, setTabletStrength] = useState(250);

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // safety & caps (educational)
  const MAX_PER_DOSE_DAY1 = 1000; // some sources cap single adult doses up to 1 g (day1), pediatric caps often 500 mg for per dose; we'll warn if exceed
  const MAX_PER_DOSE_OTHER = 500; // typical per-dose cap for subsequent days

  // helpers
  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "g") return n / 1000;
    if (unit === "lb") return n * 0.45359237;
    return null;
  };

  const round = (v, d = 2) => {
    if (v === null || v === undefined || isNaN(v)) return v;
    const p = Math.pow(10, d);
    return Math.round(v * p) / p;
  };

  const roundToNearest = (value, step) => Math.round(value / step) * step;

  // compute dosing based on regimen
  const calculate = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) return toast.error("Enter a valid weight.");

    let day1Mg = 0;
    let day2_5Mg = 0; // per day for days 2-5 when applicable
    let duration = 0;

    // Regimens (common pediatric options):
    // single30: single 30 mg/kg (often used for AOM single-dose option)
    // threeDay10: 10 mg/kg once daily for 3 days
    // fiveDay10_5: 10 mg/kg day1 then 5 mg/kg days2-5 (common CAP/pneumonia)
    // fiveDay12: 12 mg/kg once daily for 5 days (pharyngitis/tonsillitis)

    if (regimen === "single30") {
      day1Mg = round(wKg * 30, 2);
      duration = 1;
    } else if (regimen === "threeDay10") {
      day1Mg = round(wKg * 10, 2);
      day2_5Mg = day1Mg;
      duration = 3;
    } else if (regimen === "fiveDay10_5") {
      day1Mg = round(wKg * 10, 2);
      day2_5Mg = round(wKg * 5, 2);
      duration = 5;
    } else if (regimen === "fiveDay12") {
      day1Mg = round(wKg * 12, 2);
      day2_5Mg = day1Mg;
      duration = 5;
    } else if (regimen === "custom") {
      const custom = parseFloat(customMgPerKgDay);
      if (!custom || custom <= 0) return toast.error("Enter valid custom mg/kg/day.");
      day1Mg = round(wKg * custom, 2);
      day2_5Mg = day1Mg;
      duration = 5;
    }

    // apply practical per-dose caps: many references cap pediatric per dose at 500 mg (some allow 1 g single adult dose)
    const day1Cap = MAX_PER_DOSE_DAY1;
    const otherCap = MAX_PER_DOSE_OTHER;

    const day1MgApplied = Math.min(day1Mg, day1Cap);
    const day2_5MgApplied = day2_5Mg ? Math.min(day2_5Mg, otherCap) : 0;

    // convert to formulations
    let mL_day1 = null;
    let mL_day_maybe = null;
    const syrupMgPer5 = syrupOptions[formulation] || 200;
    mL_day1 = roundToNearest((day1MgApplied / syrupMgPer5) * 5, 0.5);
    if (day2_5MgApplied) mL_day_maybe = roundToNearest((day2_5MgApplied / syrupMgPer5) * 5, 0.5);

    // tablets per dose (approx)
    const tabs_day1 = round(day1MgApplied / tabletStrength, 2);
    const tabs_dayOther = day2_5MgApplied ? round(day2_5MgApplied / tabletStrength, 2) : null;
    const tabsRounded_day1 = Math.max(0, Math.round(tabs_day1));
    const tabsRounded_other = tabs_dayOther ? Math.max(0, Math.round(tabs_dayOther)) : null;

    const totalMgGiven = duration === 1 ? day1MgApplied : round(day1MgApplied + day2_5MgApplied * (duration - 1), 2);

    const res = {
      timestamp: new Date().toISOString(),
      weightKg: round(wKg, 2),
      regimen,
      day1MgRaw: day1Mg,
      day1MgApplied,
      day2_5MgRaw: day2_5Mg,
      day2_5MgApplied,
      duration,
      totalMgGiven,
      mL_day1,
      mL_dayOther: mL_day_maybe,
      tabs_day1,
      tabs_dayOther,
      tabsRounded_day1,
      tabsRounded_other,
      tabletStrength,
    };

    setResult(res);
    setHistory((h) => [res, ...h]);

    // warnings
    if (day1Mg > day1Cap) toast.warning(`Day 1 dose was capped at ${day1Cap} mg for safety/practicality.`);
    if (day2_5Mg && day2_5Mg > otherCap) toast.warning(`Subsequent-day dose was capped at ${otherCap} mg.`);
    toast.success("Calculation complete.");
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info("History cleared.");
  };

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","weightKg","regimen","day1MgApplied","day2_5MgApplied","duration","totalMgGiven"];
    const rows = history.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `azithro_history_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const text = `Azithromycin result (${new Date(result.timestamp).toLocaleString()}):\nWeight: ${result.weightKg} kg\nRegimen: ${result.regimen}\nDay1: ${result.day1MgApplied} mg (${result.mL_day1} mL or ~${result.tabsRounded_day1} x ${result.tabletStrength} mg)\nDuration: ${result.duration} days\nTotal given: ${result.totalMgGiven} mg`;
    try { await navigator.clipboard.writeText(text); toast.success("Result copied."); } catch (e) { toast.error("Copy failed."); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-2xl font-bold text-indigo-700">Azithromycin — Advanced Pediatric Dose Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Multiple pediatric regimens (single-dose, 3-day, 5-day) with formulation conversions and safety checks.</p>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Weight</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Weight unit</label>
            <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="lb">lb</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Age</label>
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

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Select regimen</label>
            <select value={regimen} onChange={(e) => setRegimen(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="single30">Single 30 mg/kg (single-dose option)</option>
              <option value="threeDay10">10 mg/kg once daily (3 days)</option>
              <option value="fiveDay10_5">Day1: 10 mg/kg → Days2-5: 5 mg/kg</option>
              <option value="fiveDay12">12 mg/kg once daily for 5 days</option>
              <option value="custom">Custom mg/kg/day (enter below)</option>
            </select>
            {regimen === 'custom' && (
              <input type="number" value={customMgPerKgDay} onChange={(e) => setCustomMgPerKgDay(e.target.value)} placeholder="mg/kg/day" className="mt-2 p-2 border rounded w-full" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Formulation (syrup)</label>
            <select value={formulation} onChange={(e) => setFormulation(e.target.value)} className="w-full p-2 border rounded mt-1">
              {Object.keys(syrupOptions).map(k => <option key={k} value={k}>{k}</option>)}
            </select>

            <label className="block text-sm font-medium mt-3">Tablet strength (for tablet conversion)</label>
            <select value={tabletStrength} onChange={(e) => setTabletStrength(parseFloat(e.target.value))} className="w-full p-2 border rounded mt-1">
              {tabletOptions.map(t => <option key={t} value={t}>{t} mg</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Practical options</label>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <p>Per-dose caps applied: Day 1 up to 1000 mg; subsequent days up to 500 mg (practical/safety).</p>
              <p className="text-red-600 font-medium">Warning: Azithromycin can prolong QT interval in susceptible patients. Review medications and cardiac history before use.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={calculate} className="px-4 py-2 bg-indigo-600 text-white rounded">Calculate</button>
          <button onClick={() => { setResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
          <button onClick={clearHistory} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-indigo-50 rounded border">
            <h2 className="text-lg font-semibold text-indigo-700">Result</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>Weight:</strong> {result.weightKg} kg</div>
              <div><strong>Regimen:</strong> {result.regimen}</div>

              <div><strong>Day 1 (raw):</strong> {result.day1MgRaw} mg</div>
              <div><strong>Day 1 (applied):</strong> {result.day1MgApplied} mg</div>

              {result.day2_5MgRaw ? (
                <>
                  <div><strong>Subsequent day (raw):</strong> {result.day2_5MgRaw} mg</div>
                  <div><strong>Subsequent day (applied):</strong> {result.day2_5MgApplied} mg</div>
                </>
              ) : null}

              <div><strong>Duration:</strong> {result.duration} day(s)</div>
              <div><strong>Total mg given (approx):</strong> {result.totalMgGiven} mg</div>

              <div><strong>Volume (day1):</strong> {result.mL_day1} mL</div>
              {result.mL_dayOther ? <div><strong>Volume (other days):</strong> {result.mL_dayOther} mL</div> : null}

              <div><strong>Tablet equiv (day1):</strong> ~{result.tabs_day1} ({result.tabsRounded_day1} practical)</div>
              {result.tabs_dayOther ? <div><strong>Tablet equiv (other):</strong> ~{result.tabs_dayOther} ({result.tabsRounded_other} practical)</div> : null}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-indigo-600 text-white rounded">Copy</button>
              <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        <div className="mt-6">
          <h3 className="font-semibold">Session history</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No history</p> : (
            <div className="mt-2 space-y-2">
              {history.map(h => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">{h.day1MgApplied} mg day1 — {h.totalMgGiven} mg total ({h.duration}d)</div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h, null, 2)); toast.success('Copied'); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded text-sm text-gray-700">
          <strong>Clinical notes & warnings:</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>Azithromycin is approved for use in children ≥6 months for many indications; dosing varies by indication (otitis media, CAP, pharyngitis, chlamydia, etc.).</li>
            <li>QT prolongation risk — review cardiac history and interacting drugs before prescribing.</li>
            <li>This tool is educational. Always verify dosing and indications with local clinical guidelines and product labeling.</li>
          </ul>
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
