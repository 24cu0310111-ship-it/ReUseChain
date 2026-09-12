"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileCode, CheckCircle, Laptop, ArrowRight } from "lucide-react";

export default function DeviceIntakePage() {
  const router = useRouter();

  const [assetTag, setAssetTag] = useState("ASSET-0512");
  const [make, setMake] = useState("Dell Inc.");
  const [model, setModel] = useState("Latitude 5430");
  const [ageMonths, setAgeMonths] = useState("28");
  const [organisation, setOrganisation] = useState("Hindustan University - Computing Labs");
  const [currentRole, setCurrentRole] = useState("Student Lab Laptop");
  const [telemetryJson, setTelemetryJson] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sampleReport = {
    collectorVersion: "1.0.4",
    reportedAt: new Date().toISOString(),
    components: [
      {
        type: "battery",
        model: "Dell 4-Cell 58Wh",
        designCapacityWh: 58.0,
        fullChargeCapacityWh: 33.2,
        cycleCount: 512,
        healthPercent: 57.2,
        source: "Windows.Power.BatteryReport",
      },
      {
        type: "ssd",
        model: "Kioxia 512GB NVMe M.2",
        healthPercent: 89.0,
        smartWearPercent: 11,
        source: "Storage.SMART.Report",
      },
      {
        type: "ram",
        model: "16GB DDR4-3200",
        healthPercent: 100.0,
        errors: 0,
      },
      {
        type: "display",
        model: "14.0 FHD Anti-Glare",
        healthPercent: 96.0,
      },
    ],
  };

  const handleLoadSample = () => {
    setTelemetryJson(JSON.stringify(sampleReport, null, 2));
    setAssetTag(`ASSET-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setStatusMessage(null);

      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetTag,
          make,
          model,
          ageMonths,
          organisation,
          currentRole,
          telemetryJson: telemetryJson ? JSON.parse(telemetryJson) : null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage(`Successfully enrolled ${assetTag} with ${json.componentsCount} components!`);
        setTimeout(() => {
          router.push(`/devices/${assetTag}`);
        }, 1200);
      } else {
        setStatusMessage(`Error: ${json.error}`);
      }
    } catch (err: any) {
      setStatusMessage(`Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "850px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Device & Telemetry Intake
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Enroll managed fleet endpoints by manual registration or by uploading normalized Windows diagnostic telemetry reports.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <h2 style={{ fontSize: "1.15rem", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Laptop size={20} color="#38bdf8" /> Asset Hardware Identification
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Asset Tag / Identifier</label>
            <input 
              type="text" 
              className="form-input" 
              value={assetTag} 
              onChange={(e) => setAssetTag(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hardware Manufacturer</label>
            <input 
              type="text" 
              className="form-input" 
              value={make} 
              onChange={(e) => setMake(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Device Model Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={model} 
              onChange={(e) => setModel(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Service Age (Months)</label>
            <input 
              type="number" 
              className="form-input" 
              value={ageMonths} 
              onChange={(e) => setAgeMonths(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Organisation / Department</label>
            <input 
              type="text" 
              className="form-input" 
              value={organisation} 
              onChange={(e) => setOrganisation(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Work Role</label>
            <input 
              type="text" 
              className="form-input" 
              value={currentRole} 
              onChange={(e) => setCurrentRole(e.target.value)} 
            />
          </div>
        </div>

        {/* Telemetry Upload Zone */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Diagnostic Telemetry Report (JSON / Collector Output)
            </label>
            <button 
              type="button" 
              onClick={handleLoadSample} 
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <FileCode size={14} color="#06b6d4" /> Load Sample Telemetry
            </button>
          </div>

          <textarea
            className="form-textarea"
            rows={8}
            placeholder="Paste normalized diagnostic JSON payload or click 'Load Sample Telemetry'..."
            value={telemetryJson}
            onChange={(e) => setTelemetryJson(e.target.value)}
            style={{ width: "100%", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}
          />
        </div>

        {statusMessage && (
          <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", fontSize: "0.875rem" }}>
            {statusMessage}
          </div>
        )}

        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? "Processing Intake..." : "Enroll Asset into ReUseChain"} &rarr;
          </button>
        </div>
      </form>
    </div>
  );
}
