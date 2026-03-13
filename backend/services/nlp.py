import re

from sklearn.feature_extraction.text import TfidfVectorizer

# Words that pass sklearn's English stop-word list but are still useless in a
# news word cloud: generic verbs, filler adverbs, article-layout words, and
# common news-site boilerplate.
_EXTRA_STOPWORDS = {
    # generic verbs that appear everywhere
    "said", "says", "told", "tell", "asked", "ask", "added", "add",
    "noted", "note", "called", "call", "cited", "cite", "reported",
    "report", "according", "continued", "continue", "explained",
    "explain", "described", "describe", "announced", "announce",
    "confirmed", "confirm", "stated", "state", "wrote", "write",
    "know", "think", "want", "need", "mean", "like", "look",
    "feel", "felt", "seem", "seemed", "keep", "kept", "give",
    "given", "gets", "gotten", "come", "came", "goes", "gone",
    # filler / connective words
    "also", "just", "even", "still", "already", "ago", "back",
    "really", "actually", "basically", "literally", "probably",
    "going", "went", "take", "taken", "make", "made",
    "way", "time", "year", "years", "week", "weeks",
    "month", "months", "day", "days", "today", "monday", "tuesday",
    "wednesday", "thursday", "friday", "saturday", "sunday",
    "right", "left", "good", "great", "very", "well", "kind",
    "sort", "thing", "things", "people", "person", "place",
    # news-site / transcript boilerplate
    "archived", "archive", "recording", "soundbite", "listen", "audio",
    "transcript", "subscribe", "newsletter", "podcast", "episode",
    "update", "updated", "read", "reading", "click", "share",
    "follow", "following", "contact", "advertisement", "sponsor",
    "copyright", "rights", "reserved", "terms", "privacy", "policy",
    "cookie", "comments", "comment", "reply", "replies",
    # numbers-as-words that slip through
    "percent", "million", "billion", "trillion", "hundred", "thousand",
    # generic quantifiers / determiners
    "many", "much", "more", "most", "some", "any", "every",
    "few", "less", "least", "several", "various", "other",
    "another", "both", "each", "either", "neither", "own",
    # pronouns that slip through
    "they", "them", "their", "there", "these", "those", "this",
    "that", "what", "which", "who", "whom", "whose", "where",
    "when", "how", "why",
}


def _clean_text(text: str) -> str:
    """Normalise whitespace and remove characters that skew tokenisation."""
    # strip transcript-style speaker labels: "SCOTT DETROW:" / "AILSA CHANG:"
    # these appear as ALL-CAPS words followed by a colon in NPR/radio content
    text = re.sub(r"\b[A-Z]{2,}(?:\s+[A-Z]{2,})*\s*:", " ", text)
    # collapse unicode dashes and quotes to ASCII equivalents
    text = re.sub(r"[\u2013\u2014\u2015]", " ", text)
    text = re.sub(r"[\u2018\u2019\u201c\u201d]", "'", text)
    # drop anything that is not a letter, digit, space, or apostrophe
    text = re.sub(r"[^a-zA-Z0-9\s']", " ", text)
    # collapse runs of whitespace
    return re.sub(r"\s+", " ", text).strip()


def extract_keywords(text: str, top_n: int = 50) -> list[dict]:
    """Run TF-IDF on article text and return ranked keywords with weights."""

    text = _clean_text(text)

    # chunk into sentences so TF-IDF has multiple docs for IDF scoring
    chunks = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 40]

    if len(chunks) < 3:
        chunks = [text[i : i + 300] for i in range(0, len(text), 300)]

    combined_stops = list(
        TfidfVectorizer(stop_words="english").get_stop_words() | _EXTRA_STOPWORDS
    )

    vectorizer = TfidfVectorizer(
        stop_words=combined_stops,
        max_features=300,
        # require at least 2 documents to contain the token — filters
        # one-off artifacts (like a reporter name that appears once)
        min_df=2,
        token_pattern=r"(?u)\b[a-zA-Z]{4,}\b",
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(chunks)
    except ValueError:
        # fewer unique tokens than min_df; fall back without min_df
        vectorizer = TfidfVectorizer(
            stop_words=combined_stops,
            max_features=300,
            token_pattern=r"(?u)\b[a-zA-Z]{4,}\b",
        )
        tfidf_matrix = vectorizer.fit_transform(chunks)

    feature_names = vectorizer.get_feature_names_out()
    scores = tfidf_matrix.sum(axis=0).A1

    ranked = sorted(zip(feature_names, scores), key=lambda x: x[1], reverse=True)

    # post-filter: drop anything still in the extra stopword list
    ranked = [(w, s) for w, s in ranked if w.lower() not in _EXTRA_STOPWORDS]
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
