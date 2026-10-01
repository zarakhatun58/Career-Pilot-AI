'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { MatchScore } from '@/components/shared/match-score';
import {
  FileText,
  ScanText,
  Briefcase,
  ClipboardList,
  TrendingUp,
  Plus,
  Upload,
  Target,
  Sparkles,
  ArrowRight,
  Users,
  Clock,
} from 'lucide-react';
import {
  demoDashboardStats,
  demoResumes,
  demoATSAnalyses,
  demoJobs,
  demoApplications,
} from '@/lib/demo-data';
import { getScoreColor, timeAgo, formatSalary, capitalize } from '@/lib/utils/score';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import type { ApplicationStatus } from '@/lib/types';

const statsCards = [
  {
    label: 'Total Resumes',
    value: demoDashboardStats.totalResumes,
    icon: FileText,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    href: '/dashboard/resumes',
  },
  {
    label: 'Avg ATS Score',
    value: `${demoDashboardStats.averageAtsScore}/100`,
    icon: ScanText,
    color: 'text-success',
    bgColor: 'bg-success/10',
    href: '/dashboard/ats-checker',
  },
  {
    label: 'Saved Jobs',
    value: demoDashboardStats.savedJobs,
    icon: Briefcase,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    href: '/dashboard/saved-jobs',
  },
  {
    label: 'Applications',
    value: demoDashboardStats.applicationsSubmitted,
    icon: ClipboardList,
    color: 'text-info',
    bgColor: 'bg-info/10',
    href: '/dashboard/applications',
  },
];

const quickActions = [
  { label: 'Create Resume', icon: Plus, href: '/dashboard/resumes/new', description: 'Start from scratch' },
  { label: 'Upload Resume', icon: Upload, href: '/dashboard/resumes', description: 'PDF or DOCX' },
  { label: 'Check ATS Score', icon: ScanText, href: '/dashboard/ats-checker', description: 'Analyze a resume' },
  { label: 'Find Jobs', icon: Target, href: '/dashboard/jobs', description: 'Search worldwide' },
  { label: 'Optimize Profile', icon: Sparkles, href: '/dashboard/profile-optimization', description: 'LinkedIn & more' },
];

const applicationActivity = [
  { stage: 'Saved', count: 1 },
  { stage: 'Preparing', count: 1 },
  { stage: 'Applied', count: 1 },
  { stage: 'Screening', count: 1 },
  { stage: 'Interview', count: 1 },
  { stage: 'Offer', count: 0 },
];

const statusColors: Record<ApplicationStatus, string> = {
  saved: 'bg-secondary text-secondary-foreground',
  preparing: 'bg-warning/15 text-warning',
  applied: 'bg-info/15 text-info',
  screening: 'bg-accent/15 text-accent',
  interview: 'bg-primary/15 text-primary',
  offer: 'bg-success/15 text-success',
  rejected: 'bg-destructive/15 text-destructive',
  withdrawn: 'bg-muted text-muted-foreground',
};

export default function DashboardPage() {
  const recommendedJobs = demoJobs.filter((j) => (j.matchScore || 0) >= 75).slice(0, 3);
  const recentAnalyses = demoATSAnalyses.slice(0, 2);
  const recentApplications = demoApplications.slice(0, 3);
  const resumeHealthData = demoResumes.map((r) => ({
    name: r.title.length > 20 ? r.title.substring(0, 20) + '...' : r.title,
    score: r.ats_score || 0,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track your resumes, applications, and job search progress"
        badge={<DemoBadge />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="border-border transition-all hover:shadow-md hover:border-accent/30">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-all hover:border-accent/30 hover:bg-accent/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-accent/10">
                  <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Resume Health */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Resume Health Overview</CardTitle>
              <CardDescription>ATS scores across your resumes</CardDescription>
            </div>
            <Link href="/dashboard/resumes">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={resumeHealthData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="score"
                  fill="hsl(var(--accent))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Interview Progress */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Interview Progress</CardTitle>
            <CardDescription>Application pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={[{ value: demoDashboardStats.interviewProgress }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" fill="hsl(var(--accent))" cornerRadius={10} background />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {demoDashboardStats.interviewProgress}%
                </p>
                <p className="text-xs text-muted-foreground">in interview stage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent ATS Analyses */}
        <Card className="border-border">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Recent ATS Analyses</CardTitle>
              <CardDescription>Latest resume scores</CardDescription>
            </div>
            <Link href="/dashboard/ats-checker">
              <Button variant="ghost" size="sm" className="gap-1">
                New <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAnalyses.map((analysis) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{analysis.job_title}</p>
                  <p className="text-sm text-muted-foreground">{analysis.company_name}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(analysis.created_at)}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                    {analysis.overall_score}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <Card className="border-border">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Recommended Jobs</CardTitle>
              <CardDescription>Based on your profile</CardDescription>
            </div>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedJobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="block rounded-lg border border-border p-3 transition-all hover:border-accent/30 hover:bg-accent/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{capitalize(job.workMode)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className="bg-success/15 text-success border-0">
                      {job.matchScore}% match
                    </Badge>
                    {job.salaryMin && (
                      <span className="mt-1 text-xs text-muted-foreground">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Application Activity */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg">Application Activity</CardTitle>
            <CardDescription>Applications by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applicationActivity.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-muted-foreground">{stage.stage}</span>
                  <div className="flex-1">
                    <div className="h-6 overflow-hidden rounded-md bg-secondary">
                      <div
                        className="h-full rounded-md bg-accent transition-all"
                        style={{ width: `${stage.count > 0 ? (stage.count / 5) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-6 text-right text-sm font-medium text-foreground">
                    {stage.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border-border">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <CardDescription>Latest application status</CardDescription>
            </div>
            <Link href="/dashboard/applications">
              <Button variant="ghost" size="sm" className="gap-1">
                All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-foreground">{app.job_data.title}</p>
                  <p className="text-sm text-muted-foreground">{app.job_data.company}</p>
                </div>
                <Badge className={`border-0 ${statusColors[app.status]}`}>
                  {capitalize(app.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
