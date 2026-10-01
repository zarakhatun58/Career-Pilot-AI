'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ScanText,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { demoResumes, demoATSAnalyses } from '@/lib/demo-data';
import { getScoreColor, getScoreLabel, timeAgo, calculateMatchScore } from '@/lib/utils/score';
import type { ATSAnalysis, Resume } from '@/lib/types';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export default function ATSCheckerPage() {
  const { toast } = useToast();
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSAnalysis | null>(null);
  const [view, setView] = useState<'input' | 'results'>('input');

  const selectedResume = demoResumes.find((r) => r.id === selectedResumeId);

  const handleAnalyze = () => {
    if (!selectedResumeId && !jobDescription) {
      toast({
        title: 'Missing information',
        description: 'Please select a resume and paste a job description.',
        variant: 'destructive',
      });
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      const resume = demoResumes.find((r) => r.id === selectedResumeId) || demoResumes[0];
      const resumeSkills = resume.content.skills.map((s) => s.name);
      const jobSkills = jobDescription
        .match(/\b(React|TypeScript|JavaScript|Node\.js|Python|PostgreSQL|GraphQL|CSS|HTML|Next\.js|Vue|Angular|AWS|Docker|Kubernetes|Jest|Cypress|Accessibility|Tailwind|Redux|Webpack|Vite)\b/gi)
        || ['React', 'TypeScript', 'CSS'];

      const { score, matching, missing } = calculateMatchScore(resumeSkills, jobSkills as string[]);
      const overall = Math.round(
        score * 0.3 + 85 * 0.25 + 80 * 0.25 + 95 * 0.2
      );

      const analysis: ATSAnalysis = {
        id: `ats-${Date.now()}`,
        user_id: 'demo-user',
        resume_id: resume.id,
        job_title: jobTitle || 'Software Engineer',
        company_name: companyName || 'Target Company',
        job_description: jobDescription,
        overall_score: overall,
        keyword_match_score: score,
        skills_match_score: 85,
        experience_alignment_score: 80,
        formatting_score: 95,
        matching_keywords: matching,
        missing_keywords: missing,
        recommendations: [
          'Add measurable achievements with specific metrics (e.g., "Improved performance by 40%")',
          'Include experience with testing frameworks if applicable',
          'Tailor your professional summary to match the job title',
          ...missing.slice(0, 2).map((s) => `Consider adding ${s} to your skills section if you have experience`),
        ],
        created_at: new Date().toISOString(),
      };
      setResult(analysis);
      setAnalyzing(false);
      setView('results');
      toast({
        title: 'Analysis complete',
        description: `Your ATS score is ${overall}/100`,
      });
    }, 2000);
  };

  const scoreBreakdown = result
    ? [
        { label: 'Keyword Match', value: result.keyword_match_score, fullMark: 100 },
        { label: 'Skills Match', value: result.skills_match_score, fullMark: 100 },
        { label: 'Experience', value: result.experience_alignment_score, fullMark: 100 },
        { label: 'Formatting', value: result.formatting_score, fullMark: 100 },
      ]
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="ATS Score Checker"
        description="Analyze your resume against a job description for ATS compatibility"
        badge={<DemoBadge />}
      />

      <Tabs value={view} onValueChange={(v) => setView(v as 'input' | 'results')}>
        <TabsList>
          <TabsTrigger value="input">Analyze</TabsTrigger>
          <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Resume Selection */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Select Resume</CardTitle>
                  <CardDescription>Choose a resume to analyze</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {demoResumes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Upload className="h-3.5 w-3.5" /> Upload PDF
                    </Button>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <FileText className="h-3.5 w-3.5" /> Upload DOCX
                    </Button>
                  </div>
                  {selectedResume && (
                    <div className="rounded-md bg-secondary/50 p-3 text-sm">
                      <p className="font-medium text-foreground">{selectedResume.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedResume.content.skills.length} skills ·
                        ATS: {selectedResume.ats_score || 'N/A'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-accent/5">
                <CardContent className="p-4">
                  <div className="flex gap-2.5">
                    <Sparkles className="h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Transparent Scoring</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Scores are estimates based on keyword and skills matching. A high score
                        does not guarantee passing a specific company&apos;s ATS.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Job Description Input */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base">Job Details</CardTitle>
                  <CardDescription>
                    Paste the job description you want to match against
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Airbnb"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description</Label>
                    <Textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here..."
                      rows={10}
                      className="resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <ScanText className="h-4 w-4" /> Analyze Resume
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Analyses */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Recent Analyses</CardTitle>
              <CardDescription>Your latest ATS scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoATSAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{analysis.job_title}</p>
                    <p className="text-sm text-muted-foreground">{analysis.company_name}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(analysis.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Keywords: {analysis.keyword_match_score}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Skills: {analysis.skills_match_score}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                        {analysis.overall_score}
                      </span>
                      <span className="text-xs text-muted-foreground">/ 100</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {result && (
            <>
              {/* Score Overview */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="border-border lg:col-span-1">
                  <CardContent className="flex flex-col items-center p-6">
                    <div className={`relative flex h-32 w-32 items-center justify-center rounded-full ${getScoreColor(result.overall_score).replace('text-', 'bg-')}/10`}>
                      <div className="text-center">
                        <span className={`text-4xl font-bold ${getScoreColor(result.overall_score)}`}>
                          {result.overall_score}
                        </span>
                        <span className="block text-xs text-muted-foreground">/ 100</span>
                      </div>
                    </div>
                    <Badge className={`mt-3 border-0 ${getScoreColor(result.overall_score).replace('text-', 'bg-')}/15 ${getScoreColor(result.overall_score)}`}>
                      {getScoreLabel(result.overall_score)}
                    </Badge>
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                      {result.job_title} at {result.company_name}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        {scoreBreakdown.map((item) => (
                          <div key={item.label}>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className={`font-bold ${getScoreColor(item.value)}`}>{item.value}%</span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={`h-full rounded-full transition-all ${getScoreColor(item.value).replace('text-', 'bg-')}`}
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={scoreBreakdown}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <Radar
                            dataKey="value"
                            stroke="hsl(var(--accent))"
                            fill="hsl(var(--accent))"
                            fillOpacity={0.3}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      Matching Keywords
                    </CardTitle>
                    <CardDescription>Keywords found in both your resume and the job description</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.matching_keywords.map((kw) => (
                        <Badge key={kw} className="border-0 bg-success/15 text-success">
                          {kw}
                        </Badge>
                      ))}
                      {result.matching_keywords.length === 0 && (
                        <p className="text-sm text-muted-foreground">No matching keywords found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <XCircle className="h-5 w-5 text-destructive" />
                      Missing Keywords
                    </CardTitle>
                    <CardDescription>Keywords in the job description not found in your resume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((kw) => (
                        <Badge key={kw} variant="outline" className="border-destructive/30 text-destructive">
                          {kw}
                        </Badge>
                      ))}
                      {result.missing_keywords.length === 0 && (
                        <p className="text-sm text-success">All keywords matched!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Lightbulb className="h-5 w-5 text-accent" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>Suggestions to improve your ATS score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-foreground">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <div className="flex items-start gap-2.5 rounded-lg bg-warning/10 p-4">
                <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
                <p className="text-sm text-muted-foreground">
                  This ATS score is an estimate based on keyword and skills matching. It does not
                  guarantee passing any specific company&apos;s Applicant Tracking System. Always
                  review your resume manually before submitting.
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setView('input')}>
                  Analyze Another
                </Button>
                <Button className="gap-2">
                  <TrendingUp className="h-4 w-4" /> Optimize Resume
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
