import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || "All";

    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          include: {
            college: true,
            department: true,
          },
        },
        skills: {
          include: {
            skill: true,
            evidences: true,
          },
        },
      },
    });

    const ranked = students
      .map((s) => {
        const relevantSkills =
          domain === "All"
            ? s.skills
            : s.skills.filter((sk) => sk.skill.domain.toLowerCase() === domain.toLowerCase());

        const verifiedSkills = relevantSkills.filter((sk) => sk.status === "VERIFIED");
        const totalScore = verifiedSkills.reduce((acc, sk) => acc + sk.score, 0);
        const avgScore = verifiedSkills.length > 0 ? totalScore / verifiedSkills.length : 0;

        return {
          id: s.id,
          name: s.user.name,
          email: s.user.email,
          college: s.user.college?.name || "CEG",
          department: s.user.department?.code || "CSE",
          batchYear: s.batchYear,
          verifiedSkillsCount: verifiedSkills.length,
          totalScore: Math.round(totalScore),
          averageScore: Math.round(avgScore),
          topSkills: verifiedSkills.slice(0, 3).map((sk) => sk.skill.name),
        };
      })
      .filter((s) => s.verifiedSkillsCount > 0)
      .sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({
      domain,
      totalRanked: ranked.length,
      rankings: ranked.map((r, idx) => ({ ...r, rank: idx + 1 })),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
