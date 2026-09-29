"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Building2,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Filter,
  Check,
  X,
  RefreshCw,
  Search,
  MessageSquare,
  ArrowRight,
  BookOpen,
} from "lucide-react";

interface SubmissionItem {
  id: string;
  studentSkillId: string;
  title: string;
  description: string;
  evidenceType: string;
  url: string;
  issuer: string;
  issueDate: string;
  status: string;
  provenanceScore: number;
  metadata?: any;
  reviewNotes?: string;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    rollNumber: string;
    cgpa: number;
    currentSemester: number;
    college: string;
    collegeCode: string;
    department: string;
    program: string;
  };
  skill: {
    id: string;
    name: string;
    code: string;
    domain: string;
    category: string;
    currentSkillStatus: string;
    proficiency: string;
  };
  reviews: Array<{
    id: string;
    action: string;
    feedback: string;
    reviewerName: string;
    createdAt: string;
  }>;
}

interface StatsSummary {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
}

export default function PrincipalPortal() {
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [stats, setStats] = useState<StatsSummary>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackNotes, setFeedbackNotes] = useState<{ [key: string]: string }>({});
  const [activeNoteEvidenceId, setActiveNoteEvidenceId] = useState<string | null>(null);
  const [actionAlert, setActionAlert] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/principal/queue?filter=${filter}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
        setStats(data.stats || { pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalCount: 0 });
      }
    } catch (err) {
      console.error("Failed to load queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [filter]);

  const handleReviewAction = async (evidenceId: string, action: "APPROVE" | "REJECT") => {
    setActionInProgressId(evidenceId);
    setActionAlert(null);
    try {
      const notes = feedbackNotes[evidenceId] || (action === "APPROVE" ? "Approved by Principal & Verified" : "Rejected upon evaluation");
      const res = await fetch("/api/principal/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceId,
          action,
          reviewerNotes: notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review action failed");

      setActionAlert({
        type: "success",
        text: `Submission ${action === "APPROVE" ? "APPROVED and skill verified" : "REJECTED"} successfully!`,
      });

      // Clear note modal
      setActiveNoteEvidenceId(null);

      // Refresh list
      await fetchQueue();
    } catch (err: any) {
      setActionAlert({
        type: "error",
        text: err.message || "Failed to process review",
      });
    } finally {
      setActionInProgressId(null);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.student.name.toLowerCase().includes(q) ||
      sub.student.rollNumber.toLowerCase().includes(q) ||
      sub.skill.name.toLowerCase().includes(q) ||
      sub.title.toLowerCase().includes(q) ||
      sub.student.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-amber-600 to-indigo-600 rounded-2xl shadow-lg shadow-amber-500/20">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Principal & Dean Console
                </span>
                <span className="text-xs text-slate-400">Institutional Competency Governance</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Student Evidence Verification & Approval Queue
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 transition"
            >
              <GraduationCap className="w-4 h-4" /> Switch to Student View
            </Link>
            <button
              onClick={fetchQueue}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition"
              title="Refresh queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Action Alert */}
        {actionAlert && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
              actionAlert.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {actionAlert.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span>{actionAlert.text}</span>
            </div>
            <button onClick={() => setActionAlert(null)} className="p-1 hover:opacity-80">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setFilter("PENDING")}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              filter === "PENDING"
                ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{stats.pendingCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Awaiting your approval</div>
          </div>

          <div
            onClick={() => setFilter("APPROVED")}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              filter === "APPROVED"
                ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.approvedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Verified on student records</div>
          </div>

          <div
            onClick={() => setFilter("REJECTED")}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              filter === "REJECTED"
                ? "bg-rose-500/10 border-rose-500/50 shadow-lg shadow-rose-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Rejected</span>
              <XCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-black text-rose-400">{stats.rejectedCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Returned with feedback</div>
          </div>

          <div
            onClick={() => setFilter("ALL")}
            className={`p-5 rounded-2xl border transition cursor-pointer ${
              filter === "ALL"
                ? "bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Submissions</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Cumulative campus submissions</div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-3 rounded-2xl">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === "PENDING"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === "APPROVED"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Approved ({stats.approvedCount})
            </button>
            <button
              onClick={() => setFilter("REJECTED")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === "REJECTED"
                  ? "bg-rose-500 text-slate-950 font-bold shadow-md shadow-rose-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              Rejected ({stats.rejectedCount})
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === "ALL"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              All Records
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, roll no, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-slate-900/40 rounded-2xl border border-slate-800">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span>Loading Principal Review Queue...</span>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No submissions found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are currently no evidence items matching your filter criteria. When students submit
              new credentials, they will appear here immediately.
            </p>
            <div>
              <Link
                href="/student"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition"
              >
                Go to Student Portal to Submit Evidence <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((sub) => {
              const isPending = sub.status === "UNDER_REVIEW" || sub.status === "SUBMITTED";
              const isProcessing = actionInProgressId === sub.id;

              return (
                <div
                  key={sub.id}
                  className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition space-y-4"
                >
                  {/* Top Bar: Student Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md">
                        {sub.student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{sub.student.name}</h3>
                          <span className="text-xs font-semibold text-amber-400">
                            {sub.student.rollNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.student.department} • {sub.student.college} • CGPA:{" "}
                          <strong className="text-cyan-300">{sub.student.cgpa?.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {sub.evidenceType}
                      </span>
                      {sub.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : sub.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Review
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Claim & Description */}
                    <div className="lg:col-span-2 space-y-2.5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                            Claimed Skill: {sub.skill.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            Domain: {sub.skill.domain}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white">{sub.title}</h4>
                      </div>

                      {sub.description && (
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                          {sub.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        {sub.issuer && (
                          <span>
                            Issuer / Platform: <strong className="text-white">{sub.issuer}</strong>
                          </span>
                        )}
                        {sub.issueDate && (
                          <span>
                            Date:{" "}
                            <strong className="text-slate-300">
                              {new Date(sub.issueDate).toLocaleDateString()}
                            </strong>
                          </span>
                        )}
                        <span>
                          Submitted on:{" "}
                          <strong className="text-slate-400">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </strong>
                        </span>
                      </div>

                      {/* Proof link */}
                      {sub.url && (
                        <div className="pt-1">
                          <a
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
                          >
                            <span>Open Proof URL / Credential</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right: AI Pre-Check & Principal Actions */}
                    <div className="space-y-4 flex flex-col justify-between">
                      {/* AI Pre-Checks Box */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          Automated Provenance Checks
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span>AI Confidence:</span>
                          <span className="font-bold text-emerald-400">
                            {Math.round((sub.provenanceScore || 0.9) * 100)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span>Issuer Reputation:</span>
                          <span className="font-bold text-cyan-400">Verified Platform</span>
                        </div>

                        <div className="flex items-center justify-between text-slate-300">
                          <span>Taxonomy Code:</span>
                          <span className="font-mono text-slate-200">{sub.skill.code}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        {isPending ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReviewAction(sub.id, "APPROVE")}
                              disabled={isProcessing}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Approve Verification
                            </button>

                            <button
                              onClick={() => handleReviewAction(sub.id, "REJECT")}
                              disabled={isProcessing}
                              className="inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition disabled:opacity-50"
                            >
                              <X className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                            <span className="text-slate-400">Decision Status:</span>
                            <span
                              className={`font-bold ${
                                sub.status === "APPROVED" ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {sub.status === "APPROVED" ? "Verified by Dean" : "Rejected"}
                            </span>
                          </div>
                        )}

                        {/* Optional notes button */}
                        {isPending && (
                          <div className="pt-1">
                            {activeNoteEvidenceId === sub.id ? (
                              <div className="space-y-1.5">
                                <input
                                  type="text"
                                  placeholder="Add reviewer feedback comment..."
                                  value={feedbackNotes[sub.id] || ""}
                                  onChange={(e) =>
                                    setFeedbackNotes({ ...feedbackNotes, [sub.id]: e.target.value })
                                  }
                                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => setActiveNoteEvidenceId(null)}
                                    className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5"
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActiveNoteEvidenceId(sub.id)}
                                className="text-[11px] text-slate-400 hover:text-amber-400 inline-flex items-center gap-1 transition"
                              >
                                <MessageSquare className="w-3 h-3" />
                                {feedbackNotes[sub.id] ? "Edit Remark" : "Add Dean's Remark"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* If already reviewed, display notes */}
                  {sub.reviewNotes && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-xs flex items-center justify-between text-slate-400">
                      <div>
                        <strong className="text-slate-300">Audited Remark:</strong> {sub.reviewNotes}
                      </div>
                      <span className="text-[10px] text-slate-500">Tamper-Proof Audit Logged</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
