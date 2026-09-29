# SkillPulse: Multi-College University Talent Intelligence Platform

[![Status](https://img.shields.io/badge/Status-Live%20&%20Trained-emerald)]()
[![Hardware](https://img.shields.io/badge/GPU-NVIDIA%20GTX%201650%20(4GB)-76b900)]()
[![Models](https://img.shields.io/badge/AI%20Models-100%25%20Custom%20Trained%20Offline-indigo)]()
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016%20App%20Router-black)]()
[![Backend](https://img.shields.io/badge/Serving-FastAPI%20%2B%20ONNX%20Runtime-009688)]()

SkillPulse is an institutional-scale, multi-agent university talent intelligence platform designed to replace unverified resume claims and GPA-only recruitment with cryptographically verified, evidence-backed competency graphs across universities.

---

## Key Highlights

- **100% Offline Custom AI**: No external AI APIs (no Gemini, no OpenAI). All NLP models are custom-trained on an **NVIDIA GeForce GTX 1650** using PyTorch + FP16 mixed precision and exported to **ONNX Runtime** for high-speed, zero-GPU CPU inference.
- **Explainable Talent Search**: Natural language recruiter queries are parsed by a joint DistilBERT dual-head model, extracting intents and slot entities (skills, department, year) with real-time explanation banners.
- **Evidence Provenance Engine**: Automated verification checks on GitHub repositories, competition ranking links, and certificate issuers with immutable audit logs.
- **Inter-College Leaderboards**: Domain-ranked student percentiles across AI/ML, Web Development, DevOps, and Cybersecurity.
- **Institutional Skill Gap Radar**: Departmental competency coverage vs market benchmarks with automated curriculum recommendations for university leadership.

---

## Custom NLP Models

| Model | Base Architecture | Parameters | Final Metrics | Role |
| :--- | :--- | :--- | :--- | :--- |
| **SkillExtractor** | DistilBERT (`distilbert-base-uncased`) | 66M | **96.42% Token Acc** | Extracts 13 BIO entity tags (SKILL, TECH, ISSUER, DATE, ROLE, ACHIEVEMENT) from unstructured student evidence. |
| **SkillMapper** | MiniLM-L6 (`all-MiniLM-L6-v2`) | 22M | **Val Loss: 0.0269** | Contrastive semantic embedder mapping informal terminology to canonical taxonomy with precomputed index. |
| **QueryParser** | DistilBERT Dual-Head | 66M | **100.0% Intent Acc, 99.26% Slot Acc** | Joint multi-task intent classification + token slot extraction for recruiter search queries. |

---

## Directory Structure

```
.
├── skillpulse-models/              # Python Custom AI Engine
│   ├── app/serve.py                # FastAPI ONNX serving server (Port 8000)
│   ├── checkpoints/                # PyTorch fine-tuned model checkpoints
│   ├── data/                       # Canonical taxonomy & synthetic datasets
│   ├── onnx/                       # Exported ONNX models (.onnx)
│   ├── scripts/                    # Model training pipelines (train_ner, train_mapper, train_query)
│   └── training_status.json        # Verified training convergence metrics
│
├── skillpulse-web/                 # Next.js 16 Full-Stack Web Platform (Port 3000)
│   ├── prisma/
│   │   ├── schema.prisma           # 15-entity relational schema
│   │   └── seed.ts                 # Colleges, departments, skills, & student profiles
│   └── src/
│       ├── app/                    # App Router pages (/search, /verification, /leaderboard, /skill-gap)
│       ├── components/             # Navbar, TalentCard, UI badges
│       ├── lib/                    # Prisma singleton & AI client bridge
│       └── types/                  # Shared TypeScript interfaces
│
├── SKILLPULSE_IMPLEMENTATION_PLAN.md   # Architectural blueprint & specification
└── SkillPulse_Research_Problem_Solution_Implementation_Report.md # Research report
```

---

## Quickstart Guide

### 1. Web Platform (Next.js)

```bash
cd skillpulse-web
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Custom AI Serving Engine (FastAPI)

```bash
cd skillpulse-models
# Run inference server on CPU
python app/serve.py
```

FastAPI server runs on **[http://127.0.0.1:8000](http://127.0.0.1:8000)** (`/health`, `/api/extract`, `/api/map`, `/api/parse-query`, `/api/verify-evidence`).

### 3. Re-train Models on GPU (Optional)

```bash
cd skillpulse-models
# Run end-to-end training pipeline on NVIDIA GPU
python scripts/train_all.py
```

---

## License

MIT License. Developed for University Talent Intelligence.
