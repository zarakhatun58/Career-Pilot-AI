'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { MatchScore } from '@/components/shared/match-score';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  ExternalLink,
  Building2,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ScanText,
  Lightbulb,
} from 'lucide-react';
import { demoJobs, demoResumes } from '@/lib/demo-data';
import { timeAgo, formatSalary, capitalize, getScoreColor } from '@/lib/utils/score';

export const dynamic = 'force-dynamic';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const job = demoJobs.find((j) => j.id === params.id);
  const [saved, setSaved] = useState(false);

  if (!job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card className="border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Job not found.</p>
            <Link href="/dashboard/jobs" className="mt-4 inline-block">
              <Button variant="outline">Browse all jobs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(!saved);
    toast({
      title: saved ? 'Job removed' : 'Job saved',
      description: saved ? 'Removed from saved jobs' : 'Added to your saved jobs',
    });
  };

  const handleApply = () => {
    toast({
      title: 'Opening application',
      description: `Redirecting to ${job.sourceName}...`,
    });
  };

  const handleAnalyzeMatch = () => {
    toast({
      title: 'Analyzing match',
      description: 'Comparing your resume to this job description...',
    });
    setTimeout(() => {
      router.push('/dashboard/ats-checker');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Button>

      <PageHeader
        title={job.title}
        description={`${job.company} · ${job.location}`}
        badge={<DemoBadge />}
        action={
          <>
            <Button variant="outline" onClick={handleSave} className="gap-2">
              <Bookmark className={saved ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button onClick={handleApply} className="gap-2">
              <ExternalLink className="h-4 w-4" /> Apply
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Info */}
          <Card className="border-border">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Briefcase className="h-4 w-4" /> {capitalize(job.workMode)}
                </span>
                <span className="text-muted-foreground">{capitalize(job.employmentType)}</span>
                <span className="text-muted-foreground">{capitalize(job.experienceLevel)}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" /> {timeAgo(job.postedAt)}
                </span>
                {job.salaryMin && (
                  <span className="font-medium text-foreground">
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{job.description}</p>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {resp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {job.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    </span>
                    {benefit}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Score */}
          {job.matchScore && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base">Resume Match</CardTitle>
                <CardDescription>Based on your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <MatchScore score={job.matchScore} showProgress size="lg" />

                {job.matchingSkills && job.matchingSkills.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Matching Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matchingSkills.map((s) => (
                        <Badge key={s} className="border-0 bg-success/15 text-success text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.missingSkills && job.missingSkills.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                      <XCircle className="h-3.5 w-3.5" /> Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.missingSkills.map((s) => (
                        <Badge key={s} variant="outline" className="border-destructive/30 text-destructive text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleAnalyzeMatch}>
                  <ScanText className="h-3.5 w-3.5" /> Full ATS Analysis
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{job.company}</p>
                  <p className="text-xs text-muted-foreground">{job.country}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium text-foreground">Technology</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span className="font-medium text-foreground">{job.sourceName}</span>
                </div>
              </div>
              <Link href="/dashboard/referrals">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Users className="h-3.5 w-3.5" /> Find Referrals
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border">
            <CardContent className="space-y-3 p-4">
              <Button className="w-full gap-2" onClick={handleApply}>
                <ExternalLink className="h-4 w-4" /> Apply on {job.sourceName}
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleSave}>
                <Bookmark className={saved ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
                {saved ? 'Saved' : 'Save Job'}
              </Button>
              <Link href="/dashboard/applications">
                <Button variant="ghost" className="w-full gap-2">
                  <Target className="h-4 w-4" /> Track Application
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Source attribution */}
          <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
            <p>
              This job was posted on {job.sourceName} on{' '}
              {new Date(job.postedAt).toLocaleDateString()}.
              CareerPilot AI does not scrape websites. Always apply through the official source.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
