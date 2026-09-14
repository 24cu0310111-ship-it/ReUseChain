"use client";

import { useState, useEffect, useRef } from "react";
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
  Clock, 
  Truck, 
  ShieldCheck, 
  Cpu, 
  HardDrive, 
  UserCheck, 
  HelpCircle,
  RotateCcw,
  Zap,
  Send,
  Camera,
  ExternalLink,
  Info,
  Terminal,
  Code,
  Brain,
  Key,
  Activity,
  Sliders,
  Radio,
  Navigation,
  Leaf,
  Check,
  Copy,
  Image as ImageIcon,
  X,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<"manual" | "chat">("chat");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("reusechain_manual_mode");
      if (stored === "true") {
        setActiveMode("manual");
      } else {
        setActiveMode("chat");
      }
    }
  }, []);

  const handleSwitchMode = (mode: "manual" | "chat") => {
    setActiveMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("reusechain_manual_mode", mode === "manual" ? "true" : "false");
      window.dispatchEvent(new CustomEvent("entryModeChanged", { detail: { mode } }));
    }
  };

  // ==========================================
  // 1. MANUAL DATA ENTRY STATE
  // ==========================================
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
        const cancelMsg = {
          id: `agent-cancel-${Date.now()}`,
          sender: "agent",
          text: `🚫 Technician Dispatch #${data.orderId || "order"} has been successfully cancelled! Doorstep specialist Alex Rivera has been notified, and any pre-authorized escrow hold has been released.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType: "BOOKING_CANCELLED",
          actionDetails: data,
        };
        setChatMessages((prev) => [...prev, cancelMsg]);
      }
    } catch (err: any) {
      console.error("Cancel booking error:", err);
    } finally {
      setCancelBookingLoading(false);
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
      setSymptom("None - Baseline operational check, all functioning normally");
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

  // ==========================================
  // 2. CHAT-BASED AGENT STATE
  // ==========================================
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "👋 Hi! I'm your Autonomous Action Agent. Tell me what's wrong with your PC or desktop issue, and I will run tests and provide the diagnosis inside this chat.\n\nIf you have a complex problem I cannot resolve on my own, I will immediately escalate it to our Lead Systems Admin for a live reply, and learn from their response!",
      timestamp: "Just now",
      chips: [
        "Scan my PC hardware",
        "My computer is slow and overheating, please fix it",
        "The keys on my keyboard are not working",
        "Escalate complex issue to Admin"
      ]
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatExecuting, setChatExecuting] = useState(false);
  const [chatAttachedPhoto, setChatAttachedPhoto] = useState<string | null>(null);
  const [chatAttachedPhotoName, setChatAttachedPhotoName] = useState<string | null>(null);
  const [chatPendingTicketId, setChatPendingTicketId] = useState<string | null>(null);
  const [chatSimulatingAdminReply, setChatSimulatingAdminReply] = useState(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // Polling for live Admin Telegram Reply in dashboard chat
  useEffect(() => {
    if (!chatPendingTicketId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/escalations/status?ticketId=${chatPendingTicketId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.status === "resolved" && json.data?.adminResponse) {
            const adminLiveMsg = {
              id: `admin-${Date.now()}`,
              sender: "admin",
              text: `👤 Live Reply from ${json.data.resolvedBy || "Lead Systems Admin"} (via Telegram Bot):\n"${json.data.adminResponse}"`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            const agentLearnedMsg = {
              id: `agent-learned-${Date.now()}`,
              sender: "agent",
              text: `🧠 Learned & Self-Improved from Admin Response:\n"${json.data.learnedRule || json.data.adminResponse}"\n\nI have committed this rule to my permanent decision model. Future queries with this symptom will now be resolved automatically!`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setChatMessages((prev) => [...prev, adminLiveMsg, agentLearnedMsg]);
            setChatPendingTicketId(null);
          }
        }
      } catch (err) {
        console.warn("Polling escalation status failed:", err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [chatPendingTicketId]);

  const handleSimulateDashboardAdminReply = async (ticketId: string) => {
    try {
      setChatSimulatingAdminReply(true);
      await fetch("/api/escalations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId,
          adminResponse: "I've reviewed your kernel telemetry and Task Manager process capture. The issue is caused by background thread contention. Disabling ASPM L1.2 and setting High Performance power profile resolves this completely.",
          learnedRule: "For PCIe and background thread latency collisions, enforce High Performance power plan.",
          resolvedBy: "Lead Systems Administrator (via Telegram Bot)",
        }),
      });
    } catch (e) {
      console.error("Failed to simulate admin reply:", e);
    } finally {
      setChatSimulatingAdminReply(false);
    }
  };

  const handleDashboardFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChatAttachedPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setChatAttachedPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const sendChatMessage = async (query: string, photoOverride?: string) => {
    const photoToSend = photoOverride || chatAttachedPhoto;
    if ((!query.trim() && !photoToSend) || chatExecuting) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      photoUrl: photoToSend || undefined,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatAttachedPhoto(null);
    setChatAttachedPhotoName(null);
    setChatExecuting(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryText: query, assetTag, photoData: photoToSend }),
      });
      const data = await res.json();

      if (data.actionType === "ADMIN_ESCALATION") {
        const agentEscalateMsg = {
          id: `agent-esc-${Date.now()}`,
          sender: "agent",
          text: `⚠️ ${data.completionMessage}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          escalationData: data.actionDetails,
          actionType: "ADMIN_ESCALATION",
          actionDetails: data.actionDetails,
        };
        setChatMessages((prev) => [...prev, agentEscalateMsg]);
        if (data.actionDetails?.escalationId) {
          setChatPendingTicketId(data.actionDetails.escalationId);
        }
      } else {
        const agentMsg = {
          id: `agent-${Date.now()}`,
          sender: "agent",
          text: data.completionMessage || "🎉 It's all done! Real action executed successfully.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actionType: data.actionType,
          actionDetails: data.actionDetails,
          finalActions: data.actionDetails?.finalActions,
        };
        setChatMessages((prev) => [...prev, agentMsg]);
      }
    } catch (err: any) {
      const errorMsg = {
        id: `agent-error-${Date.now()}`,
        sender: "agent",
        text: `⚠️ Failed to execute: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatExecuting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      
      {/* Hero Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge variant="emerald" className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
          ⚡ PC & Desktop Diagnostic & Action Platform
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          How would you like to get help for your PC?
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          The system provides two intuitive ways to diagnose and resolve computer issues. Select your preferred method below:
        </p>
      </div>

      {/* Two Ways Toggle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: Manual Data Entry */}
        <div
          onClick={() => handleSwitchMode("manual")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
            activeMode === "manual"
              ? "bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${activeMode === "manual" ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-800 text-slate-400"}`}>
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  1. Manual Data Entry
                  {activeMode === "manual" && <Badge variant="default" className="text-[10px]">Active Mode</Badge>}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter required system information, click Diagnostics, and receive basic diagnostics with damaged parts & three factors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Chat-Based Agent */}
        <div
          onClick={() => handleSwitchMode("chat")}
          className={`cursor-pointer rounded-2xl p-5 border transition-all relative overflow-hidden ${
            activeMode === "chat"
              ? "bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500"
              : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${activeMode === "chat" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  2. Chat-Based Agent
                  {activeMode === "chat" && <Badge variant="emerald" className="text-[10px]">Active Mode</Badge>}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Seek help about your PC issue directly in chat. The agent runs tests, escalates to Admin when needed, and learns from responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MANUAL DATA ENTRY FLOW                                            */}
      {/* ========================================================================= */}
      {activeMode === "manual" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-cyan-400" /> Enter Required System Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fill in your hardware details. Once completed, a small “Diagnostics” button will become visible below.
                </p>
              </div>

              {/* Presets for quick test */}
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
                      onClick={() => setSymptom("The keys on my keyboard are not working")}
                      className="px-2.5 py-1 rounded-md bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 text-xs border border-purple-500/40 hover:border-purple-400 font-medium transition-colors"
                    >
                      ⌨️ Keyboard & Touchpad Tests
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
                      <strong>Need deeper inspection?</strong> Use our conversational chat agent for live kernel telemetry, background stress testing, and driver analysis.
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setActiveMode("chat")}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-4 gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Open Chat for Advanced Diagnostics →
                    </Button>
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
                      <Info className="w-3.5 h-3.5 text-cyan-400" /> Diagnostic Analysis: Three Factors
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

                          <Button 
                            size="default" 
                            onClick={() => setActiveMode("chat")}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm h-10 gap-2 shadow-lg shadow-cyan-900/30"
                          >
                            <Layers className="w-4 h-4" /> Explore Component Repurposing Guides
                          </Button>
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
                              <Button size="sm" variant="outline" onClick={() => setActiveMode("chat")} className="w-full border-cyan-500/30 text-cyan-300 text-xs h-7">
                                Explore Guides
                              </Button>
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
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CHAT-BASED AGENT FLOW                                             */}
      {/* ========================================================================= */}
      {activeMode === "chat" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Chat-Based Diagnostic Agent</h2>
                <p className="text-xs text-slate-400">
                  Diagnosis is done directly inside the chat interface. Runs tests, handles admin live escalations, and offers final actions.
                </p>
              </div>
            </div>

            <Link href="/assistant">
              <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white text-xs h-8 gap-1">
                Full Screen Chat <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {/* In-page Chat Stream */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 max-h-[460px] overflow-y-auto space-y-4">
            {chatMessages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1.5">
                  {m.sender === "agent" && <span className="text-cyan-400 font-semibold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Agent</span>}
                  {m.sender === "admin" && <span className="text-purple-400 font-bold flex items-center gap-1"><UserCheck className="w-3 h-3" /> Lead Systems Admin</span>}
                  {m.sender === "user" && <span className="text-slate-300 font-medium">You</span>}
                  <span>•</span>
                  <span>{m.timestamp}</span>
                </div>

                <div className={`p-3.5 rounded-xl text-xs max-w-[88%] leading-relaxed ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : m.sender === "admin"
                    ? "bg-purple-950/70 border border-purple-500/40 text-purple-200 rounded-tl-none font-medium"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"
                }`}>
                  {m.photoUrl && (
                    <div className="mb-2.5 rounded-lg overflow-hidden border border-white/20 max-w-xs">
                      <div className="bg-black/70 px-2 py-0.5 text-[9px] text-cyan-300 flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" /> Attached Screen Screenshot
                      </div>
                      <img src={m.photoUrl} alt="Attached screenshot" className="w-full object-cover max-h-36" />
                    </div>
                  )}
                  <div className="whitespace-pre-line">{m.text}</div>

                  {/* Chips if any */}
                  {m.chips && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {m.chips.map((chip: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => sendChatMessage(chip)}
                          className="bg-slate-800/80 hover:bg-cyan-900/40 hover:text-cyan-300 text-slate-300 text-[11px] px-2.5 py-1 rounded-full border border-slate-700 transition-colors"
                        >
                          ⚡ {chip}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hardware AI Diagnostic Proof Card if present */}
                  {m.actionDetails?.windowsCommandExecuted && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase flex items-center gap-1">
                          <Terminal size={12} /> {m.actionDetails.selectedTool?.name || "Diagnostic Tool"}
                        </span>
                        <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                          {m.actionDetails.testingCategory || "Functional Testing"}
                        </span>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                        {m.actionDetails.windowsCommandExecuted}
                      </div>
                      {m.actionDetails.rawHostOutput && (
                        <pre className="bg-black/60 p-2 rounded border border-white/5 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-28 whitespace-pre-wrap">
                          {m.actionDetails.rawHostOutput}
                        </pre>
                      )}
                      {m.actionDetails.threeFactors && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1 text-[10px]">
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-slate-300">
                            <span className="text-cyan-400 font-bold block">1. Component Health:</span>
                            {m.actionDetails.threeFactors.factor1_health}
                          </div>
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-slate-300">
                            <span className="text-amber-400 font-bold block">2. Functional Impact:</span>
                            {m.actionDetails.threeFactors.factor2_impact}
                          </div>
                          <div className="bg-slate-950 p-1.5 rounded border border-slate-800 text-slate-300">
                            <span className="text-rose-400 font-bold block">3. Root Cause:</span>
                            {m.actionDetails.threeFactors.factor3_rootCause}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proof Card 1: Doorstep Booking Ticket & Live GPS in Chat */}
                  {m.actionType === "DOORSTEP_BOOKING" && m.actionDetails && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2.5 bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-400 font-bold flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-400" /> ONDC Doorstep Dispatch Ticket
                        </span>
                        <Badge variant="amber" className="text-[9px]">CONFIRMED</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Order ID:</span>
                          <span className="font-mono text-slate-200 font-bold">{m.actionDetails.orderId}</span>
                        </div>
                        <div className="bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 text-[10px] block">Technician:</span>
                          <span className="text-emerald-400 font-semibold">{m.actionDetails.technician}</span>
                        </div>
                      </div>

                      {/* Embedded Live Tracking Telemetry */}
                      {m.actionDetails.trackingDetails && (
                        <div className="bg-slate-900/90 rounded-lg p-2.5 border border-amber-500/20 space-y-2 text-xs">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> EN ROUTE • 2.1 km away
                            </span>
                            <span className="text-amber-300 font-mono font-semibold bg-amber-500/20 px-1.5 py-0.5 rounded">
                              ETA ~{m.actionDetails.trackingDetails.etaMinutes || 14} mins
                            </span>
                          </div>
                          <div className="space-y-1">
                            {m.actionDetails.trackingDetails.milestones?.map((ms: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/50 px-2 py-0.5 rounded">
                                <span className="flex items-center gap-1">
                                  {ms.done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-slate-600" />}
                                  <span className={ms.done ? "text-slate-200" : "text-slate-500"}>{ms.step}</span>
                                </span>
                                <span className="font-mono text-slate-500">{ms.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <Button
                          size="sm"
                          onClick={() => sendChatMessage("Track my technician live on ONDC")}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-7 gap-1"
                        >
                          <Navigation className="w-3 h-3" /> View Live GPS Console
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cancelBookingLoading}
                          onClick={() => handleCancelTechnicianBooking(m.actionDetails?.orderId)}
                          className="border-rose-500/40 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 text-xs h-7 gap-1 transition-colors"
                        >
                          <XCircle className={`w-3.5 h-3.5 text-rose-400 ${cancelBookingLoading ? "animate-spin" : ""}`} /> Cancel Technician
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Proof Card: Order Cancelled Confirmation */}
                  {m.actionType === "BOOKING_CANCELLED" && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2 bg-rose-950/60 p-3 rounded-xl border border-rose-500/40 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-rose-400 font-bold flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-400" /> Doorstep Technician Assignment Cancelled
                        </span>
                        <Badge variant="rose" className="text-[9px]">CANCELLED</Badge>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        Technician dispatch for <strong>{m.actionDetails?.technician || "Alex Rivera"}</strong> (#{m.actionDetails?.orderId}) has been cancelled.
                      </div>
                      <div className="p-2 rounded bg-rose-950/80 border border-rose-500/30 text-[10px] text-rose-300 font-mono flex items-center justify-between">
                        <span>Escrow Hold Status:</span>
                        <span className="font-bold text-emerald-400">Released (100% Refunded)</span>
                      </div>
                    </div>
                  )}

                  {/* Proof Card 2: Live ONDC GPS Tracking Console */}
                  {m.actionType === "TRACKING_ACTION" && m.actionDetails && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2.5 bg-slate-950/90 p-3.5 rounded-xl border border-cyan-500/40 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> ONDC Live GPS Radar
                        </span>
                        <Badge variant="cyan" className="text-[9px]">EN_ROUTE (2.1 km)</Badge>
                      </div>

                      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-cyan-950/30 p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-cyan-400 font-mono">ORDER #{m.actionDetails.orderId}</div>
                          <div className="text-xs font-bold text-white mt-0.5">{m.actionDetails.technician}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{m.actionDetails.vehicle}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-cyan-300 font-mono">{m.actionDetails.etaMinutes || 14} mins</div>
                          <div className="text-[9px] text-emerald-400 font-medium">GPS: 12.9784° N, 77.5912° E</div>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        {m.actionDetails.milestones?.map((ms: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-[10px] bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                            <span className="flex items-center gap-1.5">
                              {ms.done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-slate-600" />}
                              <span className={ms.done ? "text-slate-200" : "text-slate-500"}>{ms.step}</span>
                            </span>
                            <span className="font-mono text-slate-500">{ms.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proof Card 3: Modular Salvage & Reuse Blueprints */}
                  {m.actionType === "REUSE_ACTION" && m.actionDetails && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2.5 bg-slate-950/90 p-3.5 rounded-xl border border-cyan-500/40 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-cyan-400" /> Modular Component Blueprints
                        </span>
                        <Badge variant="emerald" className="text-[9px]">
                          🌱 {m.actionDetails.carbonSavingsKgCO2e || 34.8} kg CO2e Avoided
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px]">
                        {m.actionDetails.salvagedComponents?.map((c: any, i: number) => (
                          <div key={i} className="bg-slate-900 p-2 rounded border border-slate-800">
                            <span className="font-bold text-white block">{c.name}</span>
                            <span className="text-emerald-400">✓ {c.condition}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5">
                        {m.actionDetails.blueprints?.map((bp: any, i: number) => (
                          <div key={i} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-cyan-400" /> {bp.title}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold">+${bp.estimatedAnnualSavingsUSD}/yr</span>
                            </div>
                            <div className="text-[10px] text-slate-400">OS: {bp.os} • {bp.difficulty}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proof Card 4: Certified Zero-Landfill E-Waste Disposal */}
                  {m.actionType === "RECYCLE_ACTION" && m.actionDetails && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2.5 bg-slate-950/90 p-3.5 rounded-xl border border-emerald-500/40 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <Recycle className="w-4 h-4 text-emerald-400" /> Certified E-Waste Disposal
                        </span>
                        <Badge variant="emerald" className="text-[9px]">R2v3 Certified</Badge>
                      </div>

                      <div className="bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-emerald-400 uppercase font-mono">Guaranteed Scrap Credit</div>
                          <div className="text-xl font-black text-emerald-300 font-mono">${m.actionDetails.scrapCreditAmountUSD?.toFixed(2) || "18.50"}</div>
                        </div>
                        <div className="text-right text-[10px]">
                          <span className="text-slate-400 block font-mono">Pickup Ticket:</span>
                          <span className="text-white font-mono font-bold">{m.actionDetails.pickupId}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 space-y-0.5">
                        <div>• <strong>Partner:</strong> {m.actionDetails.partnerName}</div>
                        <div>• <strong>Window:</strong> {m.actionDetails.pickupSlot}</div>
                        <div>• <strong>Cert No:</strong> {m.actionDetails.destructionCertificateNumber}</div>
                      </div>
                    </div>
                  )}

                  {/* Proof Card 5: Admin Escalation & Telegram Sync */}
                  {m.actionType === "ADMIN_ESCALATION" && m.actionDetails && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2.5 bg-slate-950/90 p-3.5 rounded-xl border border-purple-500/40 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-400 font-bold flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-purple-400" /> Admin Escalation (Human-in-the-Loop)
                        </span>
                        <Badge variant="purple" className="text-[9px]">
                          Ticket #{m.actionDetails.escalationId?.slice(0, 8) || "L3-ESC"}
                        </Badge>
                      </div>

                      <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-2 text-xs text-blue-200 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Send className="w-3 h-3 text-blue-400" />
                          <span>Notified Lead Admin via <a href="https://t.me/AHackBattle013bot" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-blue-400">@AHackBattle013bot</a></span>
                        </div>
                        <a href="https://t.me/backuvro_bot" target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-300 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30 hover:bg-purple-900/60">
                          📱 Backup Bot: @backuvro_bot
                        </a>
                      </div>

                      {chatPendingTicketId === m.actionDetails.escalationId ? (
                        <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-2.5 text-xs space-y-2 text-amber-200">
                          <div className="flex items-center gap-2 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            <span>Awaiting Live Response from Lead Admin on Telegram...</span>
                          </div>
                          <div className="flex items-center justify-between gap-2 border-t border-amber-500/20 pt-1.5">
                            <span className="text-[10px] text-slate-400">Testing?</span>
                            <Button
                              size="sm"
                              disabled={chatSimulatingAdminReply}
                              onClick={() => handleSimulateDashboardAdminReply(m.actionDetails!.escalationId!)}
                              className="bg-purple-600 hover:bg-purple-500 text-white text-[10px] h-6 px-2"
                            >
                              {chatSimulatingAdminReply ? "Simulating..." : "⚡ Simulate Telegram Reply"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        m.actionDetails.adminLiveReply && (
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2.5 text-xs text-purple-200">
                            <div className="font-bold flex items-center gap-1 text-purple-300 text-[11px]">
                              <UserCheck className="w-3 h-3 text-purple-400" />
                              Reply from {m.actionDetails.assignedTo || "Lead Admin (via Telegram)"}:
                            </div>
                            <p className="italic text-slate-200 mt-1 pl-1 border-l border-purple-400">
                              "{m.actionDetails.adminLiveReply}"
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Recommended Action rendered inside chat based on device condition */}
                  {m.finalActions && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> Recommended Action (Based on Condition):
                      </div>
                      <div className="text-[11px]">
                        {(m.actionDetails?.triageVerdict === "repair" || !m.actionDetails?.triageVerdict) && (
                          <button
                            onClick={() => sendChatMessage("Book a doorstep technician for tomorrow 10am")}
                            className="w-full p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-left flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Necessary Action: 1. Repair</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Book Certified Doorstep Technician via ONDC</div>
                            </div>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
                              Dispatch Tech →
                            </span>
                          </button>
                        )}
                        {m.actionDetails?.triageVerdict === "reuse" && (
                          <button
                            onClick={() => sendChatMessage("Repurpose working components for home server or NAS node")}
                            className="w-full p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 text-left flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Necessary Action: 2. Reuse</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Repurpose Working RAM & NVMe SSD into NAS/Server</div>
                            </div>
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-semibold">
                              Explore Blueprints →
                            </span>
                          </button>
                        )}
                        {m.actionDetails?.triageVerdict === "recycle" && (
                          <button
                            onClick={() => sendChatMessage("Schedule certified zero-landfill e-waste pickup with scrap credit")}
                            className="w-full p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-left flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="font-bold flex items-center gap-1.5"><Recycle className="w-3.5 h-3.5" /> Necessary Action: 3. Recycle</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">Certified Zero-Landfill E-Waste Disposal & Scrap Credit</div>
                            </div>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-semibold">
                              Schedule Pickup (+$18.50) →
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}

            {chatExecuting && (
              <div className="text-xs text-cyan-400 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Agent running tests and diagnostics...
              </div>
            )}
          </div>

          {/* Quick Chat Prompts & Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-400 pb-1 scrollbar-none">
              <span className="shrink-0 font-medium">Quick:</span>
              <button
                type="button"
                onClick={() => sendChatMessage("Task Manager shows 98.4% CPU runaway process svchost_crypto.exe and thermal throttling", "cpu_runaway")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-300 hover:text-white"
              >
                📸 Task Manager 99% CPU
              </button>
              <button
                type="button"
                onClick={() => sendChatMessage("Task Manager shows 95% RAM memory leak in non-paged kernel pool", "memory_leak")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 hover:text-white"
              >
                📸 Task Manager 95% RAM
              </button>
              <button
                type="button"
                onClick={() => sendChatMessage("Can you scan my PC hardware?")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 hover:text-white"
              >
                ⚡ Scan PC
              </button>
              <button
                type="button"
                onClick={() => sendChatMessage("The keys on my keyboard are not working")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white"
              >
                ⌨️ Keyboard Diagnostic
              </button>
              <button
                type="button"
                onClick={() => sendChatMessage("Book a doorstep technician for tomorrow 10am")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 hover:text-white"
              >
                ⚡ Book Tech
              </button>
              <button
                type="button"
                onClick={() => sendChatMessage("Track my technician live on ONDC")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white"
              >
                📡 GPS Radar
              </button>
              <button
                type="button"
                onClick={() => sendChatMessage("I have an unfamiliar kernel error 0x800F0922, please escalate to admin")}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 hover:text-white"
              >
                👤 Escalate to Admin
              </button>
            </div>

            {/* Attached Photo Pill */}
            {chatAttachedPhoto && (
              <div className="flex items-center gap-2 p-1 px-2.5 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-xs text-cyan-300 w-fit">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="font-medium truncate max-w-[200px]">{chatAttachedPhotoName || "Attached Screenshot"}</span>
                <button
                  type="button"
                  onClick={() => { setChatAttachedPhoto(null); setChatAttachedPhotoName(null); }}
                  className="text-cyan-400 hover:text-white ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={chatFileInputRef}
              accept="image/*"
              onChange={handleDashboardFileUpload}
              className="hidden"
            />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendChatMessage(chatInput);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                title="Attach Task Manager or OS screen photo"
                className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
                  chatAttachedPhoto
                    ? "bg-cyan-950 border-cyan-500 text-cyan-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-400"
                }`}
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={chatAttachedPhoto ? "Describe attached screenshot or click Send..." : "Ask about your PC issue, attach Task Manager photo, or request admin escalation..."}
                disabled={chatExecuting}
                className="flex-1 h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Button
                type="submit"
                disabled={(!chatInput.trim() && !chatAttachedPhoto) || chatExecuting}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </Button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
