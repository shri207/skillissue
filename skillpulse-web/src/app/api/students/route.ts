import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseNaturalLanguageQuery } from "@/lib/ai-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const filterDept = searchParams.get("dept") || "";
    const filterSkill = searchParams.get("skill") || "";
    const filterYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    let parsedQuery = null;
    let targetSkills: string[] = [];
    let targetDept = filterDept;

    if (query.trim()) {
      parsedQuery = await parseNaturalLanguageQuery(query);
      if (parsedQuery.filters.skills.length > 0) {
        targetSkills = parsedQuery.filters.skills;
      }
      if (parsedQuery.filters.department && !targetDept) {
        targetDept = parsedQuery.filters.department;
      }
    }

    if (filterSkill && !targetSkills.includes(filterSkill)) {
      targetSkills.push(filterSkill);
    }

    // Fetch students with relations
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          include: {
            college: true,
            department: true,
          },
        },
        program: true,
        skills: {
          include: {
            skill: true,
            evidences: true,
          },
        },
      },
    });

    // Filter students
    const filtered = students.filter((s) => {
      // Dept filter
      if (targetDept) {
        const dCode = s.user.department?.code?.toLowerCase() || "";
        const dName = s.user.department?.name?.toLowerCase() || "";
        if (!dCode.includes(targetDept.toLowerCase()) && !dName.includes(targetDept.toLowerCase())) {
          return false;
        }
      }

      // Year filter
      if (filterYear && s.batchYear !== filterYear) {
        return false;
      }

      // Skills filter
      if (targetSkills.length > 0) {
        const studentSkillNames = s.skills.map((sk) => sk.skill.name.toLowerCase());
        const hasSkill = targetSkills.some((ts) =>
          studentSkillNames.some((ssn) => ssn.includes(ts.toLowerCase()))
        );
        if (!hasSkill) return false;
      }

      return true;
    });

    // Shape response
    const formatted = filtered.map((s) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      rollNumber: s.rollNumber,
      collegeName: s.user.college?.name || "CEG",
      collegeCode: s.user.college?.code || "CEG-001",
      departmentName: s.user.department?.name || "CSE",
      departmentCode: s.user.department?.code || "CSE",
      batchYear: s.batchYear,
      cgpa: s.cgpa,
      githubUsername: s.githubUsername,
      verifiedSkillsCount: s.skills.filter((sk) => sk.status === "VERIFIED").length,
      completenessScore: s.completenessScore,
      skills: s.skills.map((sk) => ({
        id: sk.id,
        name: sk.skill.name,
        code: sk.skill.code,
        domain: sk.skill.domain,
        category: sk.skill.category,
        proficiency: sk.proficiency,
        score: sk.score,
        status: sk.status,
        provenanceScore: sk.provenanceScore,
        evidenceCount: sk.evidences.length,
        evidences: sk.evidences.map((e) => ({
          id: e.id,
          title: e.title,
          type: e.evidenceType,
          url: e.url,
          issuer: e.issuer,
          status: e.status,
          provenanceScore: e.provenanceScore,
        })),
      })),
    }));

    return NextResponse.json({
      total: formatted.length,
      students: formatted,
      parsedQuery,
    });
  } catch (error) {
    console.error("Error searching students:", error);
    return NextResponse.json({ error: "Failed to search students" }, { status: 500 });
  }
}
