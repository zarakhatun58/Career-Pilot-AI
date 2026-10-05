from __future__ import annotations

import re
from dataclasses import dataclass


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

NORMALIZATION_REPLACEMENTS = {
    "node js": "node.js",
    "nodejs": "node.js",
    "next js": "next.js",
    "nextjs": "next.js",
    "react js": "react.js",
    "reactjs": "react.js",
    "vue js": "vue.js",
    "vuejs": "vue.js",
    "express js": "express.js",
    "expressjs": "express.js",
    "postgres sql": "postgresql",
    "postgres": "postgresql",
    "mongo db": "mongodb",
    "ci cd": "ci/cd",
    "restful api": "rest api",
    "rest apis": "rest api",
    "apis": "api",
    "web sockets": "websocket",
    "web sockets": "websocket",
    "redux toolkit": "redux-toolkit",
    "module federation": "module-federation",
    "micro frontend": "micro-frontend",
    "micro frontends": "micro-frontend",
}


# ---------------------------------------------------------------------------
# Generic words that should not affect the technical ATS score
# ---------------------------------------------------------------------------

STOP_WORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "been",
    "being",
    "by",
    "can",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "for",
    "from",
    "had",
    "has",
    "have",
    "having",
    "in",
    "into",
    "is",
    "it",
    "its",
    "may",
    "more",
    "most",
    "of",
    "on",
    "or",
    "our",
    "ours",
    "that",
    "the",
    "their",
    "them",
    "there",
    "these",
    "they",
    "this",
    "those",
    "to",
    "under",
    "up",
    "using",
    "use",
    "used",
    "uses",
    "was",
    "were",
    "what",
    "when",
    "where",
    "which",
    "who",
    "will",
    "with",
    "within",
    "would",
    "you",
    "your",
    "yours",
    "we",
    "our",
    "role",
    "job",
    "work",
    "team",
    "candidate",
    "candidates",
    "company",
    "position",
    "experience",
    "experiences",
    "years",
    "year",
    "required",
    "requirement",
    "requirements",
    "responsibility",
    "responsibilities",
    "skill",
    "skills",
    "ability",
    "abilities",
    "strong",
    "looking",
    "preferred",
    "plus",
    "including",
    "etc",
}


# ---------------------------------------------------------------------------
# High-value technical/professional terms
# ---------------------------------------------------------------------------

TECH_PATTERNS = (
    r"\bnext\.?js\b",
    r"\bnode\.?js\b",
    r"\breact\.?js\b",
    r"\bvue\.?js\b",
    r"\bexpress\.?js\b",
    r"\btypescript\b",
    r"\bjavascript\b",
    r"\bpython\b",
    r"\bfastapi\b",
    r"\bdjango\b",
    r"\bflask\b",
    r"\bpostgresql\b",
    r"\bmysql\b",
    r"\bmongodb\b",
    r"\bredis\b",
    r"\bgraphql\b",
    r"\bapollo\b",
    r"\bgRPC\b",
    r"\brest\b",
    r"\bwebsocket\b",
    r"\bplaywright\b",
    r"\bpuppeteer\b",
    r"\bselenium\b",
    r"\baws\b",
    r"\bazure\b",
    r"\bgcp\b",
    r"\bdocker\b",
    r"\bkubernetes\b",
    r"\bterraform\b",
    r"\bgithub\b",
    r"\bgitlab\b",
    r"\bci/cd\b",
    r"\bllm\b",
    r"\brag\b",
    r"\blangchain\b",
    r"\blanggraph\b",
    r"\bopenai\b",
    r"\bgemini\b",
    r"\bgroq\b",
    r"\bai\b",
    r"\bapi\b",
    r"\bsql\b",
    r"\bnosql\b",
    r"\bredis\b",
    r"\bprisma\b",
    r"\bredux\b",
    r"\bredux-toolkit\b",
    r"\bzustand\b",
    r"\btailwind\b",
    r"\bmaterial ui\b",
    r"\bmui\b",
    r"\bjest\b",
    r"\bcypress\b",
    r"\bvitest\b",
    r"\bssr\b",
    r"\bisr\b",
    r"\bapp router\b",
    r"\bserver components?\b",
    r"\bclient components?\b",
    r"\bmodule-federation\b",
    r"\bmicro-frontend\b",
    r"\bturborepo\b",
    r"\bnx\b",
    r"\blerna\b",
    r"\bgraphql\b",
    r"\bapollo\b",
)


# ---------------------------------------------------------------------------
# Professional concepts
# ---------------------------------------------------------------------------

PROFESSIONAL_PATTERNS = (
    r"\bfrontend\b",
    r"\bbackend\b",
    r"\bfull[- ]stack\b",
    r"\bsoftware engineer\b",
    r"\bfrontend engineer\b",
    r"\bsoftware developer\b",
    r"\bperformance optimization\b",
    r"\bperformance\b",
    r"\bscalable\b",
    r"\barchitecture\b",
    r"\bcomponent architecture\b",
    r"\bstate management\b",
    r"\btesting\b",
    r"\bunit testing\b",
    r"\bend[- ]to[- ]end testing\b",
    r"\btest[- ]driven development\b",
    r"\bapi design\b",
    r"\brest api\b",
    r"\bcloud\b",
    r"\bdevops\b",
    r"\bcontinuous integration\b",
    r"\bcontinuous delivery\b",
    r"\bdeployment\b",
    r"\bcontainerization\b",
    r"\bmigration\b",
    r"\blegacy migration\b",
    r"\bstrangler fig\b",
    r"\breverse proxy\b",
    r"\bcdn\b",
    r"\bmonorepo\b",
    r"\baccessibility\b",
    r"\bresponsive design\b",
    r"\bweb vitals\b",
)


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ATSResult:
    score: float
    matched_keywords: list[str]
    missing_keywords: list[str]
    recommendations: list[str]


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def normalize_text(text: str) -> str:
    """
    Normalize resume/JD text while preserving technical terminology.
    """

    normalized = text.lower()

    for source, target in NORMALIZATION_REPLACEMENTS.items():
        normalized = normalized.replace(source, target)

    normalized = re.sub(r"[•·]", " ", normalized)
    normalized = re.sub(r"\s+", " ", normalized)

    return normalized.strip()


def _extract_pattern_matches(
    patterns: tuple[str, ...],
    text: str,
) -> set[str]:
    """
    Extract normalized matches from a list of regex patterns.
    """

    matches: set[str] = set()

    for pattern in patterns:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            value = match.group(0).strip().lower()

            if value:
                matches.add(value)

    return matches


def extract_keywords(text: str) -> set[str]:
    """
    Extract meaningful ATS keywords.

    Technical and professional concepts are prioritized.
    Generic English words are deliberately excluded.
    """

    normalized = normalize_text(text)

    keywords = set()

    # High-value technical terms.
    keywords.update(
        _extract_pattern_matches(
            TECH_PATTERNS,
            normalized,
        )
    )

    # Professional concepts.
    keywords.update(
        _extract_pattern_matches(
            PROFESSIONAL_PATTERNS,
            normalized,
        )
    )

    # Remaining meaningful multi-character terms.
    words = re.findall(
        r"[a-zA-Z][a-zA-Z0-9+#./-]{2,}",
        normalized,
    )

    for word in words:
        cleaned = word.strip(".-/").lower()

        if not cleaned:
            continue

        if cleaned in STOP_WORDS:
            continue

        if len(cleaned) < 4:
            continue

        # Ignore numbers and low-value fragments.
        if cleaned.isdigit():
            continue

        keywords.add(cleaned)

    return keywords


def _keyword_aliases(keyword: str) -> set[str]:
    """
    Return acceptable aliases for a keyword.
    """

    keyword = keyword.lower().strip()

    aliases = {keyword}

    alias_groups = {
        "next.js": {"next.js", "nextjs", "next js"},
        "node.js": {"node.js", "nodejs", "node js"},
        "react.js": {"react.js", "reactjs", "react js"},
        "express.js": {"express.js", "expressjs", "express js"},
        "postgresql": {"postgresql", "postgres", "postgres sql"},
        "mongodb": {"mongodb", "mongo db"},
        "redux-toolkit": {"redux-toolkit", "redux toolkit"},
        "micro-frontend": {
            "micro-frontend",
            "micro frontend",
            "micro frontends",
        },
        "module-federation": {
            "module-federation",
            "module federation",
        },
        "rest": {"rest", "restful", "rest api"},
        "api": {"api", "apis"},
    }

    for canonical, values in alias_groups.items():
        if keyword == canonical or keyword in values:
            aliases.update(values)

    return aliases


def _keyword_present(
    keyword: str,
    resume_text: str,
) -> bool:
    """
    Check whether a keyword or one of its known aliases exists
    in the resume.
    """

    normalized_resume = normalize_text(resume_text)

    for alias in _keyword_aliases(keyword):
        escaped = re.escape(alias)

        if re.search(
            rf"(?<![a-z0-9+#]){escaped}(?![a-z0-9+#])",
            normalized_resume,
        ):
            return True

    return False


# ---------------------------------------------------------------------------
# ATS scoring
# ---------------------------------------------------------------------------

def calculate_ats_score(
    resume_text: str,
    job_description: str,
) -> tuple[float, list[str], list[str]]:
    """
    Calculate a deterministic CareerPilot compatibility score.

    This is not a reproduction of a proprietary ATS vendor score.
    """

    if not resume_text.strip():
        raise ValueError("Resume content cannot be empty.")

    if not job_description.strip():
        raise ValueError("Job description cannot be empty.")

    job_keywords = extract_keywords(job_description)

    if not job_keywords:
        raise ValueError(
            "Could not extract meaningful keywords from the job description."
        )

    matched: list[str] = []
    missing: list[str] = []

    for keyword in sorted(job_keywords):
        if _keyword_present(
            keyword=keyword,
            resume_text=resume_text,
        ):
            matched.append(keyword)
        else:
            missing.append(keyword)

    score = round(
        (len(matched) / len(job_keywords)) * 100,
        2,
    )

    return score, matched, missing


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

def build_recommendations(
    missing_keywords: list[str],
) -> list[str]:
    """
    Generate deterministic and explainable recommendations.
    """

    recommendations: list[str] = []

    if not missing_keywords:
        recommendations.append(
            "Your resume contains the main keywords detected in the job description."
        )
    else:
        recommendations.append(
            "Add missing skills or concepts only where they accurately "
            "represent your real experience."
        )

    technical_missing = {
        keyword
        for keyword in missing_keywords
        if keyword in {
            "next.js",
            "react.js",
            "typescript",
            "python",
            "fastapi",
            "node.js",
            "postgresql",
            "mongodb",
            "docker",
            "kubernetes",
            "aws",
            "azure",
            "gcp",
            "playwright",
            "puppeteer",
            "selenium",
            "graphql",
            "apollo",
            "redux",
            "redux-toolkit",
            "ssr",
            "isr",
            "cypress",
        }
    }

    if technical_missing:
        recommendations.append(
            "Review the Skills and Experience sections for relevant technical "
            "skills that are genuinely supported by your background."
        )

    if len(missing_keywords) >= 5:
        recommendations.append(
            "Tailor the professional summary to the target position."
        )

    if any(
        keyword in missing_keywords
        for keyword in {
            "performance",
            "performance optimization",
            "scalable",
            "architecture",
        }
    ):
        recommendations.append(
            "Highlight measurable performance, scalability, and architecture "
            "achievements when they are supported by your experience."
        )

    recommendations.append(
        "Use measurable achievements instead of only listing responsibilities."
    )

    recommendations.append(
        "Use standard headings such as Summary, Experience, Skills, "
        "Education, and Projects."
    )

    recommendations.append(
        "Keep the resume layout simple and machine-readable."
    )

    return recommendations


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def analyze_resume_against_job(
    resume_text: str,
    job_description: str,
) -> ATSResult:
    """
    Main public ATS analysis function.
    """

    score, matched, missing = calculate_ats_score(
        resume_text=resume_text,
        job_description=job_description,
    )

    recommendations = build_recommendations(
        missing_keywords=missing,
    )

    return ATSResult(
        score=score,
        matched_keywords=matched,
        missing_keywords=missing,
        recommendations=recommendations,
    )