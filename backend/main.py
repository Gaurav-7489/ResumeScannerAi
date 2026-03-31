from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import pdfplumber
import docx
import os
import uuid

app = FastAPI()

# ---------------- ENV CONFIG ----------------

ENV = os.getenv("ENV", "development")

# ---------------- CORS ----------------

if ENV == "development":
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
else:
    origins = [
        "https://resumescannerai.vercel.app",
    ]

# TEMP: allow all if needed (debug mode)
# origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
            for page in pdf.pages:
                text += page.extract_text() or ""
    except Exception as e:
        print("PDF ERROR:", e)
    return text


def read_docx(path):
    text = ""
    try:
        doc = docx.Document(path)
        text = "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        print("DOCX ERROR:", e)
    return text


# ---------------- PARSE RESUME ----------------

def parse_resume(text):

    data = {
        "email": "",
        "phone": "",
        "skills": [],
    }

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
        "css", "django", "fastapi",
    ]

    for s in skills_list:
        if s in text_lower:
            data["skills"].append(s)

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
        return 0

    needed = role_rules[role]

    for s in skills:
        if s in needed:
            score += 10

    return score


# ---------------- HOME ----------------

@app.get("/")
def home():
    return {"msg": f"AI Resume Ranker running in {ENV} mode"}


# ---------------- MAIN UPLOAD ----------------

@app.post("/upload")
async def upload_files(
    role: str = Form(...),
    files: List[UploadFile] = File(...)
):

    results = []

    for file in files:

        try:
            # unique filename (important for production)
            unique_name = f"{uuid.uuid4()}_{file.filename}"
            path = os.path.join(DATASET_DIR, unique_name)

            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # read text
            if file.filename.endswith(".pdf"):
                text = read_pdf(path)

            elif file.filename.endswith(".docx"):
                text = read_docx(path)

            else:
                continue

            parsed = parse_resume(text)
            score = score_resume(parsed["skills"], role)

            results.append({
                "filename": file.filename,
                "skills": parsed["skills"],
                "email": parsed["email"],
                "phone": parsed["phone"],
                "score": score,
            })

        except Exception as e:
            print("FILE ERROR:", file.filename, e)
            continue

    # sort by score
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "role": role,
        "ranking": results
    }