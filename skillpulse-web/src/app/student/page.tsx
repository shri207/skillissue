"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronRight,
  User,
  ArrowRight,
  Upload,
  FileCheck,
} from "lucide-react";

interface StudentSkill {
  id: string;
  name: string;
  code: string;
  domain: string;
  category: string;
  proficiency: string;
  score: number;
  status: string;
  provenanceScore: number;
}

interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  evidenceType: string;
  url: string;
  issuer: string;
  issueDate: string;
  status: string;
  provenanceScore: number;
  skillName: string;
  skillCode: string;
  skillProficiency: string;
  reviewNotes?: string;
  createdAt: string;
}

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  batchYear: number;
  currentSemester: number;
  cgpa: number;
  githubUsername?: string;
  college: string;
  collegeCode: string;
  department: string;
  departmentCode: string;
  verifiedSkillsCount: number;
  totalSkillsCount: number;
  completenessScore: number;
  skills: StudentSkill[];
  evidences: EvidenceItem[];
}

interface AvailableStudent {
  name: string;
  email: string;
  rollNumber: string;
}

interface AvailableSkill {
  id: string;
  code: string;
  name: string;
  domain: string;
  category: string;
}

export default function StudentPortal() {
  const [selectedEmail, setSelectedEmail] = useState("aravind.s@student.ceg.edu");
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"submit" | "skills" | "history">("submit");

  // Form State
  const [formData, setFormData] = useState({
    skillCode: "pytorch-022",
    evidenceType: "CERTIFICATE",
    title: "",
    url: "",
    issuer: "",
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfile = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) {
        setProfile(data.student);
        setAvailableStudents(data.availableStudents || []);
        setAvailableSkills(data.availableSkills || []);
        if (data.availableSkills && data.availableSkills.length > 0 && !formData.skillCode) {
          setFormData((prev) => ({ ...prev, skillCode: data.availableSkills[0].code }));
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(selectedEmail);
  }, [selectedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/evidence/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail: profile.email,
          skillCode: formData.skillCode,
          evidenceType: formData.evidenceType,
          title: formData.title,
          description: formData.description,
          url: formData.url,
          issuer: formData.issuer,
          issueDate: formData.issueDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit evidence");

      setMessage({
        type: "success",
        text: `Submitted successfully. Evidence has been queued for the Principal's review.`,
      });

      // Clear input fields
      setFormData({
        skillCode: availableSkills[0]?.code || "pytorch-022",
        evidenceType: "CERTIFICATE",
        title: "",
        url: "",
        issuer: "",
        issueDate: new Date().toISOString().split("T")[0],
        description: "",
      });

      // Refresh data
      await fetchProfile(selectedEmail);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to submit. Please check required fields.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Banner */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900">
                {profile ? profile.name : "Loading..."}
              </h1>
              {profile && (
                <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-mono">
                  {profile.rollNumber}
                </span>
              )}
            </div>
            {profile && (
              <p className="text-xs text-zinc-500 mt-1">
                {profile.department} • {profile.college} • Semester {profile.currentSemester} • CGPA: {profile.cgpa.toFixed(2)}
              </p>
            )}
          </div>

          {/* Student Switcher Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">Student:</span>
            <select
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="text-xs bg-white border border-zinc-300 rounded px-2.5 py-1.5 text-zinc-800 focus:outline-none focus:border-black font-medium"
            >
              {availableStudents.map((s) => (
                <option key={s.email} value={s.email}>
                  {s.name} ({s.rollNumber || s.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Minimalist Summary Counters */}
        {profile && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-zinc-100">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-zinc-900">{profile.verifiedSkillsCount}</div>
              <div className="text-xs text-zinc-500 font-medium">Verified Skills</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-zinc-900">
                {profile.evidences.filter((e) => e.status === "UNDER_REVIEW" || e.status === "SUBMITTED").length}
              </div>
              <div className="text-xs text-zinc-500 font-medium">Under Review</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold text-zinc-900">{profile.evidences.length}</div>
              <div className="text-xs text-zinc-500 font-medium">Total Submissions</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 gap-6">
        <button
          onClick={() => setActiveTab("submit")}
          className={`pb-2.5 text-sm font-medium transition border-b-2 ${
            activeTab === "submit"
              ? "border-black text-black font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Submit Evidence
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-2.5 text-sm font-medium transition border-b-2 ${
            activeTab === "skills"
              ? "border-black text-black font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Skills & Verification ({profile?.skills.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-2.5 text-sm font-medium transition border-b-2 ${
            activeTab === "history"
              ? "border-black text-black font-semibold"
              : "border-transparent text-zinc-500 hover:text-zinc-900"
          }`}
        >
          Submission History ({profile?.evidences.length || 0})
        </button>
      </div>

      {/* TAB 1: SUBMIT EVIDENCE FORM */}
      {activeTab === "submit" && (
        <div className="bg-white border border-zinc-200 rounded-lg p-6 max-w-2xl">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-zinc-900">Submit Skill Evidence</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Submit your certificate or project link for Principal review and official skill endorsement.
            </p>
          </div>

          {message && (
            <div
              className={`mb-5 p-3 rounded-md text-xs border ${
                message.type === "success"
                  ? "bg-zinc-50 border-zinc-300 text-zinc-900 font-medium"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">
                  Target Skill <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.skillCode}
                  onChange={(e) => setFormData({ ...formData, skillCode: e.target.value })}
                  required
                  className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 text-xs focus:outline-none focus:border-black"
                >
                  {availableSkills.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.name} ({s.domain})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">
                  Evidence Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.evidenceType}
                  onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
                  required
                  className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 text-xs focus:outline-none focus:border-black"
                >
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="GITHUB_REPO">GitHub Repository</option>
                  <option value="HACKATHON_PROJECT">Hackathon Project</option>
                  <option value="COURSE_COMPLETION">Coursework / Lab Project</option>
                  <option value="COMPETITIVE_PROGRAMMING">Competitive Programming</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">
                Title / Credential Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deep Learning Specialization or Open Source Web App"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 text-xs focus:outline-none focus:border-black placeholder-zinc-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-700 font-medium mb-1">
                  Proof URL / Certificate Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://coursera.org/verify/... or https://github.com/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 text-xs focus:outline-none focus:border-black placeholder-zinc-400"
                />
              </div>

              <div>
                <label className="block text-zinc-700 font-medium mb-1">
                  Issuer / Platform
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coursera, AWS, LeetCode, GitHub"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 text-xs focus:outline-none focus:border-black placeholder-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-700 font-medium mb-1">
                Summary / Description
              </label>
              <textarea
                rows={3}
                placeholder="Briefly explain what was achieved or built..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white border border-zinc-300 rounded px-3 py-2 text-zinc-900 text-xs focus:outline-none focus:border-black placeholder-zinc-400"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-zinc-500 text-[11px]">
                Submissions are sent directly to the Principal's Review Queue.
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-black hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: SKILLS & STATUS TABLE */}
      {activeTab === "skills" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Student Competencies</h2>
            <button
              onClick={() => setActiveTab("submit")}
              className="text-xs text-black underline font-medium"
            >
              + Submit New
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-medium">
              <tr>
                <th className="px-5 py-3">Skill Name</th>
                <th className="px-5 py-3">Domain</th>
                <th className="px-5 py-3">Proficiency</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {profile?.skills.map((sk) => (
                <tr key={sk.id} className="hover:bg-zinc-50/50">
                  <td className="px-5 py-3.5 font-medium text-zinc-900">{sk.name}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{sk.domain}</td>
                  <td className="px-5 py-3.5 text-zinc-600">{sk.proficiency}</td>
                  <td className="px-5 py-3.5">
                    {sk.status === "VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : sk.status === "PENDING_REVIEW" ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" /> Under Review
                      </span>
                    ) : (
                      <span className="text-zinc-400">Unverified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SUBMISSION HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Submitted Evidence History</h2>
            <button
              onClick={() => setActiveTab("submit")}
              className="text-xs text-black underline font-medium"
            >
              + Submit Evidence
            </button>
          </div>

          {profile?.evidences.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No evidence submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {profile?.evidences.map((ev) => (
                <div key={ev.id} className="p-5 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 text-sm">{ev.title}</span>
                      <span className="text-[11px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                        {ev.skillName}
                      </span>
                    </div>
                    <div>
                      {ev.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Approved by Principal
                        </span>
                      ) : ev.status === "UNDER_REVIEW" || ev.status === "SUBMITTED" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3" /> In Review Queue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {ev.description && <p className="text-zinc-600">{ev.description}</p>}

                  <div className="flex flex-wrap items-center gap-4 text-zinc-500 text-[11px] pt-1">
                    {ev.issuer && <span>Issuer: {ev.issuer}</span>}
                    {ev.url && (
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline inline-flex items-center gap-1 font-medium"
                      >
                        Inspect Proof <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <span>Submitted: {new Date(ev.createdAt).toLocaleDateString()}</span>
                  </div>

                  {ev.reviewNotes && (
                    <div className="bg-zinc-50 border border-zinc-200 rounded p-2.5 text-zinc-700 text-[11px] mt-2">
                      <strong>Dean's Remark:</strong> {ev.reviewNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
