import re


STOP_WORDS = {
    "and",
    "the",
    "for",
    "with",
    "that",
    "this",
    "from",
    "are",
    "you",
    "your",
    "our",
    "will",
    "have",
    "has",
    "into",
    "using",
    "use",
    "job",
    "role",
    "work",
    "team",
}


def extract_keywords(text: str) -> set[str]:
    words = re.findall(r"[a-zA-Z][a-zA-Z+#.-]{2,}", text.lower())

    return {
        word.strip(".-")
        for word in words
        if word not in STOP_WORDS
    }


def calculate_ats_score(
    resume_text: str,
    job_description: str,
) -> tuple[float, list[str], list[str]]:
    resume_keywords = extract_keywords(resume_text)
    job_keywords = extract_keywords(job_description)

    if not job_keywords:
        return 0.0, [], []

    matched = sorted(resume_keywords.intersection(job_keywords))
    missing = sorted(job_keywords.difference(resume_keywords))

    score = round(
        (len(matched) / len(job_keywords)) * 100,
        2,
    )

    return score, matched, missing


def build_recommendations(
    missing_keywords: list[str],
) -> list[str]:
    recommendations = []

    if missing_keywords:
        recommendations.append(
            "Add relevant missing keywords naturally to your resume."
        )

    if len(missing_keywords) > 10:
        recommendations.append(
            "Tailor your professional summary to the job description."
        )

    recommendations.append(
        "Use measurable achievements and action verbs."
    )

    recommendations.append(
        "Keep formatting simple and ATS-friendly."
    )

    return recommendations