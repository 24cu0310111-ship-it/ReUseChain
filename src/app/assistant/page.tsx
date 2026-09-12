"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Cpu, 
  Thermometer, 
  Battery, 
  Send, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  Recycle, 
  Layers, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  BellRing,
  HelpCircle,
  MessageSquare,
  Camera,
  Keyboard,
  Check,
  Terminal,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Truck,
  MapPin,
  Zap,
  Clock,
  UserCheck,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DiagnosticAssistantPage() {
  const [activeTab, setActiveTab] = useState<"control_panel" | "telegram_os" | "keyboard_test" | "ondc_doorstep">("control_panel");
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState("ASSET-0142");
  
  // Tab 1: Control Panel & Live Triage
  const [queryText, setQueryText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  // Live Control Panel Telemetry State
  const [cpuLoad, setCpuLoad] = useState(38);
  const [tempC, setTempC] = useState(44);
  const [batteryHealth, setBatteryHealth] = useState(52);
  const [ssdWear, setSsdWear] = useState(12);
  const [offlineSimulated, setOfflineSimulated] = useState(false);

  // Tab 2: Telegram Bot & Screen Photo Inspector
  const [telegramQuery, setTelegramQuery] = useState("");
  const [telegramPhotoType, setTelegramPhotoType] = useState<string>("driver_irql");
  const [telegramEvaluating, setTelegramEvaluating] = useState(false);
  const [telegramResponse, setTelegramResponse] = useState<any>(null);

  // Tab 3: Physical Keyboard Hardware Diagnostic
  const [keyStates, setKeyStates] = useState<Record<string, "untested" | "working" | "dead">>({});
  const [keyboardAnalyzing, setKeyboardAnalyzing] = useState(false);
  const [keyboardResult, setKeyboardResult] = useState<any>(null);

  // Tab 4: ONDC Services Doorstep Booking & User Automation
  const [userProfile, setUserProfile] = useState<any>(null);
  const [ondcPrompt, setOndcPrompt] = useState("");
  const [ondcLoading, setOndcLoading] = useState(false);
  const [ondcOrderResult, setOndcOrderResult] = useState<any>(null);

  // Key definitions for visual keyboard tester
  const keyboardRows = [
    ["Esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12", "Del"],
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace"],
    ["Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
    ["Caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter"],
    ["Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Shift"],
    ["Ctrl", "Win", "Alt", "Spacebar", "Alt", "Fn", "Ctrl"]
  ];

  useEffect(() => {
    fetch("/api/devices")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data.length > 0) {
          setDevices(j.data);
          setSelectedAsset(j.data[0].assetTag);
        }
      })
      .catch(() => {});

    // Retrieve stored user profile for zero form-filling automation
    fetch("/api/ondc/profile")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) {
          setUserProfile(j.data);
        }
      })
      .catch(() => {});
  }, []);

  // Physical keypress listener for keyboard test tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== "keyboard_test") return;
      const key = e.key.toUpperCase();
      let matchedLabel: string | null = null;

      if (e.code === "Space") matchedLabel = "Spacebar";
      else if (e.code === "Escape") matchedLabel = "Esc";
      else if (e.code === "Backspace") matchedLabel = "Backspace";
      else if (e.code === "Enter") matchedLabel = "Enter";
      else if (e.code === "Tab") matchedLabel = "Tab";
      else if (e.code === "CapsLock") matchedLabel = "Caps";
      else if (e.code.startsWith("Shift")) matchedLabel = "Shift";
      else if (e.code.startsWith("Control")) matchedLabel = "Ctrl";
      else if (e.code.startsWith("Alt")) matchedLabel = "Alt";
      else if (e.code.startsWith("Key")) matchedLabel = e.code.replace("Key", "");
      else if (e.code.startsWith("Digit")) matchedLabel = e.code.replace("Digit", "");
      else if (key.length === 1) matchedLabel = key;

      if (matchedLabel) {
        setKeyStates((prev) => {
          if (prev[matchedLabel!] === "dead") return prev;
          return { ...prev, [matchedLabel!]: "working" };
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Tab 1: Live Triage Handler
  const handleDiagnose = async (overrideText?: string) => {
    const textToSend = overrideText !== undefined ? overrideText : queryText;
    if (!textToSend.trim() && !liveTelemetryActive) return;

    if (textToSend.toLowerCase().includes("keyboard") || textToSend.toLowerCase().includes("keys not working")) {
      setActiveTab("keyboard_test");
      return;
    }

    try {
      setEvaluating(true);
      setDispatchToast(null);
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryText: textToSend,
          assetTag: selectedAsset,
          liveTelemetry: {
            cpuLoadPercent: cpuLoad,
            tempC,
            batteryHealth,
            ssdWearPercent: ssdWear,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setResult(json);
      }
    } catch (e: any) {
      console.error("Diagnostic error:", e);
    } finally {
      setEvaluating(false);
    }
  };

  const handleExecuteDispatch = async () => {
    if (!result?.dispatchAction) return;
    try {
      const res = await fetch("/api/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: result.dispatchAction.type,
          assetTag: selectedAsset,
          serviceType: result.dispatchAction.serviceType,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDispatchToast(json.message);
      }
    } catch (e: any) {
      setDispatchToast(`Dispatch failed: ${e.message}`);
    }
  };

  // Tab 2: Telegram Bot & Screen Photo Handler
  const handleTelegramDiagnose = async (overridePhoto?: string, overrideText?: string) => {
    const photoToUse = overridePhoto !== undefined ? overridePhoto : telegramPhotoType;
    const textToUse = overrideText !== undefined ? overrideText : telegramQuery;

    try {
      setTelegramEvaluating(true);
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToUse || "Diagnose captured screen error",
          photoType: photoToUse,
          assetTag: selectedAsset,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTelegramResponse(json);
      }
    } catch (e: any) {
      console.error("Telegram triage error:", e);
    } finally {
      setTelegramEvaluating(false);
    }
  };

  // Tab 3: Keyboard Diagnostic & Execution Agent Hand-Off
  const handleSimulateDeadKeys = () => {
    setKeyStates({
      W: "dead",
      E: "dead",
      Spacebar: "dead",
      A: "working",
      S: "working",
      D: "working",
    });
  };

  const handleRunKeyboardDiagnostic = async () => {
    const dead = Object.entries(keyStates)
      .filter(([_, state]) => state === "dead")
      .map(([k]) => k);

    const testedCount = Object.keys(keyStates).length;

    try {
      setKeyboardAnalyzing(true);
      const res = await fetch("/api/diagnostics/keyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetTag: selectedAsset,
          deadKeys: dead.length > 0 ? dead : ["W", "E", "Spacebar"],
          totalKeysTested: testedCount > 0 ? testedCount : 6,
          symptomReported: "User reports non-responsive keys during physical testing session",
          keyChatterDetected: dead.length >= 3,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setKeyboardResult(json);
      }
    } catch (e: any) {
      console.error("Keyboard diagnostic error:", e);
    } finally {
      setKeyboardAnalyzing(false);
    }
  };

  // Tab 4: ONDC Services Doorstep Booking Handler (Single-Turn Prompt)
  const handleOndcSingleTurnBooking = async (overridePrompt?: string, overrideService?: string) => {
    const promptToSend = overridePrompt !== undefined ? overridePrompt : ondcPrompt;
    if (!promptToSend && !overrideService) return;

    try {
      setOndcLoading(true);
      const res = await fetch("/api/ondc/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          serviceTypeOverride: overrideService,
          assetTag: selectedAsset,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setOndcOrderResult(json);
        setDispatchToast(json.message);
        setActiveTab("ondc_doorstep");
      }
    } catch (e: any) {
      console.error("ONDC booking error:", e);
    } finally {
      setOndcLoading(false);
    }
  };

  const isOverheating = tempC >= 80;
  const isHighLoad = cpuLoad >= 85;
  const liveTelemetryActive = isOverheating || isHighLoad;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Radio size={24} className="text-cyan-400" /> Autonomous Hardware & OS Diagnostic Assistant
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Multi-modal sensor tracking, screen photo OS error analysis, physical component testing, and 1-turn ONDC doorstep technician booking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/escalations">
            <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1.5 text-xs">
              <HelpCircle size={14} /> Admin Escalation Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Authenticated User Automation Banner (Bypasses Form-Filling) */}
      {userProfile && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <UserCheck size={18} className="text-emerald-400 shrink-0" />
            <div>
              <span className="text-white font-semibold">Logged-in Profile:</span>{" "}
              <strong className="text-emerald-300">{userProfile.fullName}</strong>{" "}
              <span className="text-slate-400">({userProfile.role})</span>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                <MapPin size={12} className="text-cyan-400" />
                <span>{userProfile.addressLine}, {userProfile.city} (PIN: {userProfile.pinCode})</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-cyan-400 text-[10px]">GPS: {userProfile.gpsCoordinates}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="emerald" className="gap-1 text-[10px]">
              <Check size={11} /> Zero Form-Filling Active
            </Badge>
            <button
              onClick={() => setActiveTab("ondc_doorstep")}
              className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
            >
              ONDC Doorstep Mode &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("control_panel")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "control_panel"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Cpu size={15} /> Live Control Panel & Telemetry
        </button>

        <button
          onClick={() => setActiveTab("telegram_os")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "telegram_os"
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare size={15} /> Telegram Bot & Screen Photo Inspector
        </button>

        <button
          onClick={() => setActiveTab("keyboard_test")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "keyboard_test"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Keyboard size={15} /> Physical Components Trouble Catcher
        </button>

        <button
          onClick={() => setActiveTab("ondc_doorstep")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ondc_doorstep"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Truck size={15} className="text-emerald-400" /> ONDC Doorstep Technician (1-Turn AI)
        </button>
      </div>

      {dispatchToast && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{dispatchToast}</span>
          </div>
          <button onClick={() => setDispatchToast(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: LIVE CONTROL PANEL & TRIAGE                                        */}
      {/* ========================================================================= */}
      {activeTab === "control_panel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Control Panel Telemetry */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-t-4 border-t-cyan-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Cpu size={18} className="text-cyan-400" /> Live Endpoint Control Panel
                  </CardTitle>
                  <select
                    className="form-select text-xs py-1 px-2 w-36"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                  >
                    {devices.map((d) => (
                      <option key={d.id} value={d.assetTag}>
                        {d.assetTag}
                      </option>
                    ))}
                  </select>
                </div>
                <CardDescription>
                  Simulate dynamic load & thermal stress to trigger preventative action loops.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CPU Load Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Cpu size={14} className="text-sky-400" /> CPU Utilization
                    </span>
                    <span className={cpuLoad > 80 ? "text-amber-400 font-mono" : "text-slate-300 font-mono"}>
                      {cpuLoad}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={cpuLoad}
                    onChange={(e) => setCpuLoad(parseInt(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                {/* Thermal Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Thermometer size={14} className={tempC > 80 ? "text-rose-400" : "text-sky-400"} /> Thermal Core Temperature
                    </span>
                    <span className={tempC > 80 ? "text-rose-400 font-mono font-bold" : "text-slate-300 font-mono"}>
                      {tempC}°C {tempC > 80 && "🔥 [Heavy Load]"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="98"
                    value={tempC}
                    onChange={(e) => setTempC(parseInt(e.target.value))}
                    className="w-full accent-amber-400"
                  />
                </div>

                {/* Battery Health */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Battery size={14} className="text-emerald-400" /> Battery Capacity Health
                    </span>
                    <span className="font-mono text-slate-300">{batteryHealth}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(parseInt(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                {/* Heavy Load Alert Banner */}
                {(isOverheating || isHighLoad) && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                    <div>
                      <strong className="block font-semibold">Heavy Load & Thermal Warning Active</strong>
                      Sustained thermal core temperature ({tempC}°C) exceeds normal tolerance. Recommending preventive fan servicing or technician checkup.
                    </div>
                  </div>
                )}

                {/* Emergency Offline Trigger */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setOfflineSimulated(!offlineSimulated)}
                    className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
                  >
                    <BellRing size={13} /> {offlineSimulated ? "✓ Emergency Support Triggered (Dispatched)" : "Simulate Sudden Endpoint Death / Emergency Fallback"}
                  </button>
                  {offlineSimulated && (
                    <div className="mt-2 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-200">
                      Endpoint signal lost. External automation alerted designated IT technician for physical triage.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Diagnostic Assistant & Tri-Path Execution */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-400" /> Cognitive Diagnostic Assistant
                  </CardTitle>
                  <Badge variant="purple">Understanding & Triage Agent</Badge>
                </div>
                <CardDescription>
                  Describe hardware symptoms in plain text, or test pre-configured scenarios.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Scenario Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      const text = "Battery dies in 25 minutes and chassis gets very warm under load";
                      setQueryText(text);
                      handleDiagnose(text);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-all"
                  >
                    ⚡ Battery Degradation
                  </button>
                  <button
                    onClick={() => {
                      const text = "Shattered display screen from drop; logic board still boots";
                      setQueryText(text);
                      handleDiagnose(text);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-all"
                  >
                    🖥️ Broken Display (Harvest)
                  </button>
                  <button
                    onClick={() => {
                      const text = "Keyboard buttons aren't working on my laptop";
                      setQueryText(text);
                      handleDiagnose(text);
                    }}
                    className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 text-xs border border-amber-500/30 transition-all"
                  >
                    ⌨️ Keyboard Defect (Test & Dispatch)
                  </button>
                  <button
                    onClick={() => {
                      const text = "Unusual burnt smell and high pitched electrical whine under heavy load";
                      setQueryText(text);
                      handleDiagnose(text);
                    }}
                    className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 text-xs border border-purple-500/30 transition-all"
                  >
                    ❓ Novel/Ambiguous Fault (Escalate)
                  </button>
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1 text-sm"
                    placeholder="Describe hardware issue or symptom..."
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleDiagnose()}
                  />
                  <Button 
                    onClick={() => handleDiagnose()} 
                    disabled={evaluating} 
                    variant="default"
                    className="gap-1.5"
                  >
                    <Send size={14} /> {evaluating ? "Triage..." : "Diagnose"}
                  </Button>
                </div>

                {/* Results View */}
                {result && (
                  <div className="space-y-3 pt-2">
                    {result.isEscalated ? (
                      <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-500/40 text-purple-200 space-y-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-purple-300">
                          <ShieldAlert size={18} className="text-purple-400" />
                          <span>Routed to Admin Escalation Queue</span>
                        </div>
                        <p className="text-xs leading-relaxed text-purple-300">
                          {result.triageSummary}
                        </p>
                        <div className="pt-2 flex items-center justify-between border-t border-purple-500/20">
                          <span className="text-[11px] text-purple-400">Escalation ID: {result.escalationId?.slice(0, 12)}...</span>
                          <Link href="/escalations">
                            <Button size="sm" variant="secondary" className="h-7 text-xs bg-purple-800/60 hover:bg-purple-700 text-white">
                              View & Resolve in Escalation Hub &rarr;
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Badge variant={result.recommendedPath === "repair" ? "emerald" : result.recommendedPath === "recycle" ? "rose" : "amber"}>
                              {result.actionHeadline}
                            </Badge>
                            <div className="text-base font-bold text-white mt-1 capitalize">
                              Recommended Routing: {result.recommendedPath?.replace(/_/g, " ")}
                            </div>
                          </div>
                          <div className="text-right text-xs text-slate-400">
                            <div>Asset: <strong className="text-cyan-400">{selectedAsset}</strong></div>
                            <div>Thermal: {result.liveTelemetry?.tempC}°C</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                          {result.detailedReasoning}
                        </p>

                        {/* Real-World Action & ONDC 1-Turn Doorstep Booking Buttons */}
                        {result.dispatchAction && (
                          <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <span className="text-xs text-slate-400">
                              Action Ready for Execution:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {result.recommendedPath === "repair" && (
                                <Button
                                  onClick={() => handleOndcSingleTurnBooking(undefined, result.dispatchAction?.serviceType || "OEM Battery Pack Replacement")}
                                  disabled={ondcLoading}
                                  size="sm"
                                  className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm"
                                >
                                  <Truck size={14} />
                                  {ondcLoading ? "Reserving via ONDC..." : "Book Doorstep Technician on ONDC"}
                                </Button>
                              )}

                              <Button
                                onClick={handleExecuteDispatch}
                                size="sm"
                                variant={result.recommendedPath === "repair" ? "emerald" : result.recommendedPath === "recycle" ? "destructive" : "default"}
                                className="text-xs font-semibold gap-1.5"
                              >
                                {result.recommendedPath === "repair" && <Wrench size={14} />}
                                {result.recommendedPath === "recycle" && <Recycle size={14} />}
                                {result.recommendedPath?.includes("reuse") && <Layers size={14} />}
                                {result.dispatchAction.label}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TELEGRAM BOT OS TROUBLE & SCREEN PHOTO INSPECTOR                   */}
      {/* ========================================================================= */}
      {activeTab === "telegram_os" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Screen Photo Presets & Upload */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-t-4 border-t-sky-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Camera size={18} className="text-sky-400" /> Screen Photo OS Diagnostic
                  </CardTitle>
                  <Badge variant="blue" className="gap-1">
                    <Radio size={10} className="text-sky-400 animate-pulse" /> Telegram Webhook
                  </Badge>
                </div>
                <CardDescription>
                  Take or upload a photo of the OS blue screen, freeze, or recovery loop for instant diagnosis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Select Simulated Screen Capture:</label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => {
                        setTelegramPhotoType("driver_irql");
                        handleTelegramDiagnose("driver_irql", "Screen crashed with blue screen DRIVER_IRQL_NOT_LESS_OR_EQUAL in nvlddmkm.sys");
                      }}
                      className={`p-3 rounded-lg text-left text-xs border transition-all ${
                        telegramPhotoType === "driver_irql"
                          ? "bg-sky-950/60 border-sky-500/50 text-sky-200"
                          : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>🖥️ BSOD: DRIVER_IRQL_NOT_LESS_OR_EQUAL</span>
                        <span className="text-[10px] text-sky-400 font-mono">0x000000D1</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Graphics display driver crash (nvlddmkm.sys) with high kernel latency.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setTelegramPhotoType("unmountable_boot_volume");
                        handleTelegramDiagnose("unmountable_boot_volume", "Screen photo shows BSOD UNMOUNTABLE_BOOT_VOLUME and disk cannot be read");
                      }}
                      className={`p-3 rounded-lg text-left text-xs border transition-all ${
                        telegramPhotoType === "unmountable_boot_volume"
                          ? "bg-rose-950/60 border-rose-500/50 text-rose-200"
                          : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>⚠️ BSOD: UNMOUNTABLE_BOOT_VOLUME</span>
                        <span className="text-[10px] text-rose-400 font-mono">0x000000ED</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Physical NVMe/SSD NAND sector failure or bootloader partition corruption.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setTelegramPhotoType("memory_management");
                        handleTelegramDiagnose("memory_management", "Photo of screen during crash: MEMORY_MANAGEMENT stop code occurred repeatedly");
                      }}
                      className={`p-3 rounded-lg text-left text-xs border transition-all ${
                        telegramPhotoType === "memory_management"
                          ? "bg-amber-950/60 border-amber-500/50 text-amber-200"
                          : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>🧠 BSOD: MEMORY_MANAGEMENT</span>
                        <span className="text-[10px] text-amber-400 font-mono">0x0000001A</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Physical DDR4 RAM parity bit flip or defective memory controller trace.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Simulated Screen Preview */}
                <div className="p-3.5 rounded-lg bg-blue-950/40 border border-blue-600/30 text-blue-200 text-xs font-mono">
                  <div className="text-[11px] text-blue-400 font-bold mb-1 flex items-center gap-1.5">
                    <Camera size={13} /> Optical Screen Inspection Matrix
                  </div>
                  <div className="text-[10px] text-slate-300 leading-relaxed">
                    :( Your PC ran into a problem and needs to restart. We&apos;re just collecting some error info...
                    <br />
                    <strong className="text-cyan-300">
                      Stop Code: {telegramPhotoType === "unmountable_boot_volume" ? "UNMOUNTABLE_BOOT_VOLUME" : telegramPhotoType === "memory_management" ? "MEMORY_MANAGEMENT" : "DRIVER_IRQL_NOT_LESS_OR_EQUAL"}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Telegram Chat & Multi-Agent Handoff */}
          <div className="lg:col-span-7 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare size={18} className="text-sky-400" /> Telegram Bot Conversational Triage
                  </CardTitle>
                  <Badge variant="blue">Multi-Agent Router</Badge>
                </div>
                <CardDescription>
                  Communicate with the Telegram diagnostic agent, view remediation steps, and monitor agent handoffs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1 text-sm"
                    placeholder="Describe OS issue or paste stop code (e.g., Windows freezing, DPC watchdog violation)..."
                    value={telegramQuery}
                    onChange={(e) => setTelegramQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTelegramDiagnose(undefined, telegramQuery)}
                  />
                  <Button
                    onClick={() => handleTelegramDiagnose(undefined, telegramQuery)}
                    disabled={telegramEvaluating}
                    className="gap-1.5 bg-sky-600 hover:bg-sky-500 text-white"
                  >
                    <Send size={14} /> {telegramEvaluating ? "Analyzing..." : "Send to Bot"}
                  </Button>
                </div>

                {/* Analysis & Agent Handoff Output */}
                {telegramResponse ? (
                  <div className="space-y-4 pt-2">
                    {/* Diagnostic Summary */}
                    <div className="p-4 rounded-xl bg-slate-800/80 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={telegramResponse.analysis?.crashCategory?.includes("hardware") ? "rose" : "blue"}>
                          {telegramResponse.analysis?.detectedErrorCode}
                        </Badge>
                        <span className="text-xs text-slate-400 font-mono">
                          Module: {telegramResponse.analysis?.faultyModule}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <strong className="text-xs text-white block font-semibold">Recommended Remediation:</strong>
                        <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                          {telegramResponse.analysis?.suggestedSolution?.map((sol: string, idx: number) => (
                            <li key={idx}>{sol}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Remediation Commands if Software */}
                      {telegramResponse.analysis?.remediationCommands && (
                        <div className="mt-2 p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                          <div className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                            <Terminal size={12} /> Suggested Shell Commands:
                          </div>
                          {telegramResponse.analysis.remediationCommands.map((cmd: string, idx: number) => (
                            <div key={idx} className="text-[11px] font-mono text-slate-300">
                              {cmd}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Agent Handoff Card */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowRight size={16} className="text-sky-400" />
                          <strong className="text-xs text-white font-semibold">Smooth Agent Handoff Status:</strong>
                        </div>
                        <Badge variant={telegramResponse.analysis?.recommendedAgent === "hardware_execution_agent" ? "emerald" : "blue"}>
                          {telegramResponse.analysis?.recommendedAgent === "hardware_execution_agent" ? "Hardware Execution Agent" : "Software Recovery Agent"}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded border border-white/5">
                        {telegramResponse.analysis?.agentHandoffReason}
                      </p>

                      {/* Technician Booking Details if Hardware */}
                      {telegramResponse.executionResult?.bookingId && (
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
                          <div className="font-semibold flex items-center gap-1.5 text-emerald-400">
                            <Check size={14} /> Technician Work Order Dispatched Automatically
                          </div>
                          <div>Assigned to: <strong>{telegramResponse.executionResult.technician}</strong></div>
                          <div>Service: {telegramResponse.executionResult.serviceType}</div>
                          <div className="text-[11px] text-slate-400">
                            Passport Hash: <span className="font-mono text-cyan-400">{telegramResponse.executionResult.passportHash?.slice(0, 16)}...</span>
                          </div>

                          <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Doorstep Delivery via ONDC:</span>
                            <Button
                              onClick={() => handleOndcSingleTurnBooking(undefined, telegramResponse.executionResult.serviceType)}
                              disabled={ondcLoading}
                              size="sm"
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                            >
                              <Truck size={12} /> Confirm ONDC Doorstep Slot
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-800/30 border border-white/5 text-center text-slate-500 text-xs">
                    Select a screen preset on the left or type an OS symptom to trigger the multi-agent diagnostic router.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PHYSICAL KEYBOARD HARDWARE DIAGNOSTIC TEST RUNNER                 */}
      {/* ========================================================================= */}
      {activeTab === "keyboard_test" && (
        <div className="space-y-6">
          <Card className="border-t-4 border-t-amber-500">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Keyboard size={18} className="text-amber-400" /> Physical Components Trouble Catcher: Keyboard Matrix Test
                  </CardTitle>
                  <CardDescription>
                    Press physical keys on your keyboard to test continuity, or click &apos;Simulate Broken Keys&apos; to trigger the Execution Agent.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSimulateDeadKeys}
                    variant="outline"
                    size="sm"
                    className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                  >
                    Simulate Broken Keys (W, E, Spacebar)
                  </Button>
                  <Button
                    onClick={() => setKeyStates({})}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    <RefreshCw size={12} className="mr-1" /> Reset Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-white/20"></span>
                  <span className="text-slate-400">Untested</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-400"></span>
                  <span className="text-emerald-300 font-semibold">Working Switch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/40 border border-rose-400"></span>
                  <span className="text-rose-300 font-semibold">Defective / Non-Responsive Switch</span>
                </div>
              </div>

              {/* Visual Keyboard Matrix */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 overflow-x-auto shadow-inner">
                {keyboardRows.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5 justify-center min-w-[720px]">
                    {row.map((kLabel, kIdx) => {
                      const status = keyStates[kLabel] || "untested";
                      let styleClasses = "bg-slate-800/80 text-slate-300 border-white/10 hover:border-cyan-400";
                      if (status === "working") {
                        styleClasses = "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]";
                      } else if (status === "dead") {
                        styleClasses = "bg-rose-500/30 text-rose-300 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)] animate-pulse";
                      }

                      const isWide = kLabel === "Spacebar";
                      const isMed = ["Backspace", "Enter", "Shift", "Caps", "Tab"].includes(kLabel);

                      return (
                        <button
                          key={kIdx}
                          onClick={() => {
                            setKeyStates((prev) => ({
                              ...prev,
                              [kLabel]: prev[kLabel] === "dead" ? "working" : "dead",
                            }));
                          }}
                          className={`h-10 text-xs font-mono font-medium rounded border transition-all flex items-center justify-center select-none ${styleClasses} ${
                            isWide ? "flex-1 max-w-[280px]" : isMed ? "px-3 min-w-[54px]" : "w-10"
                          }`}
                        >
                          {kLabel}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Action Button: Submit to Execution Agent */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/5">
                <div className="text-xs text-slate-400">
                  Dead Keys Detected:{" "}
                  <strong className="text-rose-400 font-mono font-bold">
                    {Object.values(keyStates).filter((v) => v === "dead").length}
                  </strong>{" "}
                  | Verified Working:{" "}
                  <strong className="text-emerald-400 font-mono font-bold">
                    {Object.values(keyStates).filter((v) => v === "working").length}
                  </strong>
                </div>

                <Button
                  onClick={handleRunKeyboardDiagnostic}
                  disabled={keyboardAnalyzing}
                  variant="default"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold gap-2 text-xs"
                >
                  <Wrench size={14} />
                  {keyboardAnalyzing ? "Evaluating Fault..." : "Run Diagnostic & Send Issue to Execution Agent"}
                </Button>
              </div>

              {/* Keyboard Diagnostic Result & Execution Agent Handoff Dossier */}
              {keyboardResult && (
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-amber-400" />
                      <strong className="text-sm text-white font-bold">Hardware Fault Analysis</strong>
                    </div>
                    <Badge variant="rose">Fault Severity: {keyboardResult.diagnosticResult?.severity?.toUpperCase()}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-slate-400">Classification:</div>
                      <div className="font-semibold text-rose-300">{keyboardResult.diagnosticResult?.failureClassification}</div>
                      <div className="text-slate-400 mt-2">Defective Keys:</div>
                      <div className="font-mono text-amber-300 font-bold">
                        [{keyboardResult.diagnosticResult?.deadKeys?.join(", ")}]
                      </div>
                    </div>

                    <div className="space-y-1 bg-black/20 p-3 rounded-lg border border-white/5">
                      <div className="text-slate-400">Autonomous Action Dispatched:</div>
                      <div className="font-semibold text-emerald-300">{keyboardResult.executionHandoff?.serviceType}</div>
                      <div className="text-slate-400 mt-2">Assigned Technician:</div>
                      <div className="text-white">
                        {keyboardResult.executionHandoff?.technician} ({keyboardResult.executionHandoff?.vendor})
                      </div>
                    </div>
                  </div>

                  {/* ONDC Doorstep 1-Click Booking Button */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">
                      Work Order: <strong>#{keyboardResult.executionHandoff?.bookingId?.slice(0, 8)}</strong> | Passport:{" "}
                      <span className="font-mono text-cyan-400">{keyboardResult.executionHandoff?.passportHash?.slice(0, 16)}...</span>
                    </span>

                    <Button
                      onClick={() => handleOndcSingleTurnBooking(undefined, keyboardResult.executionHandoff?.serviceType)}
                      disabled={ondcLoading}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 text-xs"
                    >
                      <Truck size={14} /> Confirm Doorstep Slot via ONDC Services
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ONDC SERVICES DOORSTEP TECHNICIAN BOOKING (1-TURN AI)              */}
      {/* ========================================================================= */}
      {activeTab === "ondc_doorstep" && (
        <div className="space-y-6">
          <Card className="border-t-4 border-t-emerald-500">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck size={18} className="text-emerald-400" /> ONDC Services API: On-Demand Doorstep Hardware Technician
                  </CardTitle>
                  <CardDescription>
                    Single-turn prompt technician reservation. Authenticated users bypass all form-filling; delivery address and GPS coordinates are injected automatically.
                  </CardDescription>
                </div>

                <Badge variant="emerald" className="gap-1 text-xs">
                  <Zap size={12} className="text-emerald-300" /> Single-Turn Booking Ready
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Single-Turn Prompt Input Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" /> Single-Turn AI Prompt: State the Issue & Preferred Time Slot
                </label>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      const text = "Fix my laptop battery wear tomorrow at 10 AM";
                      setOndcPrompt(text);
                      handleOndcSingleTurnBooking(text);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-all"
                  >
                    🔋 Battery repair tomorrow 10 AM
                  </button>
                  <button
                    onClick={() => {
                      const text = "Doorstep technician for keyboard ribbon replacement Sunday 2 PM";
                      setOndcPrompt(text);
                      handleOndcSingleTurnBooking(text);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-all"
                  >
                    ⌨️ Keyboard repair Sunday 2 PM
                  </button>
                  <button
                    onClick={() => {
                      const text = "Thermal repasting and fan cleaning tomorrow at 11 AM";
                      setOndcPrompt(text);
                      handleOndcSingleTurnBooking(text);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-all"
                  >
                    ❄️ Thermal repasting tomorrow 11 AM
                  </button>
                  <button
                    onClick={() => {
                      const text = "Emergency NVMe SSD replacement this weekend";
                      setOndcPrompt(text);
                      handleOndcSingleTurnBooking(text);
                    }}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-white/5 transition-all"
                  >
                    💽 Doorstep NVMe SSD this weekend
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    className="form-input flex-1 text-sm font-medium"
                    placeholder="e.g. Repair my laptop keyboard tomorrow at 10 AM, or replace battery this Saturday..."
                    value={ondcPrompt}
                    onChange={(e) => setOndcPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleOndcSingleTurnBooking()}
                  />
                  <Button
                    onClick={() => handleOndcSingleTurnBooking()}
                    disabled={ondcLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5"
                  >
                    <Truck size={14} />
                    {ondcLoading ? "Reserving..." : "Reserve Doorstep Technician"}
                  </Button>
                </div>
              </div>

              {/* ONDC Network Order Confirmation Dossier */}
              {ondcOrderResult ? (
                <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                        <Check size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">ONDC Doorstep Order Confirmed</div>
                        <div className="text-xs font-mono text-cyan-400">Order ID: {ondcOrderResult.ondcOrderId}</div>
                      </div>
                    </div>

                    <Badge variant="emerald" className="gap-1.5 text-xs self-start sm:self-auto">
                      <Clock size={12} /> {ondcOrderResult.bookingDetails?.scheduledSlot}
                    </Badge>
                  </div>

                  {/* 3-Column Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Service & Technician */}
                    <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                      <div className="text-slate-400 font-medium">Assigned Hardware Specialist:</div>
                      <div className="font-bold text-white text-sm">
                        {ondcOrderResult.bookingDetails?.assignedTechnician}
                      </div>
                      <div className="text-[11px] text-slate-300">
                        {ondcOrderResult.bookingDetails?.service}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-semibold pt-1">
                        Provider: {ondcOrderResult.bookingDetails?.provider?.split("on")[0]}
                      </div>
                    </div>

                    {/* Doorstep Destination (Auto-Pulled) */}
                    <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                      <div className="text-slate-400 font-medium flex items-center justify-between">
                        <span>Doorstep Delivery Address:</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">Auto-Injected</span>
                      </div>
                      <div className="font-semibold text-white">
                        {ondcOrderResult.bookingDetails?.doorstepDelivery?.recipient}
                      </div>
                      <div className="text-slate-300">
                        {ondcOrderResult.bookingDetails?.doorstepDelivery?.address}
                      </div>
                      <div className="text-[11px] text-cyan-400 font-mono">
                        PIN: {ondcOrderResult.bookingDetails?.doorstepDelivery?.pinCode} | GPS: {ondcOrderResult.bookingDetails?.doorstepDelivery?.gpsCoordinates}
                      </div>
                    </div>

                    {/* Network Pricing & Protocol */}
                    <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                      <div className="text-slate-400 font-medium">Network Pricing & Settlement:</div>
                      <div className="text-xl font-black text-emerald-400">
                        ${ondcOrderResult.bookingDetails?.pricing?.serviceFeeUSD?.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Protocol: <strong className="text-slate-300">{ondcOrderResult.bookingDetails?.pricing?.networkProtocol}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Status: <strong className="text-emerald-300">CONFIRMED (BAP &rarr; BPP Synced)</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Link & Cryptographic Passport Anchor */}
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-cyan-400 shrink-0" />
                      <span className="text-slate-300">
                        Circularity Passport Sealed:{" "}
                        <span className="font-mono text-cyan-300">{ondcOrderResult.bookingDetails?.passportHash?.slice(0, 16)}...</span>
                      </span>
                    </div>

                    <a
                      href={ondcOrderResult.bookingDetails?.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 text-xs"
                    >
                      <span>Live Doorstep Route Tracking</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-800/30 border border-white/5 text-center text-slate-500 text-xs">
                  Type a prompt above (e.g. &apos;Fix laptop battery tomorrow at 10 AM&apos;) or click one of the preset chips to execute a single-turn ONDC reservation.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
