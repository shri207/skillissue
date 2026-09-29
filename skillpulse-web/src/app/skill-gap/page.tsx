"use client";

import { useState, useEffect } from "react";
import { BarChart3, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, GraduationCap } from "lucide-react";

export default function SkillGapPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/skill-gap");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Skill gap error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-3">
          <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
          <span>Curriculum vs Industry Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Institutional Skill Gap Radar
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Real-time analysis comparing verified student competency distributions against
          current industry hiring benchmarks across university departments.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-500">Loading skill gap models...</div>
      ) : !data || !data.reports || data.reports.length === 0 ? (
        <div className="p-16 text-center text-xs text-slate-500">No departmental reports generated yet.</div>
      ) : (
        <div className="space-y-8">
          {data.reports.map((report: any) => (
            <div
              key={report.departmentId}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6"
            >
              {/* Department Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    {report.departmentName} ({report.departmentCode})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {report.collegeName} • {report.studentCount} Active Student Profiles
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-400">Average Deficit: </span>
                    <span
                      className={`font-bold font-mono ${
                        report.averageGapPercent > 35
                          ? "text-red-400"
                          : report.averageGapPercent > 20
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {report.averageGapPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Coverage Breakdown Bars */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Core Industry Competency Benchmarks
                </h3>

                <div className="space-y-3">
                  {report.coverageBreakdown.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-slate-200">{item.priority}</span>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-slate-400">
                            Current: <strong className="text-white">{item.currentCoveragePercent}%</strong>
                          </span>
                          <span className="text-slate-400">
                            Target: <strong className="text-indigo-400">{item.benchmarkPercent}%</strong>
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.gapPercent > 30
                                ? "bg-red-500/20 text-red-300"
                                : item.gapPercent > 10
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            Gap: {item.gapPercent}%
                          </span>
                        </div>
                      </div>

                      {/* Bar comparison */}
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-indigo-500 rounded-l-full"
                          style={{ width: `${item.currentCoveragePercent}%` }}
                        />
                        <div
                          className="h-full bg-red-500/40"
                          style={{ width: `${item.gapPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curricular Recommendations */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  AI Curricular Action Recommendations
                </h3>

                <ul className="space-y-1.5 text-xs text-slate-300">
                  {report.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
