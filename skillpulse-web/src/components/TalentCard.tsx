"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Award,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";

interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  url?: string;
  issuer?: string;
  status: string;
  provenanceScore: number;
}

interface SkillItem {
  id: string;
  name: string;
  code: string;
  domain: string;
  category: string;
  proficiency: string;
  score: number;
  status: string;
  provenanceScore: number;
  evidenceCount: number;
  evidences?: EvidenceItem[];
}

interface StudentProps {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  collegeName: string;
  collegeCode: string;
  departmentName: string;
  departmentCode: string;
  batchYear: number;
  cgpa?: number;
  githubUsername?: string;
  verifiedSkillsCount: number;
  completenessScore: number;
  skills: SkillItem[];
}

export default function TalentCard({ student }: { student: StudentProps }) {
  const [expanded, setExpanded] = useState(false);

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case "EXPERT":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "ADVANCED":
        return "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";
      case "INTERMEDIATE":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
      default:
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/60 shadow-xl relative overflow-hidden group">
      {/* Accent gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 opacity-80" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-lg text-white shadow-inner">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                {student.name}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {student.rollNumber}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                {student.collegeCode} • {student.departmentCode}
              </span>
              <span>•</span>
              <span>Batch {student.batchYear}</span>
              {student.cgpa && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">CGPA {student.cgpa}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-2">
          {student.githubUsername && (
            <a
              href={`https://github.com/${student.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="GitHub Profile"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          )}
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {student.verifiedSkillsCount} Verified
          </div>
        </div>
      </div>

      {/* Verified Skills Grid */}
      <div className="mt-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2">
          Verified Competencies
        </p>
        <div className="flex flex-wrap gap-1.5">
          {student.skills.map((skill) => (
            <div
              key={skill.id}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${getProficiencyColor(
                skill.proficiency
              )}`}
            >
              <span>{skill.name}</span>
              <span className="text-[10px] opacity-75 font-semibold">
                {Math.round(skill.score)}%
              </span>
              {skill.status === "VERIFIED" && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Provenance & Confidence Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Provenance Score:</span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
              style={{ width: `${Math.min(100, student.completenessScore)}%` }}
            />
          </div>
          <span className="font-semibold text-slate-200">
            {Math.round(student.completenessScore)}%
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          {expanded ? "Hide Evidence" : "View Evidence"}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Evidence Drawer */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 bg-slate-950/40 -mx-5 -mb-5 p-5 rounded-b-2xl">
          <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-400" />
            Verified Evidence Portfolio
          </p>

          <div className="space-y-2">
            {student.skills.flatMap((s) => s.evidences || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No direct evidence attachments linked.</p>
            ) : (
              student.skills.flatMap((s) => s.evidences || []).map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-semibold text-slate-200">{e.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {e.type}
                      </span>
                      {e.issuer && <span>• Issuer: {e.issuer}</span>}
                      <span>• Provenance: {Math.round(e.provenanceScore * 100)}%</span>
                    </div>
                  </div>

                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-medium transition-colors"
                    >
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
