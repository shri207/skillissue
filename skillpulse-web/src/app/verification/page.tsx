"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ExternalLink,
  Clock,
  Send,
} from "lucide-react";

export default function VerificationPage() {
  // Playground state
  const [inputText, setInputText] = useState(
    "Completed Advanced Deep Learning with PyTorch certification issued by Coursera and DeepLearning.AI on August 2024. Implemented CNNs and Transformers using PyTorch and Torchvision as Lead Developer."
  );
  const [extracting, setExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);

  // Submission Form state
  const [studentEmail, setStudentEmail] = useState("aravind.s@student.ceg.edu");
  const [skillCode, setSkillCode] = useState("pytorch-022");
  const [evidenceType, setEvidenceType] = useState("CERTIFICATE");
  const [title, setTitle] = useState("Coursera Deep Learning Specialization");
  const [evidenceUrl, setEvidenceUrl] = useState("https://coursera.org/verify/DL-9941");
  const [issuer, setIssuer] = useState("DeepLearning.AI / Coursera");
  const [submitting, setSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);

  // Run SkillExtractor NER
  const handleExtract = async () => {
    setExtracting(true);
    try {
      const res = await fetch("/api/evidence/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (res.ok) {
        const data = await res.json();
        setExtractionResult(data);
      }
    } catch (err) {
      console.error("Extraction failed:", err);
    } finally {
      setExtracting(false);
    }
  };

  // Submit Evidence
  const handleSubmitEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionFeedback(null);
    try {
      const res = await fetch("/api/evidence/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentEmail,
          skillCode,
          evidenceType,
          title,
          url: evidenceUrl,
          issuer,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissionFeedback({ success: true, data });
      } else {
        setSubmissionFeedback({ success: false, error: data.error });
      }
    } catch (err: any) {
      setSubmissionFeedback({ success: false, error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated Heuristics + Custom NER Extraction</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Evidence Verification Pipeline
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl">
          Test the custom SkillExtractor (DistilBERT NER) and SkillMapper (MiniLM) models in real time.
          Evidence claims undergo automated validation checks before human faculty sign-off.
        </p>
      </div>

      {/* Grid: Playground on Left, Submit Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: AI Extraction Playground */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Interactive SkillExtractor NER Playground
            </h2>
            <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              DistilBERT BIO
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Paste any certificate transcript, GitHub commit message, or course syllabus:
          </p>

          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-slate-200 outline-none focus:border-indigo-500 leading-relaxed font-mono"
          />

          <button
            onClick={handleExtract}
            disabled={extracting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {extracting ? "Extracting Entities..." : "Run SkillExtractor & SkillMapper"}
          </button>

          {/* Results Output */}
          {extractionResult && (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Extracted Entities</span>
                <span className="font-mono text-emerald-400">
                  Latency: {extractionResult.inference_time_ms}ms ({extractionResult.model_version})
                </span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2">
                {extractionResult.entities.map((ent: any, idx: number) => {
                  let tagBg = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
                  if (ent.label === "ISSUER") tagBg = "bg-sky-500/20 text-sky-300 border-sky-500/30";
                  if (ent.label === "ROLE") tagBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                  if (ent.label === "DATE") tagBg = "bg-purple-500/20 text-purple-300 border-purple-500/30";

                  return (
                    <div
                      key={idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${tagBg}`}
                    >
                      <span className="text-[10px] opacity-75 font-bold uppercase">{ent.label}:</span>
                      <span>{ent.text}</span>
                      <span className="text-[9px] opacity-60">
                        {Math.round(ent.confidence * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Canonical Taxonomy Mapping */}
              {extractionResult.mappings && extractionResult.mappings.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    SkillMapper Canonical Alignment:
                  </span>
                  <div className="space-y-1.5">
                    {extractionResult.mappings.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-300 font-mono">&quot;{m.raw}&quot;</span>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-semibold">➔ {m.canonical_name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {Math.round(m.similarity * 100)}% sim
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Evidence Submission Form */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Submit Evidence for Verification
            </h2>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Provenance Engine
            </span>
          </div>

          <form onSubmit={handleSubmitEvidence} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Student Account</label>
              <select
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
              >
                <option value="aravind.s@student.ceg.edu">Aravind Swaminathan (2022103001)</option>
                <option value="priya.sundaram@student.ceg.edu">Priya Sundaram (2022103042)</option>
                <option value="karthik.r@student.ceg.edu">Karthik Raja (2023103015)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Target Skill</label>
                <select
                  value={skillCode}
                  onChange={(e) => setSkillCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="pytorch-022">PyTorch (pytorch-022)</option>
                  <option value="py-001">Python (py-001)</option>
                  <option value="react-010">React (react-010)</option>
                  <option value="docker-030">Docker (docker-030)</option>
                  <option value="cybersecurity-043">Cybersecurity (cybersecurity-043)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Evidence Type</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="CERTIFICATE">Certificate</option>
                  <option value="GITHUB_REPO">GitHub Repository</option>
                  <option value="HACKATHON_PROJECT">Hackathon Award</option>
                  <option value="COMPETITIVE_PROGRAMMING">Competitive Coding</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Evidence Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AWS Certified Solutions Architect"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Issuer / Authority</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Coursera, Amazon Web Services, LeetCode"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Verification URL / Repo</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://github.com/... or https://coursera.org/verify/..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Validating & Submitting..." : "Submit for Verification"}
            </button>
          </form>

          {/* Feedback */}
          {submissionFeedback && (
            <div
              className={`p-3 rounded-xl text-xs border ${
                submissionFeedback.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {submissionFeedback.success ? (
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Evidence verified and recorded!
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    Verdict: <span className="font-bold">{submissionFeedback.data.verification.verdict}</span> •
                    Provenance: {Math.round(submissionFeedback.data.verification.provenance_score * 100)}% •
                    Level: {submissionFeedback.data.verification.suggested_level}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  {submissionFeedback.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
