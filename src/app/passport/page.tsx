"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Hash, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  FileCheck2 
} from "lucide-react";

export default function PassportPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventRes, devRes] = await Promise.all([
          fetch(`/api/passport${selectedDevice ? `?deviceId=${selectedDevice}` : ""}`),
          fetch("/api/devices"),
        ]);
        const eventJson = await eventRes.json();
        const devJson = await devRes.json();

        if (eventJson.success) setEvents(eventJson.data);
        if (devJson.success) setDevices(devJson.data);
      } catch (e) {
        console.error("Failed to load passport:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDevice]);

  const getCategoryBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "identity": return "badge-cyan";
      case "health": return "badge-amber";
      case "decision": return "badge-purple";
      case "control": return "badge-green";
      case "custody": return "badge-repair";
      case "verification": return "badge-emerald";
      default: return "badge-secondary";
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
            Circularity Passport™ Audit Ledger
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "700px" }}>
            Cryptographically sealed, append-only lifecycle event stream. Every intake report, diagnostic measurement, policy evaluation, human approval, and custody transfer is immutably anchored.
          </p>
        </div>

        {/* Device Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            style={{ width: "240px", fontSize: "0.85rem" }}
            aria-label="Filter Passport by Device"
          >
            <option value="">All Fleet Devices</option>
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.assetTag} ({d.model})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
          Loading cryptographic event stream...
        </div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          No passport events logged yet.
        </div>
      ) : (
        <div className="timeline">
          {events.map((ev) => (
            <div key={ev.id} className="timeline-item">
              <div className="timeline-dot">
                <ShieldCheck size={12} color="#06b6d4" />
              </div>

              <div className="timeline-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className={`badge ${getCategoryBadge(ev.eventCategory)}`}>
                      {ev.eventCategory}
                    </span>
                    <strong style={{ fontSize: "0.95rem" }}>{ev.eventType}</strong>
                    {ev.device && (
                      <Link href={`/devices/${ev.device.assetTag}`} style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", textDecoration: "underline" }}>
                        ({ev.device.assetTag})
                      </Link>
                    )}
                  </div>

                  <span className="timeline-time">
                    {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                  {ev.description}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", flexWrap: "wrap", gap: "0.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.04)", paddingTop: "0.5rem" }}>
                  <div>
                    Actor: <strong style={{ color: "var(--text-primary)" }}>{ev.actor}</strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <Hash size={12} color="var(--accent-cyan)" />
                    <span className="timeline-hash">
                      {ev.eventHash ? ev.eventHash.slice(0, 24) + "..." : "0x00..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
