import re

from sklearn.feature_extraction.text import TfidfVectorizer


def extract_keywords(text: str, top_n: int = 50) -> list[dict]:
    """Run TF-IDF on article text and return ranked keywords with weights."""

    # chunk into sentences so TF-IDF has multiple docs for IDF scoring
    chunks = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 40]

    if len(chunks) < 3:
        chunks = [text[i : i + 300] for i in range(0, len(text), 300)]

    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=200,
        token_pattern=r"(?u)\b[a-zA-Z]{3,}\b",
    )

    tfidf_matrix = vectorizer.fit_transform(chunks)
    feature_names = vectorizer.get_feature_names_out()

    scores = tfidf_matrix.sum(axis=0).A1

    ranked = sorted(zip(feature_names, scores), key=lambda x: x[1], reverse=True)
    ranked = ranked[:top_n]

    if not ranked:
        return []

    max_score = ranked[0][1]
    min_score = ranked[-1][1]
    score_range = max_score - min_score

    results = []
    for word, score in ranked:
        if score_range > 0:
            weight = (score - min_score) / score_range
        else:
            weight = 1.0
        # floor at 0.1 so the smallest words still show up in the cloud
        weight = round(max(weight, 0.1), 3)
        results.append({"word": word, "weight": weight})

    return results
