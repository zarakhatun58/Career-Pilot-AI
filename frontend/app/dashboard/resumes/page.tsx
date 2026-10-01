'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { demoResumes } from '@/lib/demo-data';
import { getScoreColor, timeAgo, capitalize } from '@/lib/utils/score';
import { FileText, Plus, Upload, Copy, Download, MoreHorizontal, Sparkles } from 'lucide-react';

const templates = [
  { id: 'classic-ats', name: 'Classic ATS', description: 'Simple formatting, optimized for ATS' },
  { id: 'modern-professional', name: 'Modern Professional', description: 'Clean and contemporary' },
  { id: 'minimal', name: 'Minimal', description: 'Essential sections, no frills' },
  { id: 'software-engineer', name: 'Software Engineer', description: 'Tech-focused layout' },
] as const;

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Resumes"
        description="Create, edit, and manage your resumes"
        badge={<DemoBadge />}
        action={
          <>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" /> Upload
            </Button>
            <Link href="/dashboard/resumes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Resume
              </Button>
            </Link>
          </>
        }
      />

      {/* Resumes List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoResumes.map((resume) => (
          <Card key={resume.id} className="border-border transition-all hover:shadow-md hover:border-accent/30">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold">{resume.title}</CardTitle>
                <CardDescription className="mt-1">
                      {capitalize(resume.template.replace(/-/g, ' '))}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.ats_score !== null && (
                <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-sm text-muted-foreground">ATS Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(resume.ats_score)}`}>
                    {resume.ats_score}/100
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Updated {timeAgo(resume.updated_at)}</span>
                <Badge variant={resume.status === 'published' ? 'default' : 'secondary'}>
                  {capitalize(resume.status)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/resumes/${resume.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Edit</Button>
                </Link>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Card */}
        <Link href="/dashboard/resumes/new">
          <Card className="flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center border-dashed border-border transition-all hover:border-accent/40 hover:bg-accent/5">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Plus className="h-6 w-6 text-accent" />
              </div>
              <p className="font-medium text-foreground">Create New Resume</p>
              <p className="text-center text-xs text-muted-foreground">
                Start from scratch or choose a template
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Templates */}
      <div className="pt-4">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground">Resume Templates</h2>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" /> 4 Available
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <Link key={template.id} href={`/dashboard/resumes/new?template=${template.id}`}>
              <Card className="h-full cursor-pointer border-border transition-all hover:shadow-md hover:border-accent/30">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-secondary/50">
                    <FileText className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                  <p className="font-medium text-foreground">{template.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
