"use client";

import Link from "next/link";
import { GraduationCap, Building2, Search, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [stats, setStats] = useState({
    collegesCount: 3,
    deptsCount: 4,
    studentsCount: 3,
    skillsCount: 50,
    verifiedSkillsCount: 16,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Fallback
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-12 py-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-block text-xs font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">
          Institutional LMS • CEG Guindy & PSG Tech
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
          College Competency & Verification Portal
        </h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          A minimalist university LMS for students to submit skill evidence and college principals to officially verify and endorse credentials.
        </p>
      </div>

      {/* Two Main Doors: Student vs Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Door 1: Student */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col justify-between hover:border-black transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">Student Portal</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload certificates, project repos, and coursework. Track review status and build an officially verified college talent profile.
            </p>
          </div>

          <div className="pt-6">
            <Link
              href="/student"
              className="inline-flex items-center gap-2 bg-black hover:bg-zinc-800 text-white font-medium px-4 py-2.5 rounded text-xs transition w-full justify-center"
            >
              <span>Enter Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Door 2: Principal */}
        <div className="bg-white border border-zinc-200 rounded-lg p-6 flex flex-col justify-between hover:border-black transition">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-800">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">Principal & Dean Console</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Review student submitted evidence, inspect credential proof links, and approve or reject submissions with institutional audit logs.
            </p>
          </div>

          <div className="pt-6">
            <Link
              href="/principal"
              className="inline-flex items-center gap-2 border border-zinc-300 hover:border-black hover:bg-zinc-50 text-zinc-900 font-medium px-4 py-2.5 rounded text-xs transition w-full justify-center"
            >
              <span>Enter Principal Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Institutional Statistics */}
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 rounded-lg p-5">
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Campus Registry Metrics
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div>
            <div className="text-2xl font-bold text-zinc-900">{stats.collegesCount}</div>
            <div className="text-xs text-zinc-500">Colleges Participating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{stats.studentsCount}</div>
            <div className="text-xs text-zinc-500">Registered Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{stats.skillsCount}+</div>
            <div className="text-xs text-zinc-500">Taxonomy Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900">{stats.verifiedSkillsCount}</div>
            <div className="text-xs text-zinc-500">Verified Credentials</div>
          </div>
        </div>
      </div>

      {/* Search Shortcut */}
      <div className="text-center">
        <Link
          href="/search"
          className="text-xs text-zinc-500 hover:text-black underline font-medium inline-flex items-center gap-1"
        >
          <Search className="w-3.5 h-3.5" />
          Looking for verified talent? Browse the Talent Directory →
        </Link>
      </div>
    </div>
  );
}
