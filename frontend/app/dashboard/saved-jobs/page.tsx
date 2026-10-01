'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Bookmark,
  MapPin,
  Briefcase,
  Clock,
  Building2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { demoJobs } from '@/lib/demo-data';
import { timeAgo, formatSalary, capitalize, getScoreColor } from '@/lib/utils/score';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState(demoJobs);

  const handleRemove = (jobId: string) => {
    setSavedJobs(savedJobs.filter((j) => j.id !== jobId));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saved Jobs"
        description="Jobs you've bookmarked for later"
        badge={<DemoBadge />}
      />

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet"
          description="Browse jobs and save the ones you're interested in to find them here later."
          action={
            <Link href="/dashboard/jobs">
              <Button>Browse Jobs</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {savedJobs.map((job) => (
            <Card key={job.id} className="border-border transition-all hover:shadow-md hover:border-accent/30">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <Link href={`/dashboard/jobs/${job.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-accent">
                            {job.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {capitalize(job.workMode)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {timeAgo(job.postedAt)}
                      </span>
                      {job.salaryMin && (
                        <span className="font-medium text-foreground">
                          {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                    {job.matchScore && (
                      <div className="flex flex-col items-center rounded-lg bg-accent/5 px-3 py-2">
                        <span className="text-xs text-muted-foreground">Match</span>
                        <span className={`text-xl font-bold ${getScoreColor(job.matchScore)}`}>
                          {job.matchScore}%
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(job.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Link href={`/dashboard/jobs/${job.id}`}>
                        <Button size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
