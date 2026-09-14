"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { 
  Laptop, 
  Truck, 
  Layers, 
  Sliders, 
  Cpu, 
  UserCheck, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  MessageSquare,
  HelpCircle,
  BarChart3,
  Network
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [manualMode, setManualMode] = useState(false);

  useEffect(() => {
    const isManualPath = 
      pathname === "/manual" || 
      pathname === "/intake" || 
      pathname === "/desktop-agent" ||
      pathname === "/fleet" ||
      pathname === "/simulator" ||
      pathname === "/approvals" ||
      pathname === "/passport" ||
      pathname === "/settings" ||
      pathname === "/escalations" ||
      pathname === "/graph";

    const stored = typeof window !== "undefined" ? localStorage.getItem("reusechain_manual_mode") : null;
    if (isManualPath) {
      setManualMode(true);
    } else if (pathname === "/assistant") {
      setManualMode(false);
    } else if (pathname === "/") {
      setManualMode(stored === "true");
    }

    const handleModeChange = (e: any) => {
      if (e.detail?.mode === "manual") {
        setManualMode(true);
        localStorage.setItem("reusechain_manual_mode", "true");
      } else if (e.detail?.mode === "chat") {
        setManualMode(false);
        localStorage.setItem("reusechain_manual_mode", "false");
      }
    };

    window.addEventListener("entryModeChanged", handleModeChange);
    return () => window.removeEventListener("entryModeChanged", handleModeChange);
  }, [pathname]);

  const primaryNavItems = [
    { label: "Manual Data Entry", href: "/manual", icon: Laptop, highlight: true },
    { label: "PC Doctor", href: "/desktop-agent", icon: Cpu },
    { label: "Fleet & Passports", href: "/fleet", icon: Layers },
    { label: "Settings", href: "/settings", icon: Sliders },
  ];

  const secondaryTools = [
    { label: "Admin Escalations", href: "/escalations", icon: HelpCircle },
    { label: "Device Intake", href: "/intake", icon: UploadCloud },
    { label: "Lifecycle Simulator", href: "/simulator", icon: Sliders },
    { label: "Approval Queue", href: "/approvals", icon: CheckCircle2 },
    { label: "Circularity Passport", href: "/passport", icon: ShieldCheck },
    { label: "Learning & ROI", href: "/learning", icon: BarChart3 },
    { label: "Architecture Graph", href: "/graph", icon: Network },
  ];

  const isToolActive = secondaryTools.some((t) => pathname === t.href || pathname.startsWith(t.href));

  return (
    <header className="navbar">
      <Link href="/assistant" className="nav-brand">
        <Cpu size={26} color="#38bdf8" />
        <span className="font-black tracking-tight text-white flex items-center gap-1.5">
          ReUseChain <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-normal">PC Care</span>
        </span>
      </Link>

      {/* Navigation panel: ONLY visible when manual data entry is active */}
      {manualMode ? (
        <nav className="nav-links flex items-center gap-1 animate-in fade-in duration-200">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Tools Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className={`nav-link flex items-center gap-1 cursor-pointer ${isToolActive ? "active" : ""}`}
              aria-expanded={toolsOpen}
            >
              <span>More Tools</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${toolsOpen ? "rotate-180" : ""}`} />
            </button>

            {toolsOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Enterprise Utilities
                </div>
                {secondaryTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setToolsOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors ${
                        isActive 
                          ? "bg-cyan-500/10 text-cyan-300 font-semibold" 
                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon size={14} className={isActive ? "text-cyan-400" : "text-slate-400"} />
                      <span>{tool.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick toggle to return to Chat Agent */}
          <Link
            href="/assistant"
            onClick={() => {
              localStorage.setItem("reusechain_manual_mode", "false");
              setManualMode(false);
              window.dispatchEvent(new CustomEvent("entryModeChanged", { detail: { mode: "chat" } }));
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all ml-1"
          >
            <MessageSquare size={13} />
            <span>Chat Agent</span>
          </Link>
        </nav>
      ) : (
        /* When NOT in manual data entry: Navigation panel is hidden, replaced with clean single button */
        <div className="flex items-center gap-2 animate-in fade-in duration-200">
          <Link
            href="/graph"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm"
          >
            <Network size={14} className="text-cyan-400" />
            <span>Architecture Graph</span>
          </Link>
          <Link
            href="/manual"
            onClick={() => {
              localStorage.setItem("reusechain_manual_mode", "true");
              setManualMode(true);
              window.dispatchEvent(new CustomEvent("entryModeChanged", { detail: { mode: "manual" } }));
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-sm"
          >
            <Laptop size={14} className="text-cyan-400" />
            <span>Manual Data Entry</span>
          </Link>
        </div>
      )}
    </header>
  );
}
