import React, { useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Advanced Anion Gap Calculator (React + Tailwind)
 * - Calculates anion gap (with or without K)
 * - Albumin-corrected anion gap
 * - Delta gap and delta/delta for evaluation of mixed acid-base disorders
 * - Expected HCO3- for high anion gap metabolic acidosis
 * - Osmolality (calculated) and osmolar gap if measured osm provided
 * - Interpretation helpers and short tips
 * - History (session), copy, CSV export, print
 * - Fully responsive layout, accessible fields
 *
 * Educational use only — do not replace clinical judgement.
 */

export default function AnionGapCalculator() {
  // Inputs
  const [sodium, setSodium] = useState(140);
  const [chloride, setChloride] = useState(100);
  const [hco3, setHco3] = useState(24);
  const [potassium, setPotassium] = useState(0); // if 0, treated as not entered
  const [useK, setUseK] = useState(false);
  const [albumin, setAlbumin] = useState(4.0); // g/dL
  const [albuminEntered, setAlbuminEntered] = useState(true);

  const [glucose, setGlucose] = useState(0); // mg/dL optional for osm calc
  const [bun, setBun] = useState(0); // mg/dL optional
  const [ethanol, setEthanol] = useState(0); // mg/dL optional
  const [measuredOsm, setMeasuredOsm] = useState(""); // mOsm/kg optional

  const [agNormal, setAgNormal] = useState(12); // normal AG (without K) often 8-12; with K typical 12-16
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // Helpers
  const round = (v, d = 2) => {
    if (v === null || v === undefined || isNaN(v)) return "—";
    const p = Math.pow(10, d);
    return Math.round(v * p) / p;
  };

  const isoStringNow = () => new Date().toISOString();

  // Core calculations
  const calculate = () => {
    // input validation
    const Na = parseFloat(sodium);
    const Cl = parseFloat(chloride);
    const HCO3 = parseFloat(hco3);
    if (!Na || !Cl || (HCO3 === null || isNaN(HCO3))) {
      toast.error("Please enter valid Na, Cl and HCO3 values.");
      return;
    }

    const K = useK ? parseFloat(potassium) : null;

    // AG calculations
    const agNoK = Na - (Cl + HCO3);
    const agWithK = K !== null && !isNaN(K) ? (Na + K) - (Cl + HCO3) : null;
    const agUsed = agWithK !== null ? agWithK : agNoK;

    // albumin correction: for each 1 g/dL drop in albumin below 4, add 2.5 to AG
    const alb = albuminEntered ? parseFloat(albumin) : null;
    const agCorrected = alb !== null && !isNaN(alb) ? agUsed + 2.5 * (4.0 - alb) : null;

    // Expected HCO3 for a given AG: Expected HCO3 ≈ 24 - (AG - normalAG)
    const normAG = parseFloat(agNormal) || 12;
    const expectedHCO3 = 24 - (agUsed - normAG);

    // Delta gap: deltaAG = AG - normalAG ; deltaHCO3 = normalHCO3(24) - measuredHCO3
    const deltaAG = agUsed - normAG;
    const deltaHCO3 = 24 - HCO3;
    const deltaDelta = deltaAG !== 0 ? deltaAG / deltaHCO3 : null; // ratio

    // Osmolality (calculated) = 2*Na + glucose/18 + BUN/2.8 + ethanol/4.6
    const Glu = parseFloat(glucose) || 0;
    const BUN = parseFloat(bun) || 0;
    const EtOH = parseFloat(ethanol) || 0;
    const calcOsm = 2 * Na + Glu / 18 + BUN / 2.8 + EtOH / 4.6;
    const measured = measuredOsm === "" ? null : parseFloat(measuredOsm);
    const osmGap = measured !== null && !isNaN(measured) ? measured - calcOsm : null;

    // Interpretation helpers
    const interpretation = [];

    // AG interpretation
    if (agUsed >= normAG + 2) {
      interpretation.push("Elevated anion gap — suggests high anion gap metabolic acidosis (HAGMA).");
    } else if (agUsed <= normAG - 2) {
      interpretation.push("Low anion gap — consider lab error, hypoalbuminemia, hypercalcemia, hypermagnesemia, lithium, bromide.");
    } else {
      interpretation.push("Normal anion gap.");
    }

    // albumin note
    if (agCorrected !== null && alb !== null && alb < 4.0) {
      interpretation.push(`Albumin-corrected AG: ${round(agCorrected)} (adjusted for albumin ${alb} g/dL).`);
    }

    // delta-delta interpretation
    if (deltaDelta !== null && !isNaN(deltaDelta)) {
      if (deltaDelta >= 0.8 && deltaDelta <= 2.0) {
        interpretation.push(`Delta/delta ≈ ${round(deltaDelta)} — consistent with pure high AG metabolic acidosis.`);
      } else if (deltaDelta < 0.8) {
        interpretation.push(`Delta/delta ≈ ${round(deltaDelta)} — suggests mixed HAGMA + normal AG metabolic acidosis (concurrent non-AG acidosis).`);
      } else if (deltaDelta > 2.0) {
        interpretation.push(`Delta/delta ≈ ${round(deltaDelta)} — suggests mixed HAGMA + metabolic alkalosis or pre-existing elevated HCO3.`);
      }
    }

    // expected HCO3 comment
    interpretation.push(`Expected HCO3- for this AG ≈ ${round(expectedHCO3)} mmol/L — compare to measured HCO3 ${HCO3}.`);

    // osm gap interpretation
    if (osmGap !== null) {
      interpretation.push(`Calculated osm: ${round(calcOsm)} mOsm/kg. Osmolar gap (measured - calculated): ${round(osmGap)} mOsm/kg.`);
      if (Math.abs(osmGap) >= 10) interpretation.push("Raised osmolar gap — consider toxic alcohols (methanol/ethylene glycol), alcohols, or lab issues.");
    }

    // store
    const res = {
      timestamp: isoStringNow(),
      sodium: Na,
      chloride: Cl,
      hco3: HCO3,
      potassium: K,
      agNoK: round(agNoK, 2),
      agWithK: agWithK !== null ? round(agWithK, 2) : null,
      agUsed: round(agUsed, 2),
      agCorrected: agCorrected !== null ? round(agCorrected, 2) : null,
      expectedHCO3: round(expectedHCO3, 2),
      deltaAG: round(deltaAG, 2),
      deltaHCO3: round(deltaHCO3, 2),
      deltaDelta: deltaDelta !== null ? round(deltaDelta, 2) : null,
      calcOsm: round(calcOsm, 2),
      measuredOsm: measured !== null ? measured : null,
      osmGap: osmGap !== null ? round(osmGap, 2) : null,
      interpretation,
    };

    setResult(res);
    setHistory((h) => [res, ...h]);
    toast.success("Anion gap calculated.");
  };

  const clear = () => {
    setResult(null);
  };

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = [
      "timestamp",
      "sodium",
      "chloride",
      "hco3",
      "potassium",
      "agUsed",
      "agCorrected",
      "deltaAG",
      "deltaHCO3",
      "deltaDelta",
      "calcOsm",
      "measuredOsm",
      "osmGap",
    ];
    const rows = history.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anion_gap_history_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const lines = [];
    lines.push(`Anion gap result — ${new Date(result.timestamp).toLocaleString()}`);
    lines.push(`Na ${result.sodium}, Cl ${result.chloride}, HCO3 ${result.hco3}${result.potassium ? `, K ${result.potassium}` : ""}`);
    lines.push(`AG used: ${result.agUsed}${result.agCorrected ? ` (albumin-corrected ${result.agCorrected})` : ""}`);
    lines.push(`Delta/delta: ${result.deltaDelta ?? "—"}`);
    if (result.osmGap !== null) lines.push(`Calculated osm: ${result.calcOsm} mOsm/kg; Osm gap: ${result.osmGap} mOsm/kg`);
    lines.push("Interpretation:");
    result.interpretation.forEach((t) => lines.push(`- ${t}`));
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
        <h1 className="text-2xl font-bold text-sky-700">Anion Gap Calculator — Advanced</h1>
        <p className="text-sm text-gray-600 mt-1">Calculate anion gap, correct for albumin, evaluate delta/delta and estimate osmolar gap. Educational only.</p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Sodium (Na, mmol/L)</label>
            <input type="number" value={sodium} onChange={(e) => setSodium(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Chloride (Cl, mmol/L)</label>
            <input type="number" value={chloride} onChange={(e) => setChloride(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Bicarbonate (HCO3-, mmol/L)</label>
            <input type="number" value={hco3} onChange={(e) => setHco3(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Include Potassium in AG?</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="checkbox" checked={useK} onChange={(e) => setUseK(e.target.checked)} />
              <input type="number" value={potassium} onChange={(e) => setPotassium(e.target.value)} className="p-2 border rounded w-28" disabled={!useK} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Albumin (g/dL) — for correction</label>
            <input type="number" step="0.1" value={albumin} onChange={(e) => { setAlbumin(e.target.value); setAlbuminEntered(true); }} className="w-full p-2 border rounded mt-1" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Reference (normal) AG value</label>
            <input type="number" value={agNormal} onChange={(e) => setAgNormal(e.target.value)} className="w-full p-2 border rounded mt-1" />
          </div>
        </motion.div>

        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold text-gray-800">Optional Osmolality inputs (for osm gap)</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-600">Glucose (mg/dL)</label>
              <input type="number" value={glucose} onChange={(e) => setGlucose(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-600">BUN (mg/dL)</label>
              <input type="number" value={bun} onChange={(e) => setBun(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Ethanol (mg/dL)</label>
              <input type="number" value={ethanol} onChange={(e) => setEthanol(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Measured Osm (mOsm/kg)</label>
              <input type="number" value={measuredOsm} onChange={(e) => setMeasuredOsm(e.target.value)} className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={calculate} className="px-4 py-2 bg-sky-600 text-white rounded">Calculate</button>
          <button onClick={clear} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
          <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download History CSV</button>
        </div>

        {/* result card */}
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-sky-50 rounded border border-sky-100">
            <h3 className="font-semibold text-sky-700">Results</h3>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-800">
              <div><strong>AG (no K):</strong> {result.agNoK}</div>
              <div><strong>AG (with K):</strong> {result.agWithK ?? "—"}</div>

              <div><strong>AG used:</strong> {result.agUsed}</div>
              <div><strong>Albumin-corrected AG:</strong> {result.agCorrected ?? "—"}</div>

              <div><strong>Delta AG:</strong> {result.deltaAG}</div>
              <div><strong>Delta HCO3:</strong> {result.deltaHCO3}</div>

              <div><strong>Delta/delta:</strong> {result.deltaDelta ?? "—"}</div>
              <div><strong>Expected HCO3:</strong> {result.expectedHCO3} mmol/L</div>

              <div><strong>Calculated osm:</strong> {result.calcOsm} mOsm/kg</div>
              <div><strong>Measured osm:</strong> {result.measuredOsm ?? "—"}</div>

              <div><strong>Osmolar gap:</strong> {result.osmGap ?? "—"}</div>
              <div className="col-span-2">
                <strong>Interpretation:</strong>
                <ul className="list-disc ml-5 mt-1 text-sm">
                  {result.interpretation.map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={copyResult} className="px-3 py-1 bg-sky-600 text-white rounded">Copy Result</button>
              <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
            </div>
          </motion.div>
        )}

        {/* history */}
        <div className="mt-6">
          <h3 className="font-semibold">Session history</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No calculations yet</p> : (
            <div className="mt-2 space-y-2">
              {history.map((h) => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="mt-1 text-sm">AG: {h.agUsed} — Albumin-corrected: {h.agCorrected ?? "—"}</div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h, null, 2)); toast.success("Copied"); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded border text-sm text-gray-700">
          <strong>Disclaimer:</strong> This tool is for educational use only. Always confirm acid-base interpretations and toxicology suspicions with laboratory specialists and treating clinicians.
        </div>

      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
