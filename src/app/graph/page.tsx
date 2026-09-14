"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Network, 
  Cpu, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Truck, 
  Recycle, 
  Brain, 
  Database, 
  Layers, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Terminal, 
  Server, 
  Compass, 
  ExternalLink, 
  Laptop, 
  Activity,
  UserCheck,
  Bot,
  Flame,
  FileCode,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GraphNode {
  id: string;
  name: string;
  shortName: string;
  layer: "reading" | "understanding" | "execution" | "trust";
  layerLabel: string;
  icon: any;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  status: "ONLINE" | "ACTIVE" | "READY";
  sourceFile: string;
  description: string;
  role: string;
  inputs: string[];
  outputs: string[];
  failSafeFallback?: string;
  x: number; // percentage in canvas
  y: number; // percentage in canvas
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: "data" | "trigger" | "fallback" | "loop";
}

interface ScenarioTrace {
  id: string;
  title: string;
  badge: string;
  description: string;
  nodeSequence: string[];
  payloads: Record<string, string>;
  finalPassportHash: string;
}

export default function ArchitectureGraphPage() {
  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("cognitive-hardware-ai");
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [scenarioStep, setScenarioStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"canvas" | "matrix" | "langgraph">("canvas");

  // Define All Graph Nodes
  const nodes: GraphNode[] = useMemo(() => [
    // LAYER 1: Reading & Ingestion (Architecture 1)
    {
      id: "windows-collector",
      name: "Windows Telemetry Collector",
      shortName: "Win Collector",
      layer: "reading",
      layerLabel: "Arch 1: Reading Agent",
      icon: Terminal,
      color: "text-blue-400",
      bgGradient: "from-blue-950/80 to-slate-900/90",
      borderColor: "border-blue-500/50",
      glowColor: "shadow-blue-500/30",
      status: "ONLINE",
      sourceFile: "scripts/Collect-WindowsTelemetry.ps1",
      description: "Extracts deep WMI, ACPI battery telemetry, SMART storage health, and CPU clock throttling parameters.",
      role: "Hardware Sensor Probing",
      inputs: ["Local Host Motherboard / OS Sensors"],
      outputs: ["Raw Telemetry JSON", "WMI Hardware Samples"],
      failSafeFallback: "Falls back to synthetic benchmark telemetry if WMI is restricted.",
      x: 12,
      y: 18,
    },
    {
      id: "desktop-daemon",
      name: "ReUseChain Desktop Daemon",
      shortName: "Desktop Agent",
      layer: "reading",
      layerLabel: "Arch 1: Reading Agent",
      icon: Laptop,
      color: "text-cyan-400",
      bgGradient: "from-cyan-950/80 to-slate-900/90",
      borderColor: "border-cyan-500/50",
      glowColor: "shadow-cyan-500/30",
      status: "ONLINE",
      sourceFile: "scripts/ReUseChain-DesktopAgent.ps1",
      description: "Background PowerShell process monitoring thermal envelopes, memory leaks, and disk queue depths.",
      role: "Continuous Host Monitoring",
      inputs: ["Win32_Processor", "Win32_DiskDrive", "System Event Log"],
      outputs: ["Periodic Telemetry Payloads", "Threshold Alerts"],
      failSafeFallback: "Auto-reconnects on system wake from sleep/hibernation.",
      x: 12,
      y: 42,
    },
    {
      id: "web-action-chat",
      name: "Conversational Action Console",
      shortName: "Web Chat",
      layer: "reading",
      layerLabel: "Arch 1: Reading Agent",
      icon: Sparkles,
      color: "text-emerald-400",
      bgGradient: "from-emerald-950/80 to-slate-900/90",
      borderColor: "border-emerald-500/50",
      glowColor: "shadow-emerald-500/30",
      status: "ACTIVE",
      sourceFile: "src/app/assistant/page.tsx",
      description: "One-message autonomous chat interface with image uploads, Task Manager vision previews, and real-time execution.",
      role: "User Conversational Ingestion",
      inputs: ["User Natural Language Prompts", "Screenshots / Task Manager Photos"],
      outputs: ["User Query Payload", "Photo Base64 Buffer", "Target Asset Tag"],
      failSafeFallback: "If host PC is unbootable, directs user to @backuvro_bot on smartphone.",
      x: 12,
      y: 66,
    },
    {
      id: "backup-telegram-bot",
      name: "Mobile Emergency Bot (@backuvro_bot)",
      shortName: "Backup Bot",
      layer: "reading",
      layerLabel: "Arch 1: Reading Agent",
      icon: Radio,
      color: "text-purple-400",
      bgGradient: "from-purple-950/80 to-slate-900/90",
      borderColor: "border-purple-500/50",
      glowColor: "shadow-purple-500/30",
      status: "ACTIVE",
      sourceFile: "scripts/run-telegram-bots.ts",
      description: "Dedicated mobile bot for when PC is dead, turned off, or showing unmountable drive errors (3F0, NVMe crash).",
      role: "Off-Host Mobile Emergency Triage",
      inputs: ["Mobile Telegram Photos (via getFile API)", "Text Queries"],
      outputs: ["Mobile Error Triage", "Emergency Booking Dispatch", "Direct Admin Escalations"],
      failSafeFallback: "Runs via long-polling without requiring public webhooks or open ports.",
      x: 12,
      y: 90,
    },

    // LAYER 2: Understanding & Self-Learning (Architecture 2)
    {
      id: "vision-diagnostic-engine",
      name: "Optical Vision & Task Manager Analyzer",
      shortName: "Vision Engine",
      layer: "understanding",
      layerLabel: "Arch 2: Understanding Agent",
      icon: Eye,
      color: "text-amber-400",
      bgGradient: "from-amber-950/80 to-slate-900/90",
      borderColor: "border-amber-500/50",
      glowColor: "shadow-amber-500/30",
      status: "ONLINE",
      sourceFile: "src/lib/vision-diagnostic-engine.ts",
      description: "Cognitive OCR and anomaly classifier detecting Task Manager runaway miners (svchost_crypto), 95% RAM leaks, and BSOD BugChecks.",
      role: "Visual Screen Telemetry Triage",
      inputs: ["Screen Photos", "Task Manager Captures", "User Context Notes"],
      outputs: ["Detected Anomaly", "Failing Module", "Windows API Diagnostic Command"],
      failSafeFallback: "Uses high-precision local heuristic pattern matching if LLM vision key is unavailable.",
      x: 40,
      y: 22,
    },
    {
      id: "cognitive-hardware-ai",
      name: "Cognitive Hardware Diagnostic AI",
      shortName: "Hardware AI",
      layer: "understanding",
      layerLabel: "Arch 2: Understanding Agent",
      icon: Brain,
      color: "text-cyan-300",
      bgGradient: "from-cyan-950/80 to-slate-900/90",
      borderColor: "border-cyan-400/50",
      glowColor: "shadow-cyan-400/30",
      status: "ACTIVE",
      sourceFile: "src/lib/hardware-ai-agent.ts",
      description: "Understands user symptoms and maps to 14 specialized diagnostic tools. Generates 3-factor diagnosis (Health, Impact, Root Cause).",
      role: "Intent Classifier & Condition Triage",
      inputs: ["User Symptom Query", "Live Windows API Output"],
      outputs: ["3-Factor Health Analysis", "Triage Verdict (Repair/Reuse/Recycle)", "Condition Badge"],
      failSafeFallback: "Auto-routes ambiguous short-circuits or liquid damage to Admin Escalation.",
      x: 40,
      y: 52,
    },
    {
      id: "self-learning-store",
      name: "Adaptive Self-Learning Memory",
      shortName: "Self-Learning Store",
      layer: "understanding",
      layerLabel: "Arch 2: Understanding Agent",
      icon: Sparkles,
      color: "text-pink-400",
      bgGradient: "from-pink-950/80 to-slate-900/90",
      borderColor: "border-pink-500/50",
      glowColor: "shadow-pink-500/30",
      status: "ONLINE",
      sourceFile: "src/lib/self-learning-agent.ts",
      description: "Stores admin-verified resolutions as permanent decision rules. Automatically answers future occurrences without human intervention.",
      role: "Continuous Model Calibration",
      inputs: ["Admin Verified Reply", "Escalated Symptom Signature"],
      outputs: ["Autonomous Resolution Match", "Circularity Passport Event"],
      failSafeFallback: "Cryptographically anchors every learned rule with SHA-256 genesis proof.",
      x: 40,
      y: 78,
    },
    {
      id: "admin-escalation-hub",
      name: "Admin Escalation Bot (@AHackBattle013bot)",
      shortName: "Admin Bot",
      layer: "understanding",
      layerLabel: "Arch 2: Understanding Agent",
      icon: UserCheck,
      color: "text-purple-300",
      bgGradient: "from-purple-950/80 to-slate-900/90",
      borderColor: "border-purple-400/50",
      glowColor: "shadow-purple-400/30",
      status: "ACTIVE",
      sourceFile: "src/lib/telegram-service.ts",
      description: "Human-in-the-loop bridge. Alerts lead admins with full telemetry, and delivers admin's /reply directly back into user chat.",
      role: "Indirect Admin Support & HITL Loop",
      inputs: ["Novel / Complex Escalations", "Admin /reply Commands"],
      outputs: ["User Real-Time Resolution", "Model Training Rule"],
      failSafeFallback: "Dual delivery routes: sends to Telegram Backup Bot or active Web Session.",
      x: 40,
      y: 95,
    },

    // LAYER 3: Execution & Circular Economy (Architecture 3)
    {
      id: "ondc-doorstep-repair",
      name: "ONDC Doorstep Repair Dispatch",
      shortName: "ONDC Repair",
      layer: "execution",
      layerLabel: "Arch 3: Execution Agent",
      icon: Truck,
      color: "text-amber-400",
      bgGradient: "from-amber-950/80 to-slate-900/90",
      borderColor: "border-amber-500/50",
      glowColor: "shadow-amber-500/30",
      status: "READY",
      sourceFile: "src/app/api/ondc/services/route.ts",
      description: "Open Network for Digital Commerce (ONDC) BAP/BPP dispatch for certified Dell/HP hardware technicians (Alex Rivera).",
      role: "Physical Doorstep Service Fulfillment",
      inputs: ["Repair Triage Verdict", "Saved User Profile"],
      outputs: ["ONDC Order ID (ONDC-SRV-2026-XXXX)", "Scheduled Service Window ($45)"],
      failSafeFallback: "Zero form-filling: automatically leverages user profile address & GPS coordinates.",
      x: 68,
      y: 20,
    },
    {
      id: "live-gps-tracking",
      name: "Live ONDC GPS Telemetry Tracker",
      shortName: "Live GPS",
      layer: "execution",
      layerLabel: "Arch 3: Execution Agent",
      icon: Compass,
      color: "text-emerald-300",
      bgGradient: "from-emerald-950/80 to-slate-900/90",
      borderColor: "border-emerald-400/50",
      glowColor: "shadow-emerald-400/30",
      status: "ONLINE",
      sourceFile: "src/app/track/[id]/page.tsx",
      description: "Monitors mobile diagnostic unit telemetry (Vehicle #BLR-42, 2.1 km away, ETA 14 mins) and milestone checkpoints.",
      role: "Real-time Vehicle & Tech Tracking",
      inputs: ["ONDC Order ID", "Mobility Hub Telemetry"],
      outputs: ["Live GPS Coordinates (12.9784, 77.5912)", "Milestone Progression"],
      failSafeFallback: "Embedded directly into chat bubbles and standalone tracking portal.",
      x: 68,
      y: 44,
    },
    {
      id: "modular-reuse-engine",
      name: "Modular Salvage & Reuse Engine",
      shortName: "Reuse Blueprints",
      layer: "execution",
      layerLabel: "Arch 3: Execution Agent",
      icon: Layers,
      color: "text-cyan-400",
      bgGradient: "from-cyan-950/80 to-slate-900/90",
      borderColor: "border-cyan-500/50",
      glowColor: "shadow-cyan-500/30",
      status: "READY",
      sourceFile: "src/app/api/assistant/route.ts",
      description: "Generates custom blueprints to repurpose working sub-assemblies (NAS node, Plex server, external SSD) avoiding 34.8 kg CO2e.",
      role: "Circular Component Repurposing",
      inputs: ["Healthy Sub-Components", "Hardware Specs"],
      outputs: ["Step-by-step DIY Blueprints", "CO2 Avoided Metric ($140/yr)"],
      failSafeFallback: "Provides 1-click technician dispatch to safely harvest parts.",
      x: 68,
      y: 68,
    },
    {
      id: "r2-certified-recycle",
      name: "R2v3 Certified Zero-Landfill Recycler",
      shortName: "E-Waste Recycler",
      layer: "execution",
      layerLabel: "Arch 3: Execution Agent",
      icon: Recycle,
      color: "text-rose-400",
      bgGradient: "from-rose-950/80 to-slate-900/90",
      borderColor: "border-rose-500/50",
      glowColor: "shadow-rose-500/30",
      status: "READY",
      sourceFile: "src/app/api/assistant/route.ts",
      description: "Doorstep hazardous e-waste collection with EcoRecycle India. Chemical neutralization of CRT/lead with $18.50 scrap credit.",
      role: "Zero-Landfill Material Recovery",
      inputs: ["Irreparable Hardware Assets", "Address Details"],
      outputs: ["Pickup Booking ID", "Destruction Certificate", "Instant UPI Scrap Credit"],
      failSafeFallback: "Guarantees 100% zero-landfill disposal with hydrometallurgical recovery.",
      x: 68,
      y: 90,
    },

    // LAYER 4: Trust & Ledger
    {
      id: "circularity-passport",
      name: "Circularity Passport Blockchain",
      shortName: "Digital Passport",
      layer: "trust",
      layerLabel: "Trust & Ledger",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgGradient: "from-emerald-950/90 to-cyan-950/90",
      borderColor: "border-emerald-400/60",
      glowColor: "shadow-emerald-400/40",
      status: "ONLINE",
      sourceFile: "src/app/passport/[id]/page.tsx",
      description: "Immutable cryptographically hashed SHA-256 audit ledger sealing every diagnostic, repair, booking, and learned rule.",
      role: "Cryptographic Proof & Chain of Custody",
      inputs: ["Event Category", "Actor Identity", "Telemetry Fingerprint"],
      outputs: ["Immutable Event Hash", "Genesis Block Proof", "Tamper-Proof Certificate"],
      failSafeFallback: "Genesis block hashing prevents ledger branching or retroactive tampering.",
      x: 92,
      y: 38,
    },
    {
      id: "sqlite-prisma-orm",
      name: "Prisma Relational Database (dev.db)",
      shortName: "SQLite Store",
      layer: "trust",
      layerLabel: "Trust & Ledger",
      icon: Database,
      color: "text-slate-300",
      bgGradient: "from-slate-900 to-slate-950",
      borderColor: "border-slate-700",
      glowColor: "shadow-slate-600/30",
      status: "ONLINE",
      sourceFile: "prisma/schema.prisma",
      description: "Fast local SQLite persistence engine tracking fleet devices, components, quotes, bookings, and Telegram chat sessions.",
      role: "Entity State & Session Persistence",
      inputs: ["ORM Schema Mutations", "SQL Transactions"],
      outputs: ["Device Records", "Active Escalation Queue", "Booking Records"],
      failSafeFallback: "Fully isolated local database with zero external cloud dependencies.",
      x: 92,
      y: 72,
    },
  ], []);

  // Define Edges (Data & Trigger Relationships)
  const edges: GraphEdge[] = useMemo(() => [
    // Reading -> Understanding
    { id: "e1", source: "windows-collector", target: "cognitive-hardware-ai", label: "WMI Hardware Telemetry", type: "data" },
    { id: "e2", source: "desktop-daemon", target: "cognitive-hardware-ai", label: "Real-time Alerts", type: "trigger" },
    { id: "e3", source: "web-action-chat", target: "vision-diagnostic-engine", label: "Task Manager Screenshot", type: "data" },
    { id: "e4", source: "web-action-chat", target: "cognitive-hardware-ai", label: "User Prompt", type: "trigger" },
    { id: "e5", source: "backup-telegram-bot", target: "cognitive-hardware-ai", label: "Dead PC / Drive Error Query", type: "trigger" },
    { id: "e6", source: "backup-telegram-bot", target: "vision-diagnostic-engine", label: "Mobile Photo of Screen", type: "data" },

    // Within Understanding
    { id: "e7", source: "vision-diagnostic-engine", target: "cognitive-hardware-ai", label: "Optical Diagnostic Verdict", type: "data" },
    { id: "e8", source: "cognitive-hardware-ai", target: "self-learning-store", label: "Learned Rule Lookup", type: "data" },
    { id: "e9", source: "cognitive-hardware-ai", target: "admin-escalation-hub", label: "Novel / Ambiguous Query", type: "loop" },
    { id: "e10", source: "admin-escalation-hub", target: "self-learning-store", label: "Admin /reply Rule Commit", type: "trigger" },
    { id: "e11", source: "admin-escalation-hub", target: "backup-telegram-bot", label: "Direct Reply to Mobile Chat", type: "data" },
    { id: "e12", source: "admin-escalation-hub", target: "web-action-chat", label: "Live Web Chat Sync", type: "data" },

    // Understanding -> Execution
    { id: "e13", source: "cognitive-hardware-ai", target: "ondc-doorstep-repair", label: "Repair Verdict", type: "trigger" },
    { id: "e14", source: "cognitive-hardware-ai", target: "modular-reuse-engine", label: "Reuse Verdict", type: "trigger" },
    { id: "e15", source: "cognitive-hardware-ai", target: "r2-certified-recycle", label: "Recycle Verdict", type: "trigger" },
    { id: "e16", source: "ondc-doorstep-repair", target: "live-gps-tracking", label: "Dispatched Order ID", type: "data" },

    // Execution & Understanding -> Trust / Ledger
    { id: "e17", source: "ondc-doorstep-repair", target: "circularity-passport", label: "Booking Sealed", type: "data" },
    { id: "e18", source: "modular-reuse-engine", target: "circularity-passport", label: "CO2 Savings Logged", type: "data" },
    { id: "e19", source: "r2-certified-recycle", target: "circularity-passport", label: "Destruction Proof", type: "data" },
    { id: "e20", source: "self-learning-store", target: "circularity-passport", label: "Rule Genesis Hash", type: "data" },
    { id: "e21", source: "ondc-doorstep-repair", target: "sqlite-prisma-orm", label: "OndcBooking Created", type: "data" },
    { id: "e22", source: "admin-escalation-hub", target: "sqlite-prisma-orm", label: "AdminEscalation Updated", type: "data" },
    { id: "e23", source: "circularity-passport", target: "sqlite-prisma-orm", label: "PassportEvent Persisted", type: "data" },
  ], []);

  // Preset Scenario Path Tracers
  const scenarios: ScenarioTrace[] = useMemo(() => [
    {
      id: "scenario-offline-pc",
      title: "Scenario A: PC Off / 3F0 Drive Failure (Mobile Telegram)",
      badge: "Emergency Mobile Flow",
      description: "Host PC cannot boot. User troubleshoots via @backuvro_bot on mobile, receives storage triage, books ONDC doorstep repair, and tracks live technician.",
      nodeSequence: ["backup-telegram-bot", "cognitive-hardware-ai", "ondc-doorstep-repair", "live-gps-tracking", "circularity-passport"],
      payloads: {
        "backup-telegram-bot": "Ingested query: '3F0 Boot device not found / NVMe drive error' from mobile Chat #7312450336",
        "cognitive-hardware-ai": "Diagnosed: Storage Controller IO failure. Verdict: REPAIR. Dispatched doorstep specialist.",
        "ondc-doorstep-repair": "Booked ONDC Order #ONDC-SRV-2026-948122. Tech: Alex Rivera ($45).",
        "live-gps-tracking": "Vehicle #BLR-42 en route (2.1 km away, ETA 14 mins). Milestone 2 of 4 reached.",
        "circularity-passport": "Cryptographically sealed Passport Block: SHA-256 e849f2b87c102a94...",
      },
      finalPassportHash: "e849f2b87c102a945d8b763198cf4201859c",
    },
    {
      id: "scenario-vision-taskmgr",
      title: "Scenario B: 99% CPU Runaway Task Manager (Optical Vision)",
      badge: "Vision Diagnostic Flow",
      description: "User captures Task Manager screenshot showing rogue crypto miner. Vision engine OCR inspects rogue thread and executes Windows remediation.",
      nodeSequence: ["web-action-chat", "vision-diagnostic-engine", "cognitive-hardware-ai", "ondc-doorstep-repair", "circularity-passport"],
      payloads: {
        "web-action-chat": "Uploaded screenshot: Task Manager showing 98.4% CPU runaway load.",
        "vision-diagnostic-engine": "OCR detected suspicious process: svchost_crypto.exe (PID 4920). Thermal throttled.",
        "cognitive-hardware-ai": "Generated remediation: Stop-Process -Force and powercfg Balanced profile.",
        "ondc-doorstep-repair": "Reserved optional doorstep technician consultation if thermal issues persist.",
        "circularity-passport": "Committed diagnostic integrity proof: SHA-256 3a1f948b209e87dc...",
      },
      finalPassportHash: "3a1f948b209e87dc548c21a980fc2837194a",
    },
    {
      id: "scenario-self-learning",
      title: "Scenario C: Unresolved Fault & Admin Self-Learning Loop",
      badge: "Adaptive HITL Flow",
      description: "Novel BugCheck occurs. Agent auto-escalates to Lead Admin via @AHackBattle013bot. Admin replies with /reply, delivering answer to user and teaching the model permanently.",
      nodeSequence: ["web-action-chat", "cognitive-hardware-ai", "admin-escalation-hub", "self-learning-store", "circularity-passport", "backup-telegram-bot"],
      payloads: {
        "web-action-chat": "User encountered unhandled BugCheck 0x80070005. Novel error condition.",
        "cognitive-hardware-ai": "Flagged as uncatalogued fault. Triggered human-in-the-loop escalation loop.",
        "admin-escalation-hub": "Admin notified via Telegram. Admin sends: '/reply ESC-9921 Disable Core Isolation Memory Integrity'.",
        "self-learning-store": "Calibrated decision model: Rule permanently committed. Future queries will auto-resolve!",
        "circularity-passport": "Sealed SELF_LEARNING_RULE_RECORDED: SHA-256 7fc3b8901a82d091...",
        "backup-telegram-bot": "Delivered verified solution directly to user's mobile Telegram chat session.",
      },
      finalPassportHash: "7fc3b8901a82d0916a4e39201f82c091849d",
    },
    {
      id: "scenario-salvage-recycle",
      title: "Scenario D: Modular Component Salvage & Zero-Landfill Recycle",
      badge: "Circular Economy Flow",
      description: "Depleted motherboard detected. Healthy sub-assemblies are salvaged for NAS & Plex server blueprints (34.8 kg CO2e saved), while hazardous chassis is recycled with scrap credit.",
      nodeSequence: ["windows-collector", "cognitive-hardware-ai", "modular-reuse-engine", "r2-certified-recycle", "circularity-passport"],
      payloads: {
        "windows-collector": "Queried Win32_BaseBoard & Win32_PhysicalMemory: Motherboard PCB burnt, 24GB DDR4 100% healthy.",
        "cognitive-hardware-ai": "Diagnosed irreparable chassis. Split circular triage into REUSE + RECYCLE.",
        "modular-reuse-engine": "Generated OpenMediaVault NAS node blueprint. Avoided 34.8 kg CO2e in carbon emissions.",
        "r2-certified-recycle": "Booked EcoRecycle India certified zero-landfill collection. Reserved $18.50 scrap credit.",
        "circularity-passport": "Sealed Circularity Custody Transfer: SHA-256 9081bc34e09f8741...",
      },
      finalPassportHash: "9081bc34e09f8741762c9081a34b209e874b",
    },
  ], []);

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    if (selectedLayer === "all") return nodes;
    return nodes.filter((n) => n.layer === selectedLayer);
  }, [nodes, selectedLayer]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Active Scenario Path
  const activeScenario = useMemo(() => {
    return scenarios.find((s) => s.id === activeScenarioId) || null;
  }, [scenarios, activeScenarioId]);

  // Scenario Auto-Step Loop
  useEffect(() => {
    let timer: any;
    if (isPlaying && activeScenario) {
      timer = setTimeout(() => {
        if (scenarioStep < activeScenario.nodeSequence.length - 1) {
          const nextStep = scenarioStep + 1;
          setScenarioStep(nextStep);
          setSelectedNodeId(activeScenario.nodeSequence[nextStep]);
        } else {
          setIsPlaying(false);
        }
      }, 2200);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, scenarioStep, activeScenario]);

  const handleStartScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setScenarioStep(0);
    setIsPlaying(true);
    const targetScenario = scenarios.find((s) => s.id === scenarioId);
    if (targetScenario) {
      setSelectedNodeId(targetScenario.nodeSequence[0]);
    }
  };

  const handleResetScenario = () => {
    setActiveScenarioId(null);
    setScenarioStep(-1);
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4.5rem)] max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">ReUseChain Architecture & Knowledge Graph</h1>
                <Badge variant="emerald" className="text-[10px] uppercase font-mono">
                  Live Visual Topology
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                Full 4-Layer Agentic Map • Three-Architecture Engine • Telegram Dual-Bot Bridge • Interactive Scenario Tracer
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Quick Stats */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setViewMode("canvas")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "canvas" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Interactive Canvas
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "matrix" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Connectivity Matrix
            </button>
            <button
              onClick={() => setViewMode("langgraph")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === "langgraph" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              LangGraph State
            </button>
          </div>

          <Link href="/assistant">
            <Button size="sm" variant="outline" className="border-slate-700 text-xs gap-1.5 h-9">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Open Web Agent
            </Button>
          </Link>
        </div>
      </div>

      {/* Scenario Tracing Control Bar */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>Interactive Scenario Path Tracers (Click to simulate live execution flow):</span>
          </div>
          {activeScenarioId && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetScenario}
              className="text-xs h-7 border-slate-800 text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset Trace
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {scenarios.map((sc) => {
            const isCurrent = activeScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleStartScenario(sc.id)}
                className={`text-left p-3 rounded-xl border transition-all text-xs space-y-1.5 ${
                  isCurrent
                    ? "bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10 text-cyan-100 ring-1 ring-cyan-500/50"
                    : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={isCurrent ? "cyan" : "slate"} className="text-[9px] py-0 px-1.5">
                    {sc.badge}
                  </Badge>
                  {isCurrent && isPlaying && (
                    <span className="flex items-center gap-1 text-[10px] text-cyan-300 animate-pulse font-mono font-bold">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Step {scenarioStep + 1}/{sc.nodeSequence.length}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-slate-100 line-clamp-1">{sc.title}</div>
                <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sc.description}</div>
              </button>
            );
          })}
        </div>

        {/* Live Scenario Telemetry Streamer Bar */}
        {activeScenario && scenarioStep >= 0 && (
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-3 text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Active Hop: {activeScenario.nodeSequence[scenarioStep]}</span>
                <span className="text-slate-500 font-normal">➔ Hop {scenarioStep + 1} of {activeScenario.nodeSequence.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (scenarioStep > 0) {
                      setScenarioStep(scenarioStep - 1);
                      setSelectedNodeId(activeScenario.nodeSequence[scenarioStep - 1]);
                    }
                  }}
                  disabled={scenarioStep === 0}
                  className="h-6 text-[10px] border-slate-700"
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (scenarioStep < activeScenario.nodeSequence.length - 1) {
                      setScenarioStep(scenarioStep + 1);
                      setSelectedNodeId(activeScenario.nodeSequence[scenarioStep + 1]);
                    }
                  }}
                  disabled={scenarioStep === activeScenario.nodeSequence.length - 1}
                  className="h-6 text-[10px] border-slate-700"
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2 text-slate-200 bg-slate-950/70 p-2 rounded border border-slate-800/80 font-mono text-[11px]">
                <span className="text-cyan-400 font-semibold">Data Payload: </span>
                {activeScenario.payloads[activeScenario.nodeSequence[scenarioStep]]}
              </div>
              <div className="text-slate-300 bg-slate-950/70 p-2 rounded border border-slate-800/80 font-mono text-[11px] flex flex-col justify-center">
                <span className="text-emerald-400 text-[10px] font-bold">Passport Anchored:</span>
                <span className="text-slate-400 truncate">{activeScenario.finalPassportHash.slice(0, 20)}...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layer Filter Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium mr-1">Filter Layer:</span>
          {[
            { id: "all", label: "All 4 Layers (14 Nodes)" },
            { id: "reading", label: "Layer 1: Reading & Ingestion" },
            { id: "understanding", label: "Layer 2: AI & Understanding" },
            { id: "execution", label: "Layer 3: Execution & Circular" },
            { id: "trust", label: "Layer 4: Trust & Ledger" },
          ].map((ly) => (
            <button
              key={ly.id}
              onClick={() => setSelectedLayer(ly.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedLayer === ly.id
                  ? "bg-slate-800 text-white border border-slate-600 shadow"
                  : "bg-slate-950 text-slate-400 border border-slate-800/70 hover:text-white"
              }`}
            >
              {ly.label}
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-xs font-mono">
          Nodes: <strong className="text-white">{filteredNodes.length}</strong> | Connections: <strong className="text-cyan-400">{edges.length}</strong>
        </div>
      </div>

      {/* Main Visualizer: Interactive Canvas or Matrix */}
      {viewMode === "canvas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Canvas (2 Cols on lg) */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 relative overflow-hidden min-h-[580px] flex flex-col justify-between shadow-2xl">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

            {/* Column Layer Titles */}
            <div className="grid grid-cols-4 gap-2 mb-4 relative z-10 text-center border-b border-slate-800/80 pb-3">
              <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Layer 1: Reading</div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Layer 2: AI & Learning</div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Layer 3: Execution</div>
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Layer 4: Trust</div>
            </div>

            {/* Nodes Grid Container */}
            <div className="grid grid-cols-4 gap-3 relative z-10 flex-1 my-auto">
              {/* Column 1: Reading */}
              <div className="flex flex-col justify-around space-y-3">
                {nodes.filter((n) => n.layer === "reading").map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeId === node.id;
                  const inActiveTrace = activeScenario?.nodeSequence.includes(node.id);
                  const isCurrentHop = activeScenario?.nodeSequence[scenarioStep] === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                        isCurrentHop
                          ? "bg-cyan-900/60 border-cyan-400 shadow-xl shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400"
                          : isSelected
                          ? "bg-slate-900 border-white/40 shadow-lg scale-102"
                          : inActiveTrace
                          ? "bg-slate-900/90 border-cyan-500/40 shadow-sm"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      {isCurrentHop && (
                        <span className="absolute -top-2 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${node.color}`} />
                        <span className="font-bold text-xs text-white truncate">{node.shortName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{node.role}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {node.status}
                        </span>
                        <span className="text-slate-500">Hop #1</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Column 2: Understanding & Learning */}
              <div className="flex flex-col justify-around space-y-3">
                {nodes.filter((n) => n.layer === "understanding").map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeId === node.id;
                  const inActiveTrace = activeScenario?.nodeSequence.includes(node.id);
                  const isCurrentHop = activeScenario?.nodeSequence[scenarioStep] === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                        isCurrentHop
                          ? "bg-amber-900/60 border-amber-400 shadow-xl shadow-amber-500/30 scale-105 ring-2 ring-amber-400"
                          : isSelected
                          ? "bg-slate-900 border-white/40 shadow-lg scale-102"
                          : inActiveTrace
                          ? "bg-slate-900/90 border-cyan-500/40 shadow-sm"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      {isCurrentHop && (
                        <span className="absolute -top-2 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${node.color}`} />
                        <span className="font-bold text-xs text-white truncate">{node.shortName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{node.role}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {node.status}
                        </span>
                        <span className="text-slate-500">Hop #2</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Column 3: Execution */}
              <div className="flex flex-col justify-around space-y-3">
                {nodes.filter((n) => n.layer === "execution").map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeId === node.id;
                  const inActiveTrace = activeScenario?.nodeSequence.includes(node.id);
                  const isCurrentHop = activeScenario?.nodeSequence[scenarioStep] === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                        isCurrentHop
                          ? "bg-emerald-900/60 border-emerald-400 shadow-xl shadow-emerald-500/30 scale-105 ring-2 ring-emerald-400"
                          : isSelected
                          ? "bg-slate-900 border-white/40 shadow-lg scale-102"
                          : inActiveTrace
                          ? "bg-slate-900/90 border-cyan-500/40 shadow-sm"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      {isCurrentHop && (
                        <span className="absolute -top-2 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${node.color}`} />
                        <span className="font-bold text-xs text-white truncate">{node.shortName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{node.role}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {node.status}
                        </span>
                        <span className="text-slate-500">Hop #3</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Column 4: Trust & Ledger */}
              <div className="flex flex-col justify-around space-y-3">
                {nodes.filter((n) => n.layer === "trust").map((node) => {
                  const Icon = node.icon;
                  const isSelected = selectedNodeId === node.id;
                  const inActiveTrace = activeScenario?.nodeSequence.includes(node.id);
                  const isCurrentHop = activeScenario?.nodeSequence[scenarioStep] === node.id;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none group ${
                        isCurrentHop
                          ? "bg-purple-900/60 border-purple-400 shadow-xl shadow-purple-500/30 scale-105 ring-2 ring-purple-400"
                          : isSelected
                          ? "bg-slate-900 border-white/40 shadow-lg scale-102"
                          : inActiveTrace
                          ? "bg-slate-900/90 border-cyan-500/40 shadow-sm"
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
                      }`}
                    >
                      {isCurrentHop && (
                        <span className="absolute -top-2 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${node.color}`} />
                        <span className="font-bold text-xs text-white truncate">{node.shortName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{node.role}</div>
                      <div className="mt-1.5 flex items-center justify-between text-[9px] font-mono">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {node.status}
                        </span>
                        <span className="text-slate-500">Hop #4</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Distributed Graph Connected: 14 Nodes, 23 Verified Edges</span>
              </span>
              <span className="font-mono text-cyan-400">
                Fail-Safe Redundancy: 100% Guaranteed
              </span>
            </div>
          </div>

          {/* Node Details & Source Inspector Drawer (1 Col) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg bg-slate-900 border border-slate-800 ${selectedNode.color}`}>
                  {selectedNode.icon && <selectedNode.icon className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">{selectedNode.name}</h2>
                  <Badge variant="cyan" className="text-[9px] mt-0.5">
                    {selectedNode.layerLabel}
                  </Badge>
                </div>
              </div>
              <Badge variant="emerald" className="text-[10px]">
                {selectedNode.status}
              </Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/70">
              {selectedNode.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Source Implementation:
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300 truncate">
                {selectedNode.sourceFile}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-semibold text-[11px]">Inbound Data Inputs:</div>
              <div className="space-y-1">
                {selectedNode.inputs.map((inp, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] text-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> {inp}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-slate-400 font-semibold text-[11px]">Outbound Actions & Dispatches:</div>
              <div className="space-y-1">
                {selectedNode.outputs.map((out, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px] text-slate-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {out}
                  </div>
                ))}
              </div>
            </div>

            {selectedNode.failSafeFallback && (
              <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl text-[11px] text-amber-200 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Fail-Safe Mechanism:
                </div>
                <div>{selectedNode.failSafeFallback}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: Connectivity Matrix */}
      {viewMode === "matrix" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-base font-bold text-white">Full System Topology Edge Matrix ({edges.length} Connections)</h2>
            <p className="text-xs text-slate-400">Verified data contracts, trigger dispatches, and circularity proof events.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-2.5">Connection ID</th>
                  <th className="p-2.5">Origin Node (Source)</th>
                  <th className="p-2.5"></th>
                  <th className="p-2.5">Destination Node (Target)</th>
                  <th className="p-2.5">Payload Contract / Data Transferred</th>
                  <th className="p-2.5">Connection Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {edges.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-2.5 font-mono text-cyan-400">{e.id}</td>
                    <td className="p-2.5 font-semibold text-slate-200">{e.source}</td>
                    <td className="p-2.5 text-slate-500"><ArrowRight className="w-3.5 h-3.5" /></td>
                    <td className="p-2.5 font-semibold text-slate-200">{e.target}</td>
                    <td className="p-2.5 text-slate-300 font-mono text-[11px]">{e.label}</td>
                    <td className="p-2.5">
                      <Badge variant={e.type === "trigger" ? "amber" : e.type === "loop" ? "purple" : "emerald"} className="text-[9px]">
                        {e.type.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Mode 3: LangGraph State Machine View */}
      {viewMode === "langgraph" && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-2">
            <h2 className="text-base font-bold text-white">Three-Architecture LangGraph State Machine</h2>
            <p className="text-xs text-slate-400">Multi-Agent StateGraph with Loop & Human-in-the-Loop Admin Escalation (src/lib/langgraph/workflow.ts).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900/80 border border-blue-500/30 p-4 rounded-xl space-y-2">
              <div className="font-bold text-blue-400 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" /> Architecture 1: Reading Agent
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Ingests telemetry via Windows WMI or mobile Telegram bot. Normalizes CPU, temperature, and battery parameters. Triggers offline fallback if host is unbootable.
              </p>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
                Node: readingAgentNode<br />
                State: rawInputChannel, telemetry, offlineFallback
              </div>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/30 p-4 rounded-xl space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Architecture 2: Understanding Agent
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Evaluates symptom and checks for novel/ambiguous faults (short circuit, burnt PCB). If unknown, routes to Admin Bot for human guidance (max 3 loops).
              </p>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
                Node: understandingAgentNode<br />
                State: isNovelOrAmbiguous, escalationId, loopIteration
              </div>
            </div>

            <div className="bg-slate-900/80 border border-emerald-500/30 p-4 rounded-xl space-y-2">
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Architecture 3: Execution Agent
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Fulfills circular verdict: Books ONDC doorstep repair ($45), schedules R2 e-waste recycler ($18.50 credit), or generates modular reuse blueprints (34.8 kg CO2 saved).
              </p>
              <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-slate-400">
                Node: executionAgentNode<br />
                State: actionDispatched, passportHash
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
