"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, Sparkles, GraduationCap, Building2 } from "lucide-react";

export default function LeaderboardPage() {
  const [domain, setDomain] = useState("All");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const domains = [
    "All",
    "Programming Languages",
    "AI & Machine Learning",
    "Frontend Development",
    "Backend Development",
    "Cloud & DevOps",
    "Cybersecurity & Systems",
  ];

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leaderboard?domain=${encodeURIComponent(domain)}`);
        if (res.ok) {
          const data = await res.json();
          setRankings(data.rankings || []);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [domain]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Verified University Talent Rankings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Inter-College Talent Leaderboard
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Students ranked objectively based on cumulative verified skill proficiency scores,
          evidence provenance, and real-world project contributions across universities.
        </p>
      </div>

      {/* Domain Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {domains.map((d) => (
          <button
            key={d}
            onClick={() => setDomain(d)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              domain === d
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 grid grid-cols-12 gap-4">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4">Student &amp; College</div>
          <div className="col-span-3">Top Verified Skills</div>
          <div className="col-span-2 text-center">Verified Skills</div>
          <div className="col-span-2 text-right">Composite Score</div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Loading rankings...</div>
        ) : rankings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No student records with verified skills in this domain yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60 text-xs">
            {rankings.map((r) => {
              let rankBadge = (
                <span className="font-bold text-slate-400 text-sm">{r.rank}</span>
              );
              if (r.rank === 1) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-xs mx-auto">
                    🥇
                  </div>
                );
              } else if (r.rank === 2) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center font-bold text-xs mx-auto">
                    🥈
                  </div>
                );
              } else if (r.rank === 3) {
                rankBadge = (
                  <div className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center font-bold text-xs mx-auto">
                    🥉
                  </div>
                );
              }

              return (
                <div
                  key={r.id}
                  className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-800/30 transition-colors"
                >
                  <div className="col-span-1 text-center">{rankBadge}</div>

                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block">{r.name}</span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-indigo-400" />
                        {r.college} • {r.department} (Batch {r.batchYear})
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-wrap gap-1">
                    {r.topSkills.map((sk: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="col-span-2 text-center font-semibold text-slate-300">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px]">
                      {r.verifiedSkillsCount} verified
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="font-mono font-bold text-sm text-indigo-300">
                      {r.totalScore} pts
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      avg {r.averageScore}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
