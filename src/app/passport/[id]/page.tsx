"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShieldCheck, Hash, ArrowLeft, Laptop } from "lucide-react";

export default function DevicePassportPage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [events, setEvents] = useState<any[]>([]);
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPassport = async () => {
      try {
        setLoading(true);
        // Match device by assetTag
        const devRes = await fetch("/api/devices");
        const devJson = await devRes.json();
        const matched = devJson.data.find((d: any) => d.assetTag === rawId || d.id === rawId);

        if (matched) {
          setDevice(matched);
          const eventRes = await fetch(`/api/passport?deviceId=${matched.id}`);
          const eventJson = await eventRes.json();
          if (eventJson.success) setEvents(eventJson.data);
        }
      } catch (e) {
        console.error("Failed to load device passport:", e);
      } finally {
        setLoading(false);
      }
    };

    loadPassport();
  }, [rawId]);

  return (
    <div>
      <Link href={`/devices/${rawId}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
        <ArrowLeft size={14} /> Back to Device Detail
      </Link>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800" }}>Circularity Passport™</h1>
          <span className="badge badge-cyan">{rawId}</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Immutable cryptographic chain of custody for {device?.make} {device?.model}.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>Loading ledger...</div>
      ) : events.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          No passport events logged for this asset.
        </div>
      ) : (
        <div className="timeline">
          {events.map((ev) => (
            <div key={ev.id} className="timeline-item">
              <div className="timeline-dot">
                <ShieldCheck size={12} color="#06b6d4" />
              </div>
              <div className="timeline-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span className="badge badge-cyan">{ev.eventCategory}</span>
                    <strong style={{ fontSize: "0.95rem" }}>{ev.eventType}</strong>
                  </div>
                  <span className="timeline-time">
                    {new Date(ev.timestamp).toLocaleDateString()} {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                  {ev.description}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid rgba(255, 255, 255, 0.04)", paddingTop: "0.5rem" }}>
                  <span>Actor: <strong>{ev.actor}</strong></span>
                  <span className="timeline-hash"><Hash size={12} /> {ev.eventHash?.slice(0, 24)}...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
