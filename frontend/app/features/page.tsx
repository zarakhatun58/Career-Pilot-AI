'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  FileText,
  ScanText,
  Briefcase,
  Target,
  Users,
  Chrome,
  TrendingUp,
  Brain,
  ClipboardList,
  Mail,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const featureSections = [
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description:
      'Build professional, ATS-friendly resumes from scratch, by uploading PDF/DOCX, or by importing text.',
    items: [
      'Four templates: Classic ATS, Modern Professional, Minimal, Software Engineer',
      'AI writing suggestions: improve summary, rewrite bullets, make achievements measurable',
      'Section reordering, inline editing, version history, and duplication',
      'Live preview and PDF download',
      'Clearly distinguish user-provided facts from AI suggestions',
    ],
  },
  {
    icon: ScanText,
    title: 'ATS Score Checker',
    description: 'Analyze your resume against any job description and get a detailed compatibility score.',
    items: [
      'Overall ATS compatibility score out of 100',
      'Keyword match, skills match, experience alignment, and formatting sub-scores',
      'Matching and missing keywords with context',
      'Section-by-section feedback and improvement suggestions',
      'Transparent scoring — no claims of guaranteed ATS passes',
    ],
  },
  {
    icon: Briefcase,
    title: 'Worldwide Job Search',
    description: 'Discover recent job opportunities from multiple sources with powerful filters.',
    items: [
      'Filter by title, skills, country, city, work mode, employment type, experience level',
      'Salary range and posting time filters (24h, 7d, 30d)',
      'Job cards with match score, save button, and quick apply',
      'Detailed job pages with responsibilities, requirements, and benefits',
      'Real source attribution and posting timestamps — no scraping',
    ],
  },
  {
    icon: Target,
    title: 'AI Job Matching',
    description: 'Instantly see how well your resume matches any job.',
    items: [
      'Match score comparing resume skills to job requirements',
      'Matching and missing skills highlighted',
      'Experience alignment and recommendations',
      'Reusable match component on job cards, detail pages, and dashboard',
    ],
  },
  {
    icon: ClipboardList,
    title: 'Application Tracker',
    description: 'Manage your job applications from saved to offer.',
    items: [
      'Status pipeline: Saved, Preparing, Applied, Screening, Interview, Offer, Rejected, Withdrawn',
      'AI-assisted cover letter generation and application answer preparation',
      'User approves every application — never auto-submits without consent',
      'Notes, source URL, and applied date tracking',
    ],
  },
  {
    icon: Users,
    title: 'Referral Finder',
    description: 'Find and connect with referral contacts at target companies.',
    items: [
      'Company profiles with leadership, open jobs, and referral opportunities',
      'Public referral contacts: engineers, recruiters, hiring managers, founders',
      'AI-generated personalized referral request messages',
      'User reviews and sends messages — no automatic sending',
      'Only publicly available or user-authorized information',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Profile Optimization',
    description: 'Optimize your LinkedIn, Naukri, and Indeed profiles.',
    items: [
      'Headline analysis and suggestions',
      'Summary improvement with AI',
      'Skills and keyword alignment',
      'Profile completeness scoring',
      'Copy-ready optimized content',
    ],
  },
  {
    icon: Chrome,
    title: 'Chrome Extension',
    description: 'Analyze jobs right from the browser with a compact popup.',
    items: [
      'Extract job title, company, and description from any job page',
      'Calculate ATS match score instantly',
      'Save jobs and prepare applications',
      'Open CareerPilot AI dashboard',
      'Manifest V3 architecture',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CareerPilot AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Brain className="mr-1.5 h-3.5 w-3.5" />
            Full Feature Set
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            A complete AI-powered career platform
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From resume building to job matching, application tracking, referrals, and profile
            optimization — CareerPilot AI has every tool you need.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-16">
          {featureSections.map((section, idx) => (
            <div
              key={section.title}
              className={`grid gap-8 lg:grid-cols-2 ${idx % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
            >
              <div className={idx % 2 === 1 ? 'lg:col-start-2' : ''}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <section.icon className="h-6 w-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                <p className="mt-2 text-muted-foreground">{section.description}</p>
                <ul className="mt-6 space-y-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={idx % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                <Card className="h-full border-border bg-secondary/30">
                  <CardContent className="flex h-full items-center justify-center p-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
                        <section.icon className="h-10 w-10 text-accent" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {section.title} preview
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Start using all features today
          </h2>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CareerPilot AI
        </div>
      </footer>
    </div>
  );
}
