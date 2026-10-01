export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  return 'bg-destructive';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Work';
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
}

export function formatSalary(min?: number, max?: number, currency?: string): string {
  if (!min && !max) return '';
  const symbol = currency === 'USD' ? '$' : currency === 'CAD' ? 'C$' : currency || '';
  if (min && max) return `${symbol}${(min / 1000).toFixed(0)}k - ${symbol}${(max / 1000).toFixed(0)}k`;
  if (min) return `${symbol}${(min / 1000).toFixed(0)}k+`;
  return `Up to ${symbol}${(max! / 1000).toFixed(0)}k`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function calculateMatchScore(
  resumeSkills: string[],
  jobSkills: string[]
): { score: number; matching: string[]; missing: string[] } {
  const normalize = (s: string) => s.toLowerCase().trim();
  const resumeSet = new Set(resumeSkills.map(normalize));
  const matching: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSkills) {
    if (resumeSet.has(normalize(skill))) {
      matching.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const score = jobSkills.length > 0 ? Math.round((matching.length / jobSkills.length) * 100) : 0;
  return { score, matching, missing };
}
