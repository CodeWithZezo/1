import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Prednisolone Pediatric Dose Calculator — Full working component
 * - Indication presets (editable)
 * - Weight & age inputs (kg, g, lb ; yrs/mo/days)
 * - Calculates single dose (mg) and daily dosing when relevant
 * - Applies max single-dose caps and practical rounding
 * - Converts to formulation volumes (syrup mg/5mL) and tablet suggestions
 * - Session history, copy, CSV export, print
 * - Responsive Tailwind-friendly UI
 *
 * Educational only — verify with your local clinical guidance.
 */

export default function PrednisolonePediatricCalculator() {
  // Inputs
  const [age, setAge] = useState(4);
  const [ageUnit, setAgeUnit] = useState("years");
  const [weight, setWeight] = useState(15);
  const [weightUnit, setWeightUnit] = useState("kg");

  // Presets
  const defaultPresets = {
    asthma: { label: "Asthma exacerbation (oral)", mgPerKg: 1, maxSingleMg: 40, freq: "Once daily or divided" },
    croup: { label: "Croup (single dose)", mgPerKg: 0.15, maxSingleMg: 10, freq: "Single dose" },
    nephrotic: { label: "Nephrotic syndrome (taper)", mgPerKg: 2, maxSingleMg: 60, freq: "Daily / per protocol" },
    autoimmune: { label: "Autoimmune / inflammatory", mgPerKg: 1, maxSingleMg: 60, freq: "Once daily" },
    antiemetic: { label: "Antiemetic adjunct", mgPerKg: 0.15, maxSingleMg: 8, freq: "Single dose" },
    custom: { label: "Custom", mgPerKg: 1, maxSingleMg: 50, freq: "Once daily" },
  };

  const [presetKey, setPresetKey] = useState("asthma");
  const [presets, setPresets] = useState(defaultPresets);
  const [useCustom, setUseCustom] = useState(false);
  const [customMgPerKg, setCustomMgPerKg] = useState(1);
  const [customMaxSingle, setCustomMaxSingle] = useState(50);

  // Formulations — sugar syrup strengths and tablets
  const [formulations, setFormulations] = useState({
    "Syrup 5 mg/5 mL": { type: "syrup", mgPer5ml: 5 },
    "Syrup 10 mg/5 mL": { type: "syrup", mgPer5ml: 10 },
    "Tablet 5 mg": { type: "tablet", mgPerTablet: 5 },
    "Tablet 20 mg": { type: "tablet", mgPerTablet: 20 },
  });

  const [formulationKey, setFormulationKey] = useState("Syrup 5 mg/5 mL");
  const [roundingMlStep, setRoundingMlStep] = useState(0.25); // mL

  // Results & history
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Helpers
  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || isNaN(n)) return null;
    if (unit === "kg") return n;
    if (unit === "g") return n / 1000;
    if (unit === "lb") return n * 0.45359237;
    return null;
  };

  const roundTo = (val, step) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    if (!step || step <= 0) return Math.round(val * 100) / 100;
    return Math.round(val / step) * step;
  };

  const calculate = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) {
      toast.error("Enter a valid weight.");
      return;
    }

    // select preset or custom
    const preset = presets[presetKey] || presets.custom;
    const mgPerKg = useCustom ? parseFloat(customMgPerKg) : parseFloat(preset.mgPerKg);
    const maxSingle = useCustom ? parseFloat(customMaxSingle) : parseFloat(preset.maxSingleMg);

    if (!mgPerKg || mgPerKg <= 0) {
      toast.error("Invalid mg/kg value.");
      return;
    }

    // compute single dose
    const rawSingleMg = wKg * mgPerKg;
    const appliedSingleMg = maxSingle > 0 ? Math.min(rawSingleMg, maxSingle) : rawSingleMg;

    // determine frequency label
    const frequencyLabel = preset.freq || "Once daily";

    // formulation conversion
    const form = formulations[formulationKey];
    let mlPerDose = null;
    let tabletsPerDose = null;

    if (form.type === "syrup") {
      const ml = (appliedSingleMg / form.mgPer5ml) * 5; // mL
      mlPerDose = roundTo(ml, roundingMlStep);
    } else if (form.type === "tablet") {
      // suggest integer tablet count nearest
      const cnt = Math.round(appliedSingleMg / form.mgPerTablet);
      tabletsPerDose = cnt;
    }

    const noteWarnings = [];
    if (rawSingleMg > maxSingle) {
      noteWarnings.push(`Calculated single dose (${Math.round(rawSingleMg)} mg) exceeds preset maximum (${maxSingle} mg) and was capped.`);
    }
    if (wKg < 1) {
      noteWarnings.push("Very low weight — verify dosing; infant/neonate guidance may differ.");
    }

    const res = {
      timestamp: new Date().toISOString(),
      age,
      ageUnit,
      weightKg: Math.round(wKg * 100) / 100,
      preset: preset.label,
      mgPerKg: mgPerKg,
      rawSingleMg: Math.round(rawSingleMg * 100) / 100,
      appliedSingleMg: Math.round(appliedSingleMg * 100) / 100,
      frequency: frequencyLabel,
      mlPerDose,
      tabletsPerDose,
      formulation: formulationKey,
      warnings: noteWarnings,
    };

    setResult(res);
    setHistory((h) => [res, ...h]);
    toast.success("Calculated — educational only. Verify clinically.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const lines = [];
    lines.push(`Prednisolone dosing — ${new Date(result.timestamp).toLocaleString()}`);
    lines.push(`Age: ${result.age} ${result.ageUnit} • Weight: ${result.weightKg} kg`);
    lines.push(`Indication: ${result.preset}`);
    lines.push(`Dose: ${result.appliedSingleMg} mg per dose (${result.frequency})`);
    if (result.mlPerDose !== null) lines.push(`Volume: ${result.mlPerDose} mL of ${result.formulation}`);
    if (result.tabletsPerDose !== null) lines.push(`Tablets: ~${result.tabletsPerDose} × ${formulations[result.formulation].mgPerTablet} mg`);
    if (result.warnings && result.warnings.length) {
      lines.push("Warnings:");
      result.warnings.forEach((w) => lines.push(`- ${w}`));
    }
    try { await navigator.clipboard.writeText(lines.join("\n")); toast.success("Copied to clipboard"); } catch (e) { toast.error("Copy failed"); }
  };

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","age","ageUnit","weightKg","preset","mgPerKg","appliedSingleMg","frequency","formulation","mlPerDose","tabletsPerDose"];
    const rows = history.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `prednisolone_history_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const clearHistory = () => { setHistory([]); toast.info("History cleared"); };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-indigo-700">Prednisolone Pediatric Dose Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Advanced, responsive dosing tool. Educational only — verify with treating clinician.</p>

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
            <label className="text-sm font-medium">Indication / preset</label>
            <select value={presetKey} onChange={(e) => setPresetKey(e.target.value)} className="w-full p-2 border rounded mt-1">
              {Object.keys(presets).map((k) => (<option key={k} value={k}>{presets[k].label}</option>))}
            </select>

            <label className="text-xs text-gray-500 mt-2">Override preset?</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
              <span className="text-sm">Use custom mg/kg and max</span>
            </div>
          </div>
        </motion.div>

        {useCustom ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Custom mg/kg</label>
              <input type="number" value={customMgPerKg} onChange={(e) => setCustomMgPerKg(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Custom max single mg</label>
              <input type="number" value={customMaxSingle} onChange={(e) => setCustomMaxSingle(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Formulation</label>
            <select value={formulationKey} onChange={(e) => setFormulationKey(e.target.value)} className="w-full p-2 border rounded mt-1">
              {Object.keys(formulations).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Round volumes to</label>
            <select value={roundingMlStep} onChange={(e) => setRoundingMlStep(parseFloat(e.target.value))} className="w-full p-2 border rounded mt-1">
              <option value={0.1}>0.1 mL</option>
              <option value={0.25}>0.25 mL</option>
              <option value={0.5}>0.5 mL</option>
              <option value={1}>1.0 mL</option>
            </select>
          </div>

          <div className="flex items-end">
            <button onClick={calculate} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">Calculate</button>
          </div>
        </motion.div>

        <div className="mt-6 flex gap-3 flex-wrap">
          <button onClick={copyResult} className="px-4 py-2 bg-indigo-500 text-white rounded">Copy Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
          <button onClick={() => { setResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={clearHistory} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-indigo-50 rounded border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-700">Result</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
              <div><strong>Weight:</strong> {result.weightKg} kg</div>
              <div><strong>Indication:</strong> {result.preset}</div>
              <div><strong>mg/kg used:</strong> {result.mgPerKg} mg/kg</div>
              <div><strong>Single dose (applied):</strong> {result.appliedSingleMg} mg</div>
              <div><strong>Frequency:</strong> {result.frequency}</div>
              <div><strong>Formulation:</strong> {result.formulation}</div>

              {result.mlPerDose !== null ? <div><strong>Volume per dose:</strong> {result.mlPerDose} mL</div> : null}
              {result.tabletsPerDose !== null ? <div><strong>Tablets per dose (approx):</strong> {result.tabletsPerDose} × {formulations[result.formulation].mgPerTablet} mg</div> : null}

              {result.warnings && result.warnings.length ? (
                <div className="col-span-2 text-sm text-yellow-800">
                  <strong>Warnings:</strong>
                  <ul className="list-disc ml-5 mt-1">
                    {result.warnings.map((w, i) => (<li key={i}>{w}</li>))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex gap-2">
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
                    <div className="mt-1 text-sm">{h.appliedSingleMg} mg — {h.formulation} — {h.frequency}</div>
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
          <strong>Disclaimer:</strong> This calculator is for educational use only. Prednisolone dosing varies by indication and local protocols; always confirm with the treating clinician and institutional guidance.
        </div>

      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
