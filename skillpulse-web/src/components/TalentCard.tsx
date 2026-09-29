"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-5 transition hover:border-black space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-zinc-900">{student.name}</h3>
            <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
              {student.rollNumber}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {student.departmentName} • {student.collegeName} • Batch {student.batchYear}
            {student.cgpa && <span> • CGPA: {student.cgpa.toFixed(2)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {student.githubUsername && (
            <a
              href={`https://github.com/${student.githubUsername}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-zinc-600 hover:text-black underline font-medium"
            >
              GitHub
            </a>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            {student.verifiedSkillsCount} Verified
          </span>
        </div>
      </div>

      {/* Verified Skills */}
      <div>
        <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
          Verified Competencies
        </div>
        <div className="flex flex-wrap gap-1.5">
          {student.skills.map((skill) => (
            <div
              key={skill.id}
              className="px-2.5 py-1 rounded bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 flex items-center gap-1.5"
            >
              <span>{skill.name}</span>
              <span className="text-[10px] text-zinc-400">{skill.proficiency}</span>
              {skill.status === "VERIFIED" && (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expand/Collapse Evidence Details */}
      <div className="pt-1 flex items-center justify-between text-xs">
        <span className="text-zinc-500">
          Profile Completeness: <strong className="text-zinc-900">{Math.round(student.completenessScore)}%</strong>
        </span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-black font-medium inline-flex items-center gap-1 hover:underline"
        >
          {expanded ? (
            <>
              Hide Proofs <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              Inspect Proofs ({student.skills.reduce((acc, s) => acc + (s.evidenceCount || 0), 0)}){" "}
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs">
          {student.skills.flatMap((s) => (s.evidences || []).map((ev) => (
            <div key={ev.id} className="p-3 bg-zinc-50 rounded border border-zinc-100 flex items-center justify-between">
              <div>
                <span className="font-semibold text-zinc-800">{ev.title}</span>
                <span className="text-zinc-500 ml-2">({s.name} • {ev.type})</span>
              </div>
              {ev.url && (
                <a
                  href={ev.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-black underline font-medium inline-flex items-center gap-1"
                >
                  Link <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )))}
        </div>
      )}
    </div>
  );
}
