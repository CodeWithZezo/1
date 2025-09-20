import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Acetaminophen (Paracetamol) — Rumack‑Matthew Nomogram Calculator
 * Advanced, fully responsive React component.
 *
 * Features:
 * - Enter ingestion time and sample/draw time (or enter hours since ingestion)
 * - Enter serum APAP concentration (µg/mL or µmol/L) with automatic unit conversion
 * - Plots a simple nomogram (t vs concentration) and plots the patient's point
 * - Uses the revised treatment (safety) line: ~150 µg/mL at 4 h (and ~4.7 µg/mL at 24 h)
 * - Warns for pre-4-hour samples, repeated/uncertain ingestions, and other limitations
 * - Session history, copy, download CSV, print
 *
 * IMPORTANT: Educational tool only. Do NOT use as sole basis for clinical care. Always confirm with local poison centre/clinical guidelines.
 */

export default function AcetaminophenNomogramCalculator() {
  // --- Inputs ---
  const [ingestionTime, setIngestionTime] = useState(""); // datetime-local string
  const [sampleTime, setSampleTime] = useState(""); // datetime-local string
  const [hoursSince, setHoursSince] = useState(""); // numeric alternative

  const [concentrationValue, setConcentrationValue] = useState(150); // numeric
  const [concentrationUnit, setConcentrationUnit] = useState("ug_per_mL"); // ug_per_mL or umol_per_L

  const [weight, setWeight] = useState(70); // optional mg/kg calculations
  const [weightUnit, setWeightUnit] = useState("kg");

  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);

  // Constants
  const ACETAMINOPHEN_MW = 151.1626; // g/mol (used to convert µmol/L -> µg/mL)

  // Nomogram reference points (t hours, concentration µg/mL) for the treatment (safety) line
  // Treatment line: ~150 µg/mL at 4 h and ~4.69 µg/mL at 24 h (these are the commonly used treatment/safety thresholds).
  const NOMO_T1 = 4;
  const NOMO_C1 = 150; // µg/mL at 4 h (treatment/safety line)
  const NOMO_T2 = 24;
  const NOMO_C2 = 4.69; // µg/mL at 24 h (equivalent treatment line)

  // --- Helpers ---
  const parseDateTimeLocal = (s) => {
    if (!s) return null;
    // DateTime-local is in local timezone; Date constructor will parse it as local
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const diffHours = (t0, t1) => {
    // returns hours from t0 -> t1 (t1 - t0)
    if (!t0 || !t1) return null;
    return (t1.getTime() - t0.getTime()) / (1000 * 60 * 60);
  };

  const umolL_to_ugmL = (umolL) => {
    // 1 µmol/L * MW (g/mol) * (1000 mg / g) * (1 mg / 1000 µg) ??? simpler: 1 µmol/L = MW * 1e-6 g/L = (MW * 1e-3) mg/L = (MW * 1e-3) µg/mL
    // But numeric: 1 µmol/L => (MW * 0.001) mg/L => since 1 mg/L = 1 µg/mL, this equals MW*0.001 µg/mL? Wait safer compute stepwise.
    // Derivation: 1 µmol/L = 1e-6 mol/L. Multiply by MW (g/mol) -> g/L. g/L -> mg/L multiply 1000. mg/L equals µg/mL directly.
    // So: ug/mL = umolL * MW * 1e-6 (g/L) * 1000 (mg/g) => umolL * MW * 1e-3 mg/L => since 1 mg/L = 1 µg/mL, result in µg/mL = umolL * MW * 1e-3
    // Therefore multiplier = MW * 0.001
    return (parseFloat(umolL) || 0) * (ACETAMINOPHEN_MW * 0.001);
  };

  const ugmL_to_umolL = (ugmL) => {
    return (parseFloat(ugmL) || 0) / (ACETAMINOPHEN_MW * 0.001);
  };

  // Nomogram threshold at arbitrary time between 4 and 24 hours using log-linear interpolation
  const nomogramThresholdAtHours = (h) => {
    if (h <= NOMO_T1) return NOMO_C1; // treat anything <=4h as threshold at 4h (nomogram not valid earlier)
    if (h >= NOMO_T2) return NOMO_C2; // beyond 24h use 24h point (nomogram was designed for 4-24h)

    // linear interpolation on log10 scale between (t1, c1) and (t2, c2)
    const logC1 = Math.log10(NOMO_C1);
    const logC2 = Math.log10(NOMO_C2);
    const ratio = (h - NOMO_T1) / (NOMO_T2 - NOMO_T1);
    const logC = logC1 + (logC2 - logC1) * ratio;
    return Math.pow(10, logC);
  };

  const toKg = (val, unit) => {
    const n = parseFloat(val);
    if (!n || n <= 0) return null;
    if (unit === "kg") return n;
    if (unit === "g") return n / 1000;
    if (unit === "lb") return n * 0.45359237;
    return null;
  };

  // Compute hours since ingestion from inputs
  const computedHoursSince = useMemo(() => {
    if (hoursSince && !isNaN(parseFloat(hoursSince))) {
      return parseFloat(hoursSince);
    }
    const tIngest = parseDateTimeLocal(ingestionTime);
    const tSample = parseDateTimeLocal(sampleTime);
    if (!tIngest || !tSample) return null;
    const h = diffHours(tIngest, tSample);
    return h;
  }, [ingestionTime, sampleTime, hoursSince]);

  // Compute concentration in ug/mL (standard)
  const concentration_ugmL = useMemo(() => {
    if (concentrationUnit === "ug_per_mL") return parseFloat(concentrationValue) || 0;
    // umol/L -> ug/mL
    return umolL_to_ugmL(concentrationValue);
  }, [concentrationValue, concentrationUnit]);

  // Main calculation
  const calculate = () => {
    const h = computedHoursSince;
    if (h === null || isNaN(h)) {
      toast.error("Please provide either both ingestion & sample times, or enter hours since ingestion.");
      return;
    }

    const conc = concentration_ugmL;
    if (!conc || isNaN(conc)) {
      toast.error("Enter a valid concentration.");
      return;
    }

    // Warnings
    const warnings = [];
    if (h < 4) warnings.push("Sample drawn before 4 hours — nomogram is not valid; repeat level at 4 hours post-ingestion if possible.");
    if (h > 24) warnings.push("Sample drawn after 24 hours — nomogram was designed for 4–24 hours. Use clinical judgment and local guidance.");

    // Determine threshold at that hour
    const threshold = nomogramThresholdAtHours(Math.max(h, 4));

    const indication = conc >= threshold ? "Treat (N‑acetylcysteine indicated)" : "No nomogram‑based treatment threshold reached";

    // concentration in µmol/L for display
    const conc_umolL = ugmL_to_umolL(conc);

    // optional mg/kg raw dose estimate for acute single ingestion if weight provided & user provides total ingested mg? We'll not estimate mg/kg without total ingestion input — keep simple.

    const res = {
      timestamp: new Date().toISOString(),
      hoursSince: roundNumber(h, 2),
      concentration_ugmL: roundNumber(conc, 3),
      concentration_umolL: roundNumber(conc_umolL, 2),
      threshold_ugmL: roundNumber(threshold, 3),
      action: indication,
      warnings,
    };

    setResult(res);
    setHistory((s) => [res, ...s]);
    toast.success("Nomogram evaluated (educational). Review results and clinical guidance.");
  };

  const roundNumber = (v, d = 2) => {
    if (v === null || v === undefined || isNaN(v)) return "—";
    const p = Math.pow(10, d);
    return Math.round(v * p) / p;
  };

  const clear = () => setResult(null);

  const downloadCSV = () => {
    if (!history.length) return toast.error("No history to download.");
    const headers = ["timestamp","hoursSince","concentration_ugmL","concentration_umolL","threshold_ugmL","action","warnings"];
    const rows = history.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `apap_nomogram_history_${new Date().toISOString()}.csv`; a.click(); URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const copyResult = async () => {
    if (!result) return toast.error("No result to copy.");
    const lines = [];
    lines.push(`APAP nomogram result — ${new Date(result.timestamp).toLocaleString()}`);
    lines.push(`Hours since ingestion: ${result.hoursSince} h`);
    lines.push(`Concentration: ${result.concentration_ugmL} µg/mL (${result.concentration_umolL} µmol/L)`);
    lines.push(`Nomogram threshold at ${result.hoursSince} h: ${result.threshold_ugmL} µg/mL`);
    lines.push(`Action: ${result.action}`);
    if (result.warnings && result.warnings.length) {
      lines.push("Warnings:");
      result.warnings.forEach((w) => lines.push(`- ${w}`));
    }
    try { await navigator.clipboard.writeText(lines.join("\n")); toast.success("Result copied to clipboard."); } catch (e) { toast.error("Copy failed."); }
  };

  // --- Small SVG nomogram plot (log scale) ---
  const NomogramSVG = ({ pointHour, pointConc }) => {
    // plot region 0-28h (we'll show 0-28 but nomogram valid 4-24)
    const width = 560;
    const height = 220;
    const padding = 40;

    const tMin = 1; // hours
    const tMax = 28;
    const cMin = 1; // µg/mL (log scale)
    const cMax = 1000; // µg/mL

    const xForT = (t) => padding + ((t - tMin) / (tMax - tMin)) * (width - padding * 2);
    const yForC = (c) => {
      const logMin = Math.log10(cMin);
      const logMax = Math.log10(cMax);
      const y = padding + (1 - (Math.log10(c) - logMin) / (logMax - logMin)) * (height - padding * 2);
      return y;
    };

    // generate nomogram treatment line points between 4 and 24
    const linePoints = [];
    for (let t = 4; t <= 24; t += 0.5) {
      const c = nomogramThresholdAtHours(t);
      linePoints.push([xForT(t), yForC(Math.max(c, cMin))]);
    }

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto border rounded">
        {/* background grid */}
        <rect x={0} y={0} width={width} height={height} fill="#fff" />

        {/* y-axis labels (log scale) */}
        {[1, 3, 10, 30, 100, 300, 1000].map((c) => (
          <g key={c}>
            <line x1={padding} x2={width - padding} y1={yForC(c)} y2={yForC(c)} stroke="#eee" />
            <text x={6} y={yForC(c) + 4} fontSize={10} fill="#666">{c} µg/mL</text>
          </g>
        ))}

        {/* x-axis labels */}
        {[0, 4, 8, 12, 16, 20, 24, 28].map((t) => (
          <g key={t}>
            <line x1={xForT(t)} x2={xForT(t)} y1={height - padding} y2={padding} stroke="#fafafa" />
            <text x={xForT(t) - 8} y={height - 8} fontSize={10} fill="#666">{t}h</text>
          </g>
        ))}

        {/* nomogram treatment line */}
        <polyline fill="none" stroke="#d63384" strokeWidth={2} points={linePoints.map((p) => p.join(",")).join(" ")} />

        {/* 300 µg/mL high-risk line (optional visual) */}
        <polyline fill="none" stroke="#ff7b00" strokeDasharray="6 4" strokeWidth={1} points={(() => {
          const pts = [];
          for (let t = 4; t <= 24; t += 0.5) {
            // compute a high-risk line scaled from NOMO_C1*2 (approx 300 at 4h)
            const scale = 2.0; // simple multiplier for a high-risk line
            const c = nomogramThresholdAtHours(t) * scale;
            pts.push([xForT(t), yForC(Math.min(Math.max(c, cMin), cMax))]);
          }
          return pts.map((p) => p.join(",")).join(" ");
        })()} />

        {/* Patient point */}
        {pointHour && pointConc ? (
          <g>
            <circle cx={xForT(Math.max(pointHour, tMin))} cy={yForC(Math.min(Math.max(pointConc, cMin), cMax))} r={6} fill="#0ea5a4" stroke="#064e3b" strokeWidth={1.5} />
            <text x={xForT(pointHour) + 8} y={yForC(pointConc) - 8} fontSize={12} fill="#064e3b">Patient</text>
          </g>
        ) : null}

        {/* legend */}
        <rect x={width - padding - 140} y={padding} width={130} height={52} fill="#fff" stroke="#eee" />
        <text x={width - padding - 128} y={padding + 14} fontSize={12} fill="#333">Nomogram lines</text>
        <line x1={width - padding - 122} x2={width - padding - 100} y1={padding + 22} y2={padding + 22} stroke="#d63384" strokeWidth={2} />
        <text x={width - padding - 94} y={padding + 26} fontSize={11} fill="#333">Treatment (150 @ 4h)</text>
        <line x1={width - padding - 122} x2={width - padding - 100} y1={padding + 36} y2={padding + 36} stroke="#ff7b00" strokeDasharray="6 4" strokeWidth={1} />
        <text x={width - padding - 94} y={padding + 40} fontSize={11} fill="#333">High‑risk (~2×)</text>
      </svg>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-2xl font-bold text-red-700">Acetaminophen — Rumack‑Matthew Nomogram Calculator</h1>
        <p className="text-sm text-gray-600 mt-1">Use for single, acute acetaminophen ingestions. This tool is educational only — confirm with your local poison centre / clinical guidelines.</p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Time of ingestion (local)</label>
            <input type="datetime-local" value={ingestionTime} onChange={(e) => setIngestionTime(e.target.value)} className="w-full mt-1 p-2 border rounded" />

            <label className="text-sm font-medium mt-3">Time of blood draw / sample (local)</label>
            <input type="datetime-local" value={sampleTime} onChange={(e) => setSampleTime(e.target.value)} className="w-full mt-1 p-2 border rounded" />

            <div className="mt-3 text-xs text-gray-500">Or, enter hours since ingestion:</div>
            <input placeholder="hours since ingestion" type="number" value={hoursSince} onChange={(e) => setHoursSince(e.target.value)} className="w-full mt-1 p-2 border rounded" />

            <hr className="my-3" />

            <label className="text-sm font-medium">Serum acetaminophen concentration</label>
            <div className="flex gap-2 mt-1">
              <input type="number" value={concentrationValue} onChange={(e) => setConcentrationValue(e.target.value)} className="w-full p-2 border rounded" />
              <select value={concentrationUnit} onChange={(e) => setConcentrationUnit(e.target.value)} className="p-2 border rounded">
                <option value="ug_per_mL">µg/mL (mg/L)</option>
                <option value="umol_per_L">µmol/L</option>
              </select>
            </div>

            <div className="mt-3 text-sm text-gray-600">Molecular weight used for unit conversion: {ACETAMINOPHEN_MW} g/mol.</div>

            <div className="mt-4 flex gap-3">
              <button onClick={calculate} className="px-4 py-2 bg-red-600 text-white rounded">Evaluate Nomogram</button>
              <button onClick={clear} className="px-4 py-2 bg-gray-100 rounded">Clear Result</button>
              <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded">Download CSV</button>
            </div>

            {/* result summary */}
            {result && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 bg-red-50 rounded border border-red-100">
                <div className="text-sm text-gray-800"><strong>Hours since ingestion:</strong> {result.hoursSince} h</div>
                <div className="text-sm text-gray-800"><strong>Concentration:</strong> {result.concentration_ugmL} µg/mL ({result.concentration_umolL} µmol/L)</div>
                <div className="text-sm text-gray-800"><strong>Nomogram threshold at {result.hoursSince} h:</strong> {result.threshold_ugmL} µg/mL</div>
                <div className="text-sm font-semibold mt-2">Action: {result.action}</div>
                {result.warnings && result.warnings.length ? (
                  <div className="mt-2 text-sm text-yellow-800">
                    <strong>Warnings:</strong>
                    <ul className="list-disc ml-5">
                      {result.warnings.map((w, i) => (<li key={i}>{w}</li>))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-3 flex gap-2">
                  <button onClick={copyResult} className="px-3 py-1 bg-red-600 text-white rounded">Copy</button>
                  <button onClick={() => window.print()} className="px-3 py-1 bg-gray-100 rounded">Print</button>
                </div>
              </motion.div>
            )}

          </div>

          <div>
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Nomogram (visual)</h4>
              <div className="text-xs text-gray-500">Red line = treatment (150 µg/mL at 4 h). Orange dashed = approximate high‑risk (~2×) line.</div>
            </div>

            <NomogramSVG pointHour={result?.hoursSince} pointConc={result?.concentration_ugmL} />

            <div className="mt-3 text-xs text-gray-600">
              <strong>Important notes:</strong>
              <ul className="list-disc ml-5 mt-1">
                <li>Use the Rumack‑Matthew nomogram only for single, acute ingestions with a known time of ingestion (generally 4–24 h post ingestion). Do not use for staggered/repeated ingestions or unknown times.</li>
                <li>Initiate N‑acetylcysteine (NAC) when a timed serum concentration falls on or above the treatment (safety) line. Confirm with your local poison centre or clinical guideline before acting.</li>
                <li>If sample was drawn &lt;4 h after ingestion, repeat level at 4 h (or follow local protocol).</li>
              </ul>
            </div>

          </div>
        </motion.div>

        <div className="mt-6">
          <h3 className="font-semibold">Session history</h3>
          {history.length === 0 ? <p className="text-gray-500 mt-2">No evaluations yet.</p> : (
            <div className="mt-2 space-y-2">
              {history.map((h) => (
                <div key={h.timestamp} className="p-3 border rounded bg-white flex justify-between">
                  <div>
                    <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                    <div className="text-sm">{h.hoursSince} h — {h.concentration_ugmL} µg/mL — {h.action}</div>
                  </div>
                  <div className="text-right">
                    <button onClick={() => { navigator.clipboard?.writeText(JSON.stringify(h, null, 2)); toast.success('Copied'); }} className="px-2 py-1 bg-gray-100 rounded text-sm">Copy</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-3 bg-yellow-50 rounded border text-sm text-gray-700">
          <strong>Disclaimer:</strong> This is an educational calculator. The Rumack‑Matthew nomogram and treatment thresholds are for single‑acute ingestions and are subject to local protocol variation. Always consult your regional poison centre or clinical toxicology service and follow local guidance for N‑acetylcysteine dosing & monitoring.
        </div>

      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
