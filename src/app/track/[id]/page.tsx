"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  ArrowLeft, 
  RefreshCw, 
  Cpu, 
  Wrench, 
  ExternalLink,
  Navigation,
  Radio,
  UserCheck,
  AlertTriangle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OndcLiveTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const orderId = decodeURIComponent(rawId || "ONDC-SRV-2026-896751");

  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const res = await fetch("/api/ondc/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: trackingData?.orderId || orderId }),
      });
      const data = await res.json();
      if (data.success) {
        handleActionToast(`Technician order #${trackingData?.orderId || orderId} cancelled successfully.`);
        setShowCancelConfirm(false);
        fetchTracking(true);
      } else {
        handleActionToast(data.error || "Failed to cancel order.");
      }
    } catch (err: any) {
      handleActionToast(`Failed to cancel: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  const fetchTracking = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/ondc/track/${encodeURIComponent(orderId)}`);
      const data = await res.json();
      if (data.success) {
        setTrackingData(data);
      } else {
        setError(data.error || "Failed to load tracking data");
      }
    } catch (err: any) {
      console.error("Tracking fetch error:", err);
      setError(err.message || "Failed to connect to ONDC tracking service");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [orderId]);

  const handleActionToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Truck className="w-10 h-10 text-cyan-400 animate-bounce" />
          <div className="w-10 h-2 bg-cyan-500/20 rounded-full blur-sm mt-1 animate-pulse" />
        </div>
        <p className="text-sm text-slate-300 font-medium">
          Connecting to ONDC Services Gateway & GPS Telemetry...
        </p>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-400 w-16 h-16 mx-auto flex items-center justify-center border border-rose-500/20">
          <Radio className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white">Order Tracking Not Found</h2>
        <p className="text-xs text-slate-400">
          Could not locate tracking records for {orderId}.
        </p>
        <div className="pt-2">
          <Link href="/manual">
            <Button size="sm" variant="outline" className="border-slate-700 text-slate-200">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Return to Diagnostics
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* Toast Notice */}
      {toastMessage && (
        <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-200 text-xs flex items-center justify-between shadow-lg shadow-cyan-950/60 animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/manual" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Diagnostics
            </Link>
            <span>/</span>
            <span className="text-slate-300 font-mono">ONDC Dispatch Network</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Live Doorstep Tracking
            </h1>
            <Badge variant="emerald" className="text-xs gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              LIVE GPS ACTIVE
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Order Reference: <span className="text-cyan-400 font-bold">{trackingData.orderId}</span> • {trackingData.protocolVersion}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {trackingData.status === "CANCELLED" ? (
            <Badge variant="rose" className="text-xs px-2.5 py-1 bg-rose-950/80 border-rose-500/50 text-rose-300 gap-1 font-mono">
              <XCircle className="w-3.5 h-3.5 text-rose-400" /> ORDER CANCELLED
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelling}
              className="border-rose-500/40 hover:bg-rose-950/50 hover:border-rose-400 text-rose-300 hover:text-rose-200 text-xs h-8 gap-1.5 transition-colors shadow-sm shadow-rose-950/40"
            >
              <XCircle className={`w-3.5 h-3.5 text-rose-400 ${cancelling ? "animate-spin" : ""}`} />
              {cancelling ? "Cancelling..." : "Cancel Technician Dispatch"}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchTracking(true)}
            disabled={refreshing}
            className="border-slate-800 hover:bg-slate-800 text-slate-300 text-xs h-8 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh GPS"}
          </Button>
          <Link href="/passport">
            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs h-8 gap-1.5 shadow-md shadow-cyan-900/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Passport Ledger
            </Button>
          </Link>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      {showCancelConfirm && (
        <div className="p-4 rounded-xl bg-rose-950/90 border-2 border-rose-500 text-xs space-y-3 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Cancel Doorstep Technician Dispatch?</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed">
            Are you sure you want to cancel the dispatch for <strong>{trackingData.technician?.name || "Alex Rivera"}</strong>? Pre-authorized escrow hold (${trackingData.serviceDetails?.preAuthorizedFeeUSD?.toFixed(2) || "45.00"} USD) will be released back to your account immediately.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              disabled={cancelling}
              onClick={handleCancelOrder}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-8 px-4"
            >
              {cancelling ? "Cancelling Dispatch..." : "Yes, Cancel Technician"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={cancelling}
              onClick={() => setShowCancelConfirm(false)}
              className="border-slate-700 text-slate-300 text-xs h-8 px-3 hover:bg-slate-800"
            >
              Keep Order
            </Button>
          </div>
        </div>
      )}

      {/* Order Cancelled Notification Banner */}
      {trackingData.status === "CANCELLED" && (
        <div className="p-4 rounded-xl bg-rose-950/80 border-2 border-rose-500/50 text-rose-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-white block">Doorstep Technician Assignment Cancelled</span>
              <span className="text-slate-300 text-xs">This ONDC service dispatch has been cancelled. Any pre-authorized escrow hold has been released immediately.</span>
            </div>
          </div>
          <Link href="/manual">
            <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-8">
              Return to Diagnostics
            </Button>
          </Link>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Map & Status Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Simulated Interactive Radar Map */}
          <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-2xl relative">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" /> Technician Real-Time Route Telemetry
                </CardTitle>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Origin: UrbanCare Central Hub → Dest: Tech Park Blvd, Block C
                </p>
              </div>
              <Badge variant="amber" className="text-[10px] font-bold">
                ETA: {trackingData.estimatedArrival.minutesRemaining} MINS ({trackingData.estimatedArrival.distanceKm} KM)
              </Badge>
            </CardHeader>

            <CardContent className="p-0 relative bg-slate-950">
              {/* Simulated GPS Canvas */}
              <div className="w-full h-72 relative overflow-hidden bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
                
                {/* Street grid line graphics */}
                <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10%" y1="20%" x2="90%" y2="80%" stroke="#0284c7" strokeWidth="3" strokeDasharray="6,6" />
                  <path d="M 60 70 Q 200 180 350 140 T 650 200" fill="none" stroke="#38bdf8" strokeWidth="4" />
                  <circle cx="10%" cy="20%" r="8" fill="#0284c7" />
                  <circle cx="85%" cy="75%" r="10" fill="#10b981" />
                </svg>

                {/* Origin Hub Marker */}
                <div className="absolute top-[18%] left-[8%] bg-slate-900/90 border border-cyan-500/40 px-2.5 py-1 rounded-lg text-[10px] text-cyan-300 font-mono shadow-lg shadow-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  UrbanCare Depot #BLR
                </div>

                {/* Moving Technician Vehicle Marker with pulsing radar wave */}
                <div className="absolute top-[48%] left-[46%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute -inset-3 rounded-full bg-cyan-400/20 animate-ping" />
                    <span className="absolute -inset-6 rounded-full bg-cyan-400/10 animate-pulse" />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 border-2 border-white flex items-center justify-center shadow-xl shadow-cyan-500/50 z-10">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 bg-slate-900/95 border border-cyan-400/60 px-2.5 py-1 rounded-full text-[10px] text-white font-bold font-mono shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Alex Rivera (En Route • 14 mins)
                  </div>
                </div>

                {/* Destination Marker */}
                <div className="absolute bottom-[16%] right-[10%] bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-[11px] text-emerald-300 font-mono shadow-lg shadow-black flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <div>
                    <span className="font-bold block text-white text-[10px]">Your Office / Residence</span>
                    <span className="text-[9px] text-slate-400">42 Tech Park Blvd, Block C</span>
                  </div>
                </div>

                {/* Bottom telemetry overlay bar */}
                <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-slate-300 font-mono text-[11px]">
                      Live Telemetry: GPS <strong className="text-white">12.9784° N, 77.5912° E</strong> • Speed: 32 km/h
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                    Express Dispatch
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Milestones */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> ONDC Protocol Dispatch Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                {trackingData.milestones.map((m: any, idx: number) => {
                  const isDone = m.completed && !m.current;
                  const isCurrent = m.current;
                  return (
                    <div key={m.id || idx} className="flex items-start gap-3.5 relative">
                      {idx < trackingData.milestones.length - 1 && (
                        <div className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${isDone ? "bg-emerald-500/60" : "bg-slate-800"}`} />
                      )}
                      
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                        isDone 
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                          : isCurrent 
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse" 
                          : "bg-slate-800/80 border-slate-700 text-slate-500"
                      }`}>
                        {isDone ? (
                          <CheckCircle2 size={14} />
                        ) : isCurrent ? (
                          <Truck size={14} />
                        ) : (
                          <span className="text-[10px] font-mono">{idx + 1}</span>
                        )}
                      </div>

                      <div className="flex-1 pb-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isCurrent ? "text-cyan-300" : isDone ? "text-white" : "text-slate-400"}`}>
                            {m.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">{m.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {m.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right 1 Col: Specialist & Service Details */}
        <div className="space-y-6">
          
          {/* Assigned Technician Profile */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-cyan-400" /> Assigned Specialist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-amber-900/30">
                  AR
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {trackingData.technician.name}
                    <Badge variant="emerald" className="text-[9px] px-1.5 py-0">★ {trackingData.technician.rating}</Badge>
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {trackingData.technician.title}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {trackingData.technician.totalJobs} Doorstep Interventions Completed
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="text-slate-200 font-mono">{trackingData.technician.vehicle}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Network BPP:</span>
                  <span className="text-cyan-400 font-mono">{trackingData.bppId}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionToast(`Calling specialist Alex Rivera at ${trackingData.technician.phoneNumber}...`)}
                  className="border-slate-700 hover:bg-slate-800 text-white text-xs h-8 gap-1.5"
                >
                  <Phone size={12} className="text-emerald-400" /> Call Tech
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionToast(`Opening secure ONDC direct message channel with Alex Rivera...`)}
                  className="border-slate-700 hover:bg-slate-800 text-white text-xs h-8 gap-1.5"
                >
                  <MessageSquare size={12} className="text-cyan-400" /> Chat Tech
                </Button>
              </div>

              {trackingData.status !== "CANCELLED" && (
                <div className="pt-2 border-t border-slate-800/80">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={cancelling}
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full border-rose-500/30 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs h-8 gap-1.5 transition-colors"
                  >
                    <XCircle size={13} className="text-rose-400" /> Cancel Technician Dispatch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Doorstep Delivery Destination */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> Destination & Recipient
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Recipient:</span>
                <span className="text-white font-semibold text-sm">{trackingData.destination.recipient}</span>
                <span className="text-slate-400 text-[11px] block">{trackingData.destination.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Delivery Address:</span>
                <span className="text-slate-300 leading-relaxed block mt-0.5">
                  {trackingData.destination.address}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono block mt-1">
                  GPS: {trackingData.destination.gps.lat}, {trackingData.destination.gps.lng} (PIN: {trackingData.destination.pinCode})
                </span>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300 font-medium">
                ✓ Zero Form-Filling: Automatically retrieved from your authenticated user profile.
              </div>
            </CardContent>
          </Card>

          {/* Service & Passport Verification */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader className="pb-3 border-b border-slate-800">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-400" /> Service & Escrow Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Intervention:</span>
                <span className="text-white font-semibold block">{trackingData.serviceDetails.description}</span>
                <span className="text-slate-400 text-[11px] block mt-0.5">Slot: {trackingData.serviceDetails.scheduledSlot}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Pre-Authorized Fee:</span>
                <span className="text-amber-400 font-bold text-sm">${trackingData.serviceDetails.preAuthorizedFeeUSD.toFixed(2)} USD</span>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Circularity Passport Hash:</span>
                <span className="text-[9px] font-mono text-slate-400 break-all block bg-slate-950 p-2 rounded border border-slate-800">
                  {trackingData.passportHash}
                </span>
              </div>
              <Link href="/passport" className="block pt-1">
                <Button size="sm" variant="outline" className="w-full border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs h-8 gap-1">
                  <ShieldCheck size={13} /> View in Circularity Ledger →
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
