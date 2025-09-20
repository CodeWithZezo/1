import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Advanced Augmentin (Amoxicillin-Clavulanate) Pediatric Calculator
 *
 * Clinical assumptions (see chat citations):
 * - Standard: ≈45 mg amox/kg/day (div q12h)
 * - High-dose options up to 80–90 mg/kg/day for selected indications
 * - Limit clavulanate to ~<10 mg/kg/day where possible
 * - Common formulations: 125/31.25, 200/28.5, 250/62.5, 400/57, 600/42.9 mg per 5 mL
 */

export default function AugmentinPediatricCalculator() {
  // ----- State -----
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [ageMonths, setAgeMonths] = useState("");
  const [doseOption, setDoseOption] = useState("standard"); // standard | high | custom
  const [customMgPerKgDay, setCustomMgPerKgDay] = useState("");
  const [interval, setInterval] = useState("q12h"); // q8h, q12h, q24h
  const [formulation, setFormulation] = useState("125/31.25 per 5 mL");
  const [tabletChoice, setTabletChoice] = useState("500/125 mg"); // for tablets
  const [result, setResult] = useState(null);

  // ----- Formulation definitions (amox_mg_per_5ml, clav_mg_per_5ml) -----
  const syrupFormulations = {
    "125/31.25 per 5 mL": { amox: 125, clav: 31.25 },
    "200/28.5 per 5 mL": { amox: 200, clav: 28.5 },
    "250/62.5 per 5 mL": { amox: 250, clav: 62.5 },
    "400/57 per 5 mL": { amox: 400, clav: 57 },
    "600/42.9 per 5 mL": { amox: 600, clav: 42.9 },
  };

  const tabletFormulations = {
    "250/62.5 mg": { amox: 250, clav: 62.5 },
    "500/125 mg": { amox: 500, clav: 125 },
    "875/125 mg": { amox: 875, clav: 125 },
  };

  // ----- Helper: convert weight input to kg -----
  function parseWeightToKg(w, unit) {
    const num = parseFloat(w);
    if (!num || num <= 0) return null;
    if (unit === "kg") return num;
    if (unit === "g") return num / 1000;
    if (unit === "lb") return num * 0.45359237;
    return null;
  }

  // ----- Calculation -----
  function calculate() {
    const wKg = parseWeightToKg(weight, weightUnit);
    if (!wKg) {
      toast.error("Enter a valid weight.");
      return;
    }

    // decide mg/kg/day based on selected option
    let mgPerKgDay;
    if (doseOption === "standard") mgPerKgDay = 45; // standard amoxicillin dose/day (amox component)
    else if (doseOption === "high") mgPerKgDay = 80; // conservative high-dose default (can be 80-90)
    else {
      const custom = parseFloat(customMgPerKgDay);
      if (!custom || custom <= 0) {
        toast.error("Enter a valid custom mg/kg/day.");
        return;
      }
      mgPerKgDay = custom;
    }

    // compute total amox per day and per dose
    const amoxMgPerDay = wKg * mgPerKgDay;
    // dosing frequency divisor
    const dosesPerDay = interval === "q24h" ? 1 : interval === "q12h" ? 2 : 3;
    let amoxMgPerDose = amoxMgPerDay / dosesPerDay;

    // apply a reasonable single-dose cap (warn but enforce a cap)
    const singleDoseCap = 1000; // safety cap (some guidelines use 875 mg/dose; many sources use ~875-1000)
    let capped = false;
    if (amoxMgPerDose > singleDoseCap) {
      amoxMgPerDose = singleDoseCap;
      capped = true;
    }

    // evaluate formulation conversions
    const usingSyrup = Object.keys(syrupFormulations).includes(formulation);
    let mLPerDose = null;
    let tabletCount = null;
    let clavMgPerDay = null;
    let clavMgPerKgDay = null;
    let clavPerDoseMg = null;

    if (usingSyrup) {
      const f = syrupFormulations[formulation];
      // mL = (amox mg per dose) / (amox mg per 5mL) * 5
      mLPerDose = (amoxMgPerDose / f.amox) * 5;
      clavPerDoseMg = (f.clav / f.amox) * amoxMgPerDose; // clav proportionate to amox in the chosen syrup
      clavMgPerDay = clavPerDoseMg * dosesPerDay;
      clavMgPerKgDay = clavMgPerDay / wKg;
    } else {
      // tablet selected
      const t = tabletFormulations[tabletChoice];
      tabletCount = amoxMgPerDose / t.amox;
      clavPerDoseMg = (t.clav / t.amox) * amoxMgPerDose;
      clavMgPerDay = clavPerDoseMg * dosesPerDay;
      clavMgPerKgDay = clavMgPerDay / wKg;
    }

    // clavulanate safety check threshold (~10 mg/kg/day)
    const clavSafetyLimitPerKg = 10;
    const clavExceeds = clavMgPerKgDay > clavSafetyLimitPerKg;

    // build result object
    setResult({
      weightKg: wKg,
      mgPerKgDay,
      amoxMgPerDay: round(amoxMgPerDay),
      amoxMgPerDose: round(amoxMgPerDose),
      dosesPerDay,
      mLPerDose: mLPerDose ? round(mLPerDose, 1) : null,
      tabletCount: tabletCount ? round(tabletCount, 2) : null,
      clavMgPerDay: clavMgPerDay ? round(clavMgPerDay) : null,
      clavMgPerKgDay: clavMgPerKgDay ? round(clavMgPerKgDay, 2) : null,
      clavExceeds,
      capped,
    });

    // Toasts / warnings
    if (capped) {
      toast.warning(
        `Single amoxicillin dose was capped at ${singleDoseCap} mg (safety cap).`
      );
    }
    if (clavExceeds) {
      toast.error(
        `Clavulanate exceeds ~${clavSafetyLimitPerKg} mg/kg/day — increased GI risk. Consider alternative regimens.`
      );
    } else {
      toast.success("Calculation completed.");
    }
  }

  // round helper
  function round(v, decimals = 0) {
    const p = Math.pow(10, decimals);
    return Math.round(v * p) / p;
  }

  // ----- UI -----
  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-bold text-blue-700 mb-2">Augmentin — Advanced Pediatric Calculator</h2>
      <p className="text-sm text-gray-600 mb-4">Select weight, dosing strategy and formulation. This is a clinical aid — verify before prescribing.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g., 12.5"
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Unit</label>
          <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="w-full p-2 border rounded">
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="lb">lb</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Age (months)</label>
          <input type="number" value={ageMonths} onChange={(e) => setAgeMonths(e.target.value)} className="w-full p-2 border rounded" placeholder="optional" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Dose strategy</label>
          <div className="flex gap-2 mt-1">
            <label className="inline-flex items-center">
              <input type="radio" checked={doseOption === "standard"} onChange={() => setDoseOption("standard")} />
              <span className="ml-2 text-sm">Standard (~45 mg/kg/day)</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input type="radio" checked={doseOption === "high"} onChange={() => setDoseOption("high")} />
              <span className="ml-2 text-sm">High (80 mg/kg/day)</span>
            </label>
            <label className="inline-flex items-center ml-4">
              <input type="radio" checked={doseOption === "custom"} onChange={() => setDoseOption("custom")} />
              <span className="ml-2 text-sm">Custom</span>
            </label>
          </div>
          {doseOption === "custom" && (
            <input
              type="number"
              value={customMgPerKgDay}
              onChange={(e) => setCustomMgPerKgDay(e.target.value)}
              placeholder="mg/kg/day"
              className="mt-2 p-2 border rounded w-40"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Interval</label>
          <select value={interval} onChange={(e) => setInterval(e.target.value)} className="w-full p-2 border rounded">
            <option value="q8h">Every 8 hours (TID)</option>
            <option value="q12h">Every 12 hours (BID)</option>
            <option value="q24h">Once daily</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Formulation (syrup)</label>
          <select value={formulation} onChange={(e) => setFormulation(e.target.value)} className="w-full p-2 border rounded">
            {Object.keys(syrupFormulations).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Tablet alternative</label>
          <select value={tabletChoice} onChange={(e) => setTabletChoice(e.target.value)} className="w-full p-2 border rounded">
            {Object.keys(tabletFormulations).map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={calculate} className="px-4 py-2 bg-blue-600 text-white rounded">Calculate</button>
      </div>

      {/* Result */}
      {result && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold">Results</h3>
          <p>Weight: <strong>{result.weightKg} kg</strong></p>
          <p>Strategy: <strong>{result.mgPerKgDay} mg/kg/day</strong> → <strong>{result.amoxMgPerDay} mg/day</strong></p>
          <p>Per dose: <strong>{result.amoxMgPerDose} mg</strong> (every {result.dosesPerDay === 1 ? "24h" : result.dosesPerDay === 2 ? "12h" : "8h"})</p>

          {result.mLPerDose !== null && <p>Give: <strong>{result.mLPerDose} mL per dose</strong> of the selected syrup ({formulation})</p>}
          {result.tabletCount !== null && <p>Equivalent tablets: <strong>{result.tabletCount} tablets</strong> of {tabletChoice} (may need to round to nearest practical dosing)</p>}

          <p>Clavulanate: <strong>{result.clavMgPerDay} mg/day</strong> → <strong>{result.clavMgPerKgDay} mg/kg/day</strong></p>

          {result.clavExceeds ? (
            <p className="text-red-600 font-semibold">⚠️ Clavulanate exceeds ~10 mg/kg/day — increased GI adverse effects risk. Re-evaluate regimen.</p>
          ) : (
            <p className="text-green-700">Clavulanate within commonly recommended limit.</p>
          )}

          {result.capped && <p className="text-yellow-700">Note: Single-dose cap applied (safety).</p>}
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-white border rounded">
        <h4 className="font-semibold">Reference (Augmentin)</h4>
        <ul className="text-sm text-gray-600 list-disc ml-5">
          <li>Common pediatric regimens and formulations — see product labeling and institutional guidelines.</li>
          <li>Standard dosing ~45 mg amoxicillin/kg/day divided q12h; high-dose options up to 80–90 mg/kg/day for selected indications. (See references in chat.)</li>
          <li>Limit clavulanate to ~<strong>10 mg/kg/day</strong> when possible to reduce GI side effects.</li>
        </ul>
      </div>

      <ToastContainer position="top-right" autoClose={3500} />
    </div>
  );
}
