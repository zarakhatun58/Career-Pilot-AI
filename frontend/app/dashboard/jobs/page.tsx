'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { EmptyState } from '@/components/shared/empty-state';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  ExternalLink,
  Target,
  Building2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { demoJobs } from '@/lib/demo-data';
import { timeAgo, formatSalary, capitalize, getScoreColor } from '@/lib/utils/score';
import type { WorkMode, EmploymentType, ExperienceLevel } from '@/lib/types';

export default function JobSearchPage() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [workMode, setWorkMode] = useState<WorkMode | 'all'>('all');
  const [employmentType, setEmploymentType] = useState<EmploymentType | 'all'>('all');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | 'all'>('all');
  const [postedWithin, setPostedWithin] = useState<'24h' | '7d' | '30d' | 'all'>('30d');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const countries = useMemo(() => {
    const set = new Set(demoJobs.map((j) => j.country));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredJobs = useMemo(() => {
    return demoJobs.filter((job) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !job.title.toLowerCase().includes(q) &&
          !job.company.toLowerCase().includes(q) &&
          !job.skills.some((s) => s.toLowerCase().includes(q))
        ) return false;
      }
      if (country !== 'all' && job.country !== country) return false;
      if (workMode !== 'all' && job.workMode !== workMode) return false;
      if (employmentType !== 'all' && job.employmentType !== employmentType) return false;
      if (experienceLevel !== 'all' && job.experienceLevel !== experienceLevel) return false;
      if (postedWithin !== 'all') {
        const posted = new Date(job.postedAt).getTime();
        const now = Date.now();
        const diffH = (now - posted) / (1000 * 60 * 60);
        if (postedWithin === '24h' && diffH > 24) return false;
        if (postedWithin === '7d' && diffH > 168) return false;
        if (postedWithin === '30d' && diffH > 720) return false;
      }
      return true;
    });
  }, [query, country, workMode, employmentType, experienceLevel, postedWithin]);

  const toggleSave = (jobId: string) => {
    setSavedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const activeFilterCount =
    (country !== 'all' ? 1 : 0) +
    (workMode !== 'all' ? 1 : 0) +
    (employmentType !== 'all' ? 1 : 0) +
    (experienceLevel !== 'all' ? 1 : 0) +
    (postedWithin !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setCountry('all');
    setWorkMode('all');
    setEmploymentType('all');
    setExperienceLevel('all');
    setPostedWithin('all');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Jobs"
        description="Discover job opportunities worldwide"
        badge={<DemoBadge />}
      />

      {/* Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search job title, company, or skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 px-1.5 text-xs">{activeFilterCount}</Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-border animate-fade-in">
          <CardContent className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c === 'all' ? 'All Countries' : c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work Mode</Label>
              <Select value={workMode} onValueChange={(v) => setWorkMode(v as WorkMode | 'all')}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Employment Type</Label>
              <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType | 'all')}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Experience Level</Label>
              <Select value={experienceLevel} onValueChange={(v) => setExperienceLevel(v as ExperienceLevel | 'all')}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="entry">Entry</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Posted Within</Label>
              <Select value={postedWithin} onValueChange={(v) => setPostedWithin(v as '24h' | '7d' | '30d' | 'all')}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="all">Any Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                <X className="h-3 w-3" /> Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </p>
      </div>

      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Try adjusting your filters or search terms to find more opportunities."
          action={
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
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
                      <span>{capitalize(job.employmentType)}</span>
                      <span>{capitalize(job.experienceLevel)}</span>
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
                      {job.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="font-medium text-foreground">{job.sourceName}</span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-2 sm:flex-col sm:items-end">
                    {job.matchScore && (
                      <div className="flex flex-col items-center rounded-lg bg-accent/5 px-3 py-2">
                        <span className="text-xs text-muted-foreground">Match Score</span>
                        <span className={`text-xl font-bold ${getScoreColor(job.matchScore)}`}>
                          {job.matchScore}%
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSave(job.id)}
                        className={savedJobs.includes(job.id) ? 'text-accent' : ''}
                      >
                        <Bookmark className={savedJobs.includes(job.id) ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
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
