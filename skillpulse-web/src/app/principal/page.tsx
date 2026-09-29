"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Search,
  Check,
  X,
  RefreshCw,
  ArrowRight,
  GraduationCap,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

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

  const handleAction = async (evidenceId: string, action: "APPROVE" | "REJECT") => {
    setActionLoadingId(evidenceId);
    setNotification(null);
    try {
      const note = remarks[evidenceId] || (action === "APPROVE" ? "Approved by Principal" : "Rejected upon evaluation");
      const res = await fetch("/api/principal/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evidenceId,
          action,
          reviewerNotes: note,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");

      setNotification(`Evidence ${action === "APPROVE" ? "approved" : "rejected"} successfully.`);
      await fetchQueue();
    } catch (err: any) {
      setNotification(`Error: ${err.message || "Action failed"}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      sub.student.name.toLowerCase().includes(q) ||
      sub.student.rollNumber.toLowerCase().includes(q) ||
      sub.skill.name.toLowerCase().includes(q) ||
      sub.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Principal & Dean Review Console</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Verify student submitted credentials and officially endorse competencies to institutional records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student"
              className="text-xs text-zinc-700 hover:text-black font-medium border border-zinc-300 hover:border-zinc-400 bg-white px-3 py-1.5 rounded transition"
            >
              Go to Student Portal →
            </Link>
            <button
              onClick={fetchQueue}
              className="text-xs text-zinc-500 hover:text-black border border-zinc-300 p-1.5 rounded bg-white"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimalist Summary Counters */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-zinc-100">
          <div
            onClick={() => setFilter("PENDING")}
            className="cursor-pointer"
          >
            <div className={`text-2xl font-bold ${filter === "PENDING" ? "text-black" : "text-zinc-600"}`}>
              {stats.pendingCount}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Pending Review</div>
          </div>

          <div
            onClick={() => setFilter("APPROVED")}
            className="cursor-pointer"
          >
            <div className={`text-2xl font-bold ${filter === "APPROVED" ? "text-black" : "text-zinc-600"}`}>
              {stats.approvedCount}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Approved</div>
          </div>

          <div
            onClick={() => setFilter("REJECTED")}
            className="cursor-pointer"
          >
            <div className={`text-2xl font-bold ${filter === "REJECTED" ? "text-black" : "text-zinc-600"}`}>
              {stats.rejectedCount}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Rejected</div>
          </div>

          <div
            onClick={() => setFilter("ALL")}
            className="cursor-pointer"
          >
            <div className={`text-2xl font-bold ${filter === "ALL" ? "text-black" : "text-zinc-600"}`}>
              {stats.totalCount}
            </div>
            <div className="text-xs text-zinc-500 font-medium">Total Records</div>
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded text-xs font-medium flex items-center justify-between">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-black text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-zinc-200 p-3 rounded-lg text-xs">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filter === "PENDING"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            Pending ({stats.pendingCount})
          </button>
          <button
            onClick={() => setFilter("APPROVED")}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filter === "APPROVED"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            Approved ({stats.approvedCount})
          </button>
          <button
            onClick={() => setFilter("REJECTED")}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filter === "REJECTED"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            Rejected ({stats.rejectedCount})
          </button>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded font-medium transition ${
              filter === "ALL"
                ? "bg-black text-white"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            All Records
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search student, roll no, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-300 rounded pl-8 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 bg-white border border-zinc-200 rounded-lg text-xs">
          Loading review queue...
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-lg text-xs">
          No submissions found for the selected filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const isPending = sub.status === "UNDER_REVIEW" || sub.status === "SUBMITTED";
            const isLoading = actionLoadingId === sub.id;

            return (
              <div
                key={sub.id}
                className="bg-white border border-zinc-200 rounded-lg p-5 space-y-3 text-xs"
              >
                {/* Header: Student Identity & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 text-sm">{sub.student.name}</span>
                      <span className="font-mono text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                        {sub.student.rollNumber}
                      </span>
                      <span className="text-zinc-500 text-[11px]">
                        {sub.student.department} • CGPA: {sub.student.cgpa.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div>
                    {sub.status === "APPROVED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    ) : sub.status === "REJECTED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" /> Awaiting Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Evidence Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 text-sm">{sub.title}</span>
                    <span className="text-[11px] font-medium bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                      Skill: {sub.skill.name}
                    </span>
                  </div>

                  {sub.description && (
                    <p className="text-zinc-600 bg-zinc-50 p-2.5 rounded border border-zinc-100">
                      {sub.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-[11px] pt-1">
                    {sub.issuer && <span>Platform: {sub.issuer}</span>}
                    {sub.url && (
                      <a
                        href={sub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline inline-flex items-center gap-1 font-medium"
                      >
                        Inspect Proof <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span>Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Area */}
                {isPending ? (
                  <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Add Dean's remark (optional)..."
                      value={remarks[sub.id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [sub.id]: e.target.value })}
                      className="flex-1 bg-white border border-zinc-300 rounded px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-black placeholder-zinc-400"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleAction(sub.id, "APPROVE")}
                        disabled={isLoading}
                        className="bg-black hover:bg-zinc-800 text-white font-medium px-4 py-1.5 rounded text-xs transition disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(sub.id, "REJECT")}
                        disabled={isLoading}
                        className="border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium px-3 py-1.5 rounded text-xs transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  sub.reviewNotes && (
                    <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-600">
                      <strong>Dean's Remark:</strong> {sub.reviewNotes}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
