'use client';

import { Linkedin } from 'lucide-react';
import { cn } from 'src/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/shared/components/ui/tooltip';
import { VALIDATION_STATUS_LABELS } from '../types';
import type { LinkedInProfile } from '../types';

interface LinkedInValidationBadgeProps {
  profile: LinkedInProfile;
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 70)
    return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 40) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
  return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
}

function getStatusDot(score: number) {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function LinkedInValidationBadge({ profile, className }: LinkedInValidationBadgeProps) {
  const scoreColor = getScoreColor(profile.validationScore);
  const statusDot = getStatusDot(profile.validationScore);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold cursor-default select-none',
              scoreColor,
              className
            )}
          >
            <Linkedin size={10} className="shrink-0" />
            <span>{profile.validationScore}</span>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot)} />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[220px]">
          <div className="space-y-1 text-xs">
            <p className="font-bold">{profile.url}</p>
            {profile.title && <p>{profile.title}</p>}
            {profile.company && <p className="text-background/70">{profile.company}</p>}
            <p className="text-background/60">
              {VALIDATION_STATUS_LABELS[profile.validationStatus]}
              {profile.lastChecked && ` · ${profile.lastChecked}`}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
