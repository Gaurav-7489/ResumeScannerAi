from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import pdfplumber
import docx
import os

app = FastAPI()

# CORS (for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def read_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def read_docx(path):
    doc = docx.Document(path)
    text = "\n".join([p.text for p in doc.paragraphs])
    return text


def detect_skills(text):
    skills = [
        "python",
        "java",
        "react",
        "node",
        "html",
        "css",
        "sql",
        "fastapi",
        "django",
        "javascript",
    ]

    found = []

    for s in skills:
        if s.lower() in text.lower():
            found.append(s)

    return found


@app.get("/")
def home():
    return {"msg": "AI Resume Scanner running"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    path = f"{UPLOAD_DIR}/{file.filename}"

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    if file.filename.endswith(".pdf"):
        text = read_pdf(path)

    elif file.filename.endswith(".docx"):
        text = read_docx(path)

    else:
        return {"error": "file not supported"}

    skills = detect_skills(text)

    return {
        "filename": file.filename,
        "skills": skills,
        "preview": text[:500],
    }