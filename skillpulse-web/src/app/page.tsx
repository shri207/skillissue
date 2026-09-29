"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
  Database,
  Lock,
} from "lucide-react";
import TalentCard from "@/components/TalentCard";

export default function HomePage() {
  const [stats, setStats] = useState<{
    collegesCount: number;
    deptsCount: number;
    studentsCount: number;
    skillsCount: number;
    verifiedSkillsCount: number;
  }>({
    collegesCount: 3,
    deptsCount: 4,
    studentsCount: 3,
    skillsCount: 50,
    verifiedSkillsCount: 12,
  });

  const [featuredStudents, setFeaturedStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData);
        }

        const studentsRes = await fetch("/api/students");
        if (studentsRes.ok) {
          const stData = await studentsRes.json();
          setFeaturedStudents(stData.students || []);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/20 via-sky-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multi-Agent University Talent Intelligence</span>
          <span className="w-1 h-1 rounded-full bg-indigo-400" />
          <span className="text-emerald-400 font-bold">100% Custom AI Models</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Verify Real Skills.{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Surface True University Talent.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal">
          Zero hallucinations. Three custom-trained BERT & MiniLM models running locally on NVIDIA
          GTX 1650. Transparent cryptographic evidence provenance for students, deans, and recruiters.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/search"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-700 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-102"
          >
            <Search className="w-4 h-4" />
            Launch Explainable Search
          </Link>

          <Link
            href="/verification"
            className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-700 flex items-center gap-2 transition-all hover:border-slate-600"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verification Pipeline
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <Building2 className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats.collegesCount}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Tier-1 Colleges</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <GraduationCap className="w-5 h-5 text-sky-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats.deptsCount}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Departments</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <Users className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats.studentsCount}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Verified Profiles</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
            <Database className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats.skillsCount}+</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Canonical Skills</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 col-span-2 md:col-span-1">
            <CheckCircle2 className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-black text-white">{stats.verifiedSkillsCount}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Verified Evidences</div>
          </div>
        </div>
      </section>

      {/* Custom AI Engine Architecture Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            No External APIs • Fully On-Premises
          </h2>
          <p className="text-3xl font-extrabold text-white">
            Custom Trained AI Models Optimized for GTX 1650
          </p>
          <p className="mt-3 text-slate-400 text-sm">
            Trained with PyTorch FP16 mixed precision and exported to ONNX Runtime for CPU serving
            with zero external dependencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10">
              Model 1: DistilBERT NER
            </span>
            <h3 className="text-lg font-bold text-white mt-2">SkillExtractor</h3>
            <p className="text-xs text-slate-400 mt-2">
              Extracts 13 BIO entity tags (SKILL, TECH, ISSUER, DATE, ROLE, ACHIEVEMENT) from certificates,
              PR descriptions, and student project READMEs.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span>66M Parameters</span>
              <span className="text-emerald-400 font-bold">&lt; 30ms ONNX</span>
            </div>
          </div>

          {/* Model 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-sky-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4 text-sky-400 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 px-2 py-0.5 rounded bg-sky-500/10">
              Model 2: all-MiniLM-L6-v2
            </span>
            <h3 className="text-lg font-bold text-white mt-2">SkillMapper</h3>
            <p className="text-xs text-slate-400 mt-2">
              Contrastive learning embedder mapping non-standard student terminology (e.g. &apos;py&apos;,
              &apos;docker-compose&apos;, &apos;next 15&apos;) to canonical university taxonomy.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span>22M Parameters</span>
              <span className="text-emerald-400 font-bold">&lt; 15ms Latency</span>
            </div>
          </div>

          {/* Model 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
              Model 3: DistilBERT Dual-Head
            </span>
            <h3 className="text-lg font-bold text-white mt-2">QueryParser</h3>
            <p className="text-xs text-slate-400 mt-2">
              Joint multi-task neural network parsing recruiter intent (FIND_STUDENTS, FIND_TEAMS,
              SKILL_GAP) with slot extraction for skills, department, and year.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span>66M Parameters</span>
              <span className="text-emerald-400 font-bold">98% Accuracy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verified Student Talent */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Verified University Talent</h2>
            <p className="text-xs text-slate-400 mt-1">
              Top student profiles backed by verifiable code commits, hackathon awards, and faculty endorsement.
            </p>
          </div>

          <Link
            href="/search"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group"
          >
            Explore all candidates <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredStudents.map((st) => (
            <TalentCard key={st.id} student={st} />
          ))}
        </div>
      </section>
    </div>
  );
}
