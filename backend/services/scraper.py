import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException


def fetch_article_text(url: str) -> str:
    """Fetch a news article URL and return its cleaned text content."""
    try:
        response = httpx.get(
            url,
            timeout=15,
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                )
            },
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Article returned status {e.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=400, detail="Could not fetch the provided URL"
        )

    soup = BeautifulSoup(response.text, "lxml")

    # strip nav/footer noise before pulling text
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    paragraphs = []
    for tag in soup.find_all(["h1", "h2", "h3", "p"]):
        text = tag.get_text(separator=" ", strip=True)
        if len(text) > 30:
            paragraphs.append(text)

    combined = " ".join(paragraphs)

    if not combined:
        raise HTTPException(
            status_code=422,
            detail="Could not extract meaningful text from this URL",
        )

    # TODO: handle JS-rendered pages better
    return combined
