"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Laptop, 
  MessageSquare, 
  Sparkles, 
  Wrench, 
  Recycle, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Cpu, 
  Info,
  Terminal,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ManualDataEntryPage() {
  const [deviceType, setDeviceType] = useState<"laptop" | "desktop">("laptop");
  const [assetTag, setAssetTag] = useState("ASSET-0142");
  const [model, setModel] = useState("Dell Latitude 5430");
  const [processor, setProcessor] = useState("13th Gen Intel Core i3-1305U");
  const [ram, setRam] = useState("24 GB DDR4");
  const [storage, setStorage] = useState("Samsung 512GB NVMe SSD");
  const [os, setOs] = useState("Microsoft Windows 11 Home");
  const [symptom, setSymptom] = useState("Overheating during moderate workload & thermal throttling");
  
  const [diagnosing, setDiagnosing] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookOndc = async () => {
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      const res = await fetch("/api/ondc/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Doorstep hardware repair for ${manualResult?.affectedPart || symptom || "PC hardware anomaly"}`,
          serviceTypeOverride: manualResult?.affectedPart || "Hardware Component Repair",
          assetTag: assetTag || "ASSET-0142",
          timeSlotOverride: "Tomorrow, 10:30 AM - 12:00 PM (Express Slot)",
        }),
      });
      const data = await res.json();
      if (data.success && data.bookingDetails) {
        setBookingSuccess(data);
      } else {
        setBookingError(data.error || "Failed to book via ONDC");
      }
    } catch (err: any) {
      console.error("ONDC booking error:", err);
      setBookingError(err.message || "Network error while connecting to ONDC");
    } finally {
      setBookingLoading(false);
    }
  };

  // Check whether required info is entered so the Diagnostics button becomes visible
  const isFormComplete = 
    model.trim().length > 0 && 
    processor.trim().length > 0 && 
    ram.trim().length > 0 && 
    storage.trim().length > 0 &&
    symptom.trim().length > 0;

  // Preset loaders for quick user testing
  const loadPreset = (type: "anomaly_thermal" | "anomaly_battery" | "anomaly_keyboard" | "healthy") => {
    setBookingSuccess(null);
    setBookingError(null);
    if (type === "anomaly_thermal") {
      setDeviceType("laptop");
      setModel("Dell Latitude 5430");
      setSymptom("Severe CPU overheating and fan running at maximum RPM");
    } else if (type === "anomaly_battery") {
      setDeviceType("laptop");
      setModel("Lenovo ThinkPad T14s");
      setSymptom("Battery draining from 100% to 0% in 40 minutes");
    } else if (type === "anomaly_keyboard") {
      setDeviceType("laptop");
      setModel("HP EliteBook 840");
      setSymptom("Keys E, R, and spacebar frequently unresponsive");
    } else if (type === "healthy") {
      setDeviceType("desktop");
      setModel("Dell OptiPlex 7090");
      setSymptom("All functioning normally within baseline");
    }
    setManualResult(null);
  };

  const handleRunManualDiagnostics = async () => {
    if (!isFormComplete || diagnosing) return;
    setDiagnosing(true);
    setManualResult(null);
    setBookingSuccess(null);
    setBookingError(null);

    try {
      const res = await fetch("/api/diagnostics/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceType,
          model,
          assetTag,
          processor,
          ram,
          storage,
          os,
          symptom,
        }),
      });
      const data = await res.json();
      setManualResult(data);
    } catch (e: any) {
      console.error("Manual diagnostics error:", e);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Manual Data Entry & Diagnostics
            </h1>
            <Badge variant="default" className="text-xs">
              Form Entry Mode
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Enter required system specifications. A small “Diagnostics” button will become visible once details are filled.
          </p>
        </div>

        <Link href="/assistant">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 gap-1.5 shadow-md shadow-emerald-500/20">
            <MessageSquare className="w-3.5 h-3.5" /> Switch to AI Action Agent
          </Button>
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" /> Enter Required System Information
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Please enter all hardware details below to unlock diagnostics.
            </p>
          </div>

          {/* Quick Scenarios */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px]">Quick Presets:</span>
            <button
              type="button"
              onClick={() => loadPreset("anomaly_thermal")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            >
              🔥 Overheating Anomaly
            </button>
            <button
              type="button"
              onClick={() => loadPreset("anomaly_battery")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            >
              🔋 Battery Drain Anomaly
            </button>
            <button
              type="button"
              onClick={() => loadPreset("healthy")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            >
              🟢 Healthy (No Anomaly)
            </button>
          </div>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block mb-1">Device Form Factor</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeviceType("laptop")}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  deviceType === "laptop"
                    ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                Laptop
              </button>
              <button
                type="button"
                onClick={() => setDeviceType("desktop")}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  deviceType === "desktop"
                    ? "bg-cyan-600/20 border-cyan-500/50 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                Desktop
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Make & Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Dell Latitude 5430"
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Asset Tag / Serial ID</label>
            <input
              type="text"
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              placeholder="e.g. ASSET-0142"
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Processor (CPU)</label>
            <input
              type="text"
              value={processor}
              onChange={(e) => setProcessor(e.target.value)}
              placeholder="e.g. 13th Gen Intel Core i3-1305U"
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">System Memory (RAM)</label>
            <input
              type="text"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              placeholder="e.g. 16 GB DDR4"
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-medium block mb-1">Primary Storage</label>
            <input
              type="text"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              placeholder="e.g. Samsung 512GB NVMe SSD"
              className="w-full h-9 bg-slate-950 border border-slate-800 rounded-lg px-3 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Prominent User Issue Text Data Entry Card */}
          <div className="sm:col-span-2 md:col-span-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-3 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" /> Device Problem & Symptom Description
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Describe what is wrong with your device. The system analyzes your issue and automatically triggers the matching Windows API testing tool (e.g. Win32_Keyboard controller probe, Event Log kernel crash detector, processor thermal counter).
                </p>
              </div>
            </div>

            {/* Quick Symptom Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Quick Select:</span>
              <button
                type="button"
                onClick={() => setSymptom("Keyboard keys E, R, and spacebar frequently unresponsive")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                ⌨️ Keyboard Keys Not Working
              </button>
              <button
                type="button"
                onClick={() => setSymptom("Frequent Blue Screen OS crashes with kernel driver stop code")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                💻 Blue Screen / Kernel Crash
              </button>
              <button
                type="button"
                onClick={() => setSymptom("Severe CPU overheating and thermal throttling under load")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                🔥 CPU Overheating & Throttling
              </button>
              <button
                type="button"
                onClick={() => setSymptom("Battery draining from 100% to 0% in 40 minutes")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                🔋 Battery Drain in 40 mins
              </button>
              <button
                type="button"
                onClick={() => setSymptom("High disk transfer latency and slow SSD response")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                💾 Slow NVMe SSD Latency
              </button>
              <button
                type="button"
                onClick={() => setSymptom("None - Baseline operational check, all functioning normally")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
              >
                🟢 Normal Baseline
              </button>
            </div>

            <textarea
              rows={2}
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Describe your device issue (e.g. 'Keyboard keys aren't working' or 'Frequent blue screen kernel crash')..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* Small "Diagnostics" Button (Only becomes visible after entering details) */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          <div className="text-xs text-slate-400">
            {isFormComplete ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Details complete. Diagnostics & Windows testing ready.
              </span>
            ) : (
              <span className="text-slate-500">
                * Enter system information and problem description to reveal the Diagnostics button.
              </span>
            )}
          </div>

          {isFormComplete && (
            <Button
              size="sm"
              onClick={handleRunManualDiagnostics}
              disabled={diagnosing}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 h-9 rounded-lg shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 animate-fade-in"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {diagnosing ? "Executing Windows API Test..." : "Run Diagnostics & Windows API Test"}
            </Button>
          )}
        </div>

      </div>

      {/* Diagnostics Output Section */}
      {manualResult && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Triggered Windows Testing Tool Banner */}
          {manualResult.triggeredTool && (
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-3.5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Terminal size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                      Triggered Testing Tool
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {manualResult.triggeredTool.name}
                    </h3>
                  </div>
                </div>
                <Badge variant="default" className="text-[10px] font-mono gap-1 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                  ⚡ Executed in {manualResult.triggeredTool.executionTimeMs}ms via Windows API
                </Badge>
              </div>

              {/* Windows API Command */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <Code size={12} className="text-cyan-400" /> Windows API Command Executed:
                </div>
                <code className="text-xs font-mono text-emerald-400 block overflow-x-auto whitespace-pre selection:bg-emerald-900">
                  {manualResult.triggeredTool.windowsCommand}
                </code>
              </div>

              {/* Live Host API Telemetry Output */}
              {manualResult.triggeredTool.rawExecutionOutput && (
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Live Host Output:</span>
                    <span className="text-[9px] text-emerald-400 font-bold font-mono">STATUS: RETURNED 0</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-36 leading-relaxed bg-black/60 p-2.5 rounded-lg border border-white/5 selection:bg-cyan-900">
                    {manualResult.triggeredTool.rawExecutionOutput}
                  </pre>
                </div>
              )}

              {/* Telemetry Summary */}
              <div className="text-xs text-slate-300 flex items-start gap-2 pt-0.5">
                <Info size={15} className="text-cyan-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{manualResult.triggeredTool.telemetrySummary}</span>
              </div>
            </div>
          )}

          {/* CASE A: NO ANOMALY FOUND */}
          {!manualResult.anomalyFound ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    “Basic diagnostics completed, all fine.”
                  </h3>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    {manualResult.summary}
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-300">
                  <strong>Need deeper analysis?</strong> Use our chat agent for live kernel telemetry, background stress testing, and driver inspection.
                </div>
                <Link href="/assistant">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-4 gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Open Chat for Advanced Diagnostics →
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* CASE B: ANOMALY FOUND */
            <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Damaged Part Banner */}
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-rose-300">
                    Anomaly Detected • Damaged / Affected Part Identified
                  </div>
                  <div className="text-base font-bold text-white mt-0.5">
                    {manualResult.affectedPart}
                  </div>
                </div>
              </div>

              {/* Three Factors Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" /> Diagnostic Information: Three Factors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  
                  {/* Factor 1 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-cyan-400 font-bold text-[11px] uppercase">
                      Factor 1: Component Health
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {manualResult.threeFactors?.factor1_health}
                    </p>
                  </div>

                  {/* Factor 2 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-amber-400 font-bold text-[11px] uppercase">
                      Factor 2: Functional Impact
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {manualResult.threeFactors?.factor2_impact}
                    </p>
                  </div>

                  {/* Factor 3 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-rose-400 font-bold text-[11px] uppercase">
                      Factor 3: Probable Root Cause
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {manualResult.threeFactors?.factor3_rootCause}
                    </p>
                  </div>

                </div>
              </div>

              {/* Final Actions Section: Repair / Reuse / Recycle */}
              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Final Action After Diagnosis:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Option 1: Repair */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-amber-500/30 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                        <Wrench className="w-4 h-4" /> 1. Repair
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        Book PC / Desktop Technician
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {manualResult.finalActions?.repair?.description}
                      </p>
                      <div className="text-[11px] text-emerald-400 font-medium mt-2">
                        Assigned Tech: {manualResult.finalActions?.repair?.technicianName}
                      </div>
                    </div>

                    {bookingSuccess ? (
                      <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-xs space-y-1.5 animate-in fade-in">
                        <div className="flex items-center justify-between text-emerald-300 font-bold">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={14} /> Booked via ONDC!
                          </span>
                          <Badge variant="emerald" className="text-[10px]">{bookingSuccess.ondcOrderId}</Badge>
                        </div>
                        <p className="text-slate-300 text-[11px]">
                          Specialist <strong>{bookingSuccess.bookingDetails?.assignedTechnician || "Alex Rivera"}</strong> reserved for <strong>{bookingSuccess.bookingDetails?.scheduledSlot}</strong>.
                        </p>
                        <div className="text-[10px] text-slate-400">
                          Destination: {bookingSuccess.bookingDetails?.doorstepDelivery?.address || "Bangalore (560103)"} (Zero Form-Filling)
                        </div>
                        <div className="pt-1">
                          <Link
                            href={`/track/${encodeURIComponent(bookingSuccess.ondcOrderId || bookingSuccess.bookingDetails?.orderId || "ONDC-SRV-2026-896751")}`}
                            className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                          >
                            <Truck className="w-3.5 h-3.5" /> Live ONDC Tracking →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Button 
                          size="sm" 
                          onClick={handleBookOndc}
                          disabled={bookingLoading}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-8 gap-1.5 shadow-md shadow-amber-900/30"
                        >
                          <Truck className={`w-3.5 h-3.5 ${bookingLoading ? "animate-spin" : ""}`} />
                          {bookingLoading ? "Reserving via ONDC..." : "Book Doorstep Tech via ONDC"}
                        </Button>
                        {bookingError && (
                          <p className="text-[11px] text-rose-400 mt-1">{bookingError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option 2: Reuse */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-cyan-500/30 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                        <Layers className="w-4 h-4" /> 2. Reuse
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        Repurpose Working Components
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {manualResult.finalActions?.reuse?.description}
                      </p>
                      <ul className="text-[11px] text-slate-300 mt-2 space-y-1 list-disc pl-3">
                        {manualResult.finalActions?.reuse?.workingComponents?.slice(0, 2).map((c: string, idx: number) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>

                    <Link href="/assistant" className="w-full">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs h-8 gap-1"
                      >
                        Explore Repurposing Guides
                      </Button>
                    </Link>
                  </div>

                  {/* Option 3: Recycle */}
                  <div className="bg-slate-950 rounded-xl p-4 border border-emerald-500/30 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <Recycle className="w-4 h-4" /> 3. Recycle
                      </div>
                      <div className="text-sm font-semibold text-white mt-1">
                        E-Waste Recycling Organizations
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {manualResult.finalActions?.recycle?.description}
                      </p>
                      <div className="text-[11px] text-slate-300 mt-2">
                        Partners: <strong>EcoRecycle India (R2 Certified)</strong>, GreenTech Recyclers.
                      </div>
                    </div>

                    <Link href="/passport" className="w-full">
                      <Button size="sm" variant="outline" className="w-full border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs h-8 gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> View Recycler Custody
                      </Button>
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
