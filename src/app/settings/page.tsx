"use client";

import { useEffect, useState } from "react";
import { Sliders, Shield, DollarSign, CheckCircle2, Lock, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    repairMode: "draft_and_assist",
    repairAutoLimitUSD: 50.0,
    sameRoleReuseMode: "auto_within_policy",
    crossPurposeReuseMode: "draft_and_assist",
    recycleMode: "auto_within_policy",
    requireWipeProof: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success && json.data) {
        setSettings({
          repairMode: json.data.repairMode,
          repairAutoLimitUSD: json.data.repairAutoLimitUSD,
          sameRoleReuseMode: json.data.sameRoleReuseMode,
          crossPurposeReuseMode: json.data.crossPurposeReuseMode,
          recycleMode: json.data.recycleMode,
          requireWipeProof: json.data.requireWipeProof,
        });
      }
    } catch (e) {
      console.error("Failed to fetch settings:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setStatusMessage(null);
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMessage("Autonomy guardrails successfully updated and active.");
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Sliders size={26} className="text-cyan-400" /> Autonomy Guardrails & Policy Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure independent automation levels across afterlife paths. Enforce Green/Amber/Red boundary tiers and spending caps server-side.
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} variant="emerald" className="gap-2">
          <Save size={16} /> {saving ? "Saving..." : "Save Guardrails"}
        </Button>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
          ✓ {statusMessage}
        </div>
      )}

      {/* Autonomy Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Repair Autonomy */}
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Path 1: Precision Repair</CardTitle>
              <Badge variant="emerald">Repair Mode</Badge>
            </div>
            <CardDescription>
              Governs automated drafting vs automatic dispatch of replacement parts and labour quotes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Automation Tier Setting
              </label>
              <select
                className="form-select w-full"
                value={settings.repairMode}
                onChange={(e) => setSettings({ ...settings, repairMode: e.target.value })}
              >
                <option value="advisory">Advisory (Recommendation Only)</option>
                <option value="draft_and_assist">Draft & Assist (Creates Draft Work Order)</option>
                <option value="auto_within_policy">Auto within Policy (Executes Under Cap)</option>
                <option value="full_autonomy">Full Autonomy within Guardrails</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Automatic Spending Threshold ($ USD)
              </label>
              <input
                type="number"
                className="form-input w-full"
                value={settings.repairAutoLimitUSD}
                onChange={(e) => setSettings({ ...settings, repairAutoLimitUSD: parseFloat(e.target.value) || 0 })}
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Repairs exceeding this limit trigger an AMBER boundary requiring human sign-off.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2. Same-Role Reuse */}
        <Card className="border-t-4 border-t-cyan-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Path 2A: Same-Role Reuse</CardTitle>
              <Badge variant="default">Kiosk / Lab</Badge>
            </div>
            <CardDescription>
              Governs internal reassignment of devices to secondary educational and kiosk roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Automation Tier Setting
              </label>
              <select
                className="form-select w-full"
                value={settings.sameRoleReuseMode}
                onChange={(e) => setSettings({ ...settings, sameRoleReuseMode: e.target.value })}
              >
                <option value="advisory">Advisory (Recommendation Only)</option>
                <option value="draft_and_assist">Draft & Assist (Requires Tech Review)</option>
                <option value="auto_within_policy">Auto within Policy (Auto-Reallocates)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 3. Cross-Purpose Reuse */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Path 2B: Cross-Purpose Harvesting</CardTitle>
              <Badge variant="amber">Spares Pool</Badge>
            </div>
            <CardDescription>
              Governs component harvesting (SSD, RAM, logic board) for active fleet maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Automation Tier Setting
              </label>
              <select
                className="form-select w-full"
                value={settings.crossPurposeReuseMode}
                onChange={(e) => setSettings({ ...settings, crossPurposeReuseMode: e.target.value })}
              >
                <option value="draft_and_assist">Draft & Assist (Requires Technical Sign-off)</option>
                <option value="auto_within_policy">Auto within Policy (Auto-Allocates Spares)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* 4. Recycling Governance */}
        <Card className="border-t-4 border-t-rose-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Path 3: Certified Recycling</CardTitle>
              <Badge variant="rose">Last Resort</Badge>
            </div>
            <CardDescription>
              Hard guardrail: recycling is locked until repair and reuse are proven non-viable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Automation Mode
              </label>
              <select
                className="form-select w-full"
                value={settings.recycleMode}
                onChange={(e) => setSettings({ ...settings, recycleMode: e.target.value })}
              >
                <option value="draft_and_assist">Draft & Assist (Asset Manager Sign-off)</option>
                <option value="auto_within_policy">Auto within Policy (Certified Partners Only)</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireWipeProof}
                  onChange={(e) => setSettings({ ...settings, requireWipeProof: e.target.checked })}
                  className="rounded text-cyan-500"
                />
                Enforce Mandatory Cryptographic NIST 800-88 Wipe Certificate
              </label>
              <span className="text-[11px] text-rose-400 block mt-1">
                Strict Red Boundary: If unchecked, recycling can proceed without cryptographic proof (NOT RECOMMENDED).
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
