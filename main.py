from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="AI Resume Screening Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    extracted_text = ""
    for page in pdf_reader.pages:
        text = page.extract_text()
        if text:
            extracted_text += text + " "
    return extracted_text.strip()

@app.get("/")
def home():
    return {"message": "AI Resume Screening Microservice is Running"}

@app.post("/analyze-resume")
async def analyze_resume(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...)
):
    pdf_bytes = await resume_file.read()
    resume_text = extract_text_from_pdf(pdf_bytes)

    if not resume_text:
        return {"error": "Could not extract text from PDF"}

    documents = [job_description, resume_text]
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(documents)

    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    score_percentage = round(float(similarity) * 100, 2)

    return {
        "filename": resume_file.filename,
        "match_score": score_percentage,
        "extracted_text_snippet": resume_text[:200] + "..."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)