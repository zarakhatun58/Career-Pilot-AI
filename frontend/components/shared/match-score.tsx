'use client';

import { cn } from '@/lib/utils';
import { getScoreColor, getScoreLabel } from '@/lib/utils/score';
import { Progress } from '@/components/ui/progress';

interface MatchScoreProps {
  score: number;
  label?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MatchScore({
  score,
  label = 'Match Score',
  showProgress = true,
  size = 'md',
  className,
}: MatchScoreProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between">
        <span className={cn('font-medium text-muted-foreground', sizeClasses[size])}>{label}</span>
        <span className={cn('font-bold', sizeClasses[size], getScoreColor(score))}>{score}/100</span>
      </div>
      {showProgress && (
        <Progress
          value={score}
          className={cn('h-2', getScoreColor(score).replace('text-', 'bg-'))}
        />
      )}
      <span className={cn(sizeClasses[size], getScoreColor(score), 'font-medium')}>
        {getScoreLabel(score)}
      </span>
    </div>
  );
}
