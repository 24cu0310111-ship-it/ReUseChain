"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Laptop, 
  Cpu, 
  Wrench, 
  Recycle, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  FastForward,
  Clock,
  CheckCircle2,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FleetDashboard() {
  const [devices, setDevices] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluatingId, setEvaluatingId] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const fetchFleet = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/devices");
      const json = await res.json();
      if (json.success) {
        setDevices(json.data);
        setMetrics(json.metrics);
      }
    } catch (e) {
      console.error("Failed to load fleet:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  const triggerEvaluation = async (deviceId: string) => {
    try {
      setEvaluatingId(deviceId);
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchFleet();
      }
    } catch (e) {
      console.error("Evaluation trigger failed:", e);
    } finally {
      setEvaluatingId(null);
    }
  };

  const handleSimulateDay = async () => {
    try {
      setSimulating(true);
      setSimulationToast(null);
      const res = await fetch("/api/simulate-day", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSimulationToast(
          json.notifications.length > 0 
            ? `Day advanced! Anomaly detected: ${json.notifications[0]}` 
            : json.message
        );
        await fetchFleet();
      }
    } catch (e: any) {
      setSimulationToast(`Simulation error: ${e.message}`);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Fleet Circularity Governance
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Continuous hardware health monitoring and governed decision loop powered by an <strong>Autonomous Lifecycle Decision Engine</strong>. Prioritizing precision repair, internal redeployment, and certified recycling strictly as a verified last resort.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button 
            onClick={handleSimulateDay} 
            disabled={simulating}
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
          >
            <FastForward size={15} /> {simulating ? "Simulating Telemetry..." : "Simulate Fleet Day +1"}
          </Button>
          <Link href="/intake">
            <Button variant="default">+ Enroll Device</Button>
          </Link>
          <Link href="/simulator">
            <Button variant="secondary">4-Way Simulator</Button>
          </Link>
        </div>
      </div>

      {simulationToast && (
        <div className="p-3.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} />
            <span>{simulationToast}</span>
          </div>
          <button onClick={() => setSimulationToast(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Metrics Grid */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Monitored Endpoints</span>
            <Laptop size={16} className="text-sky-400" />
          </div>
          <div className="metric-value">{metrics?.totalDevices ?? "—"}</div>
          <div className="metric-footer text-emerald-400">
            <span>100% Monitored • {metrics?.totalComponents ?? "—"} Hardware Sub-assemblies</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Flagged for Afterlife</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <div className="metric-value text-amber-400">
            {metrics?.flaggedCount ?? "—"}
          </div>
          <div className="metric-footer">
            <span>Requires autonomous triage</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Circularity Yield</span>
            <Recycle size={16} className="text-emerald-400" />
          </div>
          <div className="metric-value text-emerald-400">
            {metrics ? `${((((metrics.circularityBreakdown?.repair || 0) + (metrics.circularityBreakdown?.reuse || 0)) / (metrics.totalDevices || 1)) * 100).toFixed(0)}%` : "—"}
          </div>
          <div className="metric-footer">
            <span>Repair: {metrics?.circularityBreakdown?.repair || 0} | Reuse: {metrics?.circularityBreakdown?.reuse || 0}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Governance Queue</span>
            <Clock size={16} className="text-purple-400" />
          </div>
          <div className="metric-value text-purple-400">
            {metrics?.pendingApprovalsCount ?? "—"}
          </div>
          <div className="metric-footer">
            <Link href="/approvals" className="text-cyan-400 underline hover:text-cyan-300">
              Review queue &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Iconic Test Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={20} className="text-cyan-400" />
          <h2 className="text-lg font-bold">Enterprise Operational Scenarios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Case A */}
          <Card className="border-l-4 border-l-emerald-500 hover:border-white/20">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <Badge variant="emerald">Case A: Repair</Badge>
                <span className="text-xs font-mono text-slate-400">ASSET-0142</span>
              </div>
              <CardTitle className="text-sm font-semibold mt-1">Dell Latitude 5420</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-slate-400">
                Battery 51.5% with healthy SSD/RAM. Passes 40% cap ($73 quote vs $128 cap).
              </p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-medium text-amber-400">Tier: AMBER</span>
                <Link href="/devices/ASSET-0142">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">Inspect &rarr;</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Case B */}
          <Card className="border-l-4 border-l-amber-500 hover:border-white/20">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <Badge variant="amber">Case B: Cross-Purpose</Badge>
                <span className="text-xs font-mono text-slate-400">ASSET-0289</span>
              </div>
              <CardTitle className="text-sm font-semibold mt-1">Lenovo ThinkPad T14</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-slate-400">
                Shattered display panel (repair &gt;40%). Harvests SSD & RAM to spares; logic board to signage.
              </p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-medium text-amber-400">Tier: AMBER</span>
                <Link href="/devices/ASSET-0289">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">Inspect &rarr;</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Case C */}
          <Card className="border-l-4 border-l-rose-500 hover:border-white/20">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <Badge variant="rose">Case C: Blocked Recycle</Badge>
                <span className="text-xs font-mono text-slate-400">ASSET-0315</span>
              </div>
              <CardTitle className="text-sm font-semibold mt-1">HP ProBook 450 G8</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-slate-400">
                Dead motherboard 19V rail short. Hard Block: locked until NIST 800-88 cryptographic wipe proof is uploaded.
              </p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-medium text-rose-400">Tier: RED (Blocked)</span>
                <Link href="/devices/ASSET-0315">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">Inspect &rarr;</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Case D */}
          <Card className="border-l-4 border-l-cyan-500 hover:border-white/20">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <Badge variant="default">Case D: Predictive</Badge>
                <span className="text-xs font-mono text-slate-400">ASSET-0477</span>
              </div>
              <CardTitle className="text-sm font-semibold mt-1">MacBook Air M1</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <p className="text-xs text-slate-400">
                Time-series engine flags 3.55x accelerated battery wear velocity. Triggers preventative maintenance checkup.
              </p>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-medium text-cyan-400">Velocity: 3.55x</span>
                <Link href="/devices/ASSET-0477">
                  <Button size="sm" variant="secondary" className="h-7 text-xs">Inspect &rarr;</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fleet Inventory Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base">Monitored Fleet Hardware Inventory</CardTitle>
            <CardDescription>
              Telemetry synchronization with immutable Circularity Passport™ links
            </CardDescription>
          </div>
          <Button onClick={fetchFleet} variant="outline" size="sm">
            Refresh
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Loading fleet endpoints...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Device Model</th>
                    <th>Organization & Role</th>
                    <th>Age</th>
                    <th>Component Breakdown</th>
                    <th>Autonomous Recommendation</th>
                    <th>Risk Tier</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => {
                    const latestDecision = device.decisionCases[0];
                    const hasFlag = device.lifecycleStatus === "flagged" || device.lifecycleStatus === "quarantine";

                    return (
                      <tr key={device.id}>
                        <td className="font-mono font-semibold text-cyan-400">
                          <Link href={`/devices/${device.assetTag}`} className="hover:underline">
                            {device.assetTag}
                          </Link>
                        </td>
                        <td>
                          <div className="font-semibold text-slate-100">{device.model}</div>
                          <div className="text-xs text-slate-400">{device.make}</div>
                        </td>
                        <td>
                          <div className="text-slate-200">{device.currentRole || "General Workstation"}</div>
                          <div className="text-xs text-slate-400">{device.organisation}</div>
                        </td>
                        <td className="text-slate-300">{device.ageMonths} mos</td>
                        <td>
                          <div className="flex gap-1 flex-wrap">
                            {device.components.map((c: any) => {
                              let variant: "emerald" | "amber" | "rose" = "emerald";
                              if (c.healthPercent < 40 || c.currentStatus === "failed") variant = "rose";
                              else if (c.healthPercent < 80) variant = "amber";

                              return (
                                <Badge key={c.id} variant={variant} className="text-[10px] px-1.5 py-0">
                                  {c.type}: {c.healthPercent.toFixed(0)}%
                                </Badge>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          {latestDecision ? (
                            <div>
                              <span className="font-semibold capitalize text-slate-100">
                                {latestDecision.recommendedPath.replace(/_/g, " ")}
                              </span>
                              <div className="text-[11px] text-slate-400">
                                Confidence: {(latestDecision.confidenceScore * 100).toFixed(0)}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs">Pending Triage</span>
                          )}
                        </td>
                        <td>
                          {latestDecision ? (
                            <Badge variant={latestDecision.riskTier === "green" ? "emerald" : latestDecision.riskTier === "amber" ? "amber" : "rose"}>
                              {latestDecision.riskTier}
                            </Badge>
                          ) : hasFlag ? (
                            <Badge variant="amber">Action Needed</Badge>
                          ) : (
                            <Badge variant="emerald">Green</Badge>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => triggerEvaluation(device.id)}
                              disabled={evaluatingId === device.id}
                              size="sm"
                              variant="default"
                              className="h-8 text-xs bg-sky-600 hover:bg-sky-500"
                            >
                              {evaluatingId === device.id ? "Analyzing..." : "Triage"}
                            </Button>
                            <Link href={`/devices/${device.assetTag}`}>
                              <Button size="sm" variant="secondary" className="h-8 text-xs">
                                View
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
