import re

import httpx
from bs4 import BeautifulSoup, Tag
from fastapi import HTTPException

# CSS class / id substrings that reliably signal non-article content.
# Matching any of these on a tag causes the whole tag to be removed before
# text extraction, so bylines, captions, cookie banners, and subscribe
# prompts never reach the NLP pipeline.
_NOISE_PATTERNS = re.compile(
    r"byline|author|caption|credit|subscribe|newsletter|cookie|"
    r"related|trending|advertisement|promo|sidebar|share|social|"
    r"tag\-list|breadcrumb|pagination|timestamp|dateline|photo\-",
    re.IGNORECASE,
)


def _is_noise_element(tag: Tag) -> bool:
    """Return True if a tag looks like boilerplate rather than article body."""
    attrs = tag.attrs  # always a dict on a bs4 Tag
    if not attrs:
        return False
    for attr in ("class", "id"):
        value = attrs.get(attr, "")
        combined = " ".join(value) if isinstance(value, list) else (value or "")
        if _NOISE_PATTERNS.search(combined):
            return True
    return False


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

    # strip elements whose class or id signals boilerplate.
    # collect first, then decompose — avoids mutating the tree mid-iteration.
    noise_tags = [t for t in soup.find_all(True) if isinstance(t, Tag) and _is_noise_element(t)]
    for tag in noise_tags:
        tag.decompose()

    paragraphs = []
    for tag in soup.find_all(["h1", "h2", "h3", "p"]):
        text = tag.get_text(separator=" ", strip=True)
        # skip very short fragments — they are usually captions or labels
        if len(text) > 40:
            paragraphs.append(text)

    combined = " ".join(paragraphs)

    if not combined:
        raise HTTPException(
            status_code=422,
            detail="Could not extract meaningful text from this URL",
        )

    # TODO: handle JS-rendered pages better
    return combined
