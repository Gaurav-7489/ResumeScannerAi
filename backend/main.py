from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import pdfplumber
import docx
import os
import uuid
import re

app = FastAPI()

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
                    print(f"[PDF] Page {i} length:", len(extracted))
                    text += extracted + "\n"
                else:
                    print(f"[PDF WARNING] Page {i} empty")

    except Exception as e:
        print("[PDF ERROR]:", e)

    return text


# ---------------- READ DOCX ----------------

def read_docx(path):
    text = ""

    try:
        doc = docx.Document(path)
        text = "\n".join([p.text for p in doc.paragraphs])
        print("[DOCX] length:", len(text))

    except Exception as e:
        print("[DOCX ERROR]:", e)

    return text


# ---------------- CLEAN TEXT ----------------

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9+.#\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


# ---------------- PARSE RESUME ----------------

def parse_resume(text):

    data = {
        "email": "",
        "phone": "",
        "skills": [],
    }

    print("[DEBUG] TEXT LENGTH:", len(text))

    # EMAIL
    email_match = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    if email_match:
        data["email"] = email_match[0]

    # PHONE
    phone_match = re.findall(r"\b\d{10}\b", text)
    if phone_match:
        data["phone"] = phone_match[0]

    text_lower = clean_text(text)

    # HUGE SKILL DATABASE
    skills_list = [
        # programming
        "python", "java", "c++", "c", "javascript", "typescript",
        # web
        "html", "css", "react", "angular", "vue", "node", "express",
        # backend
        "django", "fastapi", "spring", "flask",
        # database
        "sql", "mysql", "postgresql", "mongodb",
        # data
        "pandas", "numpy", "power bi", "excel",
        # ml
        "tensorflow", "keras", "scikit", "machine learning",
        # devops
        "docker", "kubernetes", "aws", "linux", "git", "ci/cd"
    ]

    for skill in skills_list:
        if skill in text_lower:
            data["skills"].append(skill)

    print("[DEBUG] SKILLS FOUND:", data["skills"])

    return data


# ---------------- SCORE ----------------

def score_resume(skills, role):

    score = 0

    role_rules = {

        "Web Developer": ["html", "css", "javascript", "react", "node"],

        "Machine Learning": ["python", "numpy", "pandas", "tensorflow", "sql"],

        "Backend Engineer": ["python", "django", "fastapi", "sql", "node"],

        "Data Science": ["python", "sql", "excel", "power bi", "pandas"],
    }

    if role not in role_rules:
        print("[WARNING] Unknown role:", role)
        return 0

    needed = role_rules[role]

    for s in skills:
        if s in needed:
            score += 20  # boosted scoring

    print("[DEBUG] SCORE:", score)

    return score


# ---------------- ROOT ----------------

@app.get("/")
def home():
    return {"msg": "🔥 Resume Ranker Backend FULLY WORKING 🔥"}


# ---------------- UPLOAD ----------------

@app.post("/upload")
async def upload_files(
    role: str = Form(...),
    files: List[UploadFile] = File(...)
):

    print("\n========= NEW REQUEST =========")
    print("[ROLE]:", role)
    print("[FILES COUNT]:", len(files))

    results = []

    for file in files:

        try:
            print("\n[FILE]:", file.filename)

            unique_name = f"{uuid.uuid4()}_{file.filename}"
            path = os.path.join(DATASET_DIR, unique_name)

            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            text = ""

            # -------- FILE TYPE --------
            if file.filename.lower().endswith(".pdf"):
                print("[TYPE] PDF")
                text = read_pdf(path)

            elif file.filename.lower().endswith(".docx"):
                print("[TYPE] DOCX")
                text = read_docx(path)

            else:
                print("[SKIP] Unsupported:", file.filename)
                continue

            # -------- EMPTY CHECK --------
            if not text or len(text.strip()) < 30:
                print("[ERROR] EMPTY / USELESS TEXT:", file.filename)
                continue

            # -------- PARSE --------
            parsed = parse_resume(text)

            # fallback (VERY IMPORTANT)
            if not parsed["skills"]:
                print("[FALLBACK] assigning default minimal skill")
                parsed["skills"] = ["unknown"]

            # -------- SCORE --------
            score = score_resume(parsed["skills"], role)

            results.append({
                "filename": file.filename,
                "skills": parsed["skills"],
                "email": parsed["email"],
                "phone": parsed["phone"],
                "score": score,
            })

            print("[SUCCESS] Added:", file.filename)

        except Exception as e:
            print("[CRASH FILE]:", file.filename, e)

    print("\n[FINAL COUNT]:", len(results))

    # -------- SAFETY FALLBACK --------
    if len(results) == 0:
        print("[CRITICAL] No valid resumes processed")

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "role": role,
        "ranking": results
    }