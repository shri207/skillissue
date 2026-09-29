import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAiServiceHealth } from "@/lib/ai-client";

export async function GET() {
  try {
    const [collegesCount, deptsCount, studentsCount, skillsCount, verifiedSkillsCount] =
      await Promise.all([
        prisma.college.count(),
        prisma.department.count(),
        prisma.studentProfile.count(),
        prisma.skill.count(),
        prisma.studentSkill.count({ where: { status: "VERIFIED" } }),
      ]);

    const recentVerifications = await prisma.evidence.findMany({
      where: { status: "APPROVED" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        studentSkill: {
          include: {
            student: { include: { user: true } },
            skill: true,
          },
        },
      },
    });

    const aiHealth = await checkAiServiceHealth();

    return NextResponse.json({
      collegesCount,
      deptsCount,
      studentsCount,
      skillsCount,
      verifiedSkillsCount,
      recentVerifications,
      aiHealth,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch platform stats" }, { status: 500 });
  }
}
