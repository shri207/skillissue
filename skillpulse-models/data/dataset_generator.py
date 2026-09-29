"""
SkillPulse Synthetic Dataset Generator
Generates realistic training datasets for:
1. SkillExtractor (DistilBERT NER - BIO tagging)
2. SkillMapper (Sentence-Transformers - Semantic Similarity Pairs)
3. QueryParser (DistilBERT - Joint Intent Classification + Slot Filling)
"""

import json
import random
from pathlib import Path

# Paths
DATA_DIR = Path(__file__).resolve().parent
TAXONOMY_PATH = DATA_DIR / "canonical_taxonomy.json"

# Load taxonomy
with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
    TAXONOMY = json.load(f)

SKILL_NAMES = [s["name"] for s in TAXONOMY]
SKILL_ALIASES = [alias for s in TAXONOMY for alias in s.get("aliases", [])]
ALL_SKILL_MENTIONS = list(set(SKILL_NAMES + SKILL_ALIASES))

ISSUERS = [
    "Coursera", "edX", "Udemy", "AWS Training", "Google Cloud Skills Boost",
    "DeepLearning.AI", "Meta Blueprint", "NPTEL", "HackerRank", "LeetCode",
    "freeCodeCamp", "Oracle University", "Microsoft Learn", "Cisco Networking Academy",
    "IIT Madras", "IIT Bombay", "Stanford Online", "Kaggle", "DataCamp"
]

ROLES = [
    "Lead Developer", "Full Stack Developer", "Backend Engineer", "Frontend Developer",
    "Machine Learning Engineer", "Data Scientist", "DevOps Engineer", "Project Lead",
    "Core Contributor", "Security Researcher", "Team Lead", "Cloud Architect",
    "Research Assistant", "Software Engineering Intern", "Mobile App Developer"
]

ACHIEVEMENTS = [
    "Won 1st prize", "Won 2nd place", "Finalist", "Top 5 team",
    "Grand prize winner", "Best Innovation Award", "Runner-up",
    "Special Jury Mention", "Selected for National Round", "Published paper"
]

HACKATHONS = [
    "Smart India Hackathon 2024", "Google Solution Challenge", "HackMIT",
    "ETHIndia", "Kaggle Grand Prix", "Hack This Fall", "Flipkart GRiD",
    "TCS CodeVita", "ACM-ICPC Regionals", "Microsoft Imagine Cup"
]

DATES = [
    "January 2024", "February 2024", "March 2024", "April 2024", "May 2024",
    "June 2024", "July 2024", "August 2024", "September 2024", "October 2024",
    "November 2024", "December 2024", "January 2025", "February 2025", "May 2025",
    "Spring 2024", "Fall 2024", "Summer 2024", "Q3 2024", "Q4 2024"
]

DEPARTMENTS = [
    "Computer Science and Engineering", "CSE", "Information Technology", "IT",
    "Electronics and Communication", "ECE", "Artificial Intelligence & Data Science", "AI&DS",
    "Electrical Engineering", "EEE", "Mechanical Engineering", "MECH"
]

COLLEGES = [
    "College of Engineering Guindy", "PSG College of Technology", "Thiagarajar College of Engineering",
    "SSN College of Engineering", "Coimbatore Institute of Technology", "Government College of Technology"
]

YEARS = [
    "1st year", "2nd year", "3rd year", "4th year",
    "first year", "second year", "third year", "final year",
    "freshman", "sophomore", "junior", "senior"
]

PROFICIENCIES = ["beginner", "intermediate", "advanced", "expert", "level 1", "level 2", "level 3", "level 4"]

# ==============================================================================
# 1. NER DATASET GENERATOR (BIO Tagging)
# Tags: O, B-SKILL, I-SKILL, B-TECH, I-TECH, B-ISSUER, I-ISSUER, B-DATE, I-DATE, B-ROLE, I-ROLE, B-ACHIEVEMENT, I-ACHIEVEMENT
# ==============================================================================

def tokenize_and_tag(template, replacements):
    """
    Given a template with placeholders like {SKILL_1}, replaces them with values
    and builds token-level BIO tags.
    """
    # Create replacement map with tag types
    # replacements: {placeholder: (text, tag_type)}
    text = template
    sorted_placeholders = sorted(replacements.keys(), key=lambda k: len(k), reverse=True)
    
    # Track positions
    placeholder_spans = []
    current_text = template
    for p in sorted_placeholders:
        val, tag_type = replacements[p]
        idx = current_text.find(p)
        if idx != -1:
            placeholder_spans.append((idx, idx + len(val), val, tag_type, p))
            current_text = current_text[:idx] + val + current_text[idx + len(p):]
            
    # Now tokenize the finalized string by whitespace
    tokens = current_text.split()
    bio_tags = ["O"] * len(tokens)
    
    # Simple alignment by searching token spans
    char_idx = 0
    token_spans = []
    for t in tokens:
        start = current_text.find(t, char_idx)
        end = start + len(t)
        token_spans.append((start, end, t))
        char_idx = end

    # Tag tokens
    for p_start, p_end, val, tag_type, _ in placeholder_spans:
        first = True
        for i, (t_start, t_end, t) in enumerate(token_spans):
            # If token overlaps significantly with placeholder value
            if max(t_start, p_start) < min(t_end, p_end):
                if first:
                    bio_tags[i] = f"B-{tag_type}"
                    first = False
                else:
                    bio_tags[i] = f"I-{tag_type}"

    return tokens, bio_tags


NER_TEMPLATES = [
    # Certificates
    ("Completed {SKILL_1} course certified by {ISSUER_1} on {DATE_1}", "cert"),
    ("Successfully earned {SKILL_1} Certification from {ISSUER_1} in {DATE_1}", "cert"),
    ("Certified in {SKILL_1} and {SKILL_2} by {ISSUER_1} issued on {DATE_1}", "cert"),
    ("Completed professional training on {SKILL_1} offered by {ISSUER_1}", "cert"),
    ("{ISSUER_1} verified certificate in {SKILL_1} and {TECH_1} received in {DATE_1}", "cert"),
    
    # Projects
    ("Developed a web app with {SKILL_1} and {TECH_1} serving as {ROLE_1}", "project"),
    ("Built a scalable backend system using {SKILL_1} with {TECH_1} database as {ROLE_1}", "project"),
    ("Architected a platform utilizing {SKILL_1} , {TECH_1} , and {TECH_2} on {DATE_1}", "project"),
    ("Created a high performance service using {SKILL_1} and {TECH_1} in {DATE_1}", "project"),
    ("Implemented authentication and caching using {SKILL_1} and {TECH_1} as {ROLE_1}", "project"),
    ("Built machine learning pipeline in {SKILL_1} utilizing {TECH_1} and {TECH_2}", "project"),
    ("Designed responsive user interface with {SKILL_1} and {TECH_1} for mobile devices", "project"),
    
    # Hackathons & Achievements
    ("{ACHIEVEMENT_1} at {EVENT_1} developing a solution with {SKILL_1} and {TECH_1}", "hackathon"),
    ("{ACHIEVEMENT_1} in {EVENT_1} on {DATE_1} building an AI system using {SKILL_1}", "hackathon"),
    ("Won first prize at {EVENT_1} with project built using {SKILL_1} and {TECH_1} as {ROLE_1}", "hackathon"),
    ("Recognized as {ROLE_1} after winning {ACHIEVEMENT_1} at {EVENT_1} with {SKILL_1}", "hackathon"),
    
    # Pull Requests & Open Source
    ("Merged pull request adding {SKILL_1} support with {TECH_1} integration on {DATE_1}", "pr"),
    ("Contributed code in {SKILL_1} refactoring {TECH_1} modules as {ROLE_1}", "pr"),
    ("Optimized queries using {SKILL_1} and {TECH_1} reducing latency by 40%", "pr"),
    ("Implemented unit and integration tests for {SKILL_1} backend using {TECH_1}", "pr")
]


def generate_ner_sample():
    template, cat = random.choice(NER_TEMPLATES)
    replacements = {}
    
    # Pick random values
    s1, s2 = random.sample(SKILL_NAMES, 2)
    t1, t2 = random.sample(ALL_SKILL_MENTIONS, 2)
    issuer = random.choice(ISSUERS)
    date = random.choice(DATES)
    role = random.choice(ROLES)
    ach = random.choice(ACHIEVEMENTS)
    event = random.choice(HACKATHONS)
    
    if "{SKILL_1}" in template:
        replacements["{SKILL_1}"] = (s1, "SKILL")
    if "{SKILL_2}" in template:
        replacements["{SKILL_2}"] = (s2, "SKILL")
    if "{TECH_1}" in template:
        replacements["{TECH_1}"] = (t1, "TECH")
    if "{TECH_2}" in template:
        replacements["{TECH_2}"] = (t2, "TECH")
    if "{ISSUER_1}" in template:
        replacements["{ISSUER_1}"] = (issuer, "ISSUER")
    if "{DATE_1}" in template:
        replacements["{DATE_1}"] = (date, "DATE")
    if "{ROLE_1}" in template:
        replacements["{ROLE_1}"] = (role, "ROLE")
    if "{ACHIEVEMENT_1}" in template:
        replacements["{ACHIEVEMENT_1}"] = (ach, "ACHIEVEMENT")
    if "{EVENT_1}" in template:
        replacements["{EVENT_1}"] = (event, "ISSUER")
        
    tokens, tags = tokenize_and_tag(template, replacements)
    return {"tokens": tokens, "ner_tags": tags}


def generate_ner_datasets(num_train=1800, num_val=350):
    train_data = [generate_ner_sample() for _ in range(num_train)]
    val_data = [generate_ner_sample() for _ in range(num_val)]
    
    with open(DATA_DIR / "ner_train.json", "w", encoding="utf-8") as f:
        json.dump(train_data, f, indent=2)
    with open(DATA_DIR / "ner_val.json", "w", encoding="utf-8") as f:
        json.dump(val_data, f, indent=2)
    print(f"Generated {len(train_data)} NER train samples and {len(val_data)} val samples.")


# ==============================================================================
# 2. SKILL MAPPER DATASET GENERATOR (Semantic Similarity Pairs)
# ==============================================================================

MAPPER_PHRASES = {
    "Python": [
        "python", "py", "python 3", "scripting in python", "cpython interpreter",
        "wrote python automation scripts", "python object-oriented code", "python data processing"
    ],
    "TypeScript": [
        "typescript", "ts", "typed javascript", "typescript interfaces and generics",
        "strict typescript development", "full-stack typescript codebase"
    ],
    "React": [
        "react", "reactjs", "react.js", "react functional components", "react hooks",
        "frontend SPA using react", "react virtual dom", "stateful react app"
    ],
    "Next.js": [
        "next.js", "nextjs", "next app router", "nextjs server actions",
        "server-side rendered nextjs", "nextjs static site generation"
    ],
    "PostgreSQL": [
        "postgresql", "postgres", "pgsql", "psql", "relational database postgres",
        "postgres schema design and triggers", "postgres query optimization", "acid compliance in postgres"
    ],
    "PyTorch": [
        "pytorch", "torch", "pytorch neural networks", "torch tensors and autograd",
        "fine-tuned models in pytorch", "pytorch deep learning model"
    ],
    "Docker": [
        "docker", "containerization", "dockerfile creation", "docker-compose multi-container setup",
        "packaged app into docker container", "docker image optimization"
    ],
    "Kubernetes": [
        "kubernetes", "k8s", "kubectl deployments", "helm charts and pods",
        "orchestrated microservices on kubernetes cluster"
    ],
    "Tailwind CSS": [
        "tailwind", "tailwindcss", "utility-first css", "styled components with tailwind classes",
        "responsive design using tailwind css"
    ],
    "FastAPI": [
        "fastapi", "fast-api", "pydantic request validation fastapi",
        "high-performance async python rest api with fastapi"
    ],
    "Node.js": [
        "node", "nodejs", "node runtime", "asynchronous event loop in nodejs",
        "backend express server running on node.js"
    ],
    "Cybersecurity": [
        "infosec", "penetration testing", "ethical hacking", "owasp top 10 vulnerability assessment",
        "network security audit and ctf challenges"
    ],
    "Git": [
        "git", "version control", "git branching and merging", "github pull requests",
        "resolved merge conflicts using git", "tracked repo history"
    ],
    "CI/CD": [
        "continuous integration", "continuous deployment", "github actions workflow",
        "automated test and deployment pipeline", "gitlab ci yaml runner"
    ]
}

def generate_mapper_datasets(num_train=2400, num_val=500):
    pairs_train = []
    pairs_val = []
    
    all_skills = list(MAPPER_PHRASES.keys())
    
    def make_pairs(count):
        samples = []
        for _ in range(count):
            # 50% positive matches, 50% negative matches
            if random.random() < 0.5:
                # Positive match
                skill = random.choice(all_skills)
                phrase = random.choice(MAPPER_PHRASES[skill])
                score = round(random.uniform(0.85, 1.0), 2)
                samples.append({"query": phrase, "canonical_skill": skill, "score": score})
            else:
                # Negative or hard negative match
                skill_a, skill_b = random.sample(all_skills, 2)
                phrase = random.choice(MAPPER_PHRASES[skill_a])
                score = round(random.uniform(0.0, 0.25), 2)
                samples.append({"query": phrase, "canonical_skill": skill_b, "score": score})
        return samples

    pairs_train = make_pairs(num_train)
    pairs_val = make_pairs(num_val)

    with open(DATA_DIR / "mapper_train.json", "w", encoding="utf-8") as f:
        json.dump(pairs_train, f, indent=2)
    with open(DATA_DIR / "mapper_val.json", "w", encoding="utf-8") as f:
        json.dump(pairs_val, f, indent=2)
    print(f"Generated {len(pairs_train)} mapper train samples and {len(pairs_val)} val samples.")


# ==============================================================================
# 3. QUERY PARSER DATASET GENERATOR (Joint Intent + Slot Filling)
# Intents: FIND_STUDENTS, FIND_TEAMS, SKILL_GAP_ANALYSIS, VERIFY_EVIDENCE, LEADERBOARD, EXPORT_REPORT
# Slots: O, B-SKILL, I-SKILL, B-PROFICIENCY, I-PROFICIENCY, B-COLLEGE, I-COLLEGE, B-DEPT, I-DEPT, B-YEAR, I-YEAR, B-MIN_VERIFIED, I-MIN_VERIFIED
# ==============================================================================

QUERY_INTENTS = [
    "FIND_STUDENTS", "FIND_TEAMS", "SKILL_GAP_ANALYSIS",
    "VERIFY_EVIDENCE", "LEADERBOARD", "EXPORT_REPORT"
]

QUERY_TEMPLATES = [
    # FIND_STUDENTS
    ("Find {YEAR} students proficient in {SKILL_1} from {DEPT}", "FIND_STUDENTS"),
    ("Search for {SKILL_1} and {SKILL_2} developers in {COLLEGE}", "FIND_STUDENTS"),
    ("Show me {PROFICIENCY} {SKILL_1} engineers in {YEAR}", "FIND_STUDENTS"),
    ("Who are the top students with verified {SKILL_1} skills in {DEPT}?", "FIND_STUDENTS"),
    ("Find candidates with at least {MIN_VERIFIED} verified skills including {SKILL_1}", "FIND_STUDENTS"),
    ("Filter {DEPT} students who know {SKILL_1} and {SKILL_2}", "FIND_STUDENTS"),

    # FIND_TEAMS
    ("Build a team for hackathon requiring {SKILL_1} and {SKILL_2}", "FIND_TEAMS"),
    ("Assemble a project team with {SKILL_1} frontend and {SKILL_2} backend", "FIND_TEAMS"),
    ("Form a team of {YEAR} students with {SKILL_1} and {SKILL_2} capabilities", "FIND_TEAMS"),
    ("Suggest balanced team for smart city project with {SKILL_1} and {SKILL_2}", "FIND_TEAMS"),

    # SKILL_GAP_ANALYSIS
    ("What are the skill gaps in {DEPT} regarding {SKILL_1}?", "SKILL_GAP_ANALYSIS"),
    ("Show skill deficit report for {SKILL_1} across {COLLEGE}", "SKILL_GAP_ANALYSIS"),
    ("Compare curriculum vs market demand for {SKILL_1} in {DEPT}", "SKILL_GAP_ANALYSIS"),
    ("Analyze missing competencies in {SKILL_1} and {SKILL_2}", "SKILL_GAP_ANALYSIS"),

    # LEADERBOARD
    ("Show leaderboard of top performers in {SKILL_1}", "LEADERBOARD"),
    ("Display ranking of students based on verified {SKILL_1} evidence in {DEPT}", "LEADERBOARD"),
    ("Who is leading in {SKILL_1} skill score at {COLLEGE}?", "LEADERBOARD"),
    ("Top 10 students with highest score in {SKILL_1}", "LEADERBOARD"),

    # VERIFY_EVIDENCE
    ("Review pending evidence submissions for {SKILL_1}", "VERIFY_EVIDENCE"),
    ("Show unverified claims in {DEPT} for {SKILL_1} certificates", "VERIFY_EVIDENCE"),
    ("Audit pending github verification for {SKILL_1} projects", "VERIFY_EVIDENCE"),

    # EXPORT_REPORT
    ("Export accreditation report for {DEPT} in Excel format", "EXPORT_REPORT"),
    ("Generate placement readiness summary for {COLLEGE} on {SKILL_1}", "EXPORT_REPORT"),
    ("Download verified skills report for {YEAR} students", "EXPORT_REPORT")
]

def generate_query_sample():
    template, intent = random.choice(QUERY_TEMPLATES)
    replacements = {}
    
    s1, s2 = random.sample(SKILL_NAMES, 2)
    dept = random.choice(DEPARTMENTS)
    college = random.choice(COLLEGES)
    year = random.choice(YEARS)
    prof = random.choice(PROFICIENCIES)
    min_ver = random.choice(["3", "5", "two", "four", "3+"])
    
    if "{SKILL_1}" in template:
        replacements["{SKILL_1}"] = (s1, "SKILL")
    if "{SKILL_2}" in template:
        replacements["{SKILL_2}"] = (s2, "SKILL")
    if "{DEPT}" in template:
        replacements["{DEPT}"] = (dept, "DEPT")
    if "{COLLEGE}" in template:
        replacements["{COLLEGE}"] = (college, "COLLEGE")
    if "{YEAR}" in template:
        replacements["{YEAR}"] = (year, "YEAR")
    if "{PROFICIENCY}" in template:
        replacements["{PROFICIENCY}"] = (prof, "PROFICIENCY")
    if "{MIN_VERIFIED}" in template:
        replacements["{MIN_VERIFIED}"] = (min_ver, "MIN_VERIFIED")

    tokens, tags = tokenize_and_tag(template, replacements)
    query_str = " ".join(tokens)
    return {
        "query": query_str,
        "tokens": tokens,
        "intent": intent,
        "slots": tags
    }

def generate_query_datasets(num_train=1500, num_val=300):
    train_data = [generate_query_sample() for _ in range(num_train)]
    val_data = [generate_query_sample() for _ in range(num_val)]
    
    with open(DATA_DIR / "query_train.json", "w", encoding="utf-8") as f:
        json.dump(train_data, f, indent=2)
    with open(DATA_DIR / "query_val.json", "w", encoding="utf-8") as f:
        json.dump(val_data, f, indent=2)
    print(f"Generated {len(train_data)} query train samples and {len(val_data)} val samples.")


if __name__ == "__main__":
    print("Generating synthetic datasets for SkillPulse custom AI models...")
    generate_ner_datasets()
    generate_mapper_datasets()
    generate_query_datasets()
    print("All datasets successfully generated in:", DATA_DIR)
