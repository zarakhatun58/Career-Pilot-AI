'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { EmptyState } from '@/components/shared/empty-state';
import {
  ClipboardList,
  Building2,
  FileText,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Target,
} from 'lucide-react';
import { demoApplications, demoResumes } from '@/lib/demo-data';
import { timeAgo, capitalize } from '@/lib/utils/score';
import type { ApplicationStatus } from '@/lib/types';

const statusConfig: Record<ApplicationStatus, { color: string; label: string }> = {
  saved: { color: 'bg-secondary text-secondary-foreground', label: 'Saved' },
  preparing: { color: 'bg-warning/15 text-warning', label: 'Preparing' },
  applied: { color: 'bg-info/15 text-info', label: 'Applied' },
  screening: { color: 'bg-accent/15 text-accent', label: 'Screening' },
  interview: { color: 'bg-primary/15 text-primary', label: 'Interview' },
  offer: { color: 'bg-success/15 text-success', label: 'Offer' },
  rejected: { color: 'bg-destructive/15 text-destructive', label: 'Rejected' },
  withdrawn: { color: 'bg-muted text-muted-foreground', label: 'Withdrawn' },
};

const pipelineStages: ApplicationStatus[] = [
  'saved', 'preparing', 'applied', 'screening', 'interview', 'offer',
];

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [view, setView] = useState<'list' | 'board'>('list');

  const filteredApps = demoApplications.filter(
    (app) => statusFilter === 'all' || app.status === statusFilter
  );

  const counts = demoApplications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        description="Track your job applications from saved to offer"
        badge={<DemoBadge />}
        action={
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'board')}>
            <TabsList>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="board">Board</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          All ({demoApplications.length})
        </button>
        {pipelineStages.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {statusConfig[status].label} ({counts[status] || 0})
          </button>
        ))}
        {counts['rejected'] && (
          <button
            onClick={() => setStatusFilter('rejected')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Rejected ({counts['rejected']})
          </button>
        )}
      </div>

      {view === 'list' ? (
        filteredApps.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No applications found"
            description="Start tracking your job applications by applying to jobs."
            action={
              <Link href="/dashboard/jobs">
                <Button>Find Jobs</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredApps.map((app) => {
              const resume = demoResumes.find((r) => r.id === app.resume_id);
              const config = statusConfig[app.status];
              return (
                <Card key={app.id} className="border-border transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <Link href={`/dashboard/jobs/${app.job_id}`}>
                            <p className="font-medium text-foreground hover:text-accent">
                              {app.job_data.title}
                            </p>
                          </Link>
                          <p className="text-sm text-muted-foreground">{app.job_data.company}</p>
                          {resume && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="h-3 w-3" /> {resume.title}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {app.applied_at && (
                          <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                            <Calendar className="h-3 w-3" /> Applied {timeAgo(app.applied_at)}
                          </span>
                        )}
                        <Badge className={`border-0 ${config.color}`}>
                          {config.label}
                        </Badge>
                        {app.source_url && (
                          <a href={app.source_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {app.notes && (
                      <div className="mt-3 rounded-md bg-secondary/50 p-2.5 text-xs text-muted-foreground">
                        {app.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-x-auto scrollbar-thin lg:grid-cols-6">
          {pipelineStages.map((stage) => {
            const stageApps = demoApplications.filter((a) => a.status === stage);
            return (
              <div key={stage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {statusConfig[stage].label}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {stageApps.length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {stageApps.map((app) => (
                    <Card key={app.id} className="border-border">
                      <CardContent className="p-3">
                        <Link href={`/dashboard/jobs/${app.job_id}`}>
                          <p className="text-sm font-medium text-foreground hover:text-accent">
                            {app.job_data.title}
                          </p>
                        </Link>
                        <p className="text-xs text-muted-foreground">{app.job_data.company}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {stageApps.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      No applications
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
