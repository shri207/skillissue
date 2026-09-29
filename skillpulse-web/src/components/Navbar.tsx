"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ShieldCheck, Search, Trophy, BarChart3, Cpu } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [aiStatus, setAiStatus] = useState<string>("Checking...");
  const [isAiOnline, setIsAiOnline] = useState<boolean>(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.aiHealth && data.aiHealth.status === "HEALTHY") {
            setAiStatus("AI Server Active (ONNX)");
            setIsAiOnline(true);
          } else {
            setAiStatus("AI Engine (Hybrid)");
            setIsAiOnline(true);
          }
        }
      } catch {
        setAiStatus("Local Engine");
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Overview", href: "/", icon: Sparkles },
    { name: "Talent Search", href: "/search", icon: Search },
    { name: "Verification Queue", href: "/verification", icon: ShieldCheck },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Skill Gap Radar", href: "/skill-gap", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SkillPulse
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                GTX-1650
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Talent Intelligence Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* AI Serving Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <div className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAiOnline ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAiOnline ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </div>
            <Cpu className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            <span className="text-slate-300 font-medium">{aiStatus}</span>
          </div>

          <Link
            href="/verification"
            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
          >
            Submit Evidence
          </Link>
        </div>
      </div>
    </header>
  );
}
