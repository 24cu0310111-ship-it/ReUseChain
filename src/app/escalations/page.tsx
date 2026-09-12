"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Send, 
  Sparkles, 
  Clock, 
  UserCheck, 
  BookOpen, 
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminEscalationsPage() {
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEscalation, setActiveEscalation] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [learnedRule, setLearnedRule] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/escalations");
      const json = await res.json();
      if (json.success) {
        setEscalations(json.data);
      }
    } catch (e) {
      console.error("Failed to load escalations:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEscalation || !adminResponse.trim()) return;

    try {
      setSubmitting(true);
      setSuccessToast(null);

      const res = await fetch("/api/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalationId: activeEscalation.id,
          adminResponse,
          learnedRule: learnedRule || "Verified fault protocol committed to decision weights.",
          resolvedBy: "Lead Systems Administrator",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessToast(json.message);
        setActiveEscalation(null);
        setAdminResponse("");
        setLearnedRule("");
        await fetchEscalations();
      }
    } catch (err: any) {
      console.error("Failed to resolve escalation:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingEscalations = escalations.filter((e) => e.status === "pending");
  const resolvedEscalations = escalations.filter((e) => e.status === "resolved");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <HelpCircle size={26} className="text-purple-400" /> Admin Escalation & Self-Learning Hub
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          When the cognitive triage agent encounters an ambiguous fault or novel hardware symptom, it pauses and escalates here. Your answers permanently calibrate the agent's decision model without requiring full retraining.
        </p>
      </div>

      {/* Telegram Dual Bot Real-time Integration Card */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Dual Telegram Real-Time Automation Active</span>
          </div>
          <p className="text-xs text-slate-300">
            <strong>User Emergency Bot:</strong> <a href="https://t.me/backuvro_bot" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">@backuvro_bot</a> — User inputs & offline triage execute directly here if PC is off or showing drive errors.<br />
            <strong>Admin Self-Improving Bot:</strong> <a href="https://t.me/AHackBattle013bot" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline font-mono">@AHackBattle013bot</a> — Reply via <code className="bg-slate-800 px-1 rounded text-purple-200">/reply &lt;ticketId&gt; &lt;resolution&gt;</code> to indirectly support the chat and train the AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://t.me/AHackBattle013bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            Open Admin Bot @AHackBattle013bot
          </a>
          <a
            href="https://t.me/backuvro_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            User Bot @backuvro_bot
          </a>
        </div>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-xs text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Pending Escalations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-amber-400" /> Pending Admin Guidance ({pendingEscalations.length})
          </h2>
          <span className="text-xs text-slate-400">Requires Expert Intervention</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading escalations queue...</div>
        ) : pendingEscalations.length === 0 ? (
          <Card className="text-center p-8 text-slate-400">
            <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-white">All Escalations Resolved!</div>
            <p className="text-xs mt-1">The agent has clear policy and diagnostic data for all active fleet scenarios.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {pendingEscalations.map((esc) => (
              <Card 
                key={esc.id} 
                className={`border-l-4 ${esc.urgency === "critical" ? "border-l-rose-500" : "border-l-purple-500"} hover:border-white/20 transition-all`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={esc.urgency === "critical" ? "rose" : "purple"}>
                        {esc.urgency.toUpperCase()} PRIORITY
                      </Badge>
                      <span className="text-xs font-mono text-cyan-400">{esc.assetTag || "UNASSIGNED"}</span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(esc.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <CardTitle className="text-sm font-semibold mt-2 text-slate-100">
                    "{esc.queryText}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="text-xs text-slate-300 bg-white/[0.02] p-2.5 rounded border border-white/5">
                    <strong>Agent Observation:</strong> {esc.symptomSummary}
                  </div>

                  {esc.mediaUrl && (
                    <div className="rounded-lg overflow-hidden border border-white/10 max-w-xs">
                      <div className="bg-black/60 px-2 py-0.5 text-[9px] text-cyan-300">Attached Task Manager / Screen Screenshot</div>
                      <img src={esc.mediaUrl} alt="Attached symptom screenshot" className="w-full object-cover max-h-32" />
                    </div>
                  )}

                  {esc.telemetrySnippet && (
                    <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded truncate">
                      Telemetry Snapshot: {esc.telemetrySnippet}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                      <Send size={11} className="text-purple-400" /> Telegram Channel Alert Dispatched
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveEscalation(esc);
                        setAdminResponse("");
                        setLearnedRule("");
                      }}
                      className="text-xs bg-purple-600 hover:bg-purple-500 gap-1.5"
                    >
                      <Sparkles size={13} /> Teach Agent & Resolve &rarr;
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Resolution Modal / Drawer */}
      {activeEscalation && (
        <Card className="border-2 border-purple-500/50 bg-slate-900 shadow-2xl p-6">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="purple">Interactive Knowledge Teaching</Badge>
                <CardTitle className="text-base mt-1 text-white">
                  Resolve Escalation on {activeEscalation.assetTag}
                </CardTitle>
              </div>
              <button 
                onClick={() => setActiveEscalation(null)} 
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs text-slate-300 mt-2 bg-white/5 p-2.5 rounded">
              <strong>Reported Issue:</strong> "{activeEscalation.queryText}"
            </p>
          </CardHeader>

          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Admin Diagnostic Solution & Direction
              </label>
              <textarea
                rows={3}
                className="form-textarea w-full text-xs"
                placeholder="Explain the root cause and correct lifecycle direction (e.g. 'Coil whine with rail power cut confirms blown VRM capacitor. Non-repairable at component level: harvest SSD/RAM to spares, dispatch logic board to certified R2 e-waste')..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Persistent Learned Rule (Recorded into Model Knowledge Base)
              </label>
              <input
                type="text"
                className="form-input w-full text-xs font-mono"
                placeholder="e.g. IF coil_whine AND voltage_drop < 18V THEN route_to_cross_purpose_harvesting"
                value={learnedRule}
                onChange={(e) => setLearnedRule(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={() => setActiveEscalation(null)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={submitting} 
                size="sm" 
                variant="default"
                className="bg-purple-600 hover:bg-purple-500 gap-1.5 text-xs font-semibold"
              >
                <Send size={13} /> {submitting ? "Committing Knowledge..." : "Commit Knowledge & Resolve"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Resolved Knowledge Base */}
      {resolvedEscalations.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Learned Knowledge Calibration Archive ({resolvedEscalations.length})
            </h2>
          </div>

          <div className="space-y-2">
            {resolvedEscalations.map((res) => (
              <div 
                key={res.id} 
                className="p-3.5 rounded-lg bg-slate-800/40 border border-white/5 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Asset: <strong className="text-cyan-300">{res.assetTag}</strong></span>
                  <span>Verified by: <strong className="text-slate-200">{res.resolvedBy}</strong></span>
                </div>
                <div className="text-slate-200">
                  <strong>Admin Guidance:</strong> {res.adminResponse}
                </div>
                {res.learnedRule && (
                  <div className="text-purple-300 font-mono text-[11px] bg-purple-950/40 p-1.5 rounded border border-purple-500/20">
                    Rule: {res.learnedRule}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
