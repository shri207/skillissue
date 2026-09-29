import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { evidenceId, action, reviewerNotes } = body;

    if (!evidenceId || !action || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "evidenceId and valid action ('APPROVE' or 'REJECT') are required" },
        { status: 400 }
      );
    }

    // 1. Fetch evidence with student skill and student profile
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        studentSkill: {
          include: {
            student: true,
            skill: true,
          },
        },
      },
    });

    if (!evidence) {
      return NextResponse.json({ error: "Evidence record not found" }, { status: 404 });
    }

    // 2. Fetch or assign a reviewer (Principal)
    let reviewer = await prisma.user.findFirst({
      where: { role: { in: ["PRINCIPAL", "DEAN", "ADMIN"] } },
    });

    if (!reviewer) {
      // Fallback to first user or create principal system user
      reviewer = await prisma.user.findFirst();
    }

    const newEvidenceStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const newSkillStatus = action === "APPROVE" ? "VERIFIED" : "REJECTED";

    // 3. Update Evidence
    const updatedEvidence = await prisma.evidence.update({
      where: { id: evidenceId },
      data: {
        status: newEvidenceStatus,
        reviewNotes:
          reviewerNotes ||
          (action === "APPROVE"
            ? "Verified and approved by Principal / Institutional Review Board."
            : "Rejected: Evidence documentation insufficient or non-verifiable."),
      },
    });

    // 4. Update StudentSkill
    await prisma.studentSkill.update({
      where: { id: evidence.studentSkillId },
      data: {
        status: newSkillStatus,
        lastVerifiedAt: action === "APPROVE" ? new Date() : undefined,
      },
    });

    // 5. Update StudentProfile stats (recalculate verified skills count)
    const studentProfileId = evidence.studentSkill.student.id;
    const verifiedSkillsCount = await prisma.studentSkill.count({
      where: {
        studentId: studentProfileId,
        status: "VERIFIED",
      },
    });

    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: {
        verifiedSkillsCount,
      },
    });

    // 6. Record Review Entry
    if (reviewer) {
      await prisma.evidenceReview.create({
        data: {
          evidenceId: evidence.id,
          reviewerId: reviewer.id,
          action,
          feedback: reviewerNotes || (action === "APPROVE" ? "Approved" : "Rejected"),
          rubricScore: action === "APPROVE" ? 95.0 : 30.0,
        },
      });
    }

    // 7. Record Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        userId: reviewer?.id || null,
        action: action === "APPROVE" ? "EVIDENCE_APPROVED_BY_PRINCIPAL" : "EVIDENCE_REJECTED_BY_PRINCIPAL",
        entityType: "Evidence",
        entityId: evidence.id,
        newValues: JSON.stringify({
          action,
          evidenceId,
          skill: evidence.studentSkill.skill.name,
          studentId: studentProfileId,
          reviewerNotes,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      action,
      evidence: updatedEvidence,
      verifiedSkillsCount,
    });
  } catch (error) {
    console.error("Error processing principal review:", error);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}
