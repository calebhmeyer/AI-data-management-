import math
import re
from collections import Counter
from typing import NamedTuple

_STOP_WORDS = frozenset("""
a about above after again against all also am an and any are aren't as at
be because been before being below between both but by can't cannot could
couldn't did didn't do does doesn't doing don't down during each few for
from further get got had hadn't has hasn't have haven't having he he'd he'll
he's her here here's hers herself him himself his how how's i i'd i'll i'm
i've if in into is isn't it it's its itself just let's me more most mustn't
my myself no nor not of off on once only or other ought our ours ourselves
out over own re same shan't she she'd she'll she's should shouldn't so some
such than that that's the their theirs them themselves then there there's
these they they'd they'll they're they've this those through to too under
until up very was wasn't we we'd we'll we're we've were weren't what what's
when when's where where's which while who who's whom why why's will with
won't would wouldn't you you'd you'll you're you've your yours yourself
yourselves also it's its it's
""".split())


class SimilarNote(NamedTuple):
    note_id: int
    score: float
    preview: str


def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-z']+", text.lower())
    return [t for t in tokens if t not in _STOP_WORDS and len(t) > 2]


def _tf(tokens: list[str]) -> dict[str, float]:
    counts = Counter(tokens)
    total = len(tokens) or 1
    return {term: count / total for term, count in counts.items()}


def find_related(
    target_content: str,
    candidates: list,  # list of sqlite3.Row with id, content
    top_n: int = 5,
    min_score: float = 0.05,
    exclude_id: int | None = None,
) -> list[SimilarNote]:
    """
    TF-IDF cosine similarity between target and all candidate notes.
    Pure stdlib — no numpy, no sklearn.
    """
    if not candidates:
        return []

    all_docs = [_tokenize(row["content"]) for row in candidates]
    target_tokens = _tokenize(target_content)

    # IDF from corpus
    num_docs = len(all_docs)
    doc_freq: dict[str, int] = {}
    for doc in all_docs:
        for term in set(doc):
            doc_freq[term] = doc_freq.get(term, 0) + 1

    def idf(term: str) -> float:
        df = doc_freq.get(term, 0)
        return math.log((num_docs + 1) / (df + 1)) + 1

    def tfidf_vec(tokens: list[str]) -> dict[str, float]:
        tf = _tf(tokens)
        return {term: score * idf(term) for term, score in tf.items()}

    def cosine(a: dict[str, float], b: dict[str, float]) -> float:
        shared = set(a) & set(b)
        if not shared:
            return 0.0
        dot = sum(a[t] * b[t] for t in shared)
        mag_a = math.sqrt(sum(v * v for v in a.values()))
        mag_b = math.sqrt(sum(v * v for v in b.values()))
        if mag_a == 0 or mag_b == 0:
            return 0.0
        return dot / (mag_a * mag_b)

    target_vec = tfidf_vec(target_tokens)

    results: list[SimilarNote] = []
    for row, doc_tokens in zip(candidates, all_docs):
        if exclude_id is not None and row["id"] == exclude_id:
            continue
        score = cosine(target_vec, tfidf_vec(doc_tokens))
        if score >= min_score:
            preview = row["content"][:120].replace("\n", " ")
            results.append(SimilarNote(row["id"], score, preview))

    results.sort(key=lambda x: x.score, reverse=True)
    return results[:top_n]


def extract_keywords(content: str, top_n: int = 8) -> list[str]:
    tokens = _tokenize(content)
    counts = Counter(tokens)
    return [term for term, _ in counts.most_common(top_n)]
