from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import shutil
import pdfplumber
import docx
import os
import uuid
import re
import json

app = FastAPI(title="RANKER.AI Backend", version="3.0.0")

# ---------------- CORS ----------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://resume-scanner-ai-one.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- FOLDERS ----------------
BASE_UPLOAD = "uploads"
DATASET_DIR = "uploads/sample_dataset"
os.makedirs(BASE_UPLOAD, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

# ---------------- READ PDF ----------------
def read_pdf(path):
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print("[PDF ERROR]:", e)
    return text

# ---------------- READ DOCX ----------------
def read_docx(path):
    text = ""
    try:
        doc = docx.Document(path)
        text = "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print("[DOCX ERROR]:", e)
    return text

# ---------------- CLEAN TEXT ----------------
def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9+.#/\s\-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text

# ================ MASSIVE SKILLS DATABASE (16 CATEGORIES) ================
SKILLS_DB = {
    "languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "c",
        "ruby", "go", "golang", "rust", "swift", "kotlin", "php", "scala",
        "perl", "r", "matlab", "dart", "lua", "haskell", "elixir",
        "objective-c", "assembly", "cobol", "fortran", "groovy", "julia",
        "sql", "nosql", "html", "css", "solidity", "pl/sql", "shell", "bash"
    ],
    "frontend": [
        "html", "css", "react", "angular", "vue", "svelte", "next.js",
        "nuxt", "gatsby", "tailwind", "bootstrap", "sass", "less",
        "webpack", "vite", "jquery", "redux", "zustand", "material ui",
        "chakra ui", "styled-components", "framer motion", "three.js",
        "webgl", "pwa", "responsive design", "semantic html", "flexbox"
    ],
    "backend": [
        "node", "express", "django", "flask", "fastapi", "spring",
        "spring boot", ".net", "asp.net", "laravel", "rails",
        "ruby on rails", "gin", "fiber", "nestjs", "graphql",
        "rest api", "microservices", "grpc", "websocket", "socketio",
        "soap", "apigee", "kong", "jwt", "oauth"
    ],
    "database": [
        "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
        "cassandra", "dynamodb", "firebase", "supabase", "sqlite",
        "oracle", "mariadb", "neo4j", "couchdb", "influxdb", "memcached",
        "cockroachdb", "prisma", "sequelize", "mongoose"
    ],
    "cloud": [
        "aws", "azure", "gcp", "google cloud", "heroku", "vercel",
        "netlify", "digitalocean", "cloudflare", "terraform",
        "cloudformation", "s3", "ec2", "lambda", "ecs", "eks",
        "cloudwatch", "route53", "iam", "rds", "serverless"
    ],
    "devops": [
        "docker", "kubernetes", "jenkins", "github actions", "gitlab ci",
        "ci/cd", "ansible", "puppet", "chef", "prometheus", "grafana",
        "nginx", "apache", "linux", "bash", "shell scripting",
        "vagrant", "helm", "argocd", "datadog", "sonararqube"
    ],
    "data_science": [
        "pandas", "numpy", "scipy", "matplotlib", "seaborn",
        "jupyter", "tableau", "power bi", "excel", "statistics",
        "data visualization", "data analysis", "etl", "data pipeline",
        "apache spark", "hadoop", "airflow", "dbt", "snowflake",
        "bigquery", "looker", "spark sql", "presto", "hive"
    ],
    "ml_ai": [
        "machine learning", "deep learning", "tensorflow", "pytorch",
        "keras", "scikit", "sklearn", "nlp", "computer vision",
        "opencv", "neural network", "reinforcement learning",
        "transformers", "bert", "gpt", "llm", "langchain",
        "huggingface", "mlops", "mlflow", "model deployment",
        "feature engineering", "random forest", "xgboost", "lightgbm",
        "llama", "langgraph", "vector database", "chromadb", "pinecone"
    ],
    "mobile": [
        "android", "ios", "react native", "flutter", "swift ui",
        "jetpack compose", "xamarin", "ionic", "capacitor",
        "mobile development", "app development", "kotlin multiplatform",
        "cocoapods", "gradle", "fastlane"
    ],
    "security": [
        "cybersecurity", "penetration testing", "ethical hacking",
        "owasp", "encryption", "ssl", "tls", "firewalls", "siem",
        "vulnerability assessment", "soc", "nist", "iso 27001",
        "network security", "identity management", "zero trust",
        "saml", "cryptography", "iam", "devsecops"
    ],
    "blockchain": [
        "blockchain", "solidity", "ethereum", "web3", "smart contracts",
        "defi", "nft", "cryptocurrency", "hyperledger", "truffle",
        "hardhat", "metamask", "ipfs", "rust", "ethers.js", "web3.js"
    ],
    "design": [
        "figma", "sketch", "adobe xd", "photoshop", "illustrator",
        "ui design", "ux design", "wireframing", "prototyping",
        "user research", "design thinking", "accessibility", "wcag",
        "user flows", "interaction design", "color theory"
    ],
    "tools": [
        "git", "github", "gitlab", "bitbucket", "jira", "confluence",
        "slack", "notion", "trello", "postman", "swagger",
        "vs code", "intellij", "vim", "agile", "scrum", "kanban"
    ],
    "testing": [
        "jest", "mocha", "cypress", "selenium", "playwright",
        "pytest", "junit", "unit testing", "integration testing",
        "e2e testing", "tdd", "bdd", "load testing", "jmeter",
        "qa automation", "test automation", "supertest", "chai"
    ],
    "management_agile": [
        "project management", "scrum master", "product management",
        "agile methodologies", "sprint planning", "backlog grooming",
        "roadmap execution", "team leadership", "okrs", "kpis"
    ],
    "soft_skills": [
        "communication", "teamwork", "problem solving", "time management",
        "critical thinking", "adaptability", "mentoring", "collaboration",
        "negotiation", "conflict resolution", "leadership", "public speaking"
    ]
}

ALL_SKILLS = []
for category_skills in SKILLS_DB.values():
    ALL_SKILLS.extend(category_skills)

# Remove duplicates
ALL_SKILLS = list(set(ALL_SKILLS))

# ================ 25+ ROLE DEFINITIONS ================
ROLE_RULES = {
    "Web Developer": {
        "critical": ["html", "css", "javascript"],
        "important": ["react", "angular", "vue", "node", "typescript", "responsive design"],
        "bonus": ["git", "webpack", "vite", "tailwind", "sass", "redux"]
    },
    "Machine Learning": {
        "critical": ["python", "machine learning", "tensorflow", "pytorch"],
        "important": ["numpy", "pandas", "deep learning", "scikit", "sklearn"],
        "bonus": ["nlp", "computer vision", "keras", "jupyter", "statistics"]
    },
    "Backend Engineer": {
        "critical": ["python", "sql", "rest api"],
        "important": ["django", "fastapi", "node", "express", "postgresql", "mongodb"],
        "bonus": ["docker", "redis", "microservices", "graphql", "linux"]
    },
    "Data Science": {
        "critical": ["python", "sql", "statistics"],
        "important": ["pandas", "numpy", "data analysis", "data visualization"],
        "bonus": ["tableau", "power bi", "excel", "jupyter", "r", "scipy"]
    },
    "UI/UX Designer": {
        "critical": ["figma", "ui design", "ux design"],
        "important": ["wireframing", "prototyping", "user research", "design thinking"],
        "bonus": ["photoshop", "illustrator", "accessibility", "html", "css"]
    },
    "DevOps Engineer": {
        "critical": ["docker", "linux", "ci/cd"],
        "important": ["kubernetes", "aws", "terraform", "jenkins", "ansible"],
        "bonus": ["prometheus", "grafana", "github actions", "nginx", "bash"]
    },
    "Cloud Architect": {
        "critical": ["aws", "cloud", "terraform"],
        "important": ["azure", "gcp", "kubernetes", "docker", "microservices"],
        "bonus": ["lambda", "s3", "ec2", "cloudformation", "networking"]
    },
    "Cybersecurity": {
        "critical": ["cybersecurity", "network security", "linux"],
        "important": ["penetration testing", "ethical hacking", "owasp", "firewalls"],
        "bonus": ["siem", "encryption", "vulnerability assessment", "python"]
    },
    "Mobile Developer": {
        "critical": ["mobile development", "android", "ios"],
        "important": ["react native", "flutter", "kotlin", "swift"],
        "bonus": ["firebase", "rest api", "git", "ui design"]
    },
    "Blockchain Developer": {
        "critical": ["blockchain", "solidity", "smart contracts"],
        "important": ["ethereum", "web3", "javascript", "python"],
        "bonus": ["defi", "truffle", "hardhat", "ipfs", "cryptography"]
    },
    "Full Stack Engineer": {
        "critical": ["javascript", "html", "css", "sql"],
        "important": ["react", "node", "express", "mongodb", "postgresql"],
        "bonus": ["docker", "git", "typescript", "redux", "rest api"]
    },
    "Data Engineer": {
        "critical": ["python", "sql", "etl"],
        "important": ["apache spark", "airflow", "data pipeline", "aws"],
        "bonus": ["hadoop", "kafka", "snowflake", "bigquery", "docker"]
    },
    "QA Automation": {
        "critical": ["test automation", "qa automation", "selenium"],
        "important": ["cypress", "jest", "pytest", "unit testing"],
        "bonus": ["jira", "agile", "python", "javascript", "ci/cd"]
    },
    "System Administrator": {
        "critical": ["linux", "bash", "networking"],
        "important": ["windows server", "docker", "ansible", "nginx", "apache"],
        "bonus": ["python", "shell scripting", "monitoring", "firewalls"]
    },
    "AI Engineer": {
        "critical": ["python", "deep learning", "machine learning"],
        "important": ["tensorflow", "pytorch", "nlp", "transformers", "llm"],
        "bonus": ["langchain", "huggingface", "mlops", "docker", "gpt"]
    },
    "Frontend Engineer": {
        "critical": ["javascript", "html", "css", "react"],
        "important": ["typescript", "redux", "next.js", "tailwind", "responsive design"],
        "bonus": ["webpack", "vite", "framer motion", "testing", "git"]
    },
    "Game Developer": {
        "critical": ["c++", "c#"],
        "important": ["unity", "unreal", "opengl", "game design"],
        "bonus": ["python", "javascript", "three.js", "webgl", "blender"]
    },
    "Product Manager": {
        "critical": ["agile", "scrum", "jira"],
        "important": ["data analysis", "user research", "roadmap"],
        "bonus": ["sql", "figma", "confluence", "notion", "analytics"]
    },
    "Database Administrator": {
        "critical": ["sql", "postgresql", "mysql"],
        "important": ["mongodb", "oracle", "redis", "database optimization"],
        "bonus": ["python", "linux", "backup", "replication", "docker"]
    },
    "Embedded Systems": {
        "critical": ["c", "c++", "embedded"],
        "important": ["arduino", "raspberry pi", "rtos", "iot", "firmware"],
        "bonus": ["python", "linux", "assembly", "communication protocols"]
    },
    "Data Analyst": {
        "critical": ["sql", "excel", "data analysis"],
        "important": ["python", "pandas", "tableau", "power bi"],
        "bonus": ["statistics", "data visualization", "r", "postgresql", "mysql"]
    },
    "DevSecOps Engineer": {
        "critical": ["docker", "kubernetes", "cybersecurity"],
        "important": ["ci/cd", "jenkins", "terraform", "owasp", "network security"],
        "bonus": ["aws", "linux", "prometheus", "grafana", "git", "python"]
    },
    "Solutions Architect": {
        "critical": ["aws", "cloud", "microservices"],
        "important": ["azure", "gcp", "docker", "terraform", "kubernetes"],
        "bonus": ["security", "sql", "linux", "agile", "project management"]
    },
    "Business Analyst": {
        "critical": ["business analysis", "agile", "excel"],
        "important": ["scrum", "jira", "data analysis", "tableau"],
        "bonus": ["sql", "project management", "confluence", "communication", "leadership"]
    },
    "Systems Engineer": {
        "critical": ["linux", "bash", "networking"],
        "important": ["c++", "python", "docker", "virtualization", "ansible"],
        "bonus": ["security", "windows server", "git", "ci/cd", "shell scripting"]
    }
}

# ================ EDUCATION PATTERNS ================
EDUCATION_PATTERNS = [
    (r"\bb\.?tech\b", "B.Tech"),
    (r"\bb\.?e\.?\b", "B.E."),
    (r"\bm\.?tech\b", "M.Tech"),
    (r"\bm\.?s\.?\b", "M.S."),
    (r"\bm\.?sc\b", "M.Sc"),
    (r"\bb\.?sc\b", "B.Sc"),
    (r"\bmba\b", "MBA"),
    (r"\bmca\b", "MCA"),
    (r"\bbca\b", "BCA"),
    (r"\bphd\b", "PhD"),
    (r"\bdoctorate\b", "PhD"),
    (r"\bb\.?com\b", "B.Com"),
    (r"\bm\.?com\b", "M.Com"),
    (r"\bbba\b", "BBA"),
    (r"\bdiploma\b", "Diploma"),
    (r"\bhigh school\b", "High School"),
    (r"\b12th\b", "12th"),
    (r"\b10th\b", "10th"),
]

# ================ CERTIFICATION PATTERNS ================
CERT_PATTERNS = [
    "aws certified", "azure certified", "google certified", "gcp certified",
    "pmp", "scrum master", "cissp", "ceh", "comptia", "certified scrum master",
    "cisco certified", "ccna", "ccnp", "oracle certified", "salesforce certified",
    "itil", "six sigma", "tensorflow developer certificate", "meta certified",
    "ibm certified", "microsoft certified", "rhce", "ckad", "cka",
    "certified kubernetes administrator", "certified kubernetes application developer"
]

SPOKEN_LANGUAGES_LIST = [
    "english", "spanish", "french", "german", "mandarin", "hindi", "japanese",
    "russian", "arabic", "portuguese", "bengali", "punjabi", "telugu", "tamil",
    "marathi", "urdu", "italian", "korean", "turkish", "vietnamese", "gujarati",
    "kannada", "malayalam", "odia"
]

EXPERIENCE_KEYWORDS = {
    "senior": ["senior", "lead", "principal", "staff", "architect", "manager", "director", "head", "vp", "lead developer", "team lead"],
    "mid": ["mid", "intermediate", "associate", "engineer ii", "developer ii", "3+ years", "4+ years", "5+ years"],
    "junior": ["junior", "intern", "trainee", "fresher", "entry level", "beginner", "graduate", "co-op"]
}

# ================ EXTRACT NAME ================
def extract_candidate_name(text, filename):
    # Backup: Clean filename
    clean_filename = filename
    clean_filename = re.sub(r"^[0-9a-fA-F\-]{36}_", "", clean_filename)
    clean_filename = os.path.splitext(clean_filename)[0]
    clean_filename = re.sub(r"[\-_\s]+", " ", clean_filename)
    clean_filename = re.sub(r"\b(resume|cv|latest|updated|formatted|final|format|202\d)\b", "", clean_filename, flags=re.IGNORECASE)
    clean_filename = re.sub(r"\s+", " ", clean_filename).strip().title()
    if not clean_filename:
        clean_filename = "Candidate"

    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if not lines:
        return clean_filename

    # Search first 4 lines
    for line in lines[:4]:
        if "@" in line or "http" in line or "www" in line or any(k in line.lower() for k in ["resume", "curriculum", "cv", "page", "contact", "email", "phone", "profile", "about"]):
            continue
        words = line.split()
        if 1 <= len(words) <= 4:
            cleaned_words = [re.sub(r"[^a-zA-Z]", "", w) for w in words]
            cleaned_words = [w for w in cleaned_words if w]
            if len(cleaned_words) >= 2 and all(w[0].isupper() if w else False for w in words if w.isalpha()):
                return " ".join(words)
            if len(cleaned_words) >= 2 and all(w.isupper() for w in cleaned_words):
                return " ".join(words).title()

    return clean_filename

# ================ EXTRACT YEARS OF EXPERIENCE ================
def extract_years_of_experience(text):
    patterns = [
        r"(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:work|working|professional|relevant)?\s*(?:experience|exp)\b",
        r"(?:experience|exp)\s*(?:of)?\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)\b",
    ]
    years = 0.0
    text_lower = text.lower()
    for pattern in patterns:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            try:
                val = float(match)
                if val > years and val < 50:
                    years = val
            except ValueError:
                continue
    return years

# ================ ATS COMPATIBILITY SCORE ================
def calculate_ats_score(parsed, text):
    score = 0
    breakdown = {
        "formatting": 0,
        "contact_info": 0,
        "sections": 0,
        "keywords": 0
    }
    
    # 1. Contact Info (max 25 pts)
    if parsed["email"]:
        breakdown["contact_info"] += 10
    if parsed["phone"]:
        breakdown["contact_info"] += 10
    if parsed["linkedin"] or parsed["github"]:
        breakdown["contact_info"] += 5
    score += breakdown["contact_info"]
        
    # 2. Section Headings detection (max 25 pts)
    sections_found = 0
    text_lower = text.lower()
    for sec in ["education", "experience", "projects", "skills", "certifications", "summary", "publications", "awards"]:
        if re.search(r"\b" + re.escape(sec) + r"\b", text_lower):
            sections_found += 1
            
    breakdown["sections"] = min(sections_found * 4, 25)
    score += breakdown["sections"]
    
    # 3. Formatting and word count (max 25 pts)
    word_count = parsed["word_count"]
    if 250 <= word_count <= 800:
        breakdown["formatting"] += 15
    elif 150 <= word_count < 250 or 800 < word_count <= 1200:
        breakdown["formatting"] += 10
    else:
        breakdown["formatting"] += 5
        
    breakdown["formatting"] += 10 # Accepted PDF/DOCX format points
    score += breakdown["formatting"]
    
    # 4. Keyword / Skill density (max 25 pts)
    skills_count = len(parsed["skills"])
    if skills_count >= 12:
        breakdown["keywords"] = 25
    elif skills_count >= 8:
        breakdown["keywords"] = 20
    elif skills_count >= 4:
        breakdown["keywords"] = 15
    elif skills_count >= 1:
        breakdown["keywords"] = 10
    else:
        breakdown["keywords"] = 0
    score += breakdown["keywords"]
    
    return score, breakdown

# ================ PARSE RESUME ================
def parse_resume(text, filename):
    data = {
        "candidate_name": "",
        "email": "",
        "phone": "",
        "skills": [],
        "skill_categories": {},
        "education": [],
        "certifications": [],
        "experience_years": 0.0,
        "experience_level": "Unknown",
        "linkedin": "",
        "github": "",
        "projects_count": 0,
        "strengths": [],
        "weaknesses": [],
        "summary": "",
        "word_count": 0,
        "programming_languages": [],
        "spoken_languages": [],
    }

    data["word_count"] = len(text.split())
    data["candidate_name"] = extract_candidate_name(text, filename)

    # EMAIL
    email_match = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if email_match:
        data["email"] = email_match[0]

    # PHONE
    phone_match = re.findall(r"\b\d{10}\b", text)
    if not phone_match:
        phone_match = re.findall(r"\+?\d[\d\s\-]{8,14}\d", text)
    if phone_match:
        data["phone"] = phone_match[0].strip()

    # LINKEDIN
    linkedin_match = re.findall(r"linkedin\.com/in/[\w\-]+", text, re.IGNORECASE)
    if linkedin_match:
        data["linkedin"] = "https://" + linkedin_match[0]

    # GITHUB
    github_match = re.findall(r"github\.com/[\w\-]+", text, re.IGNORECASE)
    if github_match:
        data["github"] = "https://" + github_match[0]

    text_lower = clean_text(text)

    # SKILLS WITH CATEGORIES
    for category, skills in SKILLS_DB.items():
        found = []
        for skill in skills:
            # Match exact skills carefully
            # Escaping for regex to support chars like c++ or .net
            escaped_skill = re.escape(skill)
            pattern = rf"\b{escaped_skill}\b"
            if "+" in skill or "." in skill or "#" in skill:
                # Fallback to direct search if it has special characters
                if skill in text_lower:
                    found.append(skill)
                    if skill not in data["skills"]:
                        data["skills"].append(skill)
            elif re.search(pattern, text_lower):
                found.append(skill)
                if skill not in data["skills"]:
                    data["skills"].append(skill)
        if found:
            data["skill_categories"][category] = found

    # SEPARATE LANGUAGES
    # Spoken Languages
    for lang in SPOKEN_LANGUAGES_LIST:
        pattern = rf"\b{re.escape(lang)}\b"
        if re.search(pattern, text_lower):
            data["spoken_languages"].append(lang.capitalize())
    if not data["spoken_languages"]:
        data["spoken_languages"] = ["English"] # Default

    # Programming Languages
    if "languages" in data["skill_categories"]:
        data["programming_languages"] = [l.capitalize() for l in data["skill_categories"]["languages"]]

    # EDUCATION
    for pattern, label in EDUCATION_PATTERNS:
        if re.search(pattern, text_lower):
            if label not in data["education"]:
                data["education"].append(label)

    # CERTIFICATIONS
    for cert in CERT_PATTERNS:
        if cert in text_lower:
            data["certifications"].append(cert.title())

    # EXPERIENCE YEARS & LEVEL
    exp_years = extract_years_of_experience(text)
    data["experience_years"] = exp_years
    
    if exp_years > 0:
        if exp_years >= 6.0:
            data["experience_level"] = "Senior"
        elif exp_years >= 2.0:
            data["experience_level"] = "Mid"
        else:
            data["experience_level"] = "Junior"
    else:
        # Fallback to keyword search
        detected_level = "Unknown"
        for level, keywords in EXPERIENCE_KEYWORDS.items():
            for kw in keywords:
                if kw in text_lower:
                    detected_level = level.capitalize()
                    break
            if detected_level != "Unknown":
                break
        data["experience_level"] = detected_level if detected_level != "Unknown" else "Mid"

    # PROJECT COUNT
    project_matches = re.findall(r"\bproject[s]?\b", text_lower)
    data["projects_count"] = min(len(project_matches), 15)

    return data


# ================ ADVANCED SCORING ================
def score_resume(parsed, role):
    if role not in ROLE_RULES:
        return 0, []

    rules = ROLE_RULES[role]
    score = 0
    strengths = []
    weaknesses = []
    skills = [s.lower() for s in parsed["skills"]]

    # Critical skills (15 pts each)
    for s in rules["critical"]:
        if s in skills:
            score += 15
            strengths.append(f"Has critical skill: {s}")
        else:
            weaknesses.append(f"Missing critical skill: {s}")

    # Important skills (10 pts each)
    for s in rules["important"]:
        if s in skills:
            score += 10
            strengths.append(f"Has important skill: {s}")

    # Bonus skills (5 pts each)
    for s in rules["bonus"]:
        if s in skills:
            score += 5

    # Experience bonus
    if parsed["experience_level"] == "Senior":
        score += 15
        strengths.append("Senior-level experience detected")
    elif parsed["experience_level"] == "Mid":
        score += 10
    elif parsed["experience_level"] == "Junior":
        score += 3

    # Education bonus
    if parsed["education"]:
        score += 5
        strengths.append(f"Education: {', '.join(parsed['education'])}")

    # Certifications bonus
    if parsed["certifications"]:
        score += len(parsed["certifications"]) * 5
        strengths.append(f"{len(parsed['certifications'])} certification(s)")

    # LinkedIn/GitHub bonus
    if parsed["linkedin"]:
        score += 3
    if parsed["github"]:
        score += 5
        strengths.append("Has GitHub profile")

    # Projects bonus
    if parsed["projects_count"] >= 3:
        score += 5
        strengths.append(f"{parsed['projects_count']} projects mentioned")

    # Cap at 100
    score = min(score, 100)

    if not strengths:
        weaknesses.append("Very few relevant skills found")

    return score, strengths, weaknesses


# ================ GENERATE SUMMARY ================
def generate_summary(parsed, score, role):
    level = parsed["experience_level"]
    skill_count = len(parsed["skills"])
    top_skills = parsed["skills"][:5]

    if score >= 80:
        verdict = "Excellent match"
    elif score >= 60:
        verdict = "Strong candidate"
    elif score >= 40:
        verdict = "Moderate fit"
    elif score >= 20:
        verdict = "Weak match"
    else:
        verdict = "Poor fit"

    summary = f"{verdict} for {role}. "
    if level != "Unknown":
        summary += f"{level}-level professional. "
    summary += f"{skill_count} skills detected"
    if top_skills:
        summary += f" including {', '.join(top_skills[:3])}"
    summary += "."

    return summary


# ================ MATCH AGAINST JOB DESCRIPTION ================
def analyze_job_description_match(resume_skills, text_lower, job_description_text):
    if not job_description_text or len(job_description_text.strip()) < 10:
        return None
        
    jd_lower = clean_text(job_description_text)
    
    # Extract skills from job description
    jd_skills = []
    for skill in ALL_SKILLS:
        escaped_skill = re.escape(skill)
        pattern = rf"\b{escaped_skill}\b"
        if "+" in skill or "." in skill or "#" in skill:
            if skill in jd_lower:
                jd_skills.append(skill)
        elif re.search(pattern, jd_lower):
            jd_skills.append(skill)
            
    jd_skills = list(set(jd_skills))
    
    if not jd_skills:
        # Default fallback: scan for common terms
        return {
            "match_score": 50,
            "matching_skills": [],
            "missing_skills": [],
            "jd_skills_count": 0
        }
        
    # Intersect with resume skills
    matching = [s for s in resume_skills if s.lower() in [js.lower() for js in jd_skills]]
    missing = [s for s in jd_skills if s.lower() not in [rs.lower() for rs in resume_skills]]
    
    match_score = round((len(matching) / len(jd_skills)) * 100)
    
    return {
        "match_score": match_score,
        "matching_skills": matching,
        "missing_skills": missing[:10], # Cap missing skills list for display
        "jd_skills_count": len(jd_skills)
    }


# ================ GENERATE FEEDBACK ================
def generate_feedback(parsed, score, role, ats_score):
    strengths = []
    weaknesses = []

    # ATS-based feedback
    if ats_score >= 80:
        strengths.append("Excellent ATS compatibility — resume is well-structured")
    elif ats_score >= 60:
        strengths.append("Good ATS compatibility — resume passes most filters")
    else:
        weaknesses.append("Low ATS score — improve formatting, add clear section headings")

    if not parsed["email"]:
        weaknesses.append("No email address found — add contact info for recruiters")
    if not parsed["phone"]:
        weaknesses.append("No phone number detected — include a contact number")
    if not parsed["linkedin"]:
        weaknesses.append("No LinkedIn profile found — add your LinkedIn URL")
    if not parsed["github"] and role in ["Web Developer", "Backend Engineer", "Full Stack Engineer", "Frontend Engineer", "AI Engineer", "Data Engineer"]:
        weaknesses.append("No GitHub profile — add a GitHub link to showcase projects")

    if parsed["projects_count"] >= 5:
        strengths.append(f"Strong project portfolio ({parsed['projects_count']} projects)")
    elif parsed["projects_count"] == 0:
        weaknesses.append("No projects mentioned — add relevant projects to stand out")

    if parsed["certifications"]:
        strengths.append(f"Has {len(parsed['certifications'])} professional certification(s)")

    if parsed["education"]:
        strengths.append(f"Education credentials: {', '.join(parsed['education'][:3])}")
    else:
        weaknesses.append("No education details detected — add your degree information")

    word_count = parsed["word_count"]
    if word_count < 150:
        weaknesses.append("Resume is too short — expand with more details and achievements")
    elif word_count > 1200:
        weaknesses.append("Resume is too long — condense to 1-2 pages for best results")

    skill_count = len(parsed["skills"])
    if skill_count >= 15:
        strengths.append(f"Impressive skill breadth — {skill_count} skills detected")
    elif skill_count < 4:
        weaknesses.append("Very few skills detected — add more relevant technical skills")

    return strengths, weaknesses


# ================ ROOT ================
@app.get("/")
def home():
    return {
        "msg": "🔥 RANKER.AI Backend v3.0 — PRODUCTION READY 🔥",
        "version": "3.0.0",
        "total_roles": len(ROLE_RULES),
        "total_skills_tracked": len(ALL_SKILLS),
    }


# ================ GET AVAILABLE ROLES ================
@app.get("/roles")
def get_roles():
    return {"roles": list(ROLE_RULES.keys())}


# ================ UPLOAD & ANALYZE ================
@app.post("/upload")
async def upload_files(
    role: str = Form(...),
    files: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None)
):
    print("\n========= NEW REQUEST =========")
    print("[ROLE]:", role)
    print("[FILES COUNT]:", len(files))
    print("[HAS JOB DESC]:", job_description is not None and len(job_description.strip()) > 0)

    results = []
    total_skills_found = set()

    for file in files:
        try:
            unique_name = f"{uuid.uuid4()}_{file.filename}"
            path = os.path.join(DATASET_DIR, unique_name)

            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            text = ""

            if file.filename.lower().endswith(".pdf"):
                text = read_pdf(path)
            elif file.filename.lower().endswith(".docx"):
                text = read_docx(path)
            else:
                continue

            if not text or len(text.strip()) < 30:
                continue

            parsed = parse_resume(text, file.filename)

            if not parsed["skills"]:
                parsed["skills"] = ["unknown"]

            # Calculate basic role matching
            score, strengths, weaknesses = score_resume(parsed, role)
            summary = generate_summary(parsed, score, role)

            # Job Description Analysis
            jd_analysis = analyze_job_description_match(parsed["skills"], clean_text(text), job_description)

            # Calculate ATS compatibility score
            ats_score, ats_breakdown = calculate_ats_score(parsed, text)
            
            # Generate custom feedback based on ATS and JD details
            custom_strengths, custom_weaknesses = generate_feedback(parsed, score, role, ats_score)
            
            # Combine or overwrite feedback
            strengths = list(set(strengths + custom_strengths))
            weaknesses = list(set(weaknesses + custom_weaknesses))

            # Match score represents either job description match or role match, or a blend of both!
            # Let's keep role match as score, and return jd_analysis separately
            # Grade
            final_grade_score = jd_analysis["match_score"] if (jd_analysis is not None) else score
            if final_grade_score >= 80:
                grade = "A+"
            elif final_grade_score >= 70:
                grade = "A"
            elif final_grade_score >= 60:
                grade = "B+"
            elif final_grade_score >= 50:
                grade = "B"
            elif final_grade_score >= 40:
                grade = "C"
            elif final_grade_score >= 25:
                grade = "D"
            else:
                grade = "F"

            total_skills_found.update(parsed["skills"])

            results.append({
                "filename": file.filename,
                "candidate_name": parsed["candidate_name"],
                "skills": parsed["skills"],
                "skill_categories": parsed["skill_categories"],
                "email": parsed["email"],
                "phone": parsed["phone"],
                "linkedin": parsed["linkedin"],
                "github": parsed["github"],
                "education": parsed["education"],
                "certifications": parsed["certifications"],
                "experience_level": parsed["experience_level"],
                "experience_years": parsed["experience_years"],
                "projects_count": parsed["projects_count"],
                "word_count": parsed["word_count"],
                "spoken_languages": parsed["spoken_languages"],
                "programming_languages": parsed["programming_languages"],
                "score": score,
                "grade": grade,
                "ats_score": ats_score,
                "ats_breakdown": ats_breakdown,
                "jd_analysis": jd_analysis,
                "strengths": strengths,
                "weaknesses": weaknesses,
                "summary": summary,
            })

        except Exception as e:
            print("[CRASH FILE]:", file.filename, e)

    results.sort(key=lambda x: x["score"], reverse=True)

    # Analytics
    avg_score = round(sum(r["score"] for r in results) / max(len(results), 1), 1)
    top_skills_freq = {}
    for r in results:
        for s in r["skills"]:
            top_skills_freq[s] = top_skills_freq.get(s, 0) + 1
    top_skills_sorted = sorted(top_skills_freq.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "role": role,
        "has_job_description": job_description is not None and len(job_description.strip()) > 0,
        "ranking": results,
        "analytics": {
            "total_resumes": len(results),
            "average_score": avg_score,
            "unique_skills_found": len(total_skills_found),
            "top_skills": [{"skill": s, "count": c} for s, c in top_skills_sorted],
            "grade_distribution": {
                "A+": sum(1 for r in results if r["grade"] == "A+"),
                "A": sum(1 for r in results if r["grade"] == "A"),
                "B+": sum(1 for r in results if r["grade"] == "B+"),
                "B": sum(1 for r in results if r["grade"] == "B"),
                "C": sum(1 for r in results if r["grade"] == "C"),
                "D": sum(1 for r in results if r["grade"] == "D"),
                "F": sum(1 for r in results if r["grade"] == "F"),
            }
        }
    }