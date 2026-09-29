import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyEvidenceSubmission } from "@/lib/ai-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentEmail,
      skillCode,
      evidenceType,
      title,
      description,
      url,
      issuer,
      issueDate,
    } = body;

    if (!studentEmail || !skillCode || !title || !evidenceType) {
      return NextResponse.json(
        { error: "studentEmail, skillCode, evidenceType, and title are required" },
        { status: 400 }
      );
    }

    // 1. Find user & student
    const user = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: { studentProfile: true },
    });

    if (!user || !user.studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    // 2. Find skill
    const skill = await prisma.skill.findUnique({
      where: { code: skillCode },
    });

    if (!skill) {
      return NextResponse.json({ error: "Skill not found in taxonomy" }, { status: 404 });
    }

    // 3. AI Verification Pre-Check
    const verification = await verifyEvidenceSubmission({
      evidence_type: evidenceType,
      evidence_url: url,
      issuer,
      issue_date: issueDate,
      claimed_skills: [skill.name],
    });

    // 4. Create or get StudentSkill
    const studentSkill = await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: {
          studentId: user.studentProfile.id,
          skillId: skill.id,
        },
      },
      update: {
        provenanceScore: verification.provenance_score,
        status: "PENDING_REVIEW",
      },
      create: {
        studentId: user.studentProfile.id,
        skillId: skill.id,
        proficiency: verification.suggested_level || "INTERMEDIATE",
        score: Math.round(verification.provenance_score * 100),
        status: "PENDING_REVIEW",
        provenanceScore: verification.provenance_score,
      },
    });

    // 5. Create Evidence Record awaiting Principal Approval
    const evidence = await prisma.evidence.create({
      data: {
        studentSkillId: studentSkill.id,
        evidenceType,
        title,
        description: description || "Student submitted credential evidence",
        url,
        issuer,
        issueDate: issueDate ? new Date(issueDate) : null,
        status: "UNDER_REVIEW",
        provenanceScore: verification.provenance_score,
        metadata: JSON.stringify(verification),
        reviewNotes: `AI Pre-Check: ${verification.verdict} (Confidence: ${Math.round(verification.confidence * 100)}%). Pending Principal / Dean verification review.`,
      },
    });

    // 6. Record Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "EVIDENCE_SUBMITTED",
        entityType: "Evidence",
        entityId: evidence.id,
        newValues: JSON.stringify({
          evidenceId: evidence.id,
          verdict: verification.verdict,
          provenanceScore: verification.provenance_score,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      evidence,
      verification,
    });
  } catch (error) {
    console.error("Error submitting evidence:", error);
    return NextResponse.json({ error: "Failed to submit evidence" }, { status: 500 });
  }
}
