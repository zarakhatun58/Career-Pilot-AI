'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import {
  Chrome,
  ScanText,
  Bookmark,
  Target,
  LayoutDashboard,
  Download,
  CheckCircle2,
  Code2,
  Puzzle,
  Shield,
} from 'lucide-react';

const features = [
  { icon: ScanText, title: 'Analyze Job Pages', desc: 'Extract job title, company, and description from any job listing' },
  { icon: Target, title: 'Calculate ATS Match', desc: 'See your resume match score without leaving the page' },
  { icon: Bookmark, title: 'Save Jobs', desc: 'Bookmark jobs to your CareerPilot AI dashboard' },
  { icon: LayoutDashboard, title: 'Open Dashboard', desc: 'Quick access to your full CareerPilot AI dashboard' },
];

const steps = [
  { step: 1, title: 'Download the extension', desc: 'Get the CareerPilot AI Chrome Extension from the Chrome Web Store' },
  { step: 2, title: 'Pin to toolbar', desc: 'Pin the extension for quick access while browsing jobs' },
  { step: 3, title: 'Visit any job page', desc: 'Navigate to a job listing on any supported job board' },
  { step: 4, title: 'Click the extension icon', desc: 'Analyze the job, check your match score, and save it' },
];

export default function ExtensionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Chrome Extension"
        description="Analyze jobs right from your browser"
      />

      {/* Hero */}
      <Card className="border-border overflow-hidden">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center lg:flex-row lg:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-accent/10">
            <Chrome className="h-10 w-10 text-accent" />
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center justify-center gap-2 lg:justify-start">
              <h2 className="text-2xl font-bold text-foreground">CareerPilot AI Extension</h2>
              <Badge variant="secondary">Manifest V3</Badge>
            </div>
            <p className="text-muted-foreground">
              Analyze job pages, calculate ATS match scores, and save jobs — all without leaving
              the page you&apos;re browsing.
            </p>
          </div>
          <Button size="lg" className="gap-2">
            <Download className="h-4 w-4" /> Add to Chrome
          </Button>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="border-border">
            <CardContent className="p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <feature.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popup Preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Extension Popup Preview</CardTitle>
            <CardDescription>Compact UI that appears when you click the extension icon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-lg">
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Chrome className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">CareerPilot AI</span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Job Title</p>
                  <p className="text-sm font-medium text-foreground">Senior Frontend Engineer</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium text-foreground">Airbnb</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Match Score</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-success" style={{ width: '88%' }} />
                    </div>
                    <span className="text-sm font-bold text-success">88%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <ScanText className="h-3 w-3" /> Analyze
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Bookmark className="h-3 w-3" /> Save
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                    <Target className="h-3 w-3" /> Prepare
                  </Button>
                  <Button size="sm" className="gap-1.5 text-xs">
                    <LayoutDashboard className="h-3 w-3" /> Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Architecture */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base">Architecture</CardTitle>
            <CardDescription>Built with modern extension standards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Code2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">React + TypeScript</p>
                <p className="text-xs text-muted-foreground">Built with the same stack as the main app</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Puzzle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Manifest V3</p>
                <p className="text-xs text-muted-foreground">Uses the latest Chrome extension manifest</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Privacy First</p>
                <p className="text-xs text-muted-foreground">Only analyzes pages you explicitly trigger — no background tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Separate Build</p>
                <p className="text-xs text-muted-foreground">Built as a separate project that can be deployed independently</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How to Install */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">How to Install</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.step} className="flex flex-col gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                  {step.step}
                </div>
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
