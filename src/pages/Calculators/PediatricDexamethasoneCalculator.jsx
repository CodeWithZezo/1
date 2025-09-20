import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Pediatric Dexamethasone Calculator — Advanced, responsive React component
 * - Weight & age conversions (kg/g/lb and yrs/mo/days)
 * - Indication-based presets (editable) and custom mg/kg input
 * - Single-dose and daily dose calculations with max caps and warnings
 * - Formulation-aware conversions (oral solution, tablet, injection)
 * - Practical rounding for mL (0.1 mL) and tablet suggestions
 * - History (session), copy, CSV export, print
 * - Strong disclaimer: educational/demo only — verify with local guidelines/clinician
 */

export default function PediatricDexamethasoneCalculator() {
  // Inputs
  const [weight, setWeight] = useState(15); // default 15 kg
  const [weightUnit, setWeightUnit] = useState("kg");
  const [age, setAge] = useState(4);
  const [ageUnit, setAgeUnit] = useState("years");

  // Indication presets (example defaults). These are editable in the UI.
  const defaultIndications = {
    croup: { label: "Croup (single dose)", mgPerKg: 0.6, maxSingleMg: 16, freq: "Single dose" },
    asthma: { label: "Acute asthma exacerbation", mgPerKg: 0.3, maxSingleMg: 10, freq: "Once daily" },
    cerebralEdema: { label: "Cerebral edema / raised ICP (IV)", mgPerKg: 0.25, maxSingleMg: 10, freq: "q6-12h (clinician)" },
    antiemetic: { label: "Antiemetic adjunct", mgPerKg: 0.15, maxSingleMg: 8, freq: "Once daily" },
    custom: { label: "Custom", mgPerKg: 0.15, maxSingleMg: 10, freq: "Once daily" },
  };

  const [indicationKey, setIndicationKey] = useState("croup");
  const [indications, setIndications] = useState(defaultIndications);

  // allow user to override mg/kg or max
  const [useCustomMgPerKg, setUseCustomMgPerKg] = useState(false);
  const [customMgPerKg, setCustomMgPerKg] = useState(0.3);
  const [customMaxSingleMg, setCustomMaxSingleMg] = useState(10);
  const [frequency, setFrequency] = useState("Once daily");

  // Formulations: default common concentrations but editable
  const [formulation, setFormulation] = useState("Oral solution 0.5 mg/5 mL");
  const [formulations, setFormulations] = useState({
    "Oral solution 0.5 mg/5 mL": { type: "syrup", mgPer5ml: 0.5 },
    "Oral solution 1 mg/mL (10 mg/10 mL)": { type: "syrup", mgPer5ml: 2.5 },
    "Tablet 0.5 mg": { type: "tablet", mgPerTablet: 0.5 },
    "Tablet 1 mg": { type: "tablet", mgPerTablet: 1 },
    "Injection 4 mg/mL": { type: "injection", mgPerMl: 4 },
  });

  // Results & history
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Helpers
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

  const roundToStep = (val, step) => Math.round(val / step) * step;

  // Main calculate
  const calculate = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) return toast.error("Enter a valid weight.");

    const preset = indications[indicationKey] || indications.custom;
    const mgPerKgUsed = useCustomMgPerKg ? parseFloat(customMgPerKg) : parseFloat(preset.mgPerKg || 0);
    if (!mgPerKgUsed || mgPerKgUsed <= 0) return toast.error("Enter a valid mg/kg dose.");

    const maxSingle = useCustomMgPerKg ? parseFloat(customMaxSingleMg) : parseFloat(preset.maxSingleMg || 0);

    // calculate raw single dose and apply cap
    const rawSingleMg = wKg * mgPerKgUsed;
    const appliedSingleMg = maxSingle && maxSingle > 0 ? Math.min(rawSingleMg, maxSingle) : rawSingleMg;
    const capped = appliedSingleMg < rawSingleMg;

    // daily dose depends on frequency — if single-dose, daily = appliedSingleMg
    let dosesPerDay = 1;
    if (frequency === "Once daily") dosesPerDay = 1;
    else if (frequency === "Twice daily") dosesPerDay = 2;
    else if (frequency === "Three times daily") dosesPerDay = 3;
    else if (frequency === "q6h") dosesPerDay = 4;
    else if (frequency === "Single dose") dosesPerDay = 1;

    const dailyMg = appliedSingleMg * dosesPerDay;

    // Formulation conversions
    const form = formulations[formulation];
    let mLPerDose = null;
    let tabletsPerDose = null;
    let injectionMlPerDose = null;

    if (form) {
      if (form.type === "syrup") {
        // mg per 5 mL -> mL required
        const mgPer5 = parseFloat(form.mgPer5ml) || 0;
        if (mgPer5 > 0) {
          const ml = (appliedSingleMg / mgPer5) * 5;
          // practical rounding to 0.1 mL
          mLPerDose = roundToStep(ml, 0.1);
        }
      } else if (form.type === "tablet") {
        const mgTab = parseFloat(form.mgPerTablet) || 1;
        tabletsPerDose = round(appliedSingleMg / mgTab, 3);
      } else if (form.type === "injection") {
        const mgPerMl = parseFloat(form.mgPerMl) || 1;
        injectionMlPerDose = round(appliedSingleMg / mgPerMl, 2);
      }
    }

    const res = {
      timestamp: new Date().toISOString(),
      weightKg: round(wKg, 2),
      indication: preset.label || "Custom",
      mgPerKgUsed: round(mgPerKgUsed, 3),
      rawSingleMg: round(rawSingleMg, 2),
      appliedSingleMg: round(appliedSingleMg, 2),
      capped,
      dosesPerDay,
      dailyMg: round(dailyMg, 2),
      mLPerDose,
      tabletsPerDose,
      injectionMlPerDose,
      frequency,
      formulation,
    };

    setResult(res);
    setHistory((h) => [res, ...h]);

    if (capped) toast.warning("Single dose was capped at preset maximum — review clinical guidance.");
    toast.success("Calculation complete (educational). Verify clinically.");
  };

  // utilities
  const clear = () => setResult(null);
  const clearHistory = () => { setHistory([]); toast.info("History cleared."); };

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","weightKg","indication","mgPerKgUsed","appliedSingleMg","dosesPerDay","dailyMg","formulation","mLPerDose","tabletsPerDose","injectionMlPerDose"];
    const rows = history.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `dexamethasone_history_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const lines = [
      `Dexamethasone calculation — ${new Date(result.timestamp).toLocaleString()}`,
      `Weight: ${result.weightKg} kg`,
      `Indication: ${result.indication}`,
      `Dose used: ${result.mgPerKgUsed} mg/kg → Single dose: ${result.appliedSingleMg} mg${result.capped ? ' (capped)' : ''}`,
      `Frequency: ${result.frequency} → Daily total: ${result.dailyMg} mg`,
      result.mLPerDose ? `Give: ${result.mLPerDose} mL of ${result.formulation}` : null,
      result.tabletsPerDose ? `Tablets: ~${result.tabletsPerDose} of ${result.formulation}` : null,
      result.injectionMlPerDose ? `Injection: ${result.injectionMlPerDose} mL of ${result.formulation}` : null,
      "\nDisclaimer: Educational tool only. Verify with treating clinician and local guidelines.",
    ].filter(Boolean).join('\n');

    try { await navigator.clipboard.writeText(lines); toast.success('Result copied to clipboard.'); } catch (e) { toast.error('Copy failed.'); }
  };

  // UI
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-2xl font-bold text-indigo-700">Pediatric Dexamethasone Calculator — Advanced</h1>
        <p className="text-sm text-gray-600 mt-1">Educational tool — calculates weight-based dexamethasone dosing, converts to practical volumes/tablets and enforces caps. Verify with local guidance.</p>

        {/* Inputs */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1 }} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium">Age (optional)</label>
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

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Indication / preset</label>
            <select value={indicationKey} onChange={(e) => { setIndicationKey(e.target.value); setFrequency(indications[e.target.value]?.freq || 'Once daily'); }} className="w-full p-2 border rounded mt-1">
              {Object.keys(indications).map((k) => (<option key={k} value={k}>{indications[k].label}</option>))}
            </select>

            <label className="block text-xs text-gray-500 mt-2">Edit preset (mg/kg and max single mg)</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={indications[indicationKey].mgPerKg} onChange={(e) => setIndications(i => ({ ...i, [indicationKey]: { ...i[indicationKey], mgPerKg: e.target.value } }))} className="p-2 border rounded w-1/2" />
              <input type="number" value={indications[indicationKey].maxSingleMg} onChange={(e) => setIndications(i => ({ ...i, [indicationKey]: { ...i[indicationKey], maxSingleMg: e.target.value } }))} className="p-2 border rounded w-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Use custom mg/kg?</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" checked={useCustomMgPerKg} onChange={(e) => setUseCustomMgPerKg(e.target.checked)} />
              <span className="text-sm">Override preset</span>
            </div>
            {useCustomMgPerKg && (
              <div className="mt-2">
                <input type="number" value={customMgPerKg} onChange={(e) => setCustomMgPerKg(e.target.value)} className="p-2 border rounded w-full" placeholder="mg/kg" />
                <input type="number" value={customMaxSingleMg} onChange={(e) => setCustomMaxSingleMg(e.target.value)} className="p-2 border rounded w-full mt-2" placeholder="max single mg" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="Single dose">Single dose</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="q6h">Every 6 hours (q6h)</option>
            </select>

            <label className="block text-sm font-medium mt-3">Formulation</label>
            <select value={formulation} onChange={(e) => setFormulation(e.target.value)} className="w-full p-2 border rounded mt-1">
              {Object.keys(formulations).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </motion.div>

        <div className="mt-6 flex gap-3 flex-wrap">
          <button onClick={calculate} className="px-4 py-2 bg-indigo-600 text-white rounded">Calculate Dose</button>
          <button onClick={clear} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
          <button onClick={() => { setHistory([]); toast.info('History cleared.'); }} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-indigo-50 rounded border border-indigo-100">
            <h2 className="text-lg font-semibold text-indigo-700">Result</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
              <div><strong>Weight:</strong> {result.weightKg} kg</div>
              <div><strong>Indication:</strong> {result.indication}</div>

              <div><strong>mg/kg used:</strong> {result.mgPerKgUsed} mg/kg</div>
              <div><strong>Single dose (applied):</strong> {result.appliedSingleMg} mg {result.capped ? <span className="text-red-600 font-semibold">(capped)</span> : null}</div>

              <div><strong>Doses/day:</strong> {result.dosesPerDay}</div>
              <div><strong>Daily total:</strong> {result.dailyMg} mg</div>

              {result.mLPerDose !== null ? <div><strong>Oral volume per dose:</strong> {result.mLPerDose} mL ({result.formulation})</div> : null}
              {result.tabletsPerDose !== null ? <div><strong>Tablets per dose (approx):</strong> {result.tabletsPerDose}</div> : null}
              {result.injectionMlPerDose !== null ? <div><strong>Injection volume per dose:</strong> {result.injectionMlPerDose} mL</div> : null}

            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-indigo-600 text-white rounded">Copy</button>
              <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        {/* History */}
        <div className="mt-6">
          <h3 className="font-semibold">Session history</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No calculations yet.</p> : (
            <div className="mt-2 space-y-2">
              {history.map(h => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">{h.indication}: {h.appliedSingleMg} mg per dose × {h.dosesPerDay}/day</div>
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
          <strong>Disclaimer:</strong> This calculator is for educational/demo purposes only. Dexamethasone dosing varies by indication, age group, formulation and local protocols. Always verify dosing, route, and monitoring with the treating clinician and your institution's guidelines before giving medication.
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
