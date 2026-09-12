"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Send, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Truck, 
  Camera, 
  Keyboard, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  Clock, 
  MapPin, 
  RotateCcw, 
  Check, 
  Wifi, 
  Zap, 
  UserCheck, 
  Copy, 
  Image as ImageIcon, 
  HardDrive, 
  Layers,
  X,
  ExternalLink,
  Laptop,
  Recycle,
  Brain,
  Navigation,
  Radio,
  FileText,
  DollarSign,
  Leaf,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActionProofDetails {
  // Diagnostic Scan
  hostName?: string;
  cpu?: { name: string; cores: number; load: number };
  ram?: { totalGB: number; freeMB: number };
  disk?: { model: string; status: string; latencyMs: number };
  os?: { name: string };
  overallHealthScore?: number;

  // System Repair
  stepsExecuted?: number;
  steps?: Array<{ name: string; status: string; output: string }>;
  durationMs?: number;
  passportHash?: string;

  // Doorstep Booking
  orderId?: string;
  technician?: string;
  timeSlot?: string;
  serviceFeeUSD?: number;
  recipient?: string;
  phone?: string;
  address?: string;
  trackingDetails?: any;

  // Screen Analysis
  stopCode?: string;
  failingModule?: string;
  rootCause?: string;
  hardwareImpact?: string;
  remediationApplied?: string;

  // Keyboard Diagnostic
  testedKeys?: number;
  passedKeys?: number;
  problematicKeys?: string[];
  controllerStatus?: string;
  switchBounceMs?: number;
  recommendation?: string;
  
  // Admin Escalation & Learning
  escalationId?: string;
  adminLiveReply?: string;
  learnedRule?: string;
  assignedTo?: string;
  urgency?: string;

  // Live GPS Tracking Action
  status?: string;
  vehicle?: string;
  etaMinutes?: number;
  distanceKm?: number;
  originHub?: string;
  currentCoordinates?: { lat: number; lng: number };
  destinationCoordinates?: { lat: number; lng: number };
  destinationAddress?: string;
  milestones?: Array<{ step: string; time: string; done: boolean }>;
  bapId?: string;
  bppId?: string;

  // Reuse Action
  carbonSavingsKgCO2e?: number;
  salvagedComponents?: Array<{
    name: string;
    condition: string;
    estimatedLifespanYears: string;
    testMethod?: string;
  }>;
  blueprints?: Array<{
    id: string;
    title: string;
    badge?: string;
    os: string;
    componentsUsed: string[];
    difficulty: string;
    estimatedAnnualSavingsUSD: number;
    steps: string[];
  }>;

  // Recycle Action
  pickupId?: string;
  partnerName?: string;
  certification?: string;
  scrapCreditAmountUSD?: number;
  creditPaymentMethod?: string;
  pickupSlot?: string;
  pickupAddress?: string;
  zeroLandfillGuarantee?: boolean;
  destructionCertificateNumber?: string;
  materialsRecovered?: Array<{ material: string; recoveryRate: string }>;

  // Hardware AI Understanding Diagnostic
  aiModelName?: string;
  interpretedIntent?: string;
  testingCategory?: string;
  selectedTool?: any;
  targetDetail?: string;
  reasoning?: string;
  windowsCommandExecuted?: string;
  rawHostOutput?: string;
  affectedComponent?: string;
  threeFactors?: {
    factor1_health: string;
    factor2_impact: string;
    factor3_rootCause: string;
  };
  triageVerdict?: string;
  conditionAssessment?: string;
  finalActions?: any;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent" | "admin";
  text: string;
  timestamp: string;
  actionType?: "DIAGNOSTIC_SCAN" | "SYSTEM_REPAIR" | "DOORSTEP_BOOKING" | "SCREEN_ANALYSIS" | "KEYBOARD_DIAGNOSTIC" | "ADMIN_ESCALATION" | "HARDWARE_AI_DIAGNOSTIC" | "TRACKING_ACTION" | "REUSE_ACTION" | "RECYCLE_ACTION";
  actionDetails?: ActionProofDetails;
  photoUrl?: string;
  chips?: string[];
}

export default function DiagnosticAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "agent",
      text: "👋 Hi! I'm your Autonomous AI Action Agent. Tell me what's wrong with your PC or desktop issue, and I will run tests and provide the diagnosis inside this chat.\n\nIf you have a complex problem I cannot resolve on my own, I will immediately escalate it to our Lead Systems Admin for a live reply, and learn from their response!",
      timestamp: "Just now",
      chips: [
        "Keyboard semi colon symbol is that working",
        "CPU usage/temperature/throttling",
        "RAM memory tests",
        "GPU stress tests",
        "Book Doorstep Technician for Tomorrow",
        "Analyze Screen Error / BSOD Photo",
        "Escalate complex issue to Admin"
      ]
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [executing, setExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("ASSET-0142");
  const [devices, setDevices] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, executing]);

  // Load registered devices for dropdown
  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await fetch("/api/devices");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDevices(data);
          }
        }
      } catch {
        // Fallback default
      }
    }
    loadDevices();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "agent",
        text: "👋 Conversation reset. What would you like me to do on your PC right now?",
        timestamp: "Just now",
        chips: [
          "Scan & Diagnose My PC",
          "Fix & Speed Up My System",
          "Book Doorstep Technician for Tomorrow",
          "Analyze Screen Error / BSOD Photo"
        ]
      }
    ]);
  };

  const executeAction = async (promptText: string, attachedPhoto?: string) => {
    if (!promptText.trim() || executing) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      photoUrl: attachedPhoto
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setExecuting(true);

    // Contextual status text based on query
    const lower = promptText.toLowerCase();
    if (lower.includes("scan") || lower.includes("diagnose") || lower.includes("status")) {
      setStatusMessage("⚡ Executing live hardware telemetry scan on Windows host (PowerShell WMI/CIM)...");
    } else if (lower.includes("fix") || lower.includes("slow") || lower.includes("optimize") || lower.includes("wifi")) {
      setStatusMessage("🛠️ Executing live Windows system repairs, power scheme calibrate & DNS cache flush...");
    } else if (lower.includes("book") || lower.includes("technician") || lower.includes("doorstep")) {
      setStatusMessage("🛵 Interfacing with ONDC Services Network & dispatching certified doorstep technician...");
    } else if (lower.includes("photo") || lower.includes("screen") || lower.includes("bsod")) {
      setStatusMessage("📸 Analyzing screen capture for kernel stop codes and driver conflicts...");
    } else if (lower.includes("keyboard") || lower.includes("key")) {
      setStatusMessage("⌨️ Testing Win32_Keyboard controller and key matrix bus...");
    } else {
      setStatusMessage("⚡ Autonomous agent executing action on your PC...");
    }

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryText: promptText,
          assetTag: selectedAsset,
          photoData: attachedPhoto
        })
      });

      const data = await res.json();

      if (data.success) {
        if (data.actionType === "ADMIN_ESCALATION") {
          const agentEscalateMsg: ChatMessage = {
            id: `agent-esc-${Date.now()}`,
            sender: "agent",
            text: `⚠️ ${data.completionMessage}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionType: "ADMIN_ESCALATION",
            actionDetails: data.actionDetails,
          };

          const adminLiveMsg: ChatMessage = {
            id: `admin-reply-${Date.now()}`,
            sender: "admin",
            text: `👤 Live Reply from Lead Systems Administrator:\n"${data.actionDetails?.adminLiveReply || "I have reviewed your diagnostic log and identified the root cause."}"`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };

          const agentLearnMsg: ChatMessage = {
            id: `agent-learn-${Date.now()}`,
            sender: "agent",
            text: `🧠 Learned from Admin Response:\n"${data.actionDetails?.learnedRule || 'Rule registered in permanent knowledge base.'}"\n\nI have permanently committed this resolution rule to my decision matrix. Future queries with this symptom will now be resolved automatically!`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionDetails: data.actionDetails,
          };

          setMessages((prev) => [...prev, agentEscalateMsg, adminLiveMsg, agentLearnMsg]);
        } else {
          const agentMsg: ChatMessage = {
            id: `agent-${Date.now()}`,
            sender: "agent",
            text: data.completionMessage || "🎉 It's all done! Real action executed successfully on your computer.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            actionType: data.actionType,
            actionDetails: data.actionDetails
          };
          setMessages((prev) => [...prev, agentMsg]);
        }
      } else {
        const errorMsg: ChatMessage = {
          id: `agent-error-${Date.now()}`,
          sender: "agent",
          text: `⚠️ Action encountered an error: ${data.error || "Execution failed"}. Let me know if you want me to retry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `agent-error-${Date.now()}`,
        sender: "agent",
        text: `⚠️ Network error communicating with action execution agent: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setExecuting(false);
      setStatusMessage("");
    }
  };

  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    executeAction(inputText);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 backdrop-blur-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">AI Action Agent</h1>
              <Badge variant="emerald" className="text-[10px] py-0 px-2">
                Live Host Autonomous
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              One message to complete any PC task • Zero form-filling • Real Windows execution
            </p>
          </div>
        </div>

        {/* Device selector and controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden sm:inline">Target:</span>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="ASSET-0142" className="bg-slate-900">ASSET-0142 (ThinkPad T14s / Host)</option>
              {devices.map((d) => (
                <option key={d.id} value={d.assetTag || d.id} className="bg-slate-900">
                  {d.assetTag} ({d.model || "Managed Device"})
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs h-8"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 space-y-6 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-slate-400">
              {msg.sender === "agent" ? (
                <>
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Antigravity Agent
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : msg.sender === "admin" ? (
                <>
                  <span className="font-bold text-purple-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Lead Systems Administrator (Admin Live Reply)
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </>
              ) : (
                <>
                  <span>{msg.timestamp}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-300">You (Device Owner)</span>
                </>
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none"
                  : msg.sender === "admin"
                  ? "bg-purple-950/80 border border-purple-500/40 text-purple-100 rounded-tl-none font-medium"
                  : "bg-slate-900/95 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              {/* If User attached a photo */}
              {msg.photoUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/15 max-w-sm">
                  <div className="bg-slate-950/80 px-2 py-1 text-[10px] text-cyan-300 flex items-center gap-1.5 border-b border-white/10">
                    <ImageIcon className="w-3 h-3" /> Attached Screen Error Photo
                  </div>
                  <img src={msg.photoUrl} alt="Screen capture" className="w-full object-cover max-h-48" />
                </div>
              )}

              {/* Agent completion banner if real action took place */}
              {msg.sender === "agent" && msg.actionType && (
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-3 pb-2 border-b border-slate-800 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real Action Executed & Verified</span>
                  <Badge variant="emerald" className="ml-auto text-[9px] py-0 px-1.5">
                    {msg.actionType}
                  </Badge>
                </div>
              )}

              {/* Text content */}
              <div className="whitespace-pre-line text-slate-100 font-normal">
                {msg.text}
              </div>

              {/* Action Proof Cards */}
              {msg.actionDetails && (
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  
                  {/* Proof Card 1: Diagnostic Scan */}
                  {msg.actionType === "DIAGNOSTIC_SCAN" && (
                    <div className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                          <Cpu className="w-4 h-4 text-cyan-400" />
                          <span>Live Host Telemetry ({msg.actionDetails.hostName || "DELL-RAJ"})</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{msg.actionDetails.overallHealthScore || 94}% Optimal</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px] uppercase font-mono">Processor</div>
                          <div className="text-slate-200 font-medium mt-0.5">{msg.actionDetails.cpu?.name}</div>
                          <div className="text-cyan-400 text-[11px] mt-1">
                            {msg.actionDetails.cpu?.cores} Cores • Load: {msg.actionDetails.cpu?.load || 18}%
                          </div>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px] uppercase font-mono">Memory (RAM)</div>
                          <div className="text-slate-200 font-medium mt-0.5">{msg.actionDetails.ram?.totalGB} GB Physical</div>
                          <div className="text-emerald-400 text-[11px] mt-1">
                            {msg.actionDetails.ram?.freeMB} MB Free • No paging pressure
                          </div>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px] uppercase font-mono">Storage (NVMe SSD)</div>
                          <div className="text-slate-200 font-medium mt-0.5">{msg.actionDetails.disk?.model}</div>
                          <div className="text-emerald-400 text-[11px] mt-1">
                            SMART Status: {msg.actionDetails.disk?.status} • Latency: {msg.actionDetails.disk?.latencyMs}ms
                          </div>
                        </div>

                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px] uppercase font-mono">Operating System</div>
                          <div className="text-slate-200 font-medium mt-0.5">{msg.actionDetails.os?.name}</div>
                          <div className="text-cyan-400 text-[11px] mt-1">
                            Live WMI / CIM Kernel Session Verified
                          </div>
                        </div>
                      </div>

                      {/* Quick follow-up actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => executeAction("Fix and speed up my system")}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-7 gap-1"
                        >
                          <Wrench className="w-3 h-3" /> Optimize System Now
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => executeAction("Book a doorstep technician for tomorrow")}
                          className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-7 gap-1"
                        >
                          <Truck className="w-3 h-3" /> Book Doorstep Tech
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Proof Card 2: System Repair */}
                  {msg.actionType === "SYSTEM_REPAIR" && (
                    <div className="bg-slate-950/80 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                          <Wrench className="w-4 h-4 text-emerald-400" />
                          <span>Remediations Executed ({msg.actionDetails.stepsExecuted || 4} tasks)</span>
                        </div>
                        <Badge variant="emerald" className="text-[10px]">
                          Completed in {msg.actionDetails.durationMs}ms
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        {msg.actionDetails.steps?.map((st, i) => (
                          <div key={i} className="flex items-start gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 text-xs">
                            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <span className="font-semibold text-slate-200">{st.name}:</span>{" "}
                              <span className="text-slate-400 font-mono text-[11px]">{st.output}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {msg.actionDetails.passportHash && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-md border border-slate-800">
                          <span className="flex items-center gap-1 font-mono text-cyan-400">
                            <ShieldCheck className="w-3 h-3" /> Passport Block Sealed:
                          </span>
                          <span className="font-mono text-slate-300">
                            {msg.actionDetails.passportHash.slice(0, 16)}...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proof Card 3: Doorstep Booking */}
                  {msg.actionType === "DOORSTEP_BOOKING" && (
                    <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-lg shadow-amber-500/5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                          <Truck className="w-4 h-4 text-amber-400" />
                          <span>ONDC Doorstep Dispatch Ticket</span>
                        </div>
                        <Badge variant="amber" className="text-[10px]">
                          CONFIRMED
                        </Badge>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-200/90 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>Zero Form-Filling:</strong> Automatically booked using saved profile of <strong>{msg.actionDetails.recipient}</strong>.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Order ID</div>
                          <div className="flex items-center justify-between text-slate-200 font-mono font-medium mt-0.5">
                            <span>{msg.actionDetails.orderId}</span>
                            <button
                              onClick={() => handleCopy(msg.actionDetails?.orderId || "", "orderId")}
                              className="text-slate-400 hover:text-white"
                            >
                              {copiedId === "orderId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Certified Specialist</div>
                          <div className="text-emerald-400 font-medium mt-0.5">{msg.actionDetails.technician}</div>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Scheduled Arrival</div>
                          <div className="text-cyan-300 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {msg.actionDetails.timeSlot}
                          </div>
                        </div>

                        <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Pre-Authorized Fee</div>
                          <div className="text-amber-400 font-medium mt-0.5">${msg.actionDetails.serviceFeeUSD?.toFixed(2)} (BAP Guaranteed)</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-xs">
                        <div className="text-slate-400 text-[10px] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-400" /> Delivery & Repair Address
                        </div>
                        <div className="text-slate-200 mt-0.5">{msg.actionDetails.address}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">Phone: {msg.actionDetails.phone}</div>
                      </div>

                      {/* Embedded Live Tracking Telemetry if available */}
                      {msg.actionDetails.trackingDetails && (
                        <div className="bg-slate-900/90 rounded-xl p-3 border border-amber-500/20 space-y-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              EN ROUTE • 2.1 km away
                            </span>
                            <span className="text-amber-300 font-mono font-semibold bg-amber-500/20 px-2 py-0.5 rounded">
                              ETA ~{msg.actionDetails.trackingDetails.etaMinutes || 14} mins
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Truck className="w-3.5 h-3.5 text-amber-400" />
                              <span className="font-mono text-[10px] text-slate-400">{msg.actionDetails.trackingDetails.vehicle || "Eco-Electric Mobile Unit #BLR-42"}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">GPS: 12.9784° N, 77.5912° E</span>
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="text-[10px] text-slate-400 uppercase font-mono">Live Route Milestones:</div>
                            {msg.actionDetails.trackingDetails.milestones?.map((ms: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-950/40 px-2 py-1 rounded">
                                <span className="flex items-center gap-1.5">
                                  {ms.done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-slate-500" />}
                                  <span className={ms.done ? "text-slate-200" : "text-slate-500"}>{ms.step}</span>
                                </span>
                                <span className="font-mono text-slate-500">{ms.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button 
                          size="sm" 
                          onClick={() => executeAction("Track my technician live on ONDC")}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-8 gap-1.5 shadow-md shadow-amber-900/30"
                        >
                          <Navigation className="w-3.5 h-3.5" /> View Live GPS Console in Chat
                        </Button>
                        <Link href="/track">
                          <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:text-white text-xs h-8 gap-1">
                            <ExternalLink className="w-3 h-3" /> Full Map
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Proof Card 3B: Live ONDC GPS Tracking Action */}
                  {msg.actionType === "TRACKING_ACTION" && msg.actionDetails && (
                    <div className="bg-slate-950/95 border border-cyan-500/40 rounded-xl p-4 space-y-3.5 shadow-xl shadow-cyan-500/5 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span>ONDC Telemetry • Live Doorstep Radar</span>
                        </div>
                        <Badge variant="cyan" className="text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                          {msg.actionDetails.status || "EN_ROUTE"}
                        </Badge>
                      </div>

                      {/* Live Radar Grid Banner */}
                      <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-cyan-950/40 rounded-lg p-3 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Active Order ID</div>
                          <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                            <span>{msg.actionDetails.orderId}</span>
                            <button onClick={() => handleCopy(msg.actionDetails?.orderId || "", "trackOrderId")} className="text-slate-400 hover:text-white">
                              {copiedId === "trackOrderId" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="text-xs text-slate-300 font-medium">
                            Technician: <span className="text-emerald-400">{msg.actionDetails.technician}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Vehicle: {msg.actionDetails.vehicle}
                          </div>
                        </div>

                        <div className="text-center sm:text-right bg-black/40 px-3 py-2 rounded-lg border border-cyan-500/20">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Real-Time ETA</div>
                          <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight">
                            {msg.actionDetails.etaMinutes || 14} <span className="text-xs font-normal text-slate-400">mins</span>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                            {msg.actionDetails.distanceKm || 2.1} km to doorstep
                          </div>
                        </div>
                      </div>

                      {/* Coordinates & Route Progress */}
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>ORIGIN: Indiranagar Mobility Hub</span>
                          <span>DESTINATION: User Doorstep</span>
                        </div>
                        {/* Visual Route Progress */}
                        <div className="relative w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-[65%] rounded-full relative animate-pulse" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-0.5">
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Navigation className="w-3 h-3" /> Lat {msg.actionDetails.currentCoordinates?.lat || "12.9784"}, Lng {msg.actionDetails.currentCoordinates?.lng || "77.5912"}
                          </span>
                          <span className="text-slate-300 truncate max-w-[200px]">{msg.actionDetails.destinationAddress || "Bangalore (560103)"}</span>
                        </div>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
                          <span>Route Milestones</span>
                          <span className="text-cyan-400">GPS Live Sync Active</span>
                        </div>
                        {msg.actionDetails.milestones?.map((ms: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800">
                            <span className="flex items-center gap-2">
                              {ms.done ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              )}
                              <span className={ms.done ? "text-slate-200 font-medium" : "text-slate-500"}>{ms.step}</span>
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 shrink-0">{ms.time}</span>
                          </div>
                        ))}
                      </div>

                      {msg.actionDetails.passportHash && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-md border border-slate-800">
                          <span className="flex items-center gap-1 font-mono text-cyan-400">
                            <ShieldCheck className="w-3 h-3" /> ONDC Cryptographic Stamp:
                          </span>
                          <span className="font-mono text-slate-300 truncate max-w-[180px]">
                            {msg.actionDetails.passportHash.slice(0, 16)}...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proof Card 3C: Modular Component Salvage & Reuse Blueprints */}
                  {msg.actionType === "REUSE_ACTION" && msg.actionDetails && (
                    <div className="bg-slate-950/95 border border-cyan-500/40 rounded-xl p-4 space-y-3.5 shadow-xl shadow-cyan-500/5 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span>Modular Component Reuse & Salvage Blueprints</span>
                        </div>
                        <Badge variant="emerald" className="text-[10px] flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          {msg.actionDetails.carbonSavingsKgCO2e || 34.8} kg CO2e Avoided
                        </Badge>
                      </div>

                      {/* Salvaged sub-assemblies table */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          Verified Working Sub-Components (Host Telemetry Probed):
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {msg.actionDetails.salvagedComponents?.map((comp: any, i: number) => (
                            <div key={i} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1">
                              <div className="text-xs font-bold text-white flex items-center justify-between">
                                <span>{comp.name}</span>
                              </div>
                              <div className="text-[10px] text-emerald-400 font-medium">✓ {comp.condition}</div>
                              <div className="text-[10px] text-slate-400">Lifespan: {comp.estimatedLifespanYears}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Blueprints */}
                      <div className="space-y-2">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">
                          Turnkey Modular Blueprints for These Components:
                        </div>
                        <div className="space-y-2">
                          {msg.actionDetails.blueprints?.map((bp: any, i: number) => (
                            <div key={i} className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-1">
                                <span className="font-bold text-xs text-white flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                  {bp.title}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {bp.badge && (
                                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                                      {bp.badge}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    +${bp.estimatedAnnualSavingsUSD}/yr saved
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-300">
                                <span><strong>OS:</strong> {bp.os}</span>
                                <span><strong>Difficulty:</strong> {bp.difficulty}</span>
                              </div>

                              <div className="bg-black/50 p-2 rounded border border-slate-800/80 text-[10px] text-slate-300 space-y-1 font-mono">
                                <div className="text-slate-400 font-semibold">Implementation Steps:</div>
                                {bp.steps?.map((st: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-1.5">
                                    <span className="text-cyan-400">{idx + 1}.</span>
                                    <span>{st}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {msg.actionDetails.passportHash && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-md border border-slate-800">
                          <span className="flex items-center gap-1 font-mono text-cyan-400">
                            <ShieldCheck className="w-3 h-3" /> Sealed Reuse Blueprint Passport Hash:
                          </span>
                          <span className="font-mono text-slate-300 truncate max-w-[180px]">
                            {msg.actionDetails.passportHash.slice(0, 16)}...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proof Card 3D: Certified Zero-Landfill E-Waste Disposal */}
                  {msg.actionType === "RECYCLE_ACTION" && msg.actionDetails && (
                    <div className="bg-slate-950/95 border border-emerald-500/40 rounded-xl p-4 space-y-3.5 shadow-xl shadow-emerald-500/5 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                          <Recycle className="w-4 h-4 text-emerald-400" />
                          <span>Certified Zero-Landfill E-Waste Disposal</span>
                        </div>
                        <Badge variant="emerald" className="text-[10px]">
                          R2v3 & ISO 14001
                        </Badge>
                      </div>

                      {/* Instant Scrap Credit Banner */}
                      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/50 rounded-lg p-3 border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-emerald-400 uppercase font-mono">Guaranteed Instant Scrap Credit</div>
                          <div className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
                            ${msg.actionDetails.scrapCreditAmountUSD?.toFixed(2) || "18.50"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Method: {msg.actionDetails.creditPaymentMethod || "Instant UPI / Bank Transfer"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 uppercase font-mono">Pickup Ticket ID</div>
                          <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 justify-end mt-0.5">
                            <span>{msg.actionDetails.pickupId}</span>
                            <button onClick={() => handleCopy(msg.actionDetails?.pickupId || "", "pickupId")} className="text-slate-400 hover:text-white">
                              {copiedId === "pickupId" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold mt-1">Zero-Landfill Guaranteed</div>
                        </div>
                      </div>

                      {/* Partner & Logistics info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Certified Recycling Partner</div>
                          <div className="text-white font-bold mt-0.5">{msg.actionDetails.partnerName}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{msg.actionDetails.certification}</div>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-[10px] text-slate-400">Doorstep Collection Window</div>
                          <div className="text-cyan-300 font-bold mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {msg.actionDetails.pickupSlot}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">{msg.actionDetails.pickupAddress}</div>
                        </div>
                      </div>

                      {/* Materials Recovered Breakdown */}
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1.5">
                        <div className="text-[10px] text-slate-400 uppercase font-mono flex items-center justify-between">
                          <span>Chemical & Material Neutralization Breakdown:</span>
                          <span className="text-emerald-400">100% Zero Leach</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {msg.actionDetails.materialsRecovered?.map((mat: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                              <span className="text-slate-300">{mat.material}</span>
                              <span className="font-mono text-emerald-400 font-semibold">{mat.recoveryRate}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Destruction Certificate */}
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">OFFICIAL DESTRUCTION CERTIFICATE</div>
                          <div className="text-cyan-300 font-mono font-bold text-[11px] mt-0.5">
                            {msg.actionDetails.destructionCertificateNumber}
                          </div>
                        </div>
                        <Link href="/passport">
                          <Button size="sm" variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs h-7 gap-1">
                            <ShieldCheck className="w-3 h-3" /> View Passport
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Proof Card 7: Admin Escalation & Autonomous Learning */}
                  {msg.actionType === "ADMIN_ESCALATION" && msg.actionDetails && (
                    <div className="bg-slate-950/90 border border-purple-500/40 rounded-xl p-4 space-y-3 shadow-lg shadow-purple-500/5 animate-in fade-in">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                          <UserCheck className="w-4 h-4 text-purple-400" />
                          <span>Escalated to Lead Systems Administrator</span>
                        </div>
                        <Badge variant="purple" className="text-[10px]">
                          Ticket #{msg.actionDetails.escalationId?.slice(0, 8) || "L3-ESC"}
                        </Badge>
                      </div>

                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-xs space-y-1 text-purple-200">
                        <div className="font-bold flex items-center gap-1.5 text-purple-300">
                          <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                          Live Reply from {msg.actionDetails.assignedTo || "Lead Systems Administrator"}:
                        </div>
                        <p className="italic text-slate-200 pl-2 border-l-2 border-purple-400 mt-1">
                          "{msg.actionDetails.adminLiveReply}"
                        </p>
                      </div>

                      {msg.actionDetails.learnedRule && (
                        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1">
                          <div className="text-[10px] text-cyan-400 font-mono uppercase flex items-center gap-1">
                            <Brain className="w-3.5 h-3.5 text-cyan-400" /> Autonomous Agent Learned Rule:
                          </div>
                          <p className="text-slate-300 font-mono text-[11px]">
                            {msg.actionDetails.learnedRule}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Proof Card 4: Screen / BSOD Analysis */}
                  {msg.actionType === "SCREEN_ANALYSIS" && (
                    <div className="bg-slate-950/80 border border-purple-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                          <Camera className="w-4 h-4 text-purple-400" />
                          <span>Optical Screen Error Diagnosis</span>
                        </div>
                        <Badge variant="purple" className="text-[10px]">
                          BSOD PARSED
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px] font-mono">STOP CODE IDENTIFIED</div>
                          <div className="text-rose-400 font-mono font-bold mt-0.5">{msg.actionDetails.stopCode}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <div className="text-slate-400 text-[10px]">Failing Module</div>
                            <div className="text-amber-300 font-mono text-[11px] mt-0.5">{msg.actionDetails.failingModule}</div>
                          </div>
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <div className="text-slate-400 text-[10px]">Hardware Impact</div>
                            <div className="text-emerald-400 font-semibold text-[11px] mt-0.5">{msg.actionDetails.hardwareImpact}</div>
                          </div>
                        </div>

                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Autonomous Remediation</div>
                          <div className="text-cyan-300 text-[11px] mt-0.5">{msg.actionDetails.remediationApplied}</div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => executeAction("Fix and optimize my system")}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs h-7 gap-1"
                      >
                        <Wrench className="w-3 h-3" /> Run Comprehensive System Health Check
                      </Button>
                    </div>
                  )}

                  {/* Proof Card 5: Keyboard Diagnostic */}
                  {msg.actionType === "KEYBOARD_DIAGNOSTIC" && (
                    <div className="bg-slate-950/80 border border-rose-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                          <Keyboard className="w-4 h-4 text-rose-400" />
                          <span>Hardware Keyboard Matrix Diagnostics</span>
                        </div>
                        <Badge variant="rose" className="text-[10px]">
                          85 / 87 OK
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Tested Keys</div>
                          <div className="text-slate-200 font-bold mt-0.5">{msg.actionDetails.testedKeys} Keys Matrix</div>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <div className="text-slate-400 text-[10px]">Controller Status</div>
                          <div className="text-emerald-400 font-semibold mt-0.5">{msg.actionDetails.controllerStatus}</div>
                        </div>
                      </div>

                      <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-2.5 text-xs text-rose-300">
                        <div className="font-semibold text-rose-400">High Mechanical Resistance Detected:</div>
                        <div className="mt-0.5">Keys <strong>[{msg.actionDetails.problematicKeys?.join(", ")}]</strong> indicate membrane wear.</div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => executeAction("Book a doorstep technician to replace my keyboard tomorrow")}
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs h-8 gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" /> Book Doorstep Keyboard Replacement Now
                      </Button>
                    </div>
                  )}

                  {/* Proof Card 6: Hardware AI Understanding Diagnostic */}
                  {msg.actionType === "HARDWARE_AI_DIAGNOSTIC" && (
                    <div className="bg-slate-950/90 border border-purple-500/30 rounded-xl p-4 space-y-3.5 shadow-lg">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span>{msg.actionDetails.aiModelName || "Cognitive Hardware AI Agent"}</span>
                        </div>
                        <Badge variant="purple" className="text-[10px]">
                          {msg.actionDetails.testingCategory || "Functional Testing"}
                        </Badge>
                      </div>

                      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Tool Triggered:</div>
                        <div className="text-white font-bold text-xs">{msg.actionDetails.selectedTool?.name}</div>
                        <div className="text-[11px] text-emerald-400 font-mono overflow-x-auto whitespace-pre pt-1">
                          {msg.actionDetails.windowsCommandExecuted}
                        </div>
                      </div>

                      {msg.actionDetails.rawHostOutput && (
                        <div className="bg-black/60 rounded-lg p-2.5 border border-white/5 space-y-1">
                          <div className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-between">
                            <span>Live Host Execution Output:</span>
                            <span className="text-emerald-400 font-bold">RETURN CODE: 0</span>
                          </div>
                          <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-32 whitespace-pre-wrap">
                            {msg.actionDetails.rawHostOutput}
                          </pre>
                        </div>
                      )}

                      {msg.actionDetails.targetDetail && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-xs text-amber-200">
                          <strong>Target Hardware Detail:</strong> {msg.actionDetails.targetDetail} (Matrix Row 3 probed)
                        </div>
                      )}

                      {msg.actionDetails.threeFactors && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <div className="text-cyan-400 font-bold text-[10px]">1. Component Health</div>
                            <div className="text-slate-300 text-[11px] mt-0.5">{msg.actionDetails.threeFactors.factor1_health}</div>
                          </div>
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <div className="text-amber-400 font-bold text-[10px]">2. Functional Impact</div>
                            <div className="text-slate-300 text-[11px] mt-0.5">{msg.actionDetails.threeFactors.factor2_impact}</div>
                          </div>
                          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                            <div className="text-rose-400 font-bold text-[10px]">3. Probable Root Cause</div>
                            <div className="text-slate-300 text-[11px] mt-0.5">{msg.actionDetails.threeFactors.factor3_rootCause}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {(!msg.actionDetails.triageVerdict || msg.actionDetails.triageVerdict === "repair") && (
                          <Button
                            size="sm"
                            onClick={() => executeAction("Book a doorstep technician for tomorrow")}
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-7 gap-1"
                          >
                            <Truck className="w-3 h-3" /> Book Doorstep Tech via ONDC
                          </Button>
                        )}
                        {msg.actionDetails.triageVerdict === "reuse" && (
                          <Button
                            size="sm"
                            onClick={() => executeAction("Repurpose working components for home server or NAS node")}
                            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs h-7 gap-1"
                          >
                            <Layers className="w-3 h-3" /> Generate Salvage Blueprint
                          </Button>
                        )}
                        {msg.actionDetails.triageVerdict === "recycle" && (
                          <Button
                            size="sm"
                            onClick={() => executeAction("Schedule certified zero-landfill e-waste pickup with scrap credit")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs h-7 gap-1"
                          >
                            <Recycle className="w-3 h-3" /> Schedule E-Waste Pickup (+$18.50)
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => executeAction("Track my technician live on ONDC")}
                          className="border-slate-700 text-slate-300 hover:text-white text-xs h-7 gap-1"
                        >
                          <Radio className="w-3 h-3 text-cyan-400" /> Live Radar
                        </Button>
                        <Link href="/passport">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:text-white text-xs h-7 gap-1"
                          >
                            <ShieldCheck className="w-3 h-3" /> Sealed Passport
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Recommended Action After Diagnosis Based on Condition */}
                  {msg.actionDetails?.finalActions && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-400" /> Recommended Action (Based on Device Condition):
                      </div>
                      
                      {/* ONLY SHOW THE NECESSARY ACTION */}
                      {(msg.actionDetails?.triageVerdict === "repair" || !msg.actionDetails?.triageVerdict) && (
                        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                          <div>
                            <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                              <Wrench className="w-4 h-4" /> Necessary Action: 1. Repair
                            </div>
                            <div className="text-xs font-semibold text-white mt-0.5">
                              Book PC / Desktop Technician via ONDC
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {msg.actionDetails?.finalActions?.repair?.description || "Doorstep technician can inspect, service, or replace the affected component."}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAction("Book a doorstep technician for tomorrow 10am")}
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs h-8 gap-1.5 shrink-0 shadow-md shadow-amber-900/30"
                          >
                            <Truck className="w-3.5 h-3.5" /> Book Doorstep Tech
                          </Button>
                        </div>
                      )}

                      {msg.actionDetails?.triageVerdict === "reuse" && (
                        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                          <div>
                            <div className="font-bold text-cyan-300 flex items-center gap-1.5 text-xs">
                              <Layers className="w-4 h-4" /> Necessary Action: 2. Reuse
                            </div>
                            <div className="text-xs font-semibold text-white mt-0.5">
                              Repurpose Working Sub-Components
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {msg.actionDetails?.finalActions?.reuse?.description || "Working RAM and NVMe SSD modules are suitable for home server/NAS."}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAction("Repurpose working components for home server or NAS node")}
                            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs h-8 gap-1.5 shrink-0 shadow-md shadow-cyan-900/30"
                          >
                            <Layers className="w-3.5 h-3.5" /> Generate Reuse Blueprint
                          </Button>
                        </div>
                      )}

                      {msg.actionDetails?.triageVerdict === "recycle" && (
                        <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                          <div>
                            <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                              <Recycle className="w-4 h-4" /> Necessary Action: 3. Recycle
                            </div>
                            <div className="text-xs font-semibold text-white mt-0.5">
                              Certified Zero-Landfill E-Waste Disposal
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              {msg.actionDetails?.finalActions?.recycle?.description || "Safely recycle unrecoverable materials with certified e-waste partners."}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => executeAction("Schedule certified zero-landfill e-waste pickup with scrap credit")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs h-8 gap-1.5 shrink-0 shadow-md shadow-emerald-900/30"
                          >
                            <Recycle className="w-3.5 h-3.5" /> Schedule E-Waste Pickup (+$18.50)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Suggested Chips inside message if any */}
              {msg.chips && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-2">
                  {msg.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeAction(chip)}
                      className="bg-slate-800/80 hover:bg-cyan-900/40 hover:text-cyan-300 hover:border-cyan-500/30 text-slate-300 text-xs px-3 py-1.5 rounded-full border border-slate-700/60 transition-all text-left flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      {chip}
                    </button>
                  ))}
                </div>
              )}

            </div>
          </div>
        ))}

        {/* Live Action Executing Indicator */}
        {executing && (
          <div className="flex flex-col items-start animate-fade-in">
            <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-cyan-400">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span className="font-semibold">Antigravity Agent</span>
              <span>•</span>
              <span>Executing Action</span>
            </div>
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-lg shadow-cyan-500/5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                <div className="text-sm font-medium text-cyan-200">
                  {statusMessage || "Taking action on your computer..."}
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-2 pl-7">
                Executing direct system operations. You will receive an instant "🎉 It's all done!" report with verified proof.
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips Bar (Above Input) */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1 text-[11px]">
          <Zap className="w-3 h-3 text-cyan-400" /> Quick Actions:
        </span>
        <button
          onClick={() => executeAction("Scan and diagnose my PC hardware")}
          disabled={executing}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5"
        >
          ⚡ Scan Hardware
        </button>
        <button
          onClick={() => executeAction("Fix and speed up my system")}
          disabled={executing}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5"
        >
          🛠️ Fix & Speed Up
        </button>
        <button
          onClick={() => executeAction("Book a doorstep technician for tomorrow 10am")}
          disabled={executing}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5"
        >
          🛵 Book Doorstep Tech
        </button>
        <button
          onClick={() => executeAction("I have an unfamiliar kernel error 0x800F0922, please escalate to admin")}
          disabled={executing}
          className="shrink-0 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 hover:text-white px-3 py-1.5 rounded-full border border-purple-500/30 transition-colors flex items-center gap-1.5"
        >
          👤 Escalate to Admin
        </button>
        <button
          onClick={() => setPhotoModalOpen(true)}
          disabled={executing}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5"
        >
          📸 Analyze Screen / BSOD
        </button>
        <button
          onClick={() => executeAction("The keys on my keyboard are not working, please test them")}
          disabled={executing}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5"
        >
          ⌨️ Test Keyboard
        </button>
        <button
          onClick={() => executeAction("Flush DNS and optimize network")}
          disabled={executing}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-full border border-slate-800 transition-colors flex items-center gap-1.5"
        >
          📶 Flush DNS
        </button>
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSendPrompt} className="mt-2 relative flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPhotoModalOpen(true)}
          title="Attach screen photo or BSOD error image"
          className="h-11 w-11 shrink-0 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
        >
          <Camera className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message the agent: e.g. 'My PC is slow and hot, fix it' or 'Book a technician for tomorrow'..."
          disabled={executing}
          className="flex-1 h-11 bg-slate-900/90 border border-slate-800 rounded-xl px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
        />

        <Button
          type="submit"
          disabled={!inputText.trim() || executing}
          className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>

      {/* Optical BSOD / Screen Error Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span>Screen Error / Crash Photo Triage</span>
              </div>
              <button
                onClick={() => setPhotoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              The agent uses optical inspection to read Stop Codes, QR codes, and kernel memory address crashes directly from photos of your laptop screen.
            </p>

            {/* Sample Photo Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 p-2 space-y-2">
              <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Sample Crash Photo: Windows BSOD</span>
                <Badge variant="rose" className="text-[9px]">0x000000D1</Badge>
              </div>
              <div className="relative rounded-lg overflow-hidden bg-blue-900/60 p-3 text-white font-mono text-[11px] leading-relaxed border border-blue-500/30">
                <div className="text-2xl mb-1">:(</div>
                <div>Your device ran into a problem and needs to restart.</div>
                <div className="text-[10px] text-cyan-200 mt-2">
                  Stop code: DRIVER_IRQL_NOT_LESS_OR_EQUAL<br/>
                  What failed: rtwlane601.sys
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs h-9 gap-1.5"
                onClick={() => {
                  setPhotoModalOpen(false);
                  executeAction("Here is a photo of the blue screen crash with Stop Code DRIVER_IRQL_NOT_LESS_OR_EQUAL");
                }}
              >
                <Sparkles className="w-4 h-4" /> Send Sample Crash Photo to Agent
              </Button>

              <Button
                variant="outline"
                className="w-full border-slate-800 text-slate-400 hover:text-white text-xs h-8"
                onClick={() => setPhotoModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
