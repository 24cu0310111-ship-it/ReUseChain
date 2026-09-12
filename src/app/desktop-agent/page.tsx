"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Laptop, 
  Cpu, 
  Battery, 
  HardDrive, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Truck, 
  Zap, 
  Binary, 
  ArrowRight,
  Database,
  Search,
  Crosshair,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DesktopAgentPage() {
  const [selectedAsset, setSelectedAsset] = useState("ASSET-0142");
  const [scenario, setScenario] = useState<"thermal" | "battery" | "storage" | "keyboard" | "edp">("thermal");
  const [scanning, setScanning] = useState(false);
  const [dossier, setDossier] = useState<any>(null);
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRunDiagnosticScan = async (overrideScenario?: string) => {
    const sc = overrideScenario || scenario;
    setScanning(true);
    setToastMsg(null);

    let payload: any = {
      assetTag: selectedAsset,
      sourceOS: "Windows 11 Enterprise (Build 22631.3880)",
    };

    if (sc === "thermal") {
      payload.cpuPackageTempC = 64.0;
      payload.cpuHotspotTempC = 92.5;
      payload.cpuThrottlingProchot = true;
    } else if (sc === "battery") {
      payload.batteryDesignCapacityWh = 60.0;
      payload.batteryFullChargeCapacityWh = 31.2;
      payload.batteryCellImbalanceMv = 210.0;
    } else if (sc === "storage") {
      payload.nvmeWearPercent = 94.0;
      payload.nvmeReallocatedSectors = 128;
      payload.nvmeEccErrors = 48;
    } else if (sc === "keyboard") {
      payload.keyboardDeadKeys = ["W", "E", "Spacebar"];
    } else if (sc === "edp") {
      payload.displayEdpLinkErrors = 12;
    }

    try {
      const res = await fetch("/api/diagnostics/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setDossier(data.rootCauseDossier);
        setDbInfo(data.databasePersistence);
        setToastMsg(`Diagnostic Complete: Isolated specific defect in '${data.rootCauseDossier.specificFailingComponent}'.`);
      }
    } catch (e: any) {
      console.error("External diagnostic error:", e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue" className="gap-1 text-[10px]">
              <Laptop size={11} /> External Desktop & Laptop Agent
            </Badge>
            <Badge variant="emerald" className="text-[10px]">
              Active Causal Inference Engine
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Crosshair size={24} className="text-rose-400" /> Deep Causal Hardware/Software Diagnostic Engine
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Unlike static diagnostic tools that merely output raw system statistics, this agent performs deep physical and functional interrogation to isolate the <strong>specific failing component</strong> and <strong>probable root cause</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/assistant">
            <Button variant="outline" className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1.5 text-xs">
              <Truck size={14} /> Open ONDC Doorstep Booking
            </Button>
          </Link>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Grid: Control Panel (4 Cols) & Root Cause Dossier (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Rig & Scan Trigger */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-t-4 border-t-rose-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity size={18} className="text-rose-400" /> Diagnostic Trigger Rig
              </CardTitle>
              <CardDescription>
                Execute automated hardware sensor interrogation on the target endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Asset:</label>
                <select
                  className="form-select text-xs w-full py-1.5 px-2.5"
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                >
                  <option value="ASSET-0142">ASSET-0142 (Dell Latitude 5420)</option>
                  <option value="ASSET-9901">ASSET-9901 (Dell Inspiron 15 3520)</option>
                  <option value="ASSET-0315">ASSET-0315 (HP ProBook 450 G8)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Select Failure Investigation Domain:</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setScenario("thermal");
                      handleRunDiagnosticScan("thermal");
                    }}
                    className={`p-3 rounded-lg text-left text-xs border transition-all ${
                      scenario === "thermal"
                        ? "bg-rose-950/50 border-rose-500/50 text-rose-200"
                        : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={14} className="text-rose-400" /> CPU Thermal TIM Hotspot Delta
                      </span>
                      <span className="text-[10px] text-rose-400 font-mono">Δ 28.5°C</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Inspects core-to-core hotspot divergence and PROCHOT throttling flags.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setScenario("battery");
                      handleRunDiagnosticScan("battery");
                    }}
                    className={`p-3 rounded-lg text-left text-xs border transition-all ${
                      scenario === "battery"
                        ? "bg-amber-950/50 border-amber-500/50 text-amber-200"
                        : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Battery size={14} className="text-amber-400" /> Battery Cell Voltage Sag
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">Δ 210 mV</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Inspects internal impedance escalation and premature cutoff at 35% state-of-charge.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setScenario("storage");
                      handleRunDiagnosticScan("storage");
                    }}
                    className={`p-3 rounded-lg text-left text-xs border transition-all ${
                      scenario === "storage"
                        ? "bg-sky-950/50 border-sky-500/50 text-sky-200"
                        : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <HardDrive size={14} className="text-sky-400" /> NVMe NAND Write Exhaustion
                      </span>
                      <span className="text-[10px] text-sky-400 font-mono">94% Wear</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Interrogates SMART attribute 05 reallocated blocks and uncorrectable ECC retries.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setScenario("keyboard");
                      handleRunDiagnosticScan("keyboard");
                    }}
                    className={`p-3 rounded-lg text-left text-xs border transition-all ${
                      scenario === "keyboard"
                        ? "bg-purple-950/50 border-purple-500/50 text-purple-200"
                        : "bg-slate-800/60 border-white/5 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <div className="font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} className="text-purple-400" /> Keyboard Matrix Bus Fracture
                      </span>
                      <span className="text-[10px] text-purple-400 font-mono">Row 3 Open</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Tests flex ribbon circuit continuity and pin 18 micro-fractures.
                    </p>
                  </button>
                </div>
              </div>

              <Button
                onClick={() => handleRunDiagnosticScan()}
                disabled={scanning}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs gap-2"
              >
                <Search size={14} />
                {scanning ? "Executing Deep Sensor Scan..." : "Execute Causal Root-Cause Scan"}
              </Button>

              {/* Terminal CLI hint */}
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="text-cyan-400 font-semibold flex items-center gap-1">
                  <Laptop size={12} /> Run via Standalone Desktop Terminal:
                </div>
                <div className="text-slate-300 bg-slate-900/90 p-1.5 rounded text-[10px] break-all select-all">
                  powershell -ExecutionPolicy Bypass -File scripts\ReUseChain-DesktopAgent.ps1 -Scenario {scenario}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Root Cause Diagnostic Dossier */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" /> Causal Diagnostic Output
                </CardTitle>
                <Badge variant={dossier?.failureSeverity === "critical" ? "rose" : "amber"}>
                  {dossier ? `Severity: ${dossier.failureSeverity.toUpperCase()}` : "Awaiting Scan"}
                </Badge>
              </div>
              <CardDescription>
                Specific failing component, underlying failure physics, evidence chain, and database persistence.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dossier ? (
                <div className="space-y-4">
                  {/* Specific Failing Component Callout */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/40 space-y-2">
                    <div className="text-[11px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Crosshair size={13} /> Specific Failing Component Identified:
                    </div>
                    <div className="text-base font-black text-white">
                      {dossier.specificFailingComponent}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      <strong className="text-white">Probable Root Cause:</strong> {dossier.probableRootCause}
                    </p>
                  </div>

                  {/* Physics of Failure & Science Explanation */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-1.5 text-xs">
                    <strong className="text-white block font-semibold flex items-center gap-1.5">
                      <FileText size={14} className="text-cyan-400" /> Underlying Degradation Physics:
                    </strong>
                    <p className="text-slate-300 leading-relaxed">
                      {dossier.physicsOfFailure}
                    </p>
                  </div>

                  {/* Evidence Chain vs Baseline */}
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2 text-xs">
                    <strong className="text-white block font-semibold flex items-center gap-1.5">
                      <Activity size={14} className="text-emerald-400" /> Concrete Evidence Chain:
                    </strong>
                    <ul className="space-y-1.5 text-slate-300 pl-4 list-disc">
                      {dossier.evidenceChain?.map((item: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          <span className="font-mono text-cyan-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Database Persistence & Embeddings Card */}
                  {dbInfo && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-purple-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-purple-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Database size={13} /> Database Media & Embedding Storage Active
                        </span>
                        <Badge variant="purple" className="text-[10px]">
                          <Binary size={10} className="mr-1" /> {dbInfo.vectorDimension}D Vector Stored
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                        <div>Media Asset ID: <span className="text-white">{dbInfo.mediaAssetId?.slice(0, 16)}...</span></div>
                        <div>SHA-256 Checksum: <span className="text-cyan-400">{dbInfo.checksumSha256?.slice(0, 16)}...</span></div>
                        <div className="sm:col-span-2">
                          Circularity Passport Sealed: <span className="text-emerald-400">{dbInfo.passportHash?.slice(0, 20)}...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action & ONDC Doorstep Dispatch */}
                  <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Prescribed Action:</span>
                      <strong className="text-emerald-400 font-semibold">{dossier.recommendedService}</strong>
                    </div>

                    <Link href="/assistant">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 text-xs">
                        <Truck size={14} /> Book ONDC Doorstep Repair (${dossier.estimatedCostUSD?.toFixed(2)})
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-12 rounded-xl bg-slate-800/30 border border-white/5 text-center text-slate-500 text-xs space-y-2">
                  <Crosshair size={32} className="mx-auto text-slate-600 animate-pulse" />
                  <p>Select a failure investigation domain on the left and click &apos;Execute Causal Root-Cause Scan&apos;.</p>
                  <p className="text-[11px] text-slate-600">The agent will isolate the exact micro-component and explain the physical fault causality.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
