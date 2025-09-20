import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * TSH — Levothyroxine Dose Calculator (Advanced, responsive)
 * Features:
 * - Inputs: age, sex, weight (kg/lb), current TSH (mIU/L)
 * - Weight-based dosing (standard 1.6 mcg/kg/day) with modifiers for elderly, cardiac risk, pregnancy
 * - Option for fixed (manual) dose override
 * - Titration guidance based on TSH ranges
 * - Dose rounding to practical increments (12.5 mcg), tablet-equivalent suggestions
 * - History (session), copy result, download CSV, print
 * - Tailwind-friendly responsive UI, framer-motion for subtle animation
 *
 * Educational only — verify with treating clinician and local guidelines. Always recheck labs ~6–8 weeks after dose change.
 */

export default function TSHLevothyroxineCalculator() {
  // Inputs
  const [age, setAge] = useState(45);
  const [sex, setSex] = useState("female");
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState("kg");
  const [tsh, setTsh] = useState(8.5);
  const [tshUnit, setTshUnit] = useState("mIU/L");

  const [isElderly, setIsElderly] = useState(false);
  const [hasCardiacDisease, setHasCardiacDisease] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);

  const [useFixedDose, setUseFixedDose] = useState(false);
  const [fixedDose, setFixedDose] = useState(50);

  const [roundStep, setRoundStep] = useState(12.5); // mcg rounding step

  const tabletStrengths = [12.5, 25, 50, 75, 88, 100, 112.5, 125, 150, 175, 200];

  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // Helpers
  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "lb") return n * 0.45359237;
    return null;
  };

  const roundToStep = (value, step = 12.5) => {
    if (value === null || isNaN(value)) return value;
    return Math.round(value / step) * step;
  };

  // Main calculation
  const calculateDose = () => {
    const weightKg = toKg(weight, weightUnit);
    if (!weightKg) {
      toast.error("Enter a valid weight.");
      return;
    }

    // adult formula validity check
    if (weightKg < 30) {
      toast.info("Weight < 30 kg — use pediatric-specific guidance. This calculator is targeted at adult dosing. Proceed with caution.");
    }

    // baseline per-kg dosing
    let perKg = 1.6; // mcg/kg/day standard full replacement

    // modifiers
    if (isElderly || hasCardiacDisease) {
      // start lower in elderly / cardiac disease: ~0.3 mcg/kg/day (practical) or small fixed dose 25-50 mcg/day
      // we'll compute low-per-kg but enforce a minimum 25 mcg
      perKg = 0.3; // starting conservative
    }

    // compute raw suggested
    let suggestedRaw = weightKg * perKg; // mcg/day

    // if elderly/cardio and suggested < 25, set to 25
    if ((isElderly || hasCardiacDisease) && suggestedRaw < 25) suggestedRaw = 25;

    // pregnancy modifier - often requires increase ~20–30% — we'll default to +25%
    if (isPregnant) {
      suggestedRaw = suggestedRaw * 1.25;
    }

    // if user wants a fixed dose override
    let finalDose = useFixedDose ? parseFloat(fixedDose) : suggestedRaw;
    if (!finalDose || finalDose <= 0) {
      toast.error("Enter a valid fixed dose or check inputs.");
      return;
    }

    // practical rounding
    const roundedDose = roundToStep(finalDose, roundStep);

    // tablet suggestion: pick tablet strength that gives minimal absolute difference when using integer tablets
    const tabletOptions = tabletStrengths.map((s) => {
      const count = Math.round(roundedDose / s);
      return { strength: s, count, provided: roundToStep(count * s, roundStep), diff: Math.abs(roundedDose - roundToStep(count * s, roundStep)) };
    });

    // pick option with smallest diff but prefer fewer tablets
    tabletOptions.sort((a, b) => (a.diff === b.diff ? a.count - b.count : a.diff - b.diff));
    const bestTablet = tabletOptions[0];

    // titration guidance based on TSH
    const tshVal = parseFloat(tsh);
    let titration = [];
    if (isNaN(tshVal)) {
      titration.push("No TSH provided — follow local clinical guidance for initiation and monitoring.");
    } else {
      // general ranges — educational only
      if (tshVal >= 10) {
        titration.push("TSH ≥ 10 mIU/L — consistent with overt hypothyroidism. Consider replacement and faster titration; typical increase steps are 25–50% depending on clinical context. Recheck TSH in 6–8 weeks.");
      } else if (tshVal >= 4.5 && tshVal < 10) {
        titration.push("TSH mildly elevated (4.5–10 mIU/L) — consider starting or increasing dose by ~12.5–25% and rechecking TSH in 6–8 weeks; individualise for symptoms and comorbidities.");
      } else if (tshVal >= 0.4 && tshVal < 4.5) {
        titration.push("TSH in reference range — current dose appears appropriate. If symptomatic, investigate further; otherwise routine monitoring.");
      } else if (tshVal < 0.4 && tshVal >= 0.1) {
        titration.push("TSH mildly suppressed (<0.4 mIU/L) — consider decreasing dose by 10–25% or re-evaluating timing/adherence/biologic factors.");
      } else if (tshVal < 0.1) {
        titration.push("TSH very suppressed (<0.1 mIU/L) — consider holding or substantially reducing dose and evaluate for over-replacement; assess symptoms and cardiac risk.");
      }

      // special notes for pregnancy
      if (isPregnant) {
        titration.push("Pregnancy: levothyroxine requirement often increases during pregnancy — communicate with obstetric care; recheck TSH promptly and adjust dose as needed (typically recheck each trimester and ~4–6 weeks after a change).");
      }

      if (isElderly || hasCardiacDisease) {
        titration.push("Elderly / cardiac disease: titrate slowly (small increments) and monitor for cardiac symptoms. Consider referral to endocrinology if uncertain.");
      }
    }

    const res = {
      timestamp: new Date().toISOString(),
      age,
      sex,
      weightKg: Math.round(weightKg * 100) / 100,
      tsh: tshVal,
      suggestedRaw: Math.round(suggestedRaw * 100) / 100,
      finalDose: Math.round(finalDose * 100) / 100,
      roundedDose: roundedDose,
      tabletSuggestion: bestTablet,
      titration,
      notes: "Educational only — verify with treating clinician and local dosing guidelines. Recheck TSH in ~6–8 weeks after dose change.",
    };

    setResult(res);
    setHistory((h) => [res, ...h]);
    toast.success("Dose calculated (educational). Review titration guidance and safety notes.");
  };

  // utilities
  const clearResult = () => setResult(null);

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","age","sex","weightKg","tsh","suggestedRaw","finalDose","roundedDose","tabletStrength","tabletCount","notes"];
    const rows = history.map((r) => [r.timestamp, r.age, r.sex, r.weightKg, r.tsh, r.suggestedRaw, r.finalDose, r.roundedDose, r.tabletSuggestion.strength, r.tabletSuggestion.count, r.notes].map((v) => JSON.stringify(v ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `levothyroxine_history_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const lines = [];
    lines.push(`Levothyroxine dose result — ${new Date(result.timestamp).toLocaleString()}`);
    lines.push(`Age: ${result.age} • Sex: ${result.sex} • Weight: ${result.weightKg} kg`);
    lines.push(`TSH: ${result.tsh} mIU/L`);
    lines.push(`Suggested (raw): ${result.suggestedRaw} mcg/day`);
    lines.push(`Final dose (rounded): ${result.roundedDose} mcg/day`);
    lines.push(`Tablet suggestion: ${result.tabletSuggestion.count} × ${result.tabletSuggestion.strength} mcg`);
    lines.push("Notes: " + result.notes);
    result.titration.forEach((t) => lines.push(`- ${t}`));
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Result copied to clipboard.");
    } catch (e) {
      toast.error("Copy failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-indigo-700">TSH — Levothyroxine Dose Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Advanced, responsive calculator. Educational only — verify dosing with treating clinician and local guidelines. Recheck TSH ~6–8 weeks after dose change.</p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Age</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Sex</label>
            <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-2 border rounded mt-1">
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Weight</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-2 border rounded" />
              <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="p-2 border rounded">
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">TSH (mIU/L)</label>
            <input type="number" value={tsh} onChange={(e) => setTsh(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium">Special populations</label>
            <div className="mt-1 flex flex-col gap-1">
              <label className="inline-flex items-center"><input type="checkbox" checked={isElderly} onChange={(e) => setIsElderly(e.target.checked)} /> <span className="ml-2">Elderly</span></label>
              <label className="inline-flex items-center"><input type="checkbox" checked={hasCardiacDisease} onChange={(e) => setHasCardiacDisease(e.target.checked)} /> <span className="ml-2">Cardiac disease</span></label>
              <label className="inline-flex items-center"><input type="checkbox" checked={isPregnant} onChange={(e) => setIsPregnant(e.target.checked)} /> <span className="ml-2">Pregnant</span></label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Fixed dose override</label>
            <div className="mt-1 flex gap-2">
              <label className="inline-flex items-center"><input type="checkbox" checked={useFixedDose} onChange={(e) => setUseFixedDose(e.target.checked)} /> <span className="ml-2">Use fixed dose</span></label>
            </div>
            {useFixedDose && (
              <input type="number" value={fixedDose} onChange={(e) => setFixedDose(e.target.value)} className="w-full p-2 border rounded mt-2" />
            )}
          </div>
        </motion.div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <button onClick={calculateDose} className="px-4 py-2 bg-indigo-600 text-white rounded">Calculate Dose</button>
          <button onClick={clearResult} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
          <button onClick={() => { setHistory([]); toast.info('History cleared.'); }} className="px-4 py-2 bg-red-100 text-red-700 rounded">Clear History</button>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-indigo-50 rounded border border-indigo-100">
            <h3 className="text-lg font-semibold text-indigo-700">Result</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
              <div><strong>Weight:</strong> {result.weightKg} kg</div>
              <div><strong>TSH:</strong> {result.tsh} mIU/L</div>

              <div><strong>Suggested (raw):</strong> {result.suggestedRaw} mcg/day</div>
              <div><strong>Final (rounded):</strong> {result.roundedDose} mcg/day</div>

              <div><strong>Tablet suggestion:</strong> {result.tabletSuggestion.count} × {result.tabletSuggestion.strength} mcg ({result.tabletSuggestion.provided} mcg)</div>
              <div><strong>Notes:</strong> {result.notes}</div>

              <div className="col-span-2">
                <strong>Titration guidance</strong>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  {result.titration.map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-indigo-600 text-white rounded">Copy Result</button>
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
                    <div className="mt-1 text-sm">Dose: {h.roundedDose} mcg/day — TSH {h.tsh} mIU/L</div>
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
          <strong>Disclaimer:</strong> This calculator is for educational purposes only. Levothyroxine dosing requires clinical judgement and laboratory monitoring. Always confirm starting doses and titration plans with the treating clinician and local guidelines. Recheck TSH approximately 6–8 weeks after a dose change.
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
