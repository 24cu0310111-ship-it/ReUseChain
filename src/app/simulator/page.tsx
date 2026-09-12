"use client";

import { useState } from "react";
import { 
  Sliders, 
  Wrench, 
  Layers, 
  Recycle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Sparkles 
} from "lucide-react";
import { calculateRepairabilityScore, evaluateEconomicViability, evaluatePolicyTiers } from "@/lib/policy-engine";

export default function SimulatorPage() {
  // Simulator state
  const [componentType, setComponentType] = useState("battery");
  const [healthPercent, setHealthPercent] = useState(52);
  const [partCost, setPartCost] = useState(48);
  const [labourCost, setLabourCost] = useState(25);
  const [refurbValue, setRefurbValue] = useState(300);
  const [partAvailable, setPartAvailable] = useState(true);
  const [manualAvailable, setManualAvailable] = useState(true);
  const [isReplaceable, setIsReplaceable] = useState(true);
  const [wipeVerified, setWipeVerified] = useState(false);
  const [isSwollen, setIsSwollen] = useState(false);

  // Compute live scores
  const totalRepairCost = partCost + labourCost;
  const repairScore = calculateRepairabilityScore({
    partAvailable,
    manualAvailable,
    isReplaceable,
    hasPairingRestriction: false,
    technicianSkillApproved: true,
  });

  const economicViability = evaluateEconomicViability({
    repairTotalCost: totalRepairCost,
    fairMarketValue: refurbValue,
    predictedExtendedLifeMonths: 24,
    repairabilityScore: repairScore.score,
  });

  // Evaluate candidate path
  let recommended = "repair";
  let why = "";

  if (isSwollen) {
    recommended = "quarantine";
    why = "Physical chemical swelling detected. Hazardous: immediate containment required.";
  } else if (repairScore.isViable && economicViability.isEconomicallyViable && healthPercent > 30) {
    recommended = "repair";
    why = `Repair is viable: Total cost ($${totalRepairCost}) is ${((totalRepairCost / refurbValue) * 100).toFixed(0)}% of value (<= 40% cap), repair score is ${repairScore.score}.`;
  } else if (componentType === "display" || healthPercent > 15) {
    recommended = "cross_purpose_reuse";
    why = "Repair exceeds economic cap. Intact secondary sub-components qualify for harvesting into internal IT spares.";
  } else {
    recommended = "recycle";
    why = "Both repair and reuse paths are empirically non-viable. E-waste recycling required.";
  }

  const policyAudit = evaluatePolicyTiers({
    path: recommended === "quarantine" ? "recycle" : (recommended as any),
    componentType,
    totalCost: totalRepairCost,
    wipeVerified,
    recyclerCertified: true,
    isSwollenOrHazardous: isSwollen,
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Interactive 4-Way Decision Simulator
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Simulate the governed decision loop by adjusting component wear, parts pricing, and compliance gates in real time.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: "1.5rem" }}>
        {/* Left: Interactive Controls */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sliders size={18} color="#38bdf8" /> Scenario Parameters
          </h2>

          <div className="form-group">
            <label className="form-label">Component Category</label>
            <select 
              className="form-select"
              value={componentType} 
              onChange={(e) => setComponentType(e.target.value)}
            >
              <option value="battery">Battery Pack</option>
              <option value="ssd">NVMe SSD Storage</option>
              <option value="ram">DDR RAM Module</option>
              <option value="display">Display Panel Assembly</option>
              <option value="motherboard">System Board / CPU</option>
            </select>
          </div>

          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <label className="form-label">Component Health / Capacity</label>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--accent-cyan)" }}>
                {healthPercent}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={healthPercent} 
              onChange={(e) => setHealthPercent(parseInt(e.target.value))} 
              style={{ width: "100%", accentColor: "var(--accent-cyan)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div className="form-group">
              <label className="form-label">OEM Part Cost ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={partCost} 
                onChange={(e) => setPartCost(parseFloat(e.target.value) || 0)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Labour Quote ($)</label>
              <input 
                type="number" 
                className="form-input" 
                value={labourCost} 
                onChange={(e) => setLabourCost(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Refurbished Market Value ($)</label>
            <input 
              type="number" 
              className="form-input" 
              value={refurbValue} 
              onChange={(e) => setRefurbValue(parseFloat(e.target.value) || 1)} 
            />
          </div>

          {/* Compliance Toggles */}
          <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={partAvailable} 
                onChange={(e) => setPartAvailable(e.target.checked)} 
              />
              Compatible Part Available in Catalogue
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={wipeVerified} 
                onChange={(e) => setWipeVerified(e.target.checked)} 
              />
              Cryptographic NIST 800-88 Data Sanitization Certificate Uploaded
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", color: isSwollen ? "var(--accent-rose)" : "inherit" }}>
              <input 
                type="checkbox" 
                checked={isSwollen} 
                onChange={(e) => setIsSwollen(e.target.checked)} 
              />
              Physical Swelling / Chemical Defect Present
            </label>
          </div>
        </div>

        {/* Right: Live Waterfall Outcome */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Winner Banner */}
          <div 
            className="card"
            style={{ 
              borderLeft: `5px solid ${policyAudit.riskTier === "green" ? "var(--accent-emerald)" : policyAudit.riskTier === "amber" ? "var(--accent-amber)" : "var(--accent-rose)"}` 
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
              <span className={`badge badge-${policyAudit.riskTier}`}>
                Policy Risk Tier: {policyAudit.riskTier}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Simulated Result</span>
            </div>
            <h2 style={{ fontSize: "1.4rem", fontWeight: "800", textTransform: "capitalize", marginBottom: "0.4rem" }}>
              Outcome: {recommended.replace(/_/g, " ")}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {why}
            </p>
            {policyAudit.blockers.length > 0 && (
              <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "var(--accent-rose-glow)", border: "1px solid rgba(244, 63, 94, 0.3)", borderRadius: "6px", color: "#fb7185", fontSize: "0.8rem" }}>
                <strong>Governance Blocker:</strong> {policyAudit.blockers[0]}
              </div>
            )}
          </div>

          {/* 4 Path Breakdown Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Path 1: Repair */}
            <div className="card" style={{ padding: "1rem", opacity: recommended === "repair" ? 1 : 0.65 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", color: "var(--accent-emerald)", fontWeight: "700", fontSize: "0.85rem" }}>
                <Wrench size={16} /> 1. Precision Repair
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Score: <strong>{repairScore.score} / 1.0</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Cost: <strong>${totalRepairCost}</strong> (Cap: ${(refurbValue * 0.4).toFixed(0)})
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: economicViability.isEconomicallyViable ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                {economicViability.isEconomicallyViable ? "✓ Passes Viability Cap" : "✗ Exceeds 40% Cap"}
              </div>
            </div>

            {/* Path 2: Same Role */}
            <div className="card" style={{ padding: "1rem", opacity: recommended === "same_role_reuse" ? 1 : 0.65 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", color: "var(--accent-cyan)", fontWeight: "700", fontSize: "0.85rem" }}>
                <Layers size={16} /> 2. Same-Role Reuse
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Target: <strong>Campus Kiosk / Lab</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Prereq: Hardware Functional
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: healthPercent >= 70 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                {healthPercent >= 70 ? "✓ Eligible for Kiosks" : "⚠ Sub-optimal Specs"}
              </div>
            </div>

            {/* Path 3: Cross Purpose */}
            <div className="card" style={{ padding: "1rem", opacity: recommended === "cross_purpose_reuse" ? 1 : 0.65 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", color: "var(--accent-amber)", fontWeight: "700", fontSize: "0.85rem" }}>
                <Sliders size={16} /> 3. Cross-Purpose
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Target: <strong>IT Spares Pool</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Harvest: SSD, Memory, Mobo
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: isSwollen ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                {isSwollen ? "✗ Blocked: Swollen" : "✓ Permitted by Policy"}
              </div>
            </div>

            {/* Path 4: Recycle */}
            <div className="card" style={{ padding: "1rem", opacity: recommended === "recycle" ? 1 : 0.65 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", color: "var(--accent-rose)", fontWeight: "700", fontSize: "0.85rem" }}>
                <Recycle size={16} /> 4. Certified Recycle
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Target: <strong>R2v3 Recycler</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Wipe Proof: <strong>{wipeVerified ? "Verified" : "Missing"}</strong>
              </div>
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: wipeVerified ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                {wipeVerified ? "✓ Unlocked (Proof present)" : "✗ RED BLOCK: Missing Wipe"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
