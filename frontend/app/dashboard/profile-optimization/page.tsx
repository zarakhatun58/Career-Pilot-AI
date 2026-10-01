'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { DemoBadge } from '@/components/shared/demo-badge';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Linkedin,
  Globe,
  CheckCircle2,
  Copy,
  Sparkles,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { demoProfileOptimizations } from '@/lib/demo-data';
import { getScoreColor } from '@/lib/utils/score';
import type { ProfilePlatform } from '@/lib/types';

const platforms: { value: ProfilePlatform; label: string; icon: typeof Linkedin }[] = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'naukri', label: 'Naukri', icon: Globe },
  { value: 'indeed', label: 'Indeed', icon: Globe },
];

export default function ProfileOptimizationPage() {
  const { toast } = useToast();
  const [activePlatform, setActivePlatform] = useState<ProfilePlatform>('linkedin');
  const optimization = demoProfileOptimizations.find((p) => p.platform === activePlatform);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const handleOptimize = () => {
    toast({
      title: 'Analyzing profile',
      description: 'AI is reviewing your profile for optimization opportunities...',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile Optimization"
        description="Optimize your professional profiles with AI suggestions"
        badge={<DemoBadge />}
        action={
          <Button className="gap-2" onClick={handleOptimize}>
            <Sparkles className="h-4 w-4" /> Optimize Now
          </Button>
        }
      />

      <Tabs value={activePlatform} onValueChange={(v) => setActivePlatform(v as ProfilePlatform)}>
        <TabsList>
          {platforms.map((p) => (
            <TabsTrigger key={p.value} value={p.value} className="gap-2">
              <p.icon className="h-3.5 w-3.5" />
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map((platform) => (
          <TabsContent key={platform.value} value={platform.value} className="space-y-6">
            {optimization ? (
              <>
                {/* Completeness Score */}
                <Card className="border-border">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Profile Completeness</p>
                        <p className={`text-3xl font-bold ${getScoreColor(optimization.completeness_score)}`}>
                          {optimization.completeness_score}%
                        </p>
                      </div>
                      <div className="flex-1 max-w-xs">
                        <Progress
                          value={optimization.completeness_score}
                          className="h-3"
                        />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Add missing sections to improve your profile visibility
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Headline */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Headline</CardTitle>
                    <CardDescription>Your profile headline is the first thing recruiters see</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Current</p>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                        {optimization.current_headline}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                          <Sparkles className="h-3 w-3" /> Suggested
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleCopy(optimization.suggested_headline, 'Headline')}
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                      </div>
                      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm font-medium text-foreground">
                        {optimization.suggested_headline}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Summary</CardTitle>
                    <CardDescription>Your profile summary tells your professional story</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-1 text-xs font-medium text-muted-foreground">Current</p>
                      <div className="rounded-lg border border-border bg-secondary/30 p-3 text-sm text-muted-foreground">
                        {optimization.current_summary}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                          <Sparkles className="h-3 w-3" /> Suggested
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleCopy(optimization.suggested_summary, 'Summary')}
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                      </div>
                      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm font-medium text-foreground">
                        {optimization.suggested_summary}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* All Suggestions */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lightbulb className="h-5 w-5 text-accent" />
                      All Suggestions
                    </CardTitle>
                    <CardDescription>Section-by-section optimization recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {optimization.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="rounded-lg border border-border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="secondary">{suggestion.section}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">Current</p>
                            <p className="text-sm text-muted-foreground">{suggestion.current}</p>
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <p className="text-xs font-medium text-accent">Suggested</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 gap-1 text-xs"
                                onClick={() => handleCopy(suggestion.suggested, suggestion.section)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-sm font-medium text-foreground">{suggestion.suggested}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-start gap-2 rounded-md bg-accent/5 p-2.5">
                          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                          <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <div className="flex items-start gap-2.5 rounded-lg bg-secondary/50 p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    CareerPilot AI provides copy-ready optimized content. We do not automatically
                    update your external profiles. Copy the suggestions and paste them into your
                    LinkedIn, Naukri, or Indeed profile manually.
                  </p>
                </div>
              </>
            ) : (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    No optimization data for {platform.label} yet.
                  </p>
                  <Button className="mt-4 gap-2" onClick={handleOptimize}>
                    <Sparkles className="h-4 w-4" /> Optimize Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
