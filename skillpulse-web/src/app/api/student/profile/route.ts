import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "aravind.s@student.ceg.edu";

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        college: true,
        department: true,
        studentProfile: {
          include: {
            program: true,
            skills: {
              include: {
                skill: true,
                evidences: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // Get all available students for easy switcher in UI
    const [allStudents, allSkills] = await Promise.all([
      prisma.user.findMany({
        where: { role: "STUDENT" },
        select: {
          id: true,
          name: true,
          email: true,
          studentProfile: {
            select: { rollNumber: true },
          },
        },
      }),
      prisma.skill.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          code: true,
          name: true,
          domain: true,
          category: true,
        },
      }),
    ]);

    const profile = user.studentProfile;
    const allEvidences = profile.skills.flatMap((sk) =>
      sk.evidences.map((e) => ({
        ...e,
        skillName: sk.skill.name,
        skillCode: sk.skill.code,
        skillProficiency: sk.proficiency,
      }))
    );

    return NextResponse.json({
      student: {
        id: profile.id,
        name: user.name,
        email: user.email,
        rollNumber: profile.rollNumber,
        batchYear: profile.batchYear,
        currentSemester: profile.currentSemester,
        cgpa: profile.cgpa,
        githubUsername: profile.githubUsername,
        college: user.college?.name || "CEG Guindy",
        collegeCode: user.college?.code || "CEG-001",
        department: user.department?.name || "Computer Science",
        departmentCode: user.department?.code || "CSE",
        verifiedSkillsCount: profile.skills.filter((sk) => sk.status === "VERIFIED").length,
        totalSkillsCount: profile.skills.length,
        completenessScore: profile.completenessScore,
        skills: profile.skills.map((sk) => ({
          id: sk.id,
          name: sk.skill.name,
          code: sk.skill.code,
          domain: sk.skill.domain,
          category: sk.skill.category,
          proficiency: sk.proficiency,
          score: sk.score,
          status: sk.status,
          provenanceScore: sk.provenanceScore,
        })),
        evidences: allEvidences,
      },
      availableStudents: allStudents.map((s) => ({
        name: s.name,
        email: s.email,
        rollNumber: s.studentProfile?.rollNumber,
      })),
      availableSkills: allSkills,
    });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    return NextResponse.json({ error: "Failed to load student profile" }, { status: 500 });
  }
}
