import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        college: true,
        users: {
          include: {
            studentProfile: {
              include: {
                skills: {
                  include: { skill: true },
                },
              },
            },
          },
        },
      },
    });

    const marketPriorities = [
      { skill: "Docker & Containerization", category: "DevOps", benchmark: 80 },
      { skill: "PyTorch & Deep Learning", category: "AI & ML", benchmark: 75 },
      { skill: "TypeScript & Modern Full Stack", category: "Web", benchmark: 85 },
      { skill: "Cybersecurity & Cryptography", category: "Security", benchmark: 70 },
      { skill: "Cloud Architecture (AWS/GCP)", category: "Cloud", benchmark: 80 },
    ];

    const reports = departments.map((dept) => {
      const studentProfiles = dept.users
        .map((u) => u.studentProfile)
        .filter((sp): sp is NonNullable<typeof sp> => sp !== null);

      const totalStudents = studentProfiles.length;

      const skillCoverage = marketPriorities.map((item) => {
        let count = 0;
        studentProfiles.forEach((sp) => {
          const hasSkill = sp.skills.some(
            (sk) =>
              sk.status === "VERIFIED" &&
              (sk.skill.name.toLowerCase().includes(item.category.toLowerCase()) ||
                sk.skill.domain.toLowerCase().includes(item.category.toLowerCase()))
          );
          if (hasSkill) count++;
        });

        const actualPercent = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 45;
        const gap = Math.max(0, item.benchmark - actualPercent);

        return {
          priority: item.skill,
          category: item.category,
          benchmarkPercent: item.benchmark,
          currentCoveragePercent: actualPercent,
          gapPercent: gap,
        };
      });

      const avgGap = Math.round(
        skillCoverage.reduce((acc, c) => acc + c.gapPercent, 0) / skillCoverage.length
      );

      return {
        departmentId: dept.id,
        departmentName: dept.name,
        departmentCode: dept.code,
        collegeName: dept.college.name,
        studentCount: totalStudents,
        averageGapPercent: avgGap,
        coverageBreakdown: skillCoverage,
        recommendations: [
          `Organize a 2-week hands-on bootcamp on ${skillCoverage.sort((a,b) => b.gapPercent - a.gapPercent)[0].priority}`,
          "Integrate verifiable open-source projects into semester coursework",
          "Partner with industry recruiters for verified capstone mentorship",
        ],
      };
    });

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      marketPriorities,
      reports,
    });
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json({ error: "Failed to generate skill gap report" }, { status: 500 });
  }
}
