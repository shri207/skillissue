# SkillPulse: Research-Backed Problem, Solution, and Implementation Report

**Prepared:** 28 September 2026  
**Audience:** project team, academic reviewers, university stakeholders, and hackathon judges  
**Research approach:** focused desk review of peer-reviewed ePortfolio, employability, learning-analytics, privacy, and LLM skill-extraction literature; review of the project notes; and a scan of current product/standards context. This is a focused literature review, not a preregistered systematic review.

---

## 1. Executive summary

### The idea

**SkillPulse is a multi-college university talent intelligence platform that connects a student’s skills to projects, certifications, achievements, activities, and authorized academic records—with source, evidence, reviewer, date, and visibility attached.** Students use it to understand and share their development. Authorized university staff use it to find evidence-backed capabilities, identify support and learning needs, and connect students with projects, mentoring, and opportunities.

The product combines:

1. a student-controlled portfolio;
2. a university-managed evidence and verification workflow;
3. a shared, configurable skills/competency taxonomy;
4. an explainable search and analytics layer for authorized users; and
5. Gemini-assisted extraction and query parsing, with human verification and deterministic backend permissions.

### The problem

The team’s central problem hypothesis is that **universities—especially umbrella universities with constituent or affiliated colleges—cannot easily build one current, comparable, trusted view of what students can demonstrate**. Relevant evidence sits in different files, systems, repositories, event records, and department processes. Colleges may use different definitions and levels of digital infrastructure. Staff therefore rely on manual collection and filtering, while student self-reports, certificates, academic records, and demonstrated work can appear equally authoritative even though they are not.

This exact institutional pain must be validated with the intended university. Published studies support the surrounding issues—portfolio usefulness, adoption barriers, employability evidence, weak causal evidence for broad analytics claims, privacy concerns, and the need to evaluate AI extraction—but do **not** prove that SkillPulse’s proposed combination already improves placement or learning outcomes.

### Recommended product position

Do **not** claim that no ePortfolio or student-skills platform exists. Current products already advertise portfolios, competencies, co-curricular activities, badges, role-based access, and analytics. The research opportunity to validate is narrower and stronger:

> **Can an evidence-provenance and review layer, designed for a university hierarchy with multiple colleges and uneven infrastructure, create useful cross-college visibility without creating an opaque student ranking or an unsustainable verification burden?**

### Recommended MVP

Build one end-to-end workflow:

> **Student submits project/certificate evidence → Gemini proposes structured metadata and skill tags → student corrects suggestions → authorized reviewer approves/rejects with a reason → profile shows each skill linked to its evidence and provenance → staff search returns authorized, explainable matches.**

Use a sample roster or an authorized import. Do not imply a live SIS/ERP connector exists until it is built. Keep attendance/CGPA read-only, optional, purpose-limited, and separate from general talent matching. Put auto-team formation, trend radar, industry-gap radar, career passport, and the OD request workflow on the roadmap.

---

## 2. Product idea

### 2.1 Product name and one-line idea

**SkillPulse — a living, evidence-linked talent profile and discovery layer for universities.**

### 2.2 Formal product definition

SkillPulse is a multi-tenant, multi-college platform that consolidates student capability evidence into traceable profiles. It distinguishes institution-sourced facts, issuer credentials, reviewer-approved evidence, student-reported claims, and machine-generated suggestions. It connects these records to a common but locally mappable skills taxonomy so authorized university staff can search and analyze capability with an explanation of the evidence behind each result. Students retain control over their own portfolio content and external sharing.

### 2.3 Core promise

SkillPulse should help a student or institution answer:

- What can this student show evidence for?
- Where did each profile item come from?
- Who reviewed it, when, and under what rule?
- How recent is the supporting evidence?
- Which students match a defined opportunity, and why?
- What is unknown because the data is missing, not because the student lacks ability?
- Where are skill records or verification processes incomplete across colleges?

### 2.4 What “verified talent graph” means

“Talent graph” describes linked data; it does not mean a model can accurately measure a student’s innate talent. The graph should preserve explicit relationships:

```text
Student ──has a claim about──> Skill
   │                             │
   ├──built/contributed to──> Project ──supports──┘
   ├──earned───────────────> Certificate ──aligns to──> Skill
   ├──participated in──────> Achievement / Activity ──may suggest──> Skill
   └──belongs to──────────> Program / Department / College

Evidence ──has source──> University system / Issuer / GitHub URL / Uploaded file
Review ──records──> decision + reviewer + timestamp + reason
```

For the MVP, represent this as normalized relational records and join tables. A specialized graph database is not needed to demonstrate the concept.

---

## 3. Problem statement

### 3.1 Main problem statement

> **Universities with multiple colleges lack a dependable, low-friction way to assemble and compare current student capability evidence across departments. Student skills and achievements are distributed across self-reported profiles, certificates, projects, activities, academic systems, and local spreadsheets. Their sources and verification standards differ, and university staff often have to collect, normalize, review, and search the information manually. As a result, students can be overlooked, opportunity matching takes time, institutional skill-gap claims may be based on incomplete or self-reported data, and cross-college planning lacks a clear account of data coverage and trust.**

### 3.2 Problem statement in one sentence

**How might we help a multi-college university find and support students based on current, explainable evidence of their capabilities, while respecting student agency, local college differences, data protection, and staff review capacity?**

### 3.3 Problem statement for a proposal or presentation

Universities hold grades, attendance, and enrollment records, but these records do not capture all of a student’s applied work, skills, certificates, competition outcomes, research, and transferable experience. The additional evidence is scattered across systems and often inconsistently classified or verified. This prevents students from presenting a coherent, evidence-backed development record and makes it difficult for staff to discover relevant student capabilities across programs and colleges. A system is needed to connect capability claims to traceable evidence, apply clear verification and privacy rules, and make searches and aggregates explainable.

### 3.4 What the problem is not

- It is **not** simply “students have no portfolio.” Existing portfolios and co-curricular platforms exist.
- It is **not** “universities have no student data.” They generally hold official records; the hypothesis is that applied capability evidence is dispersed and hard to compare.
- It is **not** “AI can certify a student’s skill.” Model extraction can propose tags; evidence, assessment, and authorized review establish what the system may claim.
- It is **not** necessarily a universal or equally severe problem. The current notes supply a team hypothesis, not interview or usage measurements.
- It is **not** solved by adding more dashboard charts. Learning-analytics dashboard studies warn that display alone does not guarantee better outcomes.

---

## 4. Stakeholders and current pain hypotheses

| Stakeholder | Likely current difficulty | SkillPulse opportunity | What discovery must confirm |
|---|---|---|---|
| Student | Evidence is scattered; may not know how to connect an experience to skills or communicate it | Student-managed profile, evidence links, feedback, selected sharing | Will students update profiles outside placement season? What reward is useful? |
| Faculty/mentor | Reviewing many inconsistent submissions takes time; capability claims lack context | Structured evidence queue, scoped review, project contribution fields, clear decisions | How much review time is affordable? Which evidence deserves review? |
| HOD/department admin | Department view may depend on spreadsheet calls and term-end reports | Coverage and evidence summaries, local taxonomy mapping | Which decisions are currently delayed or unsupported? |
| Central university admin | Difficult to compare records across affiliated/constituent colleges | Cross-college aggregates with source/completeness information | Does a central user actually need student-level search, or only aggregate data? |
| Placement/career team | Shortlisting may rely on marks, self-declared skills, or manual file searches | Opportunity-specific opt-in matching with evidence and explanation | What information can be used lawfully and ethically for placement? |
| Industry/research partner | Has a project need but may not know which students have relevant work | Shareable, student-authorized shortlist or portfolio | Will a university intermediary be enough, or do students need direct sharing? |
| Registrar/IT/data protection | Integrations, data ownership, access, retention, and accuracy requests create risk | Source lineage, access scope, audit history, documented interfaces | What system is the authoritative source for each data field? |

### 4.1 Root causes in the team notes

The supplied notes identify the following root causes. They are consolidated here for testing:

1. **Fragmented evidence:** files, learning portals, spreadsheets, project platforms, event organizers, and certifications are not in one searchable place.
2. **No common definition:** a skill or project can mean different things across colleges; local calendars and taxonomies differ.
3. **Trust is flattened:** “student entered this,” “university system supplied this,” “issuer signed this,” and “reviewer approved this” may all appear as the same checkmark.
4. **Manual verification:** responsibility and standards vary by department or college; reviewer workload may be high.
5. **Low update incentive:** students may only compile evidence when placement season begins.
6. **Unequal infrastructure:** a platform that requires API access, GitHub, or a polished digital portfolio could exclude students or colleges without those resources.
7. **Weak longitudinal records:** records may show participation or completion without showing growth, contribution, recency, or evidence status.
8. **Limited actionable analytics:** raw counts can be mistaken for capability or departmental performance when participation and data completeness differ.

---

## 5. Existing research and what it says

### 5.1 How this review was scoped

The literature search focused on research about ePortfolios and demonstrated capability, employer use, institution-wide implementation, employability/skills alignment, learning-analytics efficacy, privacy/ethics, and automated skill extraction. Reviews and peer-reviewed empirical studies were prioritized. A relevant but discipline-limited health-professions review was retained because it directly summarizes ePortfolio use and measurement limits. A 2025 curricular-analytics LLM paper was included as a technical analogue; it evaluates curriculum-text skill extraction, not individual student assessment.

This report does not claim that these papers represent every publication in the field. The reference list is a useful starting bibliography for the project proposal and a future systematic review.

### 5.2 Annotated research review

| Study | Design / evidence | Main finding | What it means for SkillPulse | Limitation |
|---|---|---|---|---|
| **Buckley, Coleman & Khan (2010), “Best evidence on the educational effects of undergraduate portfolios”** ([DOI](https://doi.org/10.1111/j.1743-498X.2010.00364.x)) | Best Evidence Medical Education review of undergraduate portfolios in health professions | Higher-quality studies suggested portfolios can help integrate theory with practice, support self-awareness/reflection, and help students process difficult experiences | Treat the profile as a learning and reflection tool, not merely a recruiter directory. Let students write contribution/reflection notes linked to evidence. | Health professions; small review article; not evidence that a cross-university talent database improves hiring or outcomes. |
| **Blevins & Brill (2017), “Enabling Systemic Change: Creating an ePortfolio Implementation Framework…”** ([journal paper](https://www.isetl.org/ijtlhe/ijtlhe-article-view.php?mid=2514)) | Design/development study at one large U.S. research university; survey responses from 52 faculty/admin users or former users, plus interviews and expert review | Participants emphasized usable infrastructure, clear purpose, training/support, stakeholder participation, and time/reward. 42% of survey respondents said they had abandoned ePortfolio use; usability/reliability and time investment were common reported reasons. | Adoption and workload must be designed alongside software. Run a small pilot, give faculty a clear role, train reviewers, and measure time-to-review. | One institution, 36% survey response from those invited, retrospective self-report; not a universal abandonment rate. |
| **Mitchell et al. (2021), “Enhancing graduate employability through targeting ePortfolios to employer expectations”** ([DOI](https://doi.org/10.21153/jtlge2021vol12no2art1003)) | Systematic scoping review: six databases, 163 full texts reviewed, 17 studies included | Employer awareness and use of ePortfolios in recruitment were low. Perceived benefits included showing work/skills and differentiating candidates; issues included review time, too much information, and authenticity. Clear, concise work samples and context were recommended. | A student passport should be curated, concise, evidence-linked, and easy to review. Do not assume employers will adopt a new portal automatically; test sharing with actual hiring users. | Many included studies were U.S.-based; employer use has changed; a review of employer perceptions is not proof of employment impact. |
| **Janssens et al. (2022), “The role of ePortfolios in supporting learning in eight healthcare disciplines”** ([DOI](https://doi.org/10.1016/j.nepr.2022.103418)) | Scoping review of 37 papers across eight healthcare disciplines | ePortfolios were used for competency evidence, reflection, feedback, collaboration, professional development, employment, and certification. Most studies focused on perceptions (32); relatively few measured competence or behavioral outcomes. Time investment and digital access/literacy were reported challenges. | The feature list in the team notes has precedent, but the impact claim needs a pilot evaluation. Offer non-GitHub uploads and keep the student flow lightweight. | Healthcare-specific; studies and objectives were heterogeneous, limiting direct generalization to engineering or multi-college universities. |
| **Yang & Wong (2024), “An In-Depth Literature Review of E-Portfolio Implementation in Higher Education”** ([DOI](https://doi.org/10.2458/itlt.5809)) | Review of 17 implementation studies | The review groups implementation into steps involving purpose, stakeholders, platform, workshops, portfolio creation, and evaluation. It reports concerns around technology, policy, pedagogy, artifacts, privacy, student motivation, integrity, and teacher workload. | Treat implementation as a university change program: agree purposes and policies first, involve faculty early, train people, assess artifacts consistently, and evaluate the rollout. | Literature review scope and underlying studies vary; it provides implementation guidance, not a proven single best deployment design. |
| **Scandurra et al. (2024), “Do employability programmes in higher education improve skills and labour market outcomes?”** ([DOI](https://doi.org/10.1080/03075079.2023.2265425)) | Systematic review; screened 87 papers on university activities intended to build employability and affect labor-market outcomes | Stakeholders value employability activities, but the evidence is dominated by small-scale case studies and evaluations that are not robust enough to infer causal impact. Work-related learning is overrepresented. | Do not promise that SkillPulse itself improves employment. Evaluate near-term process outcomes and design a longer follow-up if claiming student skill or employment impact. | The paper reviews employability programs, not talent platforms; causal and long-term evidence gaps remain. |
| **Kaliisa et al. (2024), “Have Learning Analytics Dashboards Lived Up to the Hype?”** ([DOI](https://doi.org/10.1145/3636555.3636884)) | Systematic review of 38 learning-analytics dashboard studies | Many studies found negligible or small effects; evidence from well-powered controlled experiments was limited, and some comparisons confounded dashboard use with student engagement. | A dashboard is not the outcome. Each chart/search result should support a real action, and the pilot should measure whether it saves time or improves an identified workflow. | Reviews a range of dashboards and academic outcomes, not SkillPulse’s proposed evidence graph or opportunity matching. |
| **Liu & Khalil (2023), “Understanding privacy and data protection issues in learning analytics using a systematic review”** ([DOI](https://doi.org/10.1111/bjet.13388)) | Systematic review of 47 papers on learning-analytics privacy and data protection | Privacy issues span the entire analytics life cycle. Stakeholder views differ, and the review found limited applied evidence for the effectiveness of proposed safeguards. | Build access, purpose limits, notices, student sharing controls, auditing, and retention into ingestion, analysis, reporting, and export. Test these controls with real stakeholders. | Learning analytics is broader than skill portfolios; legal regimes and views differ across jurisdictions. |
| **Cerratto Pargman & McGrath (2021), “Mapping the Ethics of Learning Analytics in Higher Education”** ([DOI](https://doi.org/10.18608/jla.2021.1)) | Systematic review of 21 empirical papers published 2014–2019 | Identifies which ethical issues have been empirically studied and where the field’s evidence base remains thin. | Include students and staff in requirements research; explain why data is used; make students able to inspect/correct/share decisions about their records. | Literature cut-off was 2019; ethical issues and technical practices continue to evolve. |
| **Xu et al. (2025), “From Course to Skill: Evaluating LLM Performance in Curricular Analytics”** ([paper](https://arxiv.org/abs/2505.02324), [AIED 2025 program](https://aied2025.itd.cnr.it/index.html?p=695.html)) | Comparison of four skill-extraction/alignment approaches on 400 curriculum documents, with human/LLM-assisted evaluation | Retrieval-augmented generation performed best across tested document types; zero-shot prompting was worse than traditional NLP methods in most cases. Performance varied by model, prompt, and document type. | Ground Gemini extraction in a controlled skills catalog and retrieved source evidence, then validate output. Evaluate the actual student artifacts and local language; curriculum results cannot be transferred directly to student profiles. | Technical analogue, not an evaluation of student project/certificate extraction or Gemini 3.8 specifically; dataset and taxonomies are context-specific. |

### 5.3 Synthesis: what the literature supports

The papers support four measured conclusions:

1. **Portfolios can support documentation, reflection, feedback, and presentation of work.** Those functions appear across portfolio reviews and employer-focused research.
2. **Portfolio value depends on implementation, context, and user effort.** Adoption requires a clear purpose, a usable platform, stakeholder involvement, training, support, and time.
3. **Evidence of impact is weaker than the product pitch often implies.** Reviews find limited measurable outcomes or weak causal evidence. A searchable record or dashboard should not be presented as a proven employability intervention.
4. **Privacy, trust, authenticity, and data quality are core design questions.** They affect the full data lifecycle and the student’s willingness to contribute.

### 5.4 What the literature does not establish

The reviewed papers do **not** demonstrate that:

- a single “verified talent graph” is the accepted best architecture;
- a multi-college university has no current method or supplier for this problem;
- combining grades, attendance, GitHub, certificates, activities, and AI inference produces a fairer or more accurate shortlist;
- Gemini can authenticate certificates or accurately score proficiency;
- a skill trend dashboard causes universities to close skill gaps;
- a student passport increases employment rates;
- one canonical taxonomy will fit every department or college.

These are research and product hypotheses. The project should test them rather than presenting them as established findings.

---

## 6. Research gap and project contribution

### 6.1 Defensible research gap

Prior research has examined ePortfolio purposes, reflection, competency evidence, employability presentation, implementation, dashboards, and privacy. The supplied team concept proposes connecting several of these functions through explicit evidence provenance and review, under a multi-college university hierarchy with heterogeneous systems. The focused review did not establish whether that integrated design improves cross-college discovery or decision quality in practice.

The gap is best expressed as an **integration and evaluation gap**, not as “no one has built a portfolio.”

### 6.2 Proposed contribution

SkillPulse can contribute a pilot design that evaluates whether a university can:

- standardize cross-college reporting without deleting local skills terminology;
- show the chain from student claim to artifact, source, review, and time;
- provide authorized staff with useful, explainable opportunity search;
- achieve these outcomes at an acceptable reviewer workload and with student control.

### 6.3 Research questions for the project

**RQ1 — Fragmentation and governance:** What student capability data is currently available in each participating college, in what systems/formats, and who has authority to validate it?

**RQ2 — Evidence workflow:** Can a structured evidence and review workflow reduce the time needed to verify and locate relevant student work compared with the current process?

**RQ3 — Search quality:** Does an evidence-linked search return relevant candidates with clearer explanations than current manual or self-reported-skill search?

**RQ4 — Student agency and adoption:** Do students understand the provenance labels and use the profile when they can correct items and control what is shared?

**RQ5 — Fairness and coverage:** Are profiles and search results systematically less complete for students or colleges with less digital access, fewer paid certificates, or less institutional support?

### 6.4 Suggested hypotheses (pilot, not assumed truths)

- H1: Reviewers can locate relevant evidence-backed students faster than with a sample of the current manual process.
- H2: Students can correctly distinguish institution-sourced, reviewer-approved, self-reported, and AI-suggested information after using the profile.
- H3: A shared taxonomy with local mappings yields more consistent cross-college aggregate reporting than free-text skill labels.
- H4: Reviewer workload and student completion are acceptable only when the workflow is short, clear, and integrated into existing roles.

Set success thresholds with the institution before running the pilot. Do not invent post hoc thresholds to make an MVP appear successful.

---

## 7. Proposed SkillPulse solution

### 7.1 Core modules

#### A. Organization and identity

Represent university → college → department → program → cohort. Support student, reviewer, department admin, university admin, placement staff, and partner roles. Use institution identity/SSO when available; permit an appropriately governed initial CSV import for a pilot.

#### B. Student profile and source facts

Show stable identifiers and authorized profile fields. Official values such as attendance, CGPA, semester, and enrollment must come from an authorized system or be labelled demo/imported. Students can submit correction requests, but cannot overwrite authoritative data silently.

Each fact stores a source, source record key if available, effective period, import/sync date, and allowed audience.

#### C. Evidence portfolio

Support structured records for projects, certificates, competition achievements, research/publications, club roles, volunteering, presentations, and other approved activities. Capture dates, issuer/organizer, project role, individual contribution, evidence attachment/URL, team members, and privacy setting.

#### D. Skills taxonomy and mapping

Maintain a stable skill ID, canonical label, aliases, category, definition, level rubric if used, and version. Allow colleges to map local labels to canonical IDs and retain the original wording. Route ambiguous mappings to a reviewer instead of forcing a false match.

#### E. Review and provenance

Recommended distinct dimensions (do not reduce to one “trust score”):

- **Source type:** university source, verified credential issuer, reviewer, student, external URL, or model-extracted suggestion.
- **Workflow state:** draft, submitted, pending, approved, rejected, needs clarification, revoked, or expired.
- **Evidence count/quality:** transparent descriptor based on item types and review, not a judgment of the student.
- **Freshness:** date of latest relevant evidence; “no recent evidence in the system” is preferable to saying a skill is dormant or lost.
- **Inference:** explicit student/reviewer claim versus machine-suggested possible skill.

Approval of an artifact means the reviewer accepted that item under the institution’s process. It does not prove that every related skill is at an advanced level.

#### F. Career profile and opportunities

Let the student choose a target role or pathway. Compare explicit skill requirements to the profile, showing “supported by evidence,” “partially supported,” “not yet evidenced,” and “not shared.” Link next steps to university-approved resources where possible. Let students opt into each opportunity.

#### G. Search and analytics

Search should operate over authorized, normalized fields. Each candidate result includes matched criteria, evidence links, evidence date, provenance, and fields that were not considered. Institutional aggregates show count, denominator, reporting coverage, and date range; they do not imply that a department with more records is inherently better.

### 7.2 Verification matrix

| Record | Source of truth | What Gemini can do | Who/what verifies it | Student editing rule |
|---|---|---|---|---|
| Enrollment, program, term | SIS/registrar or authorized import | Normalize labels only | Source connector/admin reconciliation | Correction request, not direct overwrite |
| Attendance/CGPA | Academic system | No decision role; optional formatting only | Authoritative system | Read-only; restricted visibility |
| Certificate | Issuer’s validation service or review process | Extract issuer, title, date, likely skills | Issuer check or authorized reviewer | Student can submit, replace, or appeal via audit trail |
| Project | Artifact/repository plus contribution declaration | Summarize, extract candidate technologies/skills | Faculty/project mentor, rubric, or agreed process | Student can add/correct own description |
| Achievement | Organizer result or supporting document | Extract event/date/category | Organizer evidence or reviewer | Student submission with review state |
| Club/volunteering | Event/club records or named supervisor | Suggest transferable tags | Club lead/advisor where verification is needed | Student can declare; inference remains labelled |
| Career interest | Student-selected | Explain pathways | Student controls; no external verification needed | Private and editable |

### 7.3 Hidden talent suggestions

The idea of inferring event coordination, collaboration, communication, or leadership from activities is useful only when presented as a **potential skill suggestion**. Example: “Possible event coordination: inferred from three event-organizing records. Confirm or dismiss?” Never convert a repeated activity into an authoritative skill automatically. Record the evidence basis and let the student reject the suggestion.

### 7.4 Skill freshness

Keep the evidence date and evidence type visible. Use a per-skill policy where freshness matters, but never infer loss of competence from age alone. A two-year-old certificate and a current project prove different things. Suggested labels: “recent evidence,” “older evidence,” and “no newer evidence recorded.”

### 7.5 Talent passport

Let students create a concise portfolio with selected, shareable content. Use a private link with expiry/revocation or export. Default to omitting attendance, grades, internal remarks, private activities, and reviewer comments. Explain which institution or issuer stands behind each item.

---

## 8. Gemini-only AI design

### 8.1 Which Gemini model for Antigravity

Use **Gemini 3.8 Flash** as the Antigravity coding model if it is available in the installed version. Google’s Antigravity docs list Gemini 3.8 Flash and Gemini 3.1 Pro, and the Antigravity changelog says Gemini 3.8 Flash became the default model for new agents. If the user’s IDE only shows older choices, use Gemini 3.1 Pro from the Gemini options. The model selector is under the conversation prompt box, not in the terminal or Google sign-in area. [Antigravity model list](https://www.antigravity.google/docs/models/) · [Antigravity changelog](https://www.antigravity.google/changelog?tab=engine)

### 8.2 Gemini inside the product

Use Gemini in the first release only for bounded assistive operations:

1. extract candidate title, issuer, date, tools, and skills from the submitted item;
2. map free text to skill IDs in the approved catalog;
3. summarize a project for student confirmation;
4. parse a natural-language search request into an allowed query structure;
5. draft a student-facing pathway explanation from approved requirements.

Use Gemini 3.8 Flash as the first model to evaluate for these jobs. Confirm API availability, data handling, quotas, region, and production terms before implementation. Keep the API key server-side. Do not commit it.

### 8.3 Safe model boundary

```text
Evidence file or search request
          ↓
Gemini extraction / query parse (candidate JSON only)
          ↓
Schema validation + taxonomy lookup + source references
          ↓
Student correction and/or human reviewer
          ↓
Deterministic backend authorization, filters, and storage
```

Gemini must not authenticate a certificate, edit SIS data, decide eligibility, rank students by personal worth, or silently approve a skill. It must not infer protected/sensitive characteristics. Search retrieval and access control must happen in application code after validating role, institution scope, and an allowlisted query schema.

### 8.4 AI evaluation set

Before enabling extraction for real profiles, build a consented/de-identified, reviewer-labelled set of representative project summaries, certificate text, activities, languages, and file qualities. Have two reviewers label relevant skill IDs; resolve disagreement and preserve labels. Measure:

- precision, recall, and F1 for candidate skill tags;
- exactness of dates, issuers, and technology names;
- wrong or unsupported tags per artifact;
- agreement between reviewers;
- schema-valid output rate;
- performance by artifact type, language, college, and document quality;
- correction rate and time saved versus manual tagging.

Do not ship an automated proficiency level merely because a model assigns confidence. A confidence number is not a calibrated probability unless tested and calibrated.

---

## 9. Implementation plan

### Phase 0 — Validate the problem (before scaling features)

**Participants:** 5–8 students, 3–5 faculty/reviewers, 2–3 placement/career staff, one central admin, one IT/registrar representative from a pilot university. These are suggested discovery targets, not a statistically representative sample.

**Activities:** map the current process for one use case (e.g., selecting students for a faculty AI project); inspect a small anonymized set of existing records; identify who owns each source; measure manual search/review time; agree what fields can be used and shared; ask students what would motivate ongoing use.

**Deliverables:** current-state journey, field-source matrix, user roles, consent/visibility decisions, skill list and aliases, and a pilot success plan.

**Gate:** continue only if users can name a real workflow that is slow or unreliable and a buyer/sponsor can authorize a pilot.

### Phase 1 — Product and data design

Define organization hierarchy, role scopes, evidence states, allowed data fields, skill taxonomy, review policy, retention, appeal/correction process, and audit events. Prototype a student submission, reviewer queue, and explainable search result with representative users.

### Phase 2 — Hackathon MVP

Build only:

1. seeded accounts/role-aware login;
2. university → college → department scope;
3. basic student profile and clearly labelled sample academic data;
4. project and certificate submission;
5. Gemini structured metadata/skill suggestions;
6. student correction;
7. human approve/reject/request-clarification workflow;
8. evidence-linked profile with source, status, and date;
9. staff filters plus natural-language-to-query parsing;
10. “why matched?” result explanation and a few coverage-aware aggregates.

**Not in this MVP:** auto team formation, a wide industry-gap radar, alumni trajectories, real-time integration to multiple ERPs, a native credential wallet, predictive placement scores, and the OD attendance lifecycle.

### Phase 3 — Pilot at one university / limited colleges

Onboard one college with relatively mature data and one with a lighter/manual process if feasible. Use a small, bounded workflow and explicit data purpose. Train reviewers. Track profile completion, evidence quality, review time, query relevance, access errors, support needs, and student comprehension of labels.

### Phase 4 — Integration and federation

After learning the field mapping, add connectors for official systems using authenticated, least-privilege access. Where API support is not available, use validated CSV import with reconciliation and import logs. Maintain source IDs and update timestamps. Add college-level taxonomy mappings and delegated reviewer authority.

### Phase 5 — Expansion

Add a student pathway roadmap, opportunity workflows, team suggestions, credential exchange, and institutional trends only after coverage and definitions are stable. Consider standards-based credential portability and interoperable competency records.

### 9.1 Suggested greenfield architecture (adapt to current repository)

```text
Student / staff web app
          ↓
API + server-side authentication and scope checks
    ├── organization / role service
    ├── profile / evidence service
    ├── review / audit service
    ├── search / analytics service
    ├── import/connectors service
    └── Gemini adapter (server-side, structured outputs)
          ↓                         ↓
Relational database         Private object storage
          ↓
Audit, monitoring, backup, and export controls
```

Use the existing project stack if there is one. Do not rewrite the repository before inspecting its status. For greenfield, a relational database is a practical starting point because the main records are strongly related and require transactions, permissions, and audit history.

### 9.2 Core entities

`University`, `College`, `Department`, `Program`, `Cohort`, `User`, `ScopedRole`, `StudentProfile`, `AcademicFact`, `EvidenceItem`, `Project`, `Contribution`, `Credential`, `Achievement`, `Activity`, `Skill`, `SkillAlias`, `SkillClaim`, `SkillEvidence`, `VerificationAction`, `AuditEvent`, `CareerRole`, `CareerRequirement`, `CareerProfile`, `Opportunity`, and `StudentOptIn`.

Optional later entities: `ODRequest`, `ODEvidence`, `AttendancePosting`, `Issuer`, `DataConnector`, and `ImportBatch`.

Every record needs an explicit owner/scope, source, timestamps, visibility, and lifecycle state where applicable. Store files privately; issue time-bound access; validate file type/size; record deletion/retention decisions.

---

## 10. MVP acceptance criteria

The MVP is ready to demonstrate when:

- role and college scope are checked on the server for every student record;
- students cannot edit a source-marked official fact directly;
- a project/certificate is linked to the student and its original file/source;
- Gemini output is visibly marked as a suggestion and can be corrected;
- an authorized reviewer can approve/reject/request clarification with a reason;
- a profile distinguishes official source, reviewer-approved evidence, student entry, and model suggestion;
- a skill claim opens the evidence that supports it;
- a staff search can be reproduced with a structured query and shows matched conditions;
- search never returns records outside the current user’s scope;
- aggregates show time period and record coverage, not only a numerator;
- external sharing is not enabled by default;
- sample/demo data is clearly labelled as such;
- the implementation report states which features and checks are actually complete.

---

## 11. Evaluation plan

### 11.1 Baseline and comparison

For a pilot task such as finding students for a small faculty project, measure the current method first (e.g., spreadsheet/manual process): time, number of candidates reviewed, false inclusions/exclusions, and the reviewers’ confidence in evidence. Then repeat the same task with SkillPulse, using the same candidate pool and a pre-agreed relevance rubric.

### 11.2 Suggested pilot measures

| Dimension | Measure |
|---|---|
| Student value | Profile completion, evidence additions, corrections, share controls used, comprehension of status labels |
| Reviewer effort | Median review time, queue age, clarification rate, decisions per reviewer-hour |
| Evidence quality | Share with source/date, approval/rejection by type, duplicate/missing evidence rate |
| Search usefulness | Precision@k against reviewer-labeled candidates, time to shortlist, “why matched” comprehension |
| Data governance | Scope/access violations, correction resolution time, export logs, stale-source count |
| Equity/coverage | Participation and missing-evidence rates by college and relevant access groups where lawful and ethical to examine |
| Institutional outcomes | Training/opportunity actions triggered and completed; do not claim job impact from a short pilot |

### 11.3 Claims the team can make after the MVP

Before pilot evaluation, say: **“The prototype demonstrates an evidence-linked profile and explainable search workflow.”**

After a well-documented pilot, the team may report measured workflow results (e.g., median shortlist time) with sample, context, and limitations. Do not claim the product closes skill gaps, improves employment, or objectively measures talent unless a suitable longitudinal study supports it.

---

## 12. Privacy, fairness, and governance

The profile may combine identifiable educational records with activities and project artifacts. Treat privacy and fairness as product requirements from the first sprint:

- specify the purpose for each data field and the authority that supplies it;
- separate student portfolio visibility from internal academic access;
- make external employer sharing student-controlled and opportunity-specific;
- limit attendance and CGPA to authorized education purposes; do not use them as a general talent score;
- use role- and college-scoped access enforced server-side;
- log sensitive search, review, sharing, and export actions;
- let a student see, correct, contest, or remove student-contributed material, subject to institution policy;
- provide an auditable correction/appeal flow for official data rather than silently overwriting it;
- show “not recorded”/“not evidenced” instead of “does not have this skill”;
- avoid requirements for GitHub, paid certificates, public profiles, or high-bandwidth media;
- test taxonomy, skill extraction, search relevance, and data coverage across departments, colleges, language variants, and artifact types;
- do not infer sensitive personal attributes from clubs, projects, event history, or writing style;
- minimize identifiable text sent to Gemini; use a server-side adapter and assess provider data handling before live use;
- define retention, deletion, credential revocation, and incident response.

If the deployment is in India, review the Digital Personal Data Protection Act, 2023 and the 2025 commencement notification with the university’s qualified legal/privacy staff. The official notification phases commencement; the institution should confirm which provisions apply at the time of deployment. [MeitY Act](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf) · [Gazette commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)

---

## 13. Competitive position and standards

### 13.1 Competitive position

Current student products and platforms already include ePortfolios, competency mapping, activity/opportunity catalogs, badges, role-based staff permissions, student-controlled sharing, and some analytics. Therefore, the report does not claim that all comparable tools are missing.

SkillPulse’s proposed wedge is the **combination** of:

- university hierarchy across multiple colleges;
- a local-to-shared skill taxonomy mapping;
- source and review provenance on each capability item;
- heterogeneous onboarding (API, CSV, or assisted input);
- search that explains which reviewed evidence satisfied which requirement; and
- analytics that expose data coverage and uncertainty.

Whether existing systems already cover this combination for a target institution is a procurement and user-discovery question. The team should compare real deployments and integration costs, not only vendor feature pages.

### 13.2 Standards to consider

- **1EdTech CASE** can inform the structured exchange of competencies, learning outcomes, and standards.
- **Open Badges 3.0 and Comprehensive Learner Record 2.0** can inform portable, evidence-bearing achievement records.

These standards are not research proof that the product will work and not a substitute for university governance. They are useful design references if the team later needs interoperable credentials.

---

## 14. Adjacent workflow in the notes: OD requests

The pasted notes also define an on-duty attendance workflow. Keep it separate from the SkillPulse evidence MVP unless the university specifically chooses it as the first workflow.

```text
Applied / Pending Approval
    ├── pre-event approval → event date passes → Waiting for Certificate
    └── pre-event rejection → Rejected

Waiting for Certificate
    ├── upload proof → Verification Pending (student cannot silently edit)
    └── due date passes → overdue/reminder/escalation (to define)

Verification Pending
    ├── reviewer approves → Verified → authorized attendance posting
    └── reviewer rejects with remarks → Rejected → absent/correction route
```

Before implementation, define event-date changes, cancellation, submission deadlines, appeal/correction, reviewer delegation, and which system has authority to post attendance. An approved event invitation is not proof that attendance occurred; a completion certificate is evidence to review, not automatically authentic. An appeal path must exist for a false rejection. If later integrated, SkillPulse should receive only the attendance fact and provenance it is authorized to use, not take over the attendance system of record.

---

## 15. Risk register

| Risk | Consequence | Product response |
|---|---|---|
| Low student adoption | Profiles are incomplete; analytics are misleading | Give immediate student benefit, import minimal authorized facts, minimize entry, co-design reminders/incentives |
| Review burden | Faculty abandon the tool | Sample reviewer tasks, measure time, scope review policies, allow trusted sources where institution approves |
| False confidence in a checkmark | Users mistake source validation for mastery | Separate provenance, approval, level, and recency; show exact basis |
| Unequal digital opportunity | Students with fewer projects/certificates become less visible | Permit multiple evidence forms; offer faculty assessment and offline-assisted onboarding |
| Inconsistent taxonomy | Cross-college counts cannot be compared | Version canonical terms, map local terms, document mapping and uncertainty |
| LLM hallucination | Unsupported skills show on a student profile | Suggest-only status, citations, correction, reviewer queue, evaluation set, deterministic downstream logic |
| Unauthorized attendance/CGPA use | Unfair decisions and privacy harm | Exclude from talent scoring, narrow role permissions, purpose checks, no employer default visibility |
| Dashboard overclaim | Counts are treated as student/college quality | Show denominator, coverage, period, source quality; avoid leaderboard framing |
| Integration cost | Every college needs custom work | API where possible, controlled imports otherwise, phase connectors by pilot value |
| Overbuilt scope | Demo is broad but core flow unreliable | Ship one vertical slice; roadmap other modules |

---

## 16. Project status: what has and has not been established

The supplied text establishes that the team has **discussed** a broad platform vision and features. It does not establish that any feature has passed implementation or evaluation.

| Area | Status from supplied notes |
|---|---|
| SkillPulse living profile | Product idea discussed; institutional need still requires validation |
| Academic data integration | Requirement discussed; no connector or source confirmed |
| Project/certificate extraction | Proposed; no model evaluation results supplied |
| Human review | Proposed; no deployed workflow verified |
| Natural-language search | Proposed; no API/UI result supplied |
| Career gap/passport | Proposed; scope and policy remain to be defined |
| Auto-team/trend/industry radar | Later ideas; not recommended for first MVP |
| OD request/attendance transitions | Workflow described; no tested implementation shown |
| M7.1, CareerRole, CareerPathway, StudentCareerProfile | Mentioned in earlier pasted troubleshooting text only; repository state not available here |
| Foundation recovery output | Mentioned as having run; actual status report omitted, so PASS cannot be confirmed |
| Evaluation evidence | No pilot, interviews, labeled dataset, or test results included |

The next engineering step should be a repository inspection and actual status report before the team edits existing code. The next research step should be user discovery with the target university.

---

## 17. Final recommendation

Proceed with SkillPulse as a **research-backed prototype and pilot hypothesis**, not as a proven employability intervention. Center the MVP on trust and usefulness: source-tagged student evidence, human review, role-scoped access, a small shared taxonomy, and explainable opportunity search.

The strongest team story is:

> “A student’s capability is more than grades or a self-declared skill list. SkillPulse connects a skill claim to the work, credential, activity, source, and review that supports it. It gives students a clear, controlled way to present their development and gives authorized university teams a reasoned way to find relevant evidence across colleges. Gemini helps structure unstructured records; it does not verify people or make final decisions.”

### Short implementation sequence

1. Confirm the target workflow and data owners with students, faculty, registrar/IT, and placement staff.
2. Agree the skill taxonomy, provenance labels, sharing rules, and review policy.
3. Inspect the existing codebase and protect existing features.
4. Implement the student evidence → Gemini suggestion → reviewer decision → linked profile → explainable search slice.
5. Test extraction and search against reviewer-labeled examples before using live student records.
6. Pilot with limited colleges; measure review time, search utility, student comprehension, data coverage, and fairness risks.
7. Expand connectors and analytics only after the pilot proves the workflow valuable and sustainable.

---

## References

### Academic papers and reviews

1. Buckley, S., Coleman, J., & Khan, K. (2010). Best evidence on the educational effects of undergraduate portfolios. *The Clinical Teacher, 7*(3), 187–191. [https://doi.org/10.1111/j.1743-498X.2010.00364.x](https://doi.org/10.1111/j.1743-498X.2010.00364.x)
2. Blevins, S. J., & Brill, J. M. (2017). Enabling Systemic Change: Creating an ePortfolio Implementation Framework Through Design and Development Research for Use by Higher Education Professionals. *International Journal of Teaching and Learning in Higher Education, 29*(2), 216–232. [Journal article](https://www.isetl.org/ijtlhe/ijtlhe-article-view.php?mid=2514)
3. Mitchell, L., Campbell, C., Somerville, M., Cardell, E., & Williams, L. (2021). Enhancing graduate employability through targeting ePortfolios to employer expectations: A systematic scoping review. *Journal of Teaching and Learning for Graduate Employability, 12*(2), 82–98. [https://doi.org/10.21153/jtlge2021vol12no2art1003](https://doi.org/10.21153/jtlge2021vol12no2art1003)
4. Janssens, O., Haerens, L., Valcke, M., Beeckman, D., Pype, P., & Embo, M. (2022). The role of ePortfolios in supporting learning in eight healthcare disciplines: A scoping review. *Nurse Education in Practice, 63*, 103418. [https://doi.org/10.1016/j.nepr.2022.103418](https://doi.org/10.1016/j.nepr.2022.103418)
5. Yang, H., & Wong, R. (2024). An In-Depth Literature Review of E-Portfolio Implementation in Higher Education: Steps, Barriers, and Strategies. *Issues and Trends in Learning Technologies, 12*(1). [https://doi.org/10.2458/itlt.5809](https://doi.org/10.2458/itlt.5809)
6. Scandurra, R., Kelly, D., Fusaro, S., Cefalo, R., & Hermannsson, K. (2024). Do employability programmes in higher education improve skills and labour market outcomes? A systematic review of academic literature. *Studies in Higher Education, 49*(8), 1381–1396. [https://doi.org/10.1080/03075079.2023.2265425](https://doi.org/10.1080/03075079.2023.2265425)
7. Kaliisa, R., Misiejuk, K., López-Pernas, S., Khalil, M., & Saqr, M. (2024). Have Learning Analytics Dashboards Lived Up to the Hype? A Systematic Review of Impact on Students' Achievement, Motivation, Participation and Attitude. *Proceedings of LAK ’24*. [https://doi.org/10.1145/3636555.3636884](https://doi.org/10.1145/3636555.3636884)
8. Liu, Q., & Khalil, M. (2023). Understanding privacy and data protection issues in learning analytics using a systematic review. *British Journal of Educational Technology, 54*(6), 1715–1747. [https://doi.org/10.1111/bjet.13388](https://doi.org/10.1111/bjet.13388)
9. Cerratto Pargman, T., & McGrath, C. (2021). Mapping the Ethics of Learning Analytics in Higher Education: A Systematic Literature Review of Empirical Research. *Journal of Learning Analytics*. [https://doi.org/10.18608/jla.2021.1](https://doi.org/10.18608/jla.2021.1)
10. Xu, Z., Li, X., Huan, Y., Minaya, V., & Yu, R. (2025). From Course to Skill: Evaluating LLM Performance in Curricular Analytics. AIED 2025 paper/preprint. [https://arxiv.org/abs/2505.02324](https://arxiv.org/abs/2505.02324)
11. Valle, N. (2021). Staying on target: A systematic literature review on learner-facing learning analytics dashboards. *British Journal of Educational Technology, 52*, 1724–1748. [https://doi.org/10.1111/bjet.13089](https://doi.org/10.1111/bjet.13089)

### Standards, product, and policy references

- 1EdTech [CASE competency exchange](https://www.1edtech.org/standards/case)
- 1EdTech [Comprehensive Learner Record](https://www.1edtech.org/standards/clr)
- 1EdTech [Open Badges 3.0](https://standards.1edtech.org/open-badges/specifications/standards/v3p0/cert)
- Google Antigravity [model list](https://www.antigravity.google/docs/models/) and [changelog](https://www.antigravity.google/changelog?tab=engine)
- India MeitY [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf) and [2025 commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)
- Current product references: [Suitable Guided Pathways](https://www.suitable.co/products/guided-pathways), [PeopleGrove CORE MyCred](https://www.peoplegrove.com/products/core-mycred/), [Canvas Portfolio comparison](https://community.instructure.com/en/kb/articles/664383-portfolio-solutions-comparison-portfolium-eportfolios-folio-canvas-native-eportfolios-and-canvas-portfolio)

