"use client";

import { useState, useEffect } from "react";
import { Search, GraduationCap } from "lucide-react";
import TalentCard from "@/components/TalentCard";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<any>(null);
  const [deptFilter, setDeptFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  const sampleQueries = [
    "Find students skilled in Python and PyTorch from CSE",
    "Search for developers proficient in Docker and PostgreSQL",
    "Find candidates with verified skills in React",
  ];

  async function performSearch(queryString = query, dept = deptFilter, skill = skillFilter) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryString) params.set("q", queryString);
      if (dept) params.set("dept", dept);
      if (skill) params.set("skill", skill);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setParsedQuery(data.parsedQuery || null);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    performSearch();
  }, [deptFilter, skillFilter]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <h1 className="text-xl font-bold text-zinc-900">Talent & Competency Directory</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Search students across CEG Guindy & PSG Tech based on strictly verified evidence.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleQuerySubmit} className="mt-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Find students skilled in Python and PyTorch from CSE..."
                className="w-full bg-white border border-zinc-300 rounded pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-black"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-100 text-xs">
          <span className="text-zinc-400 text-[11px]">Quick filters:</span>
          {sampleQueries.map((sq, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sq);
                performSearch(sq);
              }}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition"
            >
              &quot;{sq}&quot;
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div>
          Showing <strong>{students.length}</strong> verified candidate profiles
        </div>
      </div>

      {/* Student Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 bg-white border border-zinc-200 rounded-lg text-xs">
          Loading talent records...
        </div>
      ) : students.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 bg-white border border-zinc-200 rounded-lg text-xs">
          No candidates found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student) => (
            <TalentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
