from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import pdfplumber
import docx
import os
import uuid

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

# ----------- FOLDERS -----------

BASE_UPLOAD = "uploads"
DATASET_DIR = "uploads/sample_dataset"

os.makedirs(BASE_UPLOAD, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

# ---------------- READ FILES ----------------

def read_pdf(path):
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                extracted = page.extract_text()
                if extracted:
                    print(f"[PDF] Page {i} length:", len(extracted))
                    text += extracted
                else:
                    print(f"[PDF WARNING] Page {i} empty")
    except Exception as e:
        print("[PDF ERROR]:", e)
    return text


def read_docx(path):
    text = ""
    try:
        doc = docx.Document(path)
        text = "\n".join([p.text for p in doc.paragraphs])
        print("[DOCX] length:", len(text))
    except Exception as e:
        print("[DOCX ERROR]:", e)
    return text


# ---------------- PARSE ----------------

def parse_resume(text):

    data = {
        "email": "",
        "phone": "",
        "skills": [],
    }

    print("[DEBUG] TEXT LENGTH:", len(text))

    lines = text.split("\n")

    for line in lines:

        if "@" in line and "." in line:
            data["email"] = line.strip()

        if "+91" in line or (line.strip().isdigit() and len(line.strip()) == 10):
            data["phone"] = line.strip()

    text_lower = text.lower()

    skills_list = [
        "c++", "java", "python", "react", "node", "mongodb",
        "sql", "excel", "power bi", "javascript", "html",
        "css", "django", "fastapi", "docker", "aws", "linux"
    ]

    for s in skills_list:
        if s in text_lower:
            data["skills"].append(s)

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
            score += 10

    print("[DEBUG] SCORE:", score)

    return score


# ---------------- ROUTES ----------------

@app.get("/")
def home():
    return {"msg": "Backend running DEBUG mode 🚀"}


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

            # ---------- TYPE ----------
            if file.filename.lower().endswith(".pdf"):
                print("[TYPE] PDF")
                text = read_pdf(path)

            elif file.filename.lower().endswith(".docx"):
                print("[TYPE] DOCX")
                text = read_docx(path)

            else:
                print("[SKIP] Unsupported:", file.filename)
                continue

            # ---------- EMPTY ----------
            if not text.strip():
                print("[ERROR] EMPTY TEXT:", file.filename)
                continue

            # ---------- PARSE ----------
            parsed = parse_resume(text)

            if not parsed["skills"]:
                print("[WARNING] NO SKILLS FOUND:", file.filename)

            # ---------- SCORE ----------
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

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "role": role,
        "ranking": results
    }