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
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Brain,
  Shield,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme/theme-toggle';

const features = [
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description:
      'Create ATS-friendly resumes with AI-powered writing suggestions, multiple templates, and live preview.',
  },
  {
    icon: ScanText,
    title: 'ATS Score Checker',
    description:
      'Upload your resume and a job description to get a detailed ATS compatibility score with actionable recommendations.',
  },
  {
    icon: Briefcase,
    title: 'Worldwide Job Search',
    description:
      'Discover job opportunities from multiple sources worldwide. Filter by location, work mode, salary, and more.',
  },
  {
    icon: Target,
    title: 'AI Job Matching',
    description:
      'Get instant match scores comparing your resume to job requirements. See matching and missing skills at a glance.',
  },
  {
    icon: Users,
    title: 'Referral Finder',
    description:
      'Find referral contacts at target companies and generate personalized referral request messages.',
  },
  {
    icon: TrendingUp,
    title: 'Profile Optimization',
    description:
      'Optimize your LinkedIn, Naukri, and Indeed profiles with AI-suggested headlines, summaries, and keywords.',
  },
];

const stats = [
  { value: '50K+', label: 'Resumes Created' },
  { value: '92%', label: 'ATS Pass Rate' },
  { value: '10K+', label: 'Jobs Indexed' },
  { value: '4.9/5', label: 'User Rating' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Rocket className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CareerPilot AI</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
          </nav>
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

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 bg-accent/10 text-accent border-accent/20">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Career Platform
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Land your next job with{' '}
              <span className="text-accent">AI-powered career tools</span>
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground">
              Create ATS-friendly resumes, analyze job descriptions, optimize your professional
              profile, discover jobs worldwide, and manage applications — all in one platform.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Everything you need to land your dream job
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete career toolkit powered by AI, from resume building to job matching and
            application tracking.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border transition-all hover:shadow-md hover:border-accent/30"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
                  <feature.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ATS Showcase */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4 bg-accent/10 text-accent border-accent/20">
                ATS Analysis
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Beat the bots. Get past ATS filters.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Most resumes are rejected by Applicant Tracking Systems before a human ever sees
                them. CareerPilot AI analyzes your resume against job descriptions and gives you a
                detailed score with specific recommendations.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Keyword match analysis',
                  'Skills gap identification',
                  'Formatting compliance check',
                  'Section-by-section feedback',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-8 inline-block">
                <Button>
                  Try ATS Checker <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Card className="border-border shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall ATS Score</p>
                    <p className="text-4xl font-bold text-success">82/100</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <Brain className="h-8 w-8 text-success" />
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: 'Keyword Match', value: 78 },
                    { label: 'Skills Match', value: 85 },
                    { label: 'Experience Alignment', value: 80 },
                    { label: 'Formatting', value: 95 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.value}%</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Extension CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="border-border bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-10 text-center lg:flex-row lg:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Chrome className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Analyze jobs right from your browser</h2>
              <p className="mt-2 text-primary-foreground/80">
                Install the CareerPilot AI Chrome Extension to analyze job pages, calculate match
                scores, and save jobs without leaving the page.
              </p>
            </div>
            <Link href="/extension">
              <Button variant="secondary" size="lg">
                Get Extension
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Trust */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'Your data is encrypted and never shared with employers without your consent.' },
              { icon: Brain, title: 'AI You Control', desc: 'AI suggestions are clearly marked. You approve every change — no fabricated content.' },
              { icon: CheckCircle2, title: 'Transparent Scores', desc: 'ATS scores are calculated transparently. We never guarantee passing a specific ATS.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <item.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ready to take off?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Join thousands of job seekers who use CareerPilot AI to land their dream roles.
        </p>
        <Link href="/register" className="mt-8 inline-block">
          <Button size="lg">
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Rocket className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">CareerPilot AI</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/features" className="hover:text-foreground">Features</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/login" className="hover:text-foreground">Sign In</Link>
              <Link href="/register" className="hover:text-foreground">Sign Up</Link>
            </nav>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CareerPilot AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
