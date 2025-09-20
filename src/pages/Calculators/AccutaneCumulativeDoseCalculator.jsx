// AccutaneCumulativeDoseCalculator.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Advanced Accutane (Isotretinoin) Cumulative Dose Calculator
 * - Calculates cumulative mg/kg, remaining mg/kg to reach target
 * - Estimates remaining duration at current dose
 * - Allows custom dosing, interruptions (missed days)
 * - Converts to tablets (example tablet strengths)
 * - Strong safety/teratogenic warnings and references
 *
 * IMPORTANT: Educational/demo tool only. Always verify with clinician/local guidelines.
 */

export default function AccutaneCumulativeCalculator() {
  // --- Inputs ---
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg"); // kg, g, lb
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male"); // male / female / other
  const [dailyMode, setDailyMode] = useState("mgPerKg"); // mgPerKg | mgPerDay
  const [mgPerKgPerDay, setMgPerKgPerDay] = useState(0.5);
  const [mgPerDay, setMgPerDay] = useState("");
  const [targetCumulative, setTargetCumulative] = useState(120); // mg/kg
  const [customTarget, setCustomTarget] = useState("");
  const [pastDaysOnTreatment, setPastDaysOnTreatment] = useState(0);
  const [missedDays, setMissedDays] = useState(0);
  const [tabletStrength, setTabletStrength] = useState(20); // mg per tablet (example)
  const [result, setResult] = useState(null);

  // --- Helpers ---
  const parseWeightKg = (w, unit) => {
    const n = parseFloat(w);
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

  // --- Main calculate function ---
  const calculate = () => {
    const wKg = parseWeightKg(weight, weightUnit);
    if (!wKg) {
      toast.error("Please enter a valid weight.");
      return;
    }

    // determine mg/day
    let dailyMg;
    if (dailyMode === "mgPerKg") {
      const perKg = parseFloat(mgPerKgPerDay);
      if (!perKg || perKg <= 0) {
        toast.error("Enter a valid mg/kg/day.");
        return;
      }
      dailyMg = wKg * perKg;
    } else {
      const num = parseFloat(mgPerDay);
      if (!num || num <= 0) {
        toast.error("Enter a valid mg/day.");
        return;
      }
      dailyMg = num;
    }

    // effective days on treatment so far (do not allow negative)
    const pastDays = Math.max(0, parseInt(pastDaysOnTreatment || 0, 10));
    const missed = Math.max(0, parseInt(missedDays || 0, 10));
    const effectiveDaysSoFar = Math.max(0, pastDays - missed);

    // cumulative so far (mg total and mg/kg)
    const cumulativeSoFarMg = effectiveDaysSoFar * dailyMg;
    const cumulativeSoFarMgPerKg = cumulativeSoFarMg / wKg;

    // target cumulative (mg/kg)
    let targetMgPerKg = targetCumulative;
    if (parseFloat(targetCumulative) === -1) {
      const c = parseFloat(customTarget);
      if (!c || c <= 0) {
        toast.error("Enter a valid custom target cumulative mg/kg.");
        return;
      }
      targetMgPerKg = c;
    }

    // remaining mg/kg and total remaining mg
    const remainingMgPerKg = Math.max(0, targetMgPerKg - cumulativeSoFarMgPerKg);
    const remainingTotalMg = remainingMgPerKg * wKg;

    // estimated remaining days at current dailyMg (avoid division by zero)
    const estRemainingDays = dailyMg > 0 ? Math.ceil(remainingTotalMg / dailyMg) : Infinity;

    // estimator for months/weeks
    const estWeeks = estRemainingDays === Infinity ? Infinity : round(estRemainingDays / 7, 1);
    const estMonths = estRemainingDays === Infinity ? Infinity : round(estRemainingDays / 30, 1);

    // tablet equivalents per day (tablets/day)
    const tabletsPerDay = tabletStrength > 0 ? round(dailyMg / tabletStrength, 2) : null;

    // build result
    const res = {
      weightKg: round(wKg, 2),
      dailyMg: round(dailyMg, 2),
      cumulativeSoFarMgPerKg: round(cumulativeSoFarMgPerKg, 2),
      cumulativeSoFarTotalMg: round(cumulativeSoFarMg, 2),
      targetMgPerKg: targetMgPerKg,
      remainingMgPerKg: round(remainingMgPerKg, 2),
      remainingTotalMg: round(remainingTotalMg, 0),
      estRemainingDays,
      estWeeks,
      estMonths,
      tabletsPerDay,
      effectiveDaysSoFar,
    };

    setResult(res);
    toast.success("Calculation completed. Review results and safety warnings.");
  };

  const downloadReport = () => {
    if (!result) {
      toast.error("Calculate first to generate report.");
      return;
    }
    const lines = [
      "Accutane (Isotretinoin) Cumulative Dose Calculator - Report",
      `Weight: ${result.weightKg} kg`,
      `Daily dose: ${result.dailyMg} mg/day`,
      `Days on treatment (effective): ${result.effectiveDaysSoFar}`,
      `Cumulative so far: ${result.cumulativeSoFarMgPerKg} mg/kg (${result.cumulativeSoFarTotalMg} mg total)`,
      `Target cumulative: ${result.targetMgPerKg} mg/kg`,
      `Remaining: ${result.remainingMgPerKg} mg/kg (${result.remainingTotalMg} mg)`,
      `Estimated remaining days at current dose: ${result.estRemainingDays} days (~${result.estWeeks} weeks / ${result.estMonths} months)`,
      `Tablet strength used for conversion: ${tabletStrength} mg → ~${result.tabletsPerDay} tablets/day`,
      "",
      "Safety notes:",
      "- Isotretinoin is a potent teratogen. Do NOT use during pregnancy. Follow pregnancy prevention programs (iPLEDGE / local PPP) for females of childbearing potential.",
      "- This tool is educational only. Always confirm dosing, monitoring, and contraceptive requirements with the treating clinician and local guidelines.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "accutane_cumulative_report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold text-red-700 mb-2">Accutane (Isotretinoin) — Cumulative Dose Calculator</h2>

      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mb-4">
        <p className="font-semibold">Important safety note</p>
        <p className="text-sm">
          Isotretinoin is a highly teratogenic prescription medication. This calculator is educational and does not replace clinical judgement.
          Females of childbearing potential must follow pregnancy prevention programs (e.g., iPLEDGE) and local guidelines. Always consult the treating clinician.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 70"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Weight unit</label>
          <select
            value={weightUnit}
            onChange={(e) => setWeightUnit(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Age (years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="optional"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Sex</label>
          <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-2 border rounded">
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Daily dosing mode</label>
          <div className="flex gap-2 items-center mt-1">
            <label className="inline-flex items-center">
              <input type="radio" checked={dailyMode === "mgPerKg"} onChange={() => setDailyMode("mgPerKg")} />
              <span className="ml-2 text-sm">mg/kg/day</span>
            </label>

            <label className="inline-flex items-center ml-4">
              <input type="radio" checked={dailyMode === "mgPerDay"} onChange={() => setDailyMode("mgPerDay")} />
              <span className="ml-2 text-sm">mg/day (absolute)</span>
            </label>

            {dailyMode === "mgPerKg" && (
              <select
                value={mgPerKgPerDay}
                onChange={(e) => setMgPerKgPerDay(e.target.value)}
                className="ml-4 p-2 border rounded"
              >
                <option value={0.5}>0.5 mg/kg/day</option>
                <option value={0.75}>0.75 mg/kg/day</option>
                <option value={1.0}>1.0 mg/kg/day</option>
                <option value={1.5}>1.5 mg/kg/day</option>
              </select>
            )}

            {dailyMode === "mgPerDay" && (
              <input
                type="number"
                value={mgPerDay}
                onChange={(e) => setMgPerDay(e.target.value)}
                placeholder="mg/day"
                className="ml-4 p-2 border rounded w-28"
              />
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Target cumulative (mg/kg)</label>
          <select
            value={targetCumulative}
            onChange={(e) => setTargetCumulative(parseFloat(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={120}>120 mg/kg (standard)</option>
            <option value={150}>150 mg/kg (higher)</option>
            <option value={-1}>Custom...</option>
          </select>
          {parseFloat(targetCumulative) === -1 && (
            <input
              type="number"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="e.g. 130"
              className="mt-2 w-full p-2 border rounded"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Days already on treatment</label>
          <input
            type="number"
            value={pastDaysOnTreatment}
            onChange={(e) => setPastDaysOnTreatment(e.target.value)}
            placeholder="e.g., 60"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Missed / interrupted days</label>
          <input
            type="number"
            value={missedDays}
            onChange={(e) => setMissedDays(e.target.value)}
            placeholder="e.g., 3"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Tablet strength for conversion (mg)</label>
          <select
            value={tabletStrength}
            onChange={(e) => setTabletStrength(parseFloat(e.target.value))}
            className="w-full p-2 border rounded"
          >
            <option value={10}>10 mg</option>
            <option value={20}>20 mg</option>
            <option value={40}>40 mg</option>
            <option value={80}>80 mg</option>
            <option value={120}>120 mg</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={calculate} className="px-4 py-2 bg-red-600 text-white rounded">Calculate</button>
        <button
          onClick={() => {
            setResult(null);
            setWeight("");
            setPastDaysOnTreatment(0);
            setMissedDays(0);
          }}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Reset
        </button>
        <button onClick={downloadReport} className="px-4 py-2 bg-blue-600 text-white rounded">Download Report</button>
      </div>

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-gray-50 border rounded">
          <h3 className="text-lg font-semibold mb-2">Results</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><strong>Weight:</strong> {result.weightKg} kg</div>
            <div><strong>Daily dose:</strong> {result.dailyMg} mg/day</div>

            <div><strong>Effective days on treatment:</strong> {result.effectiveDaysSoFar} days</div>
            <div><strong>Cumulative so far:</strong> {result.cumulativeSoFarMgPerKg} mg/kg ({result.cumulativeSoFarTotalMg} mg total)</div>

            <div><strong>Target cumulative:</strong> {result.targetMgPerKg} mg/kg</div>
            <div><strong>Remaining:</strong> {result.remainingMgPerKg} mg/kg ({result.remainingTotalMg} mg)</div>

            <div><strong>Estimated remaining:</strong> {result.estRemainingDays} days</div>
            <div><strong>~Weeks / Months:</strong> {result.estWeeks} weeks / {result.estMonths} months</div>

            <div><strong>Tablet equivalent:</strong> ~{result.tabletsPerDay} tablets/day ({tabletStrength} mg)</div>
          </div>

          {/* Safety messages */}
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded">
            <p className="font-semibold">Safety & monitoring</p>
            <ul className="list-disc ml-5 text-sm">
              <li>Isotretinoin is contraindicated in pregnancy and highly teratogenic. Females of childbearing potential must follow pregnancy prevention programs (e.g., iPLEDGE) and local testing/contraception rules.</li>
              <li>Typical initial dosing is 0.5–1.0 mg/kg/day; many regimens aim for a cumulative total of ~120–150 mg/kg per course, although practices vary by guideline and patient response.</li>
              <li>This calculator is educational and not a prescription tool. Confirm all decisions with the treating clinician and local guidelines (e.g., national REMS / PPP).</li>
            </ul>
          </div>
        </motion.div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
