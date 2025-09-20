import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Opioid Conversion Calculator — Advanced (React + Tailwind)
 * - Add multiple opioid entries (drug, dose, route, frequency)
 * - Calculates total Oral Morphine Equivalent (OME) using conversion coefficients
 * - Convert total OME to equivalent dose of a chosen target opioid
 * - Supports transdermal patch conversions (mcg/hr -> mg/day) and unit conversions
 * - Incomplete cross-tolerance adjustment (default 25%) with manual override
 * - Rounding to practical units, history, CSV export, copy, print
 * - Strong safety warnings; conversion factors are placeholders and MUST be verified
 *
 * NOTE: This is an educational/demo component only. Do NOT use it as the sole source for clinical decision-making.
 * Always verify conversion ratios with institutional guidelines or a pharmacist.
 */

export default function OpioidConversionCalculator() {
  // --- Conversion coefficients to Oral Morphine Equivalent (OME)
  // coeff = number of mg oral morphine equivalent per 1 unit of the listed drug
  // IMPORTANT: These are illustrative placeholders. Replace with verified institutional values.
  const defaultCoefficients = {
    "Oral morphine (mg)": { coeff: 1, unit: "mg" },
    "Oral oxycodone (mg)": { coeff: 1.5, unit: "mg" },
    "Oral hydromorphone (mg)": { coeff: 4, unit: "mg" },
    "Oral codeine (mg)": { coeff: 0.15, unit: "mg" },
    "Oral tramadol (mg)": { coeff: 0.1, unit: "mg" },
    "Transdermal fentanyl (mcg/hr)": { coeff: 2.4, unit: "mcg/hr" }, // placeholder: conversion uses mcg/hr -> mg morphine/day
    "Oral methadone (mg)": { coeff: 4, unit: "mg" }, // note: methadone conversion is nonlinear in practice
    "Hydrocodone (mg)": { coeff: 1, unit: "mg" },
    "Other (custom)": { coeff: 0, unit: "mg" },
  };

  // State
  const [entries, setEntries] = useState([
    { id: Date.now(), drug: "Oral morphine (mg)", dose: "30", unit: "mg", freqPerDay: 4 },
  ]);
  const [coefficients, setCoefficients] = useState(defaultCoefficients);
  const [targetOpioid, setTargetOpioid] = useState("Oral morphine (mg)");
  const [incompleteCrossTolerancePercent, setIncompleteCrossTolerancePercent] = useState(25); // default reduce 25%
  const [rounding, setRounding] = useState({ mg: 5, mcg: 25 });

  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // Helpers
  const uid = () => Math.random().toString(36).slice(2, 9);

  const parseNumber = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  // Convert an entry to OME (mg morphine/day)
  function entryToOME(entry) {
    const drugMeta = coefficients[entry.drug] || { coeff: 0, unit: "mg" };
    const dose = parseNumber(entry.dose);
    const freq = parseNumber(entry.freqPerDay) || 1;

    if (drugMeta.unit === "mcg/hr") {
      // patch style: dose is mcg/hr; convert to mg morphine/day via coeff (placeholder)
      // example: mcg/hr * 24 * coeffFactor (coeff stored expresses morphine mg per mcg/hr)
      // Using coeff as morphine mg per mcg/hr. So OME = dose(mcg/hr) * 24 * coeff
      const ome = dose * 24 * drugMeta.coeff;
      return ome;
    }

    // oral/parenteral: dose * freqPerDay * coeff
    const ome = dose * freq * drugMeta.coeff;
    return ome;
  }

  function calculateTotalOME() {
    const total = entries.reduce((s, e) => s + entryToOME(e), 0);
    return total;
  }

  // Convert total OME to equivalent target opioid dose (per day)
  function convertOMEtoTarget(totalOME, target) {
    const meta = coefficients[target] || { coeff: 0, unit: "mg" };
    // If target is patch mcg/hr: we need to invert the patch conversion
    if (meta.unit === "mcg/hr") {
      // targetDose_mcg_per_hr = totalOME / (24 * coeff)
      const mcgPerHr = totalOME / (24 * meta.coeff);
      return { value: mcgPerHr, unit: "mcg/hr" };
    }

    // Otherwise: targetDose_mg_per_day = totalOME / coeff
    const mgPerDay = totalOME / meta.coeff;
    return { value: mgPerDay, unit: "mg/day" };
  }

  // Round to practical units
  function practicalRound(value, unit) {
    if (unit === "mcg/hr") {
      const step = rounding.mcg || 25;
      return Math.round(value / step) * step;
    }
    const step = rounding.mg || 5;
    return Math.round(value / step) * step;
  }

  // Core calculate function: computes total OME, applies incomplete cross-tolerance, and suggests target dosing
  function calculate() {
    // sum OME
    const totalOME = calculateTotalOME();
    if (!totalOME || totalOME <= 0) {
      toast.error("Total OME is zero — add valid opioid entries.");
      return;
    }

    // Convert to target
    const rawTarget = convertOMEtoTarget(totalOME, targetOpioid);

    // Apply incomplete cross-tolerance reduction: reduce raw equivalent by percent
    const reductionFactor = (100 - parseNumber(incompleteCrossTolerancePercent || 0)) / 100;

    let adjustedValue = rawTarget.value * reductionFactor;

    // Practical rounding
    const practical = practicalRound(adjustedValue, rawTarget.unit);

    const res = {
      timestamp: new Date().toISOString(),
      entries: JSON.parse(JSON.stringify(entries)),
      totalOME: Math.round(totalOME * 100) / 100,
      rawTarget,
      adjustedValue: Math.round(adjustedValue * 100) / 100,
      practical,
      practicalUnit: rawTarget.unit,
      incompleteCrossTolerancePercent: parseNumber(incompleteCrossTolerancePercent),
    };

    setResult(res);
    setHistory((h) => [res, ...h]);
    toast.success("Conversion calculated. Confirm with clinical guidelines before applying.");
  }

  // CRUD for entries
  function addEntry() {
    setEntries((cur) => [...cur, { id: uid(), drug: "Oral morphine (mg)", dose: "0", unit: "mg", freqPerDay: 1 }]);
  }
  function updateEntry(id, patch) {
    setEntries((cur) => cur.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function removeEntry(id) {
    setEntries((cur) => cur.filter((e) => e.id !== id));
  }

  // Edit coefficients (admin/advanced)
  function updateCoefficient(drugKey, coeff, unit) {
    setCoefficients((c) => ({ ...c, [drugKey]: { coeff: parseNumber(coeff), unit: unit || c[drugKey]?.unit || "mg" } }));
    toast.info(`Updated coefficient for ${drugKey}`);
  }

  // Export / copy
  function downloadCSV() {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","totalOME","targetValue","targetUnit","adjustedValue","practical","incompleteCrossTolerancePercent"];
    const rows = history.map(h => [h.timestamp,h.totalOME,h.rawTarget.value,h.rawTarget.unit,h.adjustedValue,h.practical,h.incompleteCrossTolerancePercent].map(v=>JSON.stringify(v)).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `opioid_conversion_history_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  }

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const lines = [];
    lines.push(`Opioid conversion result — ${new Date(result.timestamp).toLocaleString()}`);
    lines.push(`Total OME: ${result.totalOME} mg morphine/day`);
    lines.push(`Raw equivalent: ${result.rawTarget.value} ${result.rawTarget.unit}`);
    lines.push(`After ${result.incompleteCrossTolerancePercent}% incomplete cross-tolerance: ${result.adjustedValue} ${result.rawTarget.unit}`);
    lines.push(`Practical dose: ${result.practical} ${result.practicalUnit}`);
    try { await navigator.clipboard.writeText(lines.join("\n")); toast.success("Result copied to clipboard."); } catch (e) { toast.error("Copy failed."); }
  };

  // UI
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800">Opioid Conversion Calculator — Advanced</h1>
        <p className="text-sm text-gray-600 mt-1">Add current opioid regimen, calculate Oral Morphine Equivalent (OME), and convert safely to a target opioid. <strong className="text-red-600">Verify conversion factors clinically.</strong></p>

        {/* entries */}
        <div className="mt-6 space-y-3">
          {entries.map((e) => (
            <div key={e.id} className="p-3 border rounded grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-gray-600">Drug</label>
                <select value={e.drug} onChange={(evt) => updateEntry(e.id, { drug: evt.target.value })} className="w-full p-2 border rounded mt-1">
                  {Object.keys(coefficients).map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Dose</label>
                <input type="number" value={e.dose} onChange={(evt) => updateEntry(e.id, { dose: evt.target.value })} className="w-full p-2 border rounded mt-1" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Units</label>
                <input type="text" value={e.unit} onChange={(evt) => updateEntry(e.id, { unit: evt.target.value })} className="w-full p-2 border rounded mt-1" />
              </div>

              <div>
                <label className="text-xs text-gray-600">Frequency/day</label>
                <input type="number" value={e.freqPerDay} onChange={(evt) => updateEntry(e.id, { freqPerDay: evt.target.value })} className="w-full p-2 border rounded mt-1" />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs text-gray-600">OME (mg/day)</label>
                <div className="mt-1 text-sm font-medium">{Math.round(entryToOME(e)*100)/100}</div>
              </div>

              <div className="flex gap-2 md:justify-end md:col-span-6 mt-2 md:mt-0">
                <button onClick={() => removeEntry(e.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded">Remove</button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button onClick={addEntry} className="px-3 py-2 bg-blue-600 text-white rounded">Add entry</button>
            <button onClick={() => setEntries([{ id: uid(), drug: "Oral morphine (mg)", dose: "0", unit: "mg", freqPerDay: 1 }])} className="px-3 py-2 bg-gray-100 rounded">Reset entries</button>
          </div>
        </div>

        {/* options */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-gray-600">Target opioid</label>
            <select value={targetOpioid} onChange={(e) => setTargetOpioid(e.target.value)} className="w-full p-2 border rounded mt-1">
              {Object.keys(coefficients).map((k) => (<option key={k} value={k}>{k}</option>))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-600">Incomplete cross-tolerance (%)</label>
            <input type="number" value={incompleteCrossTolerancePercent} onChange={(e) => setIncompleteCrossTolerancePercent(e.target.value)} className="w-full p-2 border rounded mt-1" />
            <p className="text-xs text-gray-500 mt-1">Default 25% — reduce recommended equivalent to account for cross-tolerance loss.</p>
          </div>

          <div>
            <label className="text-xs text-gray-600">Rounding steps</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={rounding.mg} onChange={(e) => setRounding((r)=>({...r, mg: parseNumber(e.target.value)}))} className="p-2 border rounded w-full" />
              <input type="number" value={rounding.mcg} onChange={(e) => setRounding((r)=>({...r, mcg: parseNumber(e.target.value)}))} className="p-2 border rounded w-full" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={calculate} className="px-4 py-2 bg-slate-700 text-white rounded">Calculate Conversion</button>
          <button onClick={() => { setResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download History CSV</button>
        </div>

        {/* result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-slate-50 rounded border">
            <h2 className="font-semibold text-slate-800">Conversion Result</h2>
            <p className="text-sm text-gray-600">Total OME: <strong>{result.totalOME} mg morphine/day</strong></p>
            <p className="text-sm">Raw equivalent: <strong>{Math.round(result.rawTarget.value*100)/100} {result.rawTarget.unit}</strong></p>
            <p className="text-sm">After {result.incompleteCrossTolerancePercent}% incomplete cross-tolerance: <strong>{result.adjustedValue} {result.rawTarget.unit}</strong></p>
            <p className="text-sm">Practical rounded dose: <strong>{result.practical} {result.practicalUnit}</strong></p>

            <div className="mt-3 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-slate-700 text-white rounded">Copy result</button>
              <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        {/* history */}
        <div className="mt-6">
          <h3 className="font-semibold">Session History</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No conversions yet</p> : (
            <div className="mt-2 space-y-2">
              {history.map(h => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between items-start">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">Total OME: {h.totalOME} mg — Practical: {h.practical} {h.practicalUnit}</div>
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
          <strong>Safety & clinical note:</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>This tool is educational/demo only. Opioid conversions are high-risk — always verify with your institution's guidelines or a clinical pharmacist.</li>
            <li>Conversion factors here are placeholders. Do NOT use these values in clinical care until verified. Methadone and transdermal conversions are nonlinear and require specialist oversight.</li>
            <li>Always consider renal/hepatic function, formulation bioavailability, and patient factors. Reduce for incomplete cross-tolerance and monitor closely after rotation.</li>
          </ul>
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
