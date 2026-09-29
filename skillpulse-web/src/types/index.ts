// SkillPulse Core Shared Types

export type UserRole =
  | "SYSTEM_ADMIN"
  | "UNIVERSITY_ADMIN"
  | "COLLEGE_ADMIN"
  | "DEPT_HEAD"
  | "FACULTY"
  | "STUDENT"
  | "RECRUITER";

export type ProficiencyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "FLAGGED";

export type EvidenceType =
  | "CERTIFICATE"
  | "GITHUB_REPO"
  | "PULL_REQUEST"
  | "HACKATHON_PROJECT"
  | "COURSE_COMPLETION"
  | "COMPETITIVE_PROGRAMMING"
  | "RESEARCH_PAPER"
  | "FACULTY_ENDORSEMENT";

export type EvidenceStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "FLAGGED";

export interface SkillItem {
  id: string;
  code: string;
  name: string;
  domain: string;
  category: string;
  description?: string;
  proficiency?: ProficiencyLevel;
  score?: number;
  status?: VerificationStatus;
  provenanceScore?: number;
}

export interface StudentCardData {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  collegeName: string;
  collegeCode: string;
  departmentCode: string;
  batchYear: number;
  cgpa?: number;
  avatarUrl?: string;
  verifiedSkills: SkillItem[];
  completenessScore: number;
}

export interface ExtractedEntity {
  text: string;
  label: "SKILL" | "TECH" | "ISSUER" | "DATE" | "ROLE" | "ACHIEVEMENT";
  confidence: number;
  start: number;
  end: number;
}

export interface SkillMappingResult {
  raw: string;
  canonical_id?: string;
  canonical_name?: string;
  domain?: string;
  category?: string;
  similarity: number;
  status: "EXACT_MATCH" | "SEMANTIC_MATCH" | "UNMAPPED";
}

export interface ParsedSearchQuery {
  query: string;
  intent:
    | "FIND_STUDENTS"
    | "FIND_TEAMS"
    | "SKILL_GAP_ANALYSIS"
    | "VERIFY_EVIDENCE"
    | "LEADERBOARD"
    | "EXPORT_REPORT";
  confidence: number;
  filters: {
    skills: string[];
    proficiency?: string;
    college?: string;
    department?: string;
    year?: string;
    min_verified?: number;
  };
  inference_time_ms: number;
}

export interface EvidenceVerificationResult {
  verdict: "VERIFIED" | "SUSPICIOUS" | "REJECTED";
  confidence: number;
  provenance_score: number;
  checks: Record<string, boolean>;
  flagged_reasons: string[];
  suggested_level: ProficiencyLevel;
}
