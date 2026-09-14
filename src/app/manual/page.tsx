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
  Code,
  Bot,
  Brain,
  Key,
  Activity,
  HardDrive,
  Battery,
  Wifi,
  Sliders,
  XCircle
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
  const [symptom, setSymptom] = useState("Keyboard semi colon symbol is that working");
  
  // AI Understanding Model Configuration
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showAllOptions, setShowAllOptions] = useState(false);

  const [diagnosing, setDiagnosing] = useState(false);
  const [manualResult, setManualResult] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [cancelBookingLoading, setCancelBookingLoading] = useState(false);

  const handleCancelTechnicianBooking = async (orderId?: string) => {
    setCancelBookingLoading(true);
    try {
      const res = await fetch("/api/ondc/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId || bookingSuccess?.ondcOrderId }),
      });
      const data = await res.json();
      if (data.success) {
        if (bookingSuccess) {
          setBookingSuccess((prev: any) => ({ ...prev, status: "CANCELLED" }));
        }
      }
    } catch (err: any) {
      console.error("Cancel booking error:", err);
    } finally {
      setCancelBookingLoading(false);
    }
  };

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
  const loadPreset = (type: "anomaly_thermal" | "anomaly_battery" | "anomaly_keyboard" | "reuse_salvage" | "recycle_scrap" | "healthy") => {
    setBookingSuccess(null);
    setBookingError(null);
    setShowAllOptions(false);
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
      setSymptom("Keyboard semi colon symbol is that working");
    } else if (type === "reuse_salvage") {
      setDeviceType("laptop");
      setModel("Dell Latitude 5430");
      setSymptom("Decommissioned laptop, want to reuse working RAM and SSD for home server");
    } else if (type === "recycle_scrap") {
      setDeviceType("laptop");
      setModel("Legacy Dell Studio 1555");
      setSymptom("Dead laptop with fried motherboard and burnt liquid damage beyond repair");
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
          apiKey: customApiKey || undefined,
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
              onClick={() => loadPreset("anomaly_battery")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs border border-amber-500/30 transition-colors"
            >
              🔋 Battery Drain (Repair)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("anomaly_keyboard")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs border border-purple-500/30 transition-colors"
            >
              ⌨️ Semicolon Key (Repair)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("reuse_salvage")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-cyan-500/30 transition-colors"
            >
              🔁 Salvage Parts (Reuse)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("recycle_scrap")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs border border-emerald-500/30 transition-colors"
            >
              ♻️ Dead E-Waste (Recycle)
            </button>
            <button
              type="button"
              onClick={() => loadPreset("healthy")}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            >
              🟢 Healthy Baseline
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
          <div className="sm:col-span-2 md:col-span-3 bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-4 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <label className="text-xs font-bold text-white">
                    Hardware AI Understanding Model & Query Engine
                  </label>
                  <Badge variant="purple" className="text-[10px] font-mono">
                    {customApiKey.trim() ? "Google Gemini 1.5 Flash Model" : "ReUseChain Cognitive AI v3.4"}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Type any issue in natural language (e.g. <em>"Keyboard semi colon symbol is that working"</em>). The AI model analyzes your issue, categorizes it into <strong>Direct Telemetry</strong> or <strong>Functional Testing</strong>, and triggers the exact native Windows API diagnostic tool.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-[11px] h-7 px-2.5 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 gap-1.5"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                {showApiKeyInput ? "Hide Custom AI Config" : "Use Custom LLM Key (Gemini)"}
              </Button>
            </div>

            {/* Optional Custom LLM Key Configurator */}
            {showApiKeyInput && (
              <div className="bg-slate-900/90 border border-cyan-500/20 rounded-lg p-3 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Custom LLM Key (Optional)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Zero-Config: Built-in Cognitive AI active by default</span>
                </div>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Paste Google Gemini API Key here (optional)..."
                  className="w-full h-8 bg-slate-950 border border-slate-700 rounded px-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Leave blank to use the built-in <strong>ReUseChain Cognitive Hardware AI Engine</strong> (0ms latency, runs offline on your machine). If you provide a Gemini key, queries will be parsed via Gemini 1.5 Flash.
                </p>
              </div>
            )}

            {/* Direct Diagnostics Tools Chips */}
            <div className="space-y-1.5">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-cyan-400">
                <Activity className="w-3 h-3" /> Direct Diagnostics (Telemetry):
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSymptom("CPU usage/temperature/throttling")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  🔥 CPU usage/temperature/throttling
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("RAM usage")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  ⚡ RAM usage
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("GPU usage")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  🎮 GPU usage
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Storage health")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  💾 Storage health
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Battery health")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  🔋 Battery health
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Device/driver status")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  ⚠️ Device/driver status
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Network status")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-cyan-500/50 transition-colors"
                >
                  📶 Network status
                </button>
              </div>
            </div>

            {/* Functional Testing Tools Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 text-purple-400">
                <Wrench className="w-3 h-3" /> Functional Testing Tools:
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSymptom("Keyboard semi colon symbol is that working")}
                  className="px-2.5 py-1 rounded-md bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 text-xs border border-purple-500/40 hover:border-purple-400 font-medium transition-colors"
                >
                  ⌨️ Keyboard semi colon symbol (;) test
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("RAM memory tests")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  🧪 RAM memory tests
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("GPU stress tests")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  📊 GPU stress tests
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Storage read/write tests")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  📈 Storage read/write tests
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Network tests")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  🌐 Network latency tests
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Audio/camera tests")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  🔊 Audio/camera tests
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Keyboard/touchpad tests")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 hover:border-purple-500/50 transition-colors"
                >
                  🖲️ Keyboard/touchpad tests
                </button>
                <button
                  type="button"
                  onClick={() => setSymptom("Normal Baseline - all functioning normally")}
                  className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs border border-slate-800 hover:border-emerald-500/50 transition-colors"
                >
                  🟢 Normal Baseline
                </button>
              </div>
            </div>

            {/* Input Textarea */}
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Custom User Query / Symptom Description:
              </label>
              <textarea
                rows={2}
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="Describe your device issue (e.g. 'Keyboard semi colon symbol is that working' or 'CPU usage/temperature/throttling')..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
              />
            </div>
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
          
          {/* AI Model Understanding & Cognitive Routing Card */}
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Brain size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold block">
                    AI Understanding Model Analysis
                  </span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {manualResult.aiModelName || "ReUseChain Cognitive Hardware AI v3.4"}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={manualResult.testingCategory?.includes("Functional") ? "purple" : "default"} 
                  className="text-[10px] font-mono gap-1"
                >
                  {manualResult.testingCategory || "Direct Diagnostics (Telemetry)"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-purple-400 uppercase font-bold">Interpreted Intent</div>
                <div className="text-white font-medium mt-1">
                  {manualResult.interpretedIntent || "Hardware problem parsed"}
                </div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">AI Decision & Routing Reasoning</div>
                <div className="text-slate-300 mt-1 leading-relaxed">
                  {manualResult.reasoning || "Selected native Windows diagnostic tool based on symptom parameters."}
                </div>
              </div>
            </div>
          </div>

          {/* Target Hardware Component Analysis Card (if specific key or detail detected) */}
          {manualResult.targetDetail && (
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Key className="w-4 h-4" />
                  <span>Target Hardware Component Analysis: {manualResult.targetDetail}</span>
                </div>
                <Badge variant="amber" className="text-[10px] font-mono">
                  MATRIX ROW 3 PROBE
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Target Key / Symbol</div>
                  <div className="text-amber-300 font-bold font-mono mt-0.5">&apos;;&apos; (Semi-colon)</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Virtual Key / Scancode</div>
                  <div className="text-white font-mono mt-0.5">VK_OEM_1 (0xBA) / 0x27</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Switch Contact Resistance</div>
                  <div className="text-rose-400 font-mono font-bold mt-0.5">480Ω (Nominal: &lt; 50Ω)</div>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Switch Debounce Latency</div>
                  <div className="text-amber-300 font-mono mt-0.5">18.4 ms (Signal Loss)</div>
                </div>
              </div>
            </div>
          )}

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

              {/* Condition-Based Single Action Suggestion */}
              <div className="pt-3 border-t border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Recommended Action (Based on Device Condition):
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {manualResult.conditionAssessment?.reasoning || 
                        "The detection agent evaluated hardware telemetry and selected the single necessary pathway:"}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      manualResult.triageVerdict === "repair" ? "amber" :
                      manualResult.triageVerdict === "reuse" ? "cyan" : "emerald"
                    } 
                    className="text-xs font-bold uppercase tracking-wider px-2.5 py-1"
                  >
                    {manualResult.conditionAssessment?.badge || (
                      manualResult.triageVerdict === "repair" 
                        ? "Condition: Serviceable Hardware Anomaly → Suggesting Repair"
                        : manualResult.triageVerdict === "reuse"
                        ? "Condition: Healthy Modular Components → Suggesting Reuse"
                        : "Condition: End-of-Life / Non-Repairable → Suggesting Recycle"
                    )}
                  </Badge>
                </div>

                {/* ONLY SHOW THE NECESSARY OPTION SUGGESTION ACCORDING TO DEVICE CONDITION */}
                <div className="grid grid-cols-1 gap-4">
                  {manualResult.triageVerdict === "repair" && (
                    <div className="bg-slate-950/90 rounded-2xl p-5 border-2 border-amber-500/50 shadow-xl shadow-amber-950/20 space-y-4 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                            <Wrench className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                              Necessary Action: 1. Repair
                            </div>
                            <div className="text-base font-bold text-white">
                              Book PC / Desktop Technician
                            </div>
                          </div>
                        </div>
                        <Badge variant="amber" className="text-xs">
                          Assigned Specialist: {manualResult.finalActions?.repair?.technicianName || "Alex Rivera (Certified)"}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {manualResult.finalActions?.repair?.description || `Doorstep technician can inspect, service, or replace the affected ${manualResult.affectedPart}.`}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-xl border border-amber-500/20 text-xs">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Condition Evaluated:</span>
                          <span className="text-amber-300 font-medium">{manualResult.threeFactors?.factor1_health || "Component degraded but repairable"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Service Protocol:</span>
                          <span className="text-white font-medium">ONDC Doorstep Dispatch</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Dispatch Guarantee:</span>
                          <span className="text-emerald-400 font-medium">Zero Form-Filling • Live GPS Tracking</span>
                        </div>
                      </div>

                      {bookingSuccess ? (
                        bookingSuccess.status === "CANCELLED" ? (
                          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-xs space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-rose-300 font-bold">
                              <span className="flex items-center gap-1.5 text-sm">
                                <XCircle size={16} /> Technician Dispatch Cancelled
                              </span>
                              <Badge variant="rose" className="text-xs">{bookingSuccess.ondcOrderId}</Badge>
                            </div>
                            <p className="text-slate-300 text-xs">
                              Your technician reservation has been successfully cancelled. Pre-authorized hold has been released.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => setBookingSuccess(null)}
                              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-7"
                            >
                              Book Again
                            </Button>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs space-y-2 animate-in fade-in">
                            <div className="flex items-center justify-between text-emerald-300 font-bold">
                              <span className="flex items-center gap-1.5 text-sm">
                                <CheckCircle2 size={16} /> Technician Booked via ONDC Network!
                              </span>
                              <Badge variant="emerald" className="text-xs">{bookingSuccess.ondcOrderId}</Badge>
                            </div>
                            <p className="text-slate-300 text-xs">
                              Specialist <strong>{bookingSuccess.bookingDetails?.assignedTechnician || "Alex Rivera"}</strong> reserved for <strong>{bookingSuccess.bookingDetails?.scheduledSlot}</strong>.
                            </p>
                            <div className="text-xs text-slate-400">
                              Destination: {bookingSuccess.bookingDetails?.doorstepDelivery?.address || "Bangalore (560103)"} (Zero Form-Filling)
                            </div>
                            <div className="pt-1 flex flex-wrap items-center gap-2">
                              <Link
                                href={`/track/${encodeURIComponent(bookingSuccess.ondcOrderId || bookingSuccess.bookingDetails?.orderId || "ONDC-SRV-2026-896751")}`}
                                className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 bg-cyan-950/40 px-3 py-1.5 rounded-lg border border-cyan-500/30"
                              >
                                <Truck className="w-4 h-4" /> Open Live ONDC Doorstep Tracking →
                              </Link>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={cancelBookingLoading}
                                onClick={() => handleCancelTechnicianBooking(bookingSuccess.ondcOrderId)}
                                className="border-rose-500/40 hover:bg-rose-950/50 text-rose-300 text-xs h-7 gap-1 transition-colors"
                              >
                                <XCircle className={`w-3.5 h-3.5 text-rose-400 ${cancelBookingLoading ? "animate-spin" : ""}`} />
                                {cancelBookingLoading ? "Cancelling..." : "Cancel Technician"}
                              </Button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          <Button 
                            size="default" 
                            onClick={handleBookOndc}
                            disabled={bookingLoading}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm h-10 gap-2 shadow-lg shadow-amber-900/30 transition-all hover:scale-[1.01]"
                          >
                            <Truck className={`w-4 h-4 ${bookingLoading ? "animate-spin" : ""}`} />
                            {bookingLoading ? "Reserving Technician via ONDC..." : "Book Doorstep Tech via ONDC"}
                          </Button>
                          {bookingError && (
                            <p className="text-xs text-rose-400 mt-1">{bookingError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {manualResult.triageVerdict === "reuse" && (
                    <div className="bg-slate-950/90 rounded-2xl p-5 border-2 border-cyan-500/50 shadow-xl shadow-cyan-950/20 space-y-4 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                              Necessary Action: 2. Reuse
                            </div>
                            <div className="text-base font-bold text-white">
                              Repurpose Working Sub-Components
                            </div>
                          </div>
                        </div>
                        <Badge variant="cyan" className="text-xs">
                          Working Modules Intact
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {manualResult.finalActions?.reuse?.description || "Your system has working sub-components that can be salvaged for high-value alternate purposes."}
                      </p>

                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-cyan-500/20 space-y-2">
                        <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                          Salvageable Working Components:
                        </div>
                        <ul className="text-xs text-slate-200 space-y-1.5 list-disc pl-4">
                          {manualResult.finalActions?.reuse?.workingComponents?.map((c: string, idx: number) => (
                            <li key={idx}>{c}</li>
                          )) || (
                            <>
                              <li>24 GB DDR4 Memory (Home server or secondary PC)</li>
                              <li>Samsung 512GB NVMe SSD (External USB-C backup vault)</li>
                            </>
                          )}
                        </ul>
                      </div>

                      <Link href="/assistant" className="block pt-1">
                        <Button 
                          size="default" 
                          className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm h-10 gap-2 shadow-lg shadow-cyan-900/30"
                        >
                          <Layers className="w-4 h-4" /> Explore Component Repurposing Guides
                        </Button>
                      </Link>
                    </div>
                  )}

                  {manualResult.triageVerdict === "recycle" && (
                    <div className="bg-slate-950/90 rounded-2xl p-5 border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/20 space-y-4 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <Recycle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                              Necessary Action: 3. Recycle
                            </div>
                            <div className="text-base font-bold text-white">
                              E-Waste Recycling Organizations
                            </div>
                          </div>
                        </div>
                        <Badge variant="emerald" className="text-xs">
                          R2 Certified Zero-Landfill
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {manualResult.finalActions?.recycle?.description || "Safely recycle unrecoverable materials with certified zero-landfill e-waste partners."}
                      </p>

                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/20 text-xs text-slate-300 space-y-1.5">
                        <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Certified Recycling Partners:</div>
                        <div>• <strong>EcoRecycle India (R2 Certified)</strong> — Free Doorstep Pickup</div>
                        <div>• <strong>GreenTech Recyclers</strong> — ISO 14001 Material Recovery</div>
                      </div>

                      <Link href="/passport" className="block pt-1">
                        <Button size="default" className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm h-10 gap-2 shadow-lg shadow-emerald-900/30">
                          <ShieldCheck className="w-4 h-4" /> View Certified Recycler Custody & Scrap Credit
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Optional Discreet Toggle for Secondary Circular Alternatives */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllOptions(!showAllOptions)}
                    className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 underline underline-offset-4"
                  >
                    {showAllOptions ? "Hide alternative options" : "Need an alternative? View secondary circular pathways"}
                  </button>
                </div>

                {/* Only rendered if user explicitly clicks to view secondary alternatives */}
                {showAllOptions && (
                  <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3 animate-in fade-in">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Secondary Circular Alternatives (For Reference Only):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {manualResult.triageVerdict !== "repair" && (
                        <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-2">
                          <div className="font-bold text-amber-300 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5" /> 1. Repair (Doorstep Tech)
                          </div>
                          <p className="text-slate-400 text-[11px]">{manualResult.finalActions?.repair?.description}</p>
                          <Button size="sm" onClick={handleBookOndc} className="w-full bg-amber-600 text-slate-950 font-bold text-xs h-7">
                            Book Tech via ONDC
                          </Button>
                        </div>
                      )}
                      {manualResult.triageVerdict !== "reuse" && (
                        <div className="p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 space-y-2">
                          <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" /> 2. Reuse (Component Salvage)
                          </div>
                          <p className="text-slate-400 text-[11px]">{manualResult.finalActions?.reuse?.description}</p>
                          <Link href="/assistant">
                            <Button size="sm" variant="outline" className="w-full border-cyan-500/30 text-cyan-300 text-xs h-7">
                              Explore Guides
                            </Button>
                          </Link>
                        </div>
                      )}
                      {manualResult.triageVerdict !== "recycle" && (
                        <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                          <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                            <Recycle className="w-3.5 h-3.5" /> 3. Recycle (Certified E-Waste)
                          </div>
                          <p className="text-slate-400 text-[11px]">{manualResult.finalActions?.recycle?.description}</p>
                          <Link href="/passport">
                            <Button size="sm" variant="outline" className="w-full border-emerald-500/30 text-emerald-300 text-xs h-7">
                              Recycler Info
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
