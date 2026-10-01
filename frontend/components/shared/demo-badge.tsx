'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export function DemoBadge() {
  return (
    <Badge variant="secondary" className="gap-1 bg-accent/10 text-accent border-accent/20">
      <Sparkles className="h-3 w-3" />
      Demo Data
    </Badge>
  );
}
