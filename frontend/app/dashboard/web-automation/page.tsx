'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  ServerCog,
  ShieldAlert,
  Timer,
  Workflow,
  Zap,
} from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';

type Job = {
  id: number;
  target_url: string;
  status: string;
  max_concurrency: number;
  max_retries: number;
  total_items: number;
  successful_items: number;
  failed_items: number;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

type RecordItem = {
  id: number;
  job_id: number;
  url: string;
  status: string;
  title: string | null;
  content: string | null;
  data: Record<string, unknown> | null;
  error_message: string | null;
  attempt: number;
  created_at: string;
};

type EventItem = {
  timestamp: string;
  job_id: number;
  event_type: string;
  message: string;
  target_id: number | null;
  session_id: string | null;
  status: string | null;
  attempt: number | null;
  proxy: string | null;
  http_status: number | null;
  duration_ms: number | null;
  data: Record<string, unknown>;
};

const DEFAULT_TEMPLATE = 'http://127.0.0.1:8100/item/{id}';

function statusClass(status: string) {
  if (status === 'completed' || status === 'success') {
    return 'bg-success/15 text-success border-success/20';
  }

  if (
    status === 'running' ||
    status === 'queued' ||
    status === 'pending'
  ) {
    return 'bg-accent/15 text-accent border-accent/20';
  }

  if (
    status === 'failed' ||
    status === 'completed_with_errors'
  ) {
    return 'bg-destructive/15 text-destructive border-destructive/20';
  }

  return 'bg-secondary text-secondary-foreground';
}

function formatDuration(ms: number | null | undefined) {
  if (ms == null) return '—';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function WebAutomationPage() {
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [targetCount, setTargetCount] = useState('50');
  const [concurrency, setConcurrency] = useState('10');
  const [retries, setRetries] = useState('2');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent the initial jobs request from replacing a newly selected job.
  const selectedJobIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedJobIdRef.current = selectedJob?.id ?? null;
  }, [selectedJob?.id]);

  const loadJobs = useCallback(async () => {
    try {
      const data = await apiFetch<Job[]>('/api/scraping/jobs');

      // Sort newest first regardless of backend ordering.
      const sortedJobs = [...data].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();

        if (dateB !== dateA) {
          return dateB - dateA;
        }

        return b.id - a.id;
      });

      setJobs(sortedJobs);

      // If a job is already selected, keep it selected.
      const currentSelectedId = selectedJobIdRef.current;

      if (currentSelectedId != null) {
        const existingSelected = sortedJobs.find(
          (job) => job.id === currentSelectedId,
        );

        if (existingSelected) {
          setSelectedJob(existingSelected);
          return;
        }
      }

      // First page load: automatically select the newest job.
      if (sortedJobs.length > 0) {
        setSelectedJob(sortedJobs[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load scraping jobs.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadExecution = useCallback(async (jobId: number) => {
    const [job, recordData, eventData] = await Promise.all([
      apiFetch<Job>(`/api/scraping/jobs/${jobId}`),
      apiFetch<RecordItem[]>(
        `/api/scraping/jobs/${jobId}/records`,
      ),
      apiFetch<{ job_id: number; events: EventItem[] }>(
        `/api/scraping/jobs/${jobId}/events`,
      ),
    ]);

    setSelectedJob(job);
    setRecords(recordData);
    setEvents(eventData.events || []);

    setJobs((current) => {
      const exists = current.some((item) => item.id === job.id);

      if (!exists) {
        return [job, ...current];
      }

      return current.map((item) =>
        item.id === job.id ? job : item,
      );
    });

    return job;
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!selectedJob) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const job = await loadExecution(selectedJob.id);

        if (cancelled) return;

        if (['running', 'queued'].includes(job.status)) {
          setRunning(true);
        } else {
          setRunning(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to refresh execution.',
          );
        }
      }
    };

    poll();

    const interval = setInterval(poll, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedJob?.id, loadExecution]);

const runJob = async () => {
  setCreating(true);
  setError(null);

  try {
    const count = Math.max(
      1,
      Math.min(100, Number(targetCount) || 1),
    );

    const urls = Array.from(
      { length: count },
      (_, index) =>
        template.includes('{id}')
          ? template.replaceAll(
              '{id}',
              String(index + 1),
            )
          : template,
    );

    const uniqueUrls = Array.from(new Set(urls));

    const created = await apiFetch<Job>(
      '/api/scraping/jobs',
      {
        method: 'POST',
        body: JSON.stringify({
          targets: uniqueUrls.map((url, index) => ({
            url,
            external_id: `target-${index + 1}`,
          })),

          max_concurrency: Math.max(
            1,
            Math.min(
              50,
              Number(concurrency) || 10,
            ),
          ),

          max_retries: Math.max(
            0,
            Math.min(
              10,
              Number(retries) || 2,
            ),
          ),

          selectors: {
            title: '.item-title',
            description: '.item-description',
            price: '.price',
            category: '.category',
            item_id: '.item-id',
          },
        }),
      },
    );

    // Select the newly-created job immediately.
    setSelectedJob(created);
    selectedJobIdRef.current = created.id;
    setRecords([]);
    setEvents([]);
    setRunning(true);

    // Start the job.
    await apiFetch<Job>(
      `/api/scraping/jobs/${created.id}/start`,
      {
        method: 'POST',
      },
    );

    // Reload the job list after starting.
    await loadJobs();

    // Keep the newly-created job selected.
    setSelectedJob(created);
    selectedJobIdRef.current = created.id;

    // Immediately load current execution state.
    await loadExecution(created.id);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to start scraping job.',
    );

    setRunning(false);
  } finally {
    setCreating(false);
  }
};

  const selectJob = async (job: Job) => {
    setError(null);
    selectedJobIdRef.current = job.id;
    setSelectedJob(job);
    setRecords([]);
    setEvents([]);

    try {
      await loadExecution(job.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load selected job.',
      );
    }
  };

  const refresh = async () => {
    if (!selectedJob) return;

    setError(null);

    try {
      await loadExecution(selectedJob.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Refresh failed.',
      );
    }
  };

  const stats = useMemo(() => {
    const sessions = new Set(
      events
        .map((event) => event.session_id)
        .filter(Boolean),
    ).size;

    const proxies = new Set(
      events
        .map((event) => event.proxy)
        .filter(Boolean),
    );

    const durations = events
      .map((event) => event.duration_ms)
      .filter(
        (value): value is number =>
          typeof value === 'number' && value > 0,
      );

    const avgLatency = durations.length
      ? durations.reduce(
          (sum, value) => sum + value,
          0,
        ) / durations.length
      : null;

    const startedAt = selectedJob?.started_at
      ? new Date(selectedJob.started_at).getTime()
      : 0;

    const endAt = selectedJob?.completed_at
      ? new Date(
          selectedJob.completed_at,
        ).getTime()
      : Date.now();

    const elapsed = startedAt
      ? Math.max(
          1,
          (endAt - startedAt) / 1000,
        )
      : 0;

    const throughput =
      selectedJob && elapsed
        ? selectedJob.successful_items /
          elapsed
        : 0;

    const progress = selectedJob?.total_items
      ? Math.min(
          100,
          Math.round(
            ((selectedJob.successful_items +
              selectedJob.failed_items) /
              selectedJob.total_items) *
              100,
          ),
        )
      : 0;

    return {
      sessions,
      proxies,
      avgLatency,
      throughput,
      progress,
    };
  }, [events, selectedJob]);
  console.log('Execution events:', events);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Web Automation"
        description="Authorized Playwright extraction with bounded concurrency, isolated sessions, retries, and structured telemetry."
        badge={
          <Badge
            variant="outline"
            className="gap-1.5 border-accent/30 text-accent"
          >
            <Activity className="h-3 w-3" />
            Live Backend
          </Badge>
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={!selectedJob}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">
              Backend request failed
            </p>
            <p className="mt-1 opacity-90">
              {error}
            </p>
          </div>
        </div>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-accent" />
            Run authorized extraction
          </CardTitle>

          <CardDescription>
            Use your own/local target or another site
            where you have permission to automate.
            Protection challenges are detected and
            reported, not bypassed.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-[1fr_120px_120px_120px_auto]">
          <div className="space-y-2">
            <Label htmlFor="target-template">
              Target URL template
            </Label>

            <Input
              id="target-template"
              value={template}
              onChange={(event) =>
                setTemplate(event.target.value)
              }
              placeholder="https://example.test/item/{id}"
            />

            <p className="text-xs text-muted-foreground">
              Use <code>{'{id}'}</code> to generate
              multiple targets.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-count">
              Targets
            </Label>

            <Input
              id="target-count"
              type="number"
              min={1}
              max={100}
              value={targetCount}
              onChange={(event) =>
                setTargetCount(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concurrency">
              Workers
            </Label>

            <Input
              id="concurrency"
              type="number"
              min={1}
              max={50}
              value={concurrency}
              onChange={(event) =>
                setConcurrency(event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retries">
              Retries
            </Label>

            <Input
              id="retries"
              type="number"
              min={0}
              max={10}
              value={retries}
              onChange={(event) =>
                setRetries(event.target.value)
              }
            />
          </div>

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={runJob}
              disabled={creating || running}
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}

              {creating ? 'Starting…' : 'Run'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedJob && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[
              {
                label: 'Processed',
                value: `${selectedJob.successful_items + selectedJob.failed_items}/${selectedJob.total_items}`,
                icon: Database,
              },
              {
                label: 'Success',
                value: String(
                  selectedJob.successful_items,
                ),
                icon: CheckCircle2,
              },
              {
                label: 'Failed',
                value: String(
                  selectedJob.failed_items,
                ),
                icon: AlertTriangle,
              },
              {
                label: 'Workers',
                value: String(
                  selectedJob.max_concurrency,
                ),
                icon: ServerCog,
              },
              {
                label: 'Sessions',
                value: String(stats.sessions),
                icon: Globe2,
              },
              {
                label: 'Avg latency',
                value: formatDuration(
                  stats.avgLatency,
                ),
                icon: Timer,
              },
            ].map(
              ({
                label,
                value,
                icon: Icon,
              }) => (
                <Card
                  key={label}
                  className="border-border"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        {label}
                      </p>

                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <p className="mt-2 truncate text-xl font-bold text-foreground">
                      {value}
                    </p>
                  </CardContent>
                </Card>
              ),
            )}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
           <Card className="border-border">
  <CardHeader className="flex-row items-start justify-between space-y-0">
    <div>
      <CardTitle>Live execution</CardTitle>

      <CardDescription>
        Job #{selectedJob.id} ·{' '}
        {formatDate(selectedJob.started_at)}
      </CardDescription>
    </div>

    <Badge
      variant="outline"
      className={statusClass(selectedJob.status)}
    >
      {selectedJob.status}
    </Badge>
  </CardHeader>

  <CardContent className="space-y-5">
    {/* Execution progress */}
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Execution progress
        </span>

        <span className="font-semibold text-foreground">
          {stats.progress}%
        </span>
      </div>

      <Progress
        value={stats.progress}
        className="h-2"
      />
    </div>

    {/* Live telemetry — 2 rows */}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {/* Row 1 */}
      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Active Workers
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {selectedJob.max_concurrency}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Sessions
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {stats.sessions}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Proxy IDs
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-foreground">
          {stats.proxies.size
            ? `${stats.proxies.size} configured`
            : 'Direct'}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          HTTP
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
           {(() => {
      const httpStatuses = events
        .map((event) => event.http_status)
        .filter(
          (value): value is number =>
            typeof value === 'number',
        );

      return httpStatuses.length
        ? httpStatuses[httpStatuses.length - 1]
        : '—';
    })()} 
        </p>
      </div>

      {/* Row 2 */}
      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Throughput
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {stats.throughput.toFixed(2)}/s
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Avg Latency
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {stats.avgLatency !== null
            ? `${stats.avgLatency.toFixed(0)}ms`
            : '—'}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Completed
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {selectedJob.successful_items}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-secondary/40 p-3">
        <p className="text-xs text-muted-foreground">
          Failed
        </p>
        <p className="mt-1 text-sm font-semibold text-foreground">
          {selectedJob.failed_items}
        </p>
      </div>
    </div>

    {selectedJob.error_message && (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
        {selectedJob.error_message}
      </div>
    )}
  </CardContent>
</Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle>
                  Execution events
                </CardTitle>

                <CardDescription>
                  {events.length} telemetry events
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="scrollbar-thin max-h-[330px] space-y-2 overflow-y-auto pr-1">
                  {events.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                      {running
                        ? 'Waiting for worker telemetry…'
                        : 'No events recorded for this job.'}
                    </div>
                  ) : (
                    events
                      .slice(-30)
                      .reverse()
                      .map(
                        (event, index) => (
                          <div
                            key={`${event.timestamp}-${index}`}
                            className="rounded-lg border border-border p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {event.message}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {event.event_type}

                                  {event.target_id
                                    ? ` · target ${event.target_id}`
                                    : ''}

                                  {event.session_id
                                    ? ` · ${event.session_id}`
                                    : ''}
                                </p>
                              </div>

                              {event.duration_ms !=
                                null && (
                                <span className="shrink-0 text-xs text-muted-foreground">
                                  {formatDuration(
                                    event.duration_ms,
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        ),
                      )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>
                Extracted records
              </CardTitle>

              <CardDescription>
                Structured output persisted by the
                FastAPI scraping service.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-3 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Item
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Title
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Price
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Category
                      </th>

                      <th className="px-3 py-3 font-medium">
                        Attempt
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {records
                      .slice(0, 100)
                      .map((record) => {
                        const data =
                          record.data || {};

                        return (
                          <tr
                            key={record.id}
                            className="border-b border-border/70 last:border-0"
                          >
                            <td className="px-3 py-3">
                              <Badge
                                variant="outline"
                                className={statusClass(
                                  record.status,
                                )}
                              >
                                {record.status}
                              </Badge>
                            </td>

                            <td className="px-3 py-3 font-medium">
                              {String(
                                data.item_id ??
                                  record.url
                                    .split('/')
                                    .pop() ??
                                  '—',
                              )}
                            </td>

                            <td className="max-w-[260px] truncate px-3 py-3">
                              {String(
                                data.title ??
                                  record.title ??
                                  '—',
                              )}
                            </td>

                            <td className="px-3 py-3">
                              {String(
                                data.price ?? '—',
                              )}
                            </td>

                            <td className="px-3 py-3">
                              {String(
                                data.category ?? '—',
                              )}
                            </td>

                            <td className="px-3 py-3">
                              {record.attempt}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>

                {records.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    Records will appear here as
                    extraction completes.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedJob && !loading && (
        <Card className="border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Zap className="h-6 w-6 text-accent" />
            </div>

            <h3 className="mt-4 font-semibold">
              No scraping jobs yet
            </h3>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Start the authorized local benchmark
              to see workers, sessions, telemetry,
              and structured records.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent jobs</CardTitle>

          <CardDescription>
            Select an execution to inspect its
            telemetry and records.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading jobs…
            </div>
          ) : jobs.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No jobs found.
            </p>
          ) : (
            <div className="space-y-2">
              {jobs
                .slice(0, 10)
                .map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => selectJob(job)}
                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      selectedJob?.id === job.id
                        ? 'border-accent/40 bg-accent/5'
                        : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      {job.status ===
                      'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : job.status ===
                        'failed' ||
                        job.status ===
                          'completed_with_errors' ? (
                        <ShieldAlert className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock3 className="h-4 w-4 text-accent" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        Job #{job.id}
                      </p>

                      <p className="truncate text-xs text-muted-foreground">
                        {job.target_url} ·{' '}
                        {job.successful_items}/
                        {job.total_items}{' '}
                        successful
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={statusClass(
                        job.status,
                      )}
                    >
                      {job.status}
                    </Badge>
                  </button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <RotateCcw className="h-3.5 w-3.5" />
        Dashboard refreshes execution telemetry
        every 2 seconds while a job is active.
      </div>
    </div>
  );
}