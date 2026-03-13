# 3D Word Cloud Visualizer

A full-stack app that takes a news article URL, extracts the key topics, and renders them as an interactive 3D word cloud. Paste a link, hit Analyze, and explore the results in a rotating, zoomable 3D scene where word size reflects relevance.

**Live Demo:** https://wordcloud-frontend.onrender.com  
**Backend API Docs:** https://wordcloud-backend.onrender.com/docs

## Tech Stack

**Frontend:** React, TypeScript, Three.js, React Three Fiber, Drei, Vite

**Backend:** Python, FastAPI, scikit-learn (TF-IDF), BeautifulSoup, httpx

## Project Structure

```
├── backend/
│   ├── main.py                 # FastAPI app and /analyze endpoint
│   ├── requirements.txt
│   └── services/
│       ├── scraper.py          # Article fetching and HTML text extraction
│       └── nlp.py              # TF-IDF keyword extraction and scoring
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx             # Root component and state management
│       ├── types/index.ts      # Shared TypeScript interfaces
│       └── components/
│           ├── URLInput.tsx     # URL form with sample links
│           └── WordCloudScene.tsx  # 3D word cloud renderer
├── setup.sh                    # One-command install and run
└── README.md
```

## Quick Start

The setup script installs all dependencies and starts both servers:

```bash
chmod +x setup.sh
./setup.sh
```

Then open **http://localhost:5173** in your browser.

## Manual Setup

If you prefer to run things separately:

**Backend** (Python 3.10+):

```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000
```

**Frontend** (Node 18+):

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:8000`.

## API

### POST /analyze

Accepts a news article URL and returns extracted keywords with relevance weights.

**Request:**

```json
{
  "url": "https://www.npr.org/2026/03/06/nx-s1-5737460/in-one-week-war-has-swept-across-the-middle-east"
}
```

**Response:**

```json
{
  "words": [
    { "word": "iran", "weight": 0.962 },
    { "word": "trump", "weight": 0.864 },
    { "word": "war", "weight": 0.668 }
  ]
}
```

Weights are normalized to a 0-1 range. The endpoint returns 50 keywords by default.

**Errors:** Returns `400` for invalid or unreachable URLs, `422` if no meaningful text could be extracted.

## How It Works

1. User enters an article URL in the frontend
2. Frontend sends the URL to `POST /analyze`
3. Backend fetches the page and strips non-content HTML (nav, footer, scripts)
4. Text is split into sentences and scored with TF-IDF to find distinctive keywords
5. Ranked keywords and normalized weights are returned as JSON
6. Frontend positions words on a Fibonacci sphere and renders them with React Three Fiber
7. Word size and color reflect weight; the cloud auto-rotates and supports orbit/zoom

## Known Limitations

- Only works with server-rendered pages; JavaScript-heavy sites (SPAs) may return incomplete text
- Crawling is basic and not designed to handle paywalled or login-gated content
- TF-IDF scoring works best on longer articles with several paragraphs
