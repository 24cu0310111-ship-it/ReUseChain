"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/approvals");
      const json = await res.json();
      if (json.success) {
        setApprovals(json.data);
      }
    } catch (e) {
      console.error("Failed to load approvals:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (approvalId: string, decision: "approved" | "rejected") => {
    try {
      setProcessingId(approvalId);
      const role = localStorage.getItem("reusechain_role") || "Asset Manager";

      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          decision,
          approverRole: role,
          approverIdentity: `${role} Authorized Sign-off`,
          comments: decision === "approved" ? "Authorized within circularity policy budget." : "Rejected by approver.",
        }),
      });

      const json = await res.json();
      if (json.success) {
        await fetchApprovals();
      }
    } catch (e) {
      console.error("Failed to process approval action:", e);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingList = approvals.filter((a) => a.decision === "pending");
  const historyList = approvals.filter((a) => a.decision !== "pending");

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Human Governance & Approval Queue
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Autonomous policy enforcement halts at Amber and Red boundaries. Human asset managers and lead technicians review evidence dossiers before authorizing work orders or asset reallocations.
        </p>
      </div>

      {/* Pending Reviews */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={18} color="#f59e0b" /> Pending Review ({pendingList.length})
        </h2>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>Loading approval queue...</div>
        ) : pendingList.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--text-muted)" }}>
            <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 0.75rem auto" }} />
            <div style={{ fontWeight: "600", color: "var(--text-primary)" }}>All Caught Up!</div>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>No items currently awaiting human authorization.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {pendingList.map((item) => {
              const dev = item.decisionCase?.device;
              const isProcessing = processingId === item.id;

              return (
                <div key={item.id} className="card" style={{ borderLeft: "4px solid var(--accent-amber)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <span className="badge badge-amber" style={{ marginBottom: "0.4rem" }}>
                        Risk Tier: {item.riskTier}
                      </span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{item.requestedAction}</h3>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        Asset: <Link href={`/devices/${dev?.assetTag}`} style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>{dev?.assetTag}</Link> ({dev?.model}) • Role Required: <strong>{item.requiredRole}</strong>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleAction(item.id, "approved")}
                        disabled={isProcessing}
                        className="btn btn-emerald btn-sm"
                      >
                        <CheckCircle2 size={14} /> Approve Action
                      </button>
                      <button
                        onClick={() => handleAction(item.id, "rejected")}
                        disabled={isProcessing}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  {item.decisionCase?.justification && (
                    <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "0.75rem", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, border: "1px solid var(--border-subtle)" }}>
                      <strong>Evidence Summary:</strong> {item.decisionCase.justification}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit History */}
      <div>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <UserCheck size={18} color="#06b6d4" /> Historical Governance Decisions
        </h2>

        {historyList.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            No past approval decisions recorded yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Requested</th>
                  <th>Decision</th>
                  <th>Authorized By</th>
                  <th>Resolution Note</th>
                </tr>
              </thead>
              <tbody>
                {historyList.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                      {new Date(item.reviewedAt || item.createdAt).toLocaleDateString()} {new Date(item.reviewedAt || item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                      {item.requestedAction}
                    </td>
                    <td>
                      <span className={`badge ${item.decision === "approved" ? "badge-green" : "badge-red"}`}>
                        {item.decision}
                      </span>
                    </td>
                    <td>{item.approverIdentity || item.requiredRole}</td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{item.comments || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
