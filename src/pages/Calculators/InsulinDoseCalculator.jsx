import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Insulin Advanced Calculator (React + Tailwind)
 * Features:
 * - Estimate Total Daily Dose (TDD) from weight or custom
 * - Suggest basal/bolus split (default 50/50) with adjustable split
 * - Calculate Insulin-to-Carb Ratio (ICR) using 500-rule
 * - Calculate Insulin Sensitivity Factor (ISF) using 1800 or 1500 rule
 * - Carb bolus + correction calculation (accounts for active insulin/IOB)
 * - Active insulin (IOB) simple decay model (duration configurable)
 * - History, copy, CSV export, completely responsive layout
 *
 * Clinical notes: educational/demo only. Verify with provider/local guidelines.
 */

export default function InsulinAdvancedCalculator() {
  // Inputs
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [tddMethod, setTddMethod] = useState("estimate"); // estimate | custom
  const [tddEstimatePerKg, setTddEstimatePerKg] = useState(0.5); // U/kg/day
  const [customTDD, setCustomTDD] = useState(40);

  const [basalPercent, setBasalPercent] = useState(50); // percent of TDD
  const [icrRule, setIcrRule] = useState("500"); // 500-rule
  const [isfRule, setIsfRule] = useState("1800"); // 1800 or 1500

  const [carbGrams, setCarbGrams] = useState(45);
  const [currentBG, setCurrentBG] = useState(180); // mg/dL
  const [targetBG, setTargetBG] = useState(120); // mg/dL

  const [insulinOnBoard, setInsulinOnBoard] = useState(0); // units currently active
  const [insulinDurationHours, setInsulinDurationHours] = useState(4); // decay window

  const [unitFormulation, setUnitFormulation] = useState("units");

  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // Helpers
  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "lb") return n * 0.45359237;
    if (unit === "g") return n / 1000;
    return null;
  };

  const round = (v, d = 2) => {
    if (v === null || v === undefined || isNaN(v)) return v;
    const p = Math.pow(10, d);
    return Math.round(v * p) / p;
  };

  // Calculate TDD
  const calcTDD = () => {
    const wKg = toKg(weight, weightUnit);
    if (!wKg) return null;
    if (tddMethod === "estimate") {
      return round(wKg * parseFloat(tddEstimatePerKg), 2);
    }
    return round(parseFloat(customTDD), 2);
  };

  // ICR via 500-rule
  const calcICR = (tdd) => {
    if (!tdd || tdd <= 0) return null;
    if (icrRule === "500") return round(500 / tdd, 2);
    if (icrRule === "450") return round(450 / tdd, 2);
    return round(500 / tdd, 2);
  };

  // ISF via 1800 or 1500 rule
  const calcISF = (tdd) => {
    if (!tdd || tdd <= 0) return null;
    if (isfRule === "1800") return round(1800 / tdd, 1);
    if (isfRule === "1500") return round(1500 / tdd, 1);
    return round(1800 / tdd, 1);
  };

  // IOB naive remaining effect (linear decay)
  const calcRemainingIOB = (iob, hoursSince) => {
    const dur = parseFloat(insulinDurationHours) || 4;
    if (!iob || iob <= 0) return 0;
    if (hoursSince >= dur) return 0;
    const rem = iob * (1 - hoursSince / dur);
    return round(rem, 2);
  };

  // Main: compute bolus
  const calculateBolus = () => {
    const tdd = calcTDD();
    if (!tdd) {
      toast.error("Please enter valid weight / TDD settings.");
      return;
    }

    const icr = calcICR(tdd);
    const isf = calcISF(tdd);

    if (!icr || !isf) {
      toast.error("Unable to compute ICR/ISF. Check TDD and rules.");
      return;
    }

    // carb units
    const carbUnits = round(carbGrams / icr, 2);

    // correction units: (current - target) / ISF
    const correctionUnitsRaw = (currentBG - targetBG) / isf;
    const correctionUnits = correctionUnitsRaw > 0 ? round(correctionUnitsRaw, 2) : 0;

    // account for insulin on board (IOB) as subtractive
    const iob = round(insulinOnBoard || 0, 2);

    let suggestedBolus = carbUnits + correctionUnits - iob;
    if (suggestedBolus < 0) suggestedBolus = 0;

    // basal/bolus split
    const basalUnits = round((tdd * (basalPercent / 100)) , 2);
    const bolusDaily = round(tdd - basalUnits, 2);

    const res = {
      timestamp: new Date().toISOString(),
      tdd,
      tddPerKg: round(tdd / toKg(weight, weightUnit), 2),
      icr,
      isf,
      carbUnits,
      correctionUnits,
      iob,
      suggestedBolus: round(suggestedBolus, 2),
      basalUnits,
      bolusDaily,
      carbGrams,
      currentBG,
      targetBG,
    };

    setResult(res);
    setHistory((h) => [res, ...h]);

    toast.success("Bolus calculated (educational). Verify clinically.");
  };

  const downloadCSV = () => {
    if (!history.length) { toast.error("No history to download."); return; }
    const headers = ["timestamp","tdd","tddPerKg","icr","isf","carbGrams","carbUnits","correctionUnits","iob","suggestedBolus","basalUnits","bolusDaily"];
    const rows = history.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `insulin_history_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const clearHistory = () => { setHistory([]); toast.info("History cleared."); };

  // responsive UI
  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-emerald-700">Insulin Dose Calculator — Advanced</h1>
        <p className="text-sm text-gray-600 mt-1">Estimate TDD, ICR (500-rule), ISF (1800/1500 rules) and compute carb + correction bolus. Educational only.</p>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1 }} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Weight</label>
            <input type="number" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium">Unit</label>
            <select value={weightUnit} onChange={e=>setWeightUnit(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="g">g</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">TDD method</label>
            <select value={tddMethod} onChange={e=>setTddMethod(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="estimate">Estimate from weight (U/kg/day)</option>
              <option value="custom">Custom TDD (units/day)</option>
            </select>
          </div>
        </motion.div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {tddMethod === 'estimate' ? (
            <div>
              <label className="block text-sm font-medium">Estimate (U/kg/day)</label>
              <select value={tddEstimatePerKg} onChange={e=>setTddEstimatePerKg(e.target.value)} className="w-full p-2 border rounded mt-1">
                <option value={0.4}>0.4 U/kg/day (low)</option>
                <option value={0.5}>0.5 U/kg/day (typical)</option>
                <option value={0.7}>0.7 U/kg/day (higher)</option>
                <option value={1.0}>1.0 U/kg/day (insulin resistant)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium">Custom TDD (units/day)</label>
              <input type="number" value={customTDD} onChange={e=>setCustomTDD(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium">Basal % of TDD</label>
            <input type="range" min={20} max={80} value={basalPercent} onChange={e=>setBasalPercent(parseInt(e.target.value))} className="w-full mt-2" />
            <div className="text-sm text-gray-600 mt-1">Basal: {basalPercent}%  • Bolus: {100-basalPercent}%</div>
          </div>

          <div>
            <label className="block text-sm font-medium">ICR rule</label>
            <select value={icrRule} onChange={e=>setIcrRule(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="500">500-rule (ICR = 500 ÷ TDD)</option>
              <option value="450">450-rule</option>
            </select>

            <label className="block text-sm font-medium mt-3">ISF rule</label>
            <select value={isfRule} onChange={e=>setIsfRule(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="1800">1800-rule (regular insulin)</option>
              <option value="1500">1500-rule (rapid-acting)</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Carbs to cover (g)</label>
            <input type="number" value={carbGrams} onChange={e=>setCarbGrams(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium">Current BG (mg/dL)</label>
            <input type="number" value={currentBG} onChange={e=>setCurrentBG(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="block text-sm font-medium">Target BG (mg/dL)</label>
            <input type="number" value={targetBG} onChange={e=>setTargetBG(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Insulin on board (units)</label>
            <input type="number" value={insulinOnBoard} onChange={e=>setInsulinOnBoard(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Insulin duration (hrs)</label>
            <input type="number" value={insulinDurationHours} onChange={e=>setInsulinDurationHours(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Unit label</label>
            <input type="text" value={unitFormulation} onChange={e=>setUnitFormulation(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
        </div>

        <div className="mt-6 flex gap-3 flex-wrap">
          <button onClick={calculateBolus} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Calculate Bolus</button>
          <button onClick={()=>{ setResult(null); }} className="px-4 py-2 bg-gray-100 rounded">Clear</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
          <button onClick={clearHistory} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {/* Result */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-emerald-50 rounded border border-emerald-100">
            <h2 className="text-lg font-semibold text-emerald-700">Suggested Bolus</h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>TDD:</strong> {result.tdd} units/day ({result.tddPerKg} U/kg)</div>
              <div><strong>Basal:</strong> {result.basalUnits} units/day • <strong>Bolus daily:</strong> {result.bolusDaily} units/day</div>

              <div><strong>ICR:</strong> 1 U : {result.icr} g carbs</div>
              <div><strong>ISF:</strong> 1 U lowers ~{result.isf} mg/dL</div>

              <div><strong>Carb coverage:</strong> {result.carbUnits} U</div>
              <div><strong>Correction:</strong> {result.correctionUnits} U</div>

              <div><strong>IOB subtracted:</strong> {result.iob} U</div>
              <div><strong>Suggested bolus:</strong> {result.suggestedBolus} {unitFormulation}</div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={async ()=>{ try{ await navigator.clipboard.writeText(JSON.stringify(result, null, 2)); toast.success('Copied result'); }catch(e){toast.error('Copy failed')} }} className="px-3 py-1 bg-emerald-600 text-white rounded">Copy</button>
              <button onClick={()=>window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        {/* History */}
        <div className="mt-6">
          <h3 className="font-semibold">Session history</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No calculations yet</p> : (
            <div className="mt-2 space-y-2">
              {history.map(h => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">Bolus: {h.suggestedBolus} U • ICR 1:{h.icr} • ISF {h.isf}</div>
                  </div>
                  <div>
                    <button onClick={()=>{ navigator.clipboard?.writeText(JSON.stringify(h, null,2)); toast.success('Copied') }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-100 text-sm text-gray-700">
          <strong>Safety & clinical note:</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>This calculator is educational only. Insulin dosing is high-risk — always confirm with the treating clinician.</li>
            <li>ICR commonly uses the 500-rule (ICR = 500 ÷ TDD). ISF often uses the 1800-rule for regular / 1500-rule for rapid-acting — these are starting estimates and must be individualized. </li>
            <li>Typical starting TDD estimates range ~0.4–1.0 U/kg/day; many clinicians use ~0.5 U/kg/day in stable patients. Adjustments needed for age, insulin sensitivity, illness, and lifestyle.</li>
          </ul>
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
