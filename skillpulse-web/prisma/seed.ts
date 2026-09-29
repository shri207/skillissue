import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding SkillPulse database...");

  // 1. University
  const university = await prisma.university.upsert({
    where: { code: "AU-TN" },
    update: {},
    create: {
      name: "Anna University",
      code: "AU-TN",
      state: "Tamil Nadu",
      country: "India",
    },
  });

  // 2. Colleges
  const ceg = await prisma.college.upsert({
    where: { code: "CEG-001" },
    update: {},
    create: {
      universityId: university.id,
      name: "College of Engineering, Guindy",
      code: "CEG-001",
      city: "Chennai",
      state: "Tamil Nadu",
      tier: 1,
      accreditation: "NAAC A++",
    },
  });

  const psg = await prisma.college.upsert({
    where: { code: "PSG-002" },
    update: {},
    create: {
      universityId: university.id,
      name: "PSG College of Technology",
      code: "PSG-002",
      city: "Coimbatore",
      state: "Tamil Nadu",
      tier: 1,
      accreditation: "NAAC A+",
    },
  });

  // 3. Departments
  const cseDept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: ceg.id, code: "CSE" } },
    update: {},
    create: {
      collegeId: ceg.id,
      name: "Department of Computer Science and Engineering",
      code: "CSE",
    },
  });

  const itDept = await prisma.department.upsert({
    where: { collegeId_code: { collegeId: ceg.id, code: "IT" } },
    update: {},
    create: {
      collegeId: ceg.id,
      name: "Department of Information Technology",
      code: "IT",
    },
  });

  // 4. Programs
  const existingProg = await prisma.program.findFirst({
    where: { departmentId: cseDept.id, name: "B.E. Computer Science and Engineering" }
  });
  const beCse = existingProg || await prisma.program.create({
    data: {
      departmentId: cseDept.id,
      name: "B.E. Computer Science and Engineering",
      degree: "B.E.",
      durationYears: 4,
    },
  });

  // 5. Skills from Taxonomy
  const taxonomyPath = path.resolve(__dirname, "../../skillpulse-models/data/canonical_taxonomy.json");
  if (fs.existsSync(taxonomyPath)) {
    const skillsData = JSON.parse(fs.readFileSync(taxonomyPath, "utf-8"));
    for (const s of skillsData) {
      const skill = await prisma.skill.upsert({
        where: { code: s.id },
        update: {},
        create: {
          code: s.id,
          name: s.name,
          domain: s.domain,
          category: s.category,
          description: s.description,
          isCanonical: true,
        },
      });

      if (s.aliases && Array.isArray(s.aliases)) {
        for (const alias of s.aliases) {
          await prisma.skillAlias.upsert({
            where: {
              skillId_normalizedAlias: {
                skillId: skill.id,
                normalizedAlias: alias.toLowerCase().trim(),
              },
            },
            update: {},
            create: {
              skillId: skill.id,
              alias: alias,
              normalizedAlias: alias.toLowerCase().trim(),
            },
          });
        }
      }
    }
  }

  // 6. Users across roles
  await prisma.user.upsert({
    where: { email: "admin@skillpulse.edu" },
    update: {},
    create: {
      email: "admin@skillpulse.edu",
      name: "System Administrator",
      passwordHash: "$2a$10$wK1Ww6aZ1uR1wQJq9JzU0.e8sB.FvD7.G4g3s8v0j0c9v8b7n6m5",
      role: "SYSTEM_ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "faculty.ramesh@ceg.edu" },
    update: {},
    create: {
      email: "faculty.ramesh@ceg.edu",
      name: "Dr. K. Ramesh",
      passwordHash: "$2a$10$wK1Ww6aZ1uR1wQJq9JzU0.e8sB.FvD7.G4g3s8v0j0c9v8b7n6m5",
      role: "FACULTY",
      collegeId: ceg.id,
      departmentId: cseDept.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "recruiter@talent.io" },
    update: {},
    create: {
      email: "recruiter@talent.io",
      name: "Ananya Sharma",
      passwordHash: "$2a$10$wK1Ww6aZ1uR1wQJq9JzU0.e8sB.FvD7.G4g3s8v0j0c9v8b7n6m5",
      role: "RECRUITER",
    },
  });

  // Students Seed
  const studentsSeed = [
    {
      name: "Aravind Swaminathan",
      email: "aravind.s@student.ceg.edu",
      roll: "2022103001",
      year: 2026,
      sem: 6,
      cgpa: 9.15,
      github: "aravind-dev",
      skills: [
        { code: "py-001", level: "ADVANCED", score: 94.0, status: "VERIFIED" },
        { code: "pytorch-022", level: "ADVANCED", score: 91.0, status: "VERIFIED" },
        { code: "docker-030", level: "INTERMEDIATE", score: 82.0, status: "VERIFIED" },
        { code: "fastapi-018", level: "ADVANCED", score: 88.0, status: "VERIFIED" },
        { code: "postgresql-035", level: "INTERMEDIATE", score: 79.0, status: "VERIFIED" },
      ],
      evidence: {
        title: "Smart India Hackathon 2024 - AI Medical Triage",
        type: "HACKATHON_PROJECT",
        url: "https://github.com/aravind-dev/ai-triage-sih24",
        issuer: "Government of India / AICTE",
        provenance: 0.95,
      },
    },
    {
      name: "Priya Sundaram",
      email: "priya.sundaram@student.ceg.edu",
      roll: "2022103042",
      year: 2026,
      sem: 6,
      cgpa: 8.85,
      github: "priyacodes",
      skills: [
        { code: "react-010", level: "EXPERT", score: 96.0, status: "VERIFIED" },
        { code: "ts-002", level: "ADVANCED", score: 92.0, status: "VERIFIED" },
        { code: "nextjs-011", level: "ADVANCED", score: 90.0, status: "VERIFIED" },
        { code: "tailwind-013", level: "EXPERT", score: 95.0, status: "VERIFIED" },
      ],
      evidence: {
        title: "Realtime Collaborative Whiteboard",
        type: "GITHUB_REPO",
        url: "https://github.com/priyacodes/collab-canvas",
        issuer: "GitHub",
        provenance: 0.93,
      },
    },
    {
      name: "Karthik Raja",
      email: "karthik.r@student.ceg.edu",
      roll: "2023103015",
      year: 2027,
      sem: 4,
      cgpa: 8.4,
      github: "karthik-sec",
      skills: [
        { code: "cybersecurity-043", level: "ADVANCED", score: 89.0, status: "VERIFIED" },
        { code: "py-001", level: "INTERMEDIATE", score: 78.0, status: "VERIFIED" },
        { code: "linux-048", level: "ADVANCED", score: 87.0, status: "VERIFIED" },
      ],
      evidence: {
        title: "Top 10 Finalist - National Cyber Defense CTF",
        type: "COMPETITIVE_PROGRAMMING",
        url: "https://ctf.cyberdefence.in/rankings/ceg-team",
        issuer: "CERT-In / Cyber Security Task Force",
        provenance: 0.94,
      },
    },
  ];

  for (const s of studentsSeed) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        name: s.name,
        passwordHash: "$2a$10$wK1Ww6aZ1uR1wQJq9JzU0.e8sB.FvD7.G4g3s8v0j0c9v8b7n6m5",
        role: "STUDENT",
        collegeId: ceg.id,
        departmentId: cseDept.id,
      },
    });

    const profile = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        programId: beCse.id,
        rollNumber: s.roll,
        batchYear: s.year,
        currentSemester: s.sem,
        cgpa: s.cgpa,
        githubUsername: s.github,
        verifiedSkillsCount: s.skills.filter((x) => x.status === "VERIFIED").length,
        totalSkillsCount: s.skills.length,
        completenessScore: 88.0,
      },
    });

    for (const sk of s.skills) {
      const dbSkill = await prisma.skill.findUnique({ where: { code: sk.code } });
      if (dbSkill) {
        const studentSkill = await prisma.studentSkill.upsert({
          where: {
            studentId_skillId: {
              studentId: profile.id,
              skillId: dbSkill.id,
            },
          },
          update: {},
          create: {
            studentId: profile.id,
            skillId: dbSkill.id,
            proficiency: sk.level,
            score: sk.score,
            status: sk.status,
            provenanceScore: 0.92,
            lastVerifiedAt: new Date(),
          },
        });

        if (s.evidence) {
          const existingEvidence = await prisma.evidence.findFirst({
            where: { studentSkillId: studentSkill.id, title: s.evidence.title }
          });
          if (!existingEvidence) {
            await prisma.evidence.create({
              data: {
                studentSkillId: studentSkill.id,
                evidenceType: s.evidence.type,
                title: s.evidence.title,
                url: s.evidence.url,
                issuer: s.evidence.issuer,
                status: "APPROVED",
                provenanceScore: s.evidence.provenance,
                reviewNotes: "Verified by Faculty Ramesh via GitHub & certificate checks.",
              },
            });
          }
        }
      }
    }
  }

  console.log("Database seeded successfully with universities, colleges, departments, skills, and student profiles!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
