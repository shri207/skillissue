import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "PENDING"; // PENDING, APPROVED, REJECTED, ALL
    const collegeCode = searchParams.get("college") || "";

    const whereClause: any = {};

    if (filter === "PENDING") {
      whereClause.status = { in: ["UNDER_REVIEW", "SUBMITTED"] };
    } else if (filter === "APPROVED") {
      whereClause.status = "APPROVED";
    } else if (filter === "REJECTED") {
      whereClause.status = "REJECTED";
    }

    if (collegeCode) {
      whereClause.studentSkill = {
        student: {
          user: {
            college: { code: collegeCode },
          },
        },
      };
    }

    const evidences = await prisma.evidence.findMany({
      where: whereClause,
      include: {
        studentSkill: {
          include: {
            skill: true,
            student: {
              include: {
                user: {
                  include: {
                    college: true,
                    department: true,
                  },
                },
                program: true,
              },
            },
          },
        },
        reviews: {
          include: {
            reviewer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Counts for stats summary badges
    const [pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
      prisma.evidence.count({ where: { status: { in: ["UNDER_REVIEW", "SUBMITTED"] } } }),
      prisma.evidence.count({ where: { status: "APPROVED" } }),
      prisma.evidence.count({ where: { status: "REJECTED" } }),
      prisma.evidence.count(),
    ]);

    const submissions = evidences.map((ev) => {
      let parsedMeta = null;
      try {
        if (ev.metadata) parsedMeta = JSON.parse(ev.metadata);
      } catch {
        parsedMeta = null;
      }

      return {
        id: ev.id,
        studentSkillId: ev.studentSkillId,
        title: ev.title,
        description: ev.description,
        evidenceType: ev.evidenceType,
        url: ev.url,
        issuer: ev.issuer,
        issueDate: ev.issueDate,
        status: ev.status,
        provenanceScore: ev.provenanceScore,
        metadata: parsedMeta,
        reviewNotes: ev.reviewNotes,
        createdAt: ev.createdAt,
        student: {
          id: ev.studentSkill.student.id,
          name: ev.studentSkill.student.user.name,
          email: ev.studentSkill.student.user.email,
          rollNumber: ev.studentSkill.student.rollNumber,
          cgpa: ev.studentSkill.student.cgpa,
          currentSemester: ev.studentSkill.student.currentSemester,
          college: ev.studentSkill.student.user.college?.name || "CEG Guindy",
          collegeCode: ev.studentSkill.student.user.college?.code || "CEG-001",
          department: ev.studentSkill.student.user.department?.name || "Computer Science",
          program: ev.studentSkill.student.program?.name || "B.Tech Computer Science and Engineering",
        },
        skill: {
          id: ev.studentSkill.skill.id,
          name: ev.studentSkill.skill.name,
          code: ev.studentSkill.skill.code,
          domain: ev.studentSkill.skill.domain,
          category: ev.studentSkill.skill.category,
          currentSkillStatus: ev.studentSkill.status,
          proficiency: ev.studentSkill.proficiency,
        },
        reviews: ev.reviews.map((r) => ({
          id: r.id,
          action: r.action,
          feedback: r.feedback,
          reviewerName: r.reviewer.name,
          createdAt: r.createdAt,
        })),
      };
    });

    return NextResponse.json({
      submissions,
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching principal review queue:", error);
    return NextResponse.json({ error: "Failed to load review queue" }, { status: 500 });
  }
}
