"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Layers, 
  Cpu, 
  UploadCloud, 
  Sliders, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3,
  UserCheck,
  Radio,
  HelpCircle,
  Laptop
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState("Asset Manager");

  useEffect(() => {
    const saved = localStorage.getItem("reusechain_role");
    if (saved) setRole(saved);
  }, []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    localStorage.setItem("reusechain_role", newRole);
    window.dispatchEvent(new Event("roleChanged"));
  };

  const navItems = [
    { label: "Fleet Overview", href: "/", icon: Layers },
    { label: "Diagnostic Assistant", href: "/assistant", icon: Radio },
    { label: "Desktop AI Agent", href: "/desktop-agent", icon: Laptop },
    { label: "Admin Escalations", href: "/escalations", icon: HelpCircle },
    { label: "Device Intake", href: "/intake", icon: UploadCloud },
    { label: "4-Way Simulator", href: "/simulator", icon: Sliders },
    { label: "Approval Queue", href: "/approvals", icon: CheckCircle2 },
    { label: "Circularity Passport", href: "/passport", icon: ShieldCheck },
    { label: "Learning & ROI", href: "/learning", icon: BarChart3 },
    { label: "Policy Guardrails", href: "/settings", icon: Sliders },
  ];

  return (
    <header className="navbar">
      <Link href="/" className="nav-brand">
        <Cpu size={26} color="#38bdf8" />
        <span>ReUseChain</span>
      </Link>

      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="role-badge-container">
        <UserCheck size={14} color="#06b6d4" />
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Role:</span>
        <select
          className="role-select"
          value={role}
          onChange={handleRoleChange}
          aria-label="Select Demo Role"
        >
          <option value="Asset Manager">Asset Manager (Approver)</option>
          <option value="Hardware Technician">Hardware Technician</option>
          <option value="Sustainability Lead">Sustainability Lead</option>
          <option value="Compliance Auditor">Compliance Auditor</option>
        </select>
      </div>
    </header>
  );
}
