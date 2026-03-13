from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.scraper import fetch_article_text
from services.nlp import extract_keywords

app = FastAPI(title="Word Cloud API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://wordcloud-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    url: str


class WordScore(BaseModel):
    word: str
    weight: float


class AnalyzeResponse(BaseModel):
    words: list[WordScore]


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_article(request: AnalyzeRequest):
    """Accept an article URL, extract text, and return keyword weights."""
    url = request.url.strip()
    if not url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    text = fetch_article_text(url)
    words = extract_keywords(text)

    return {"words": words}
