'use client';

import type { PipelineStage } from '../types/sales.types';

interface PipelineChevronProps {
  stages: PipelineStage[];
}

export function PipelineChevron({ stages }: PipelineChevronProps) {
  const N = stages.length;
  const D = 24; // arrow depth in px

  // Provide default colors if stage doesn't have one
  const CHEVRON_FALLBACKS = [
    { bg: '#93C5FD', accent: '#2563EB', text: '#1E3A8A' },
    { bg: '#7DD3FC', accent: '#0284C7', text: '#0C4A6E' },
    { bg: '#FCD34D', accent: '#D97706', text: '#78350F' },
    { bg: '#86EFAC', accent: '#16A34A', text: '#14532D' },
    { bg: '#C4B5FD', accent: '#7C3AED', text: '#4C1D95' },
    { bg: '#FDA4AF', accent: '#E11D48', text: '#881337' },
    { bg: '#FDBA74', accent: '#EA580C', text: '#7C2D12' },
    { bg: '#A7F3D0', accent: '#059669', text: '#064E3B' },
  ];

  return (
    <div className="relative mb-5" style={{ height: 88 }}>
      {stages.map((stage, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === N - 1;
        const prob = Math.round(stage.probability_percent);
        const slotPct = 100 / N;

        const fallback = CHEVRON_FALLBACKS[idx % CHEVRON_FALLBACKS.length];
        const accentColor = stage.color ?? fallback.accent;
        const textColor = fallback.text;
        const bgColor = stage.color ?? fallback.bg;

        const clipPath = isFirst
          ? `polygon(0 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, 0 100%)`
          : isLast
            ? `polygon(${D}px 0, 100% 0, 100% 100%, ${D}px 100%, 0 50%)`
            : `polygon(${D}px 0, calc(100% - ${D}px) 0, 100% 50%, calc(100% - ${D}px) 100%, ${D}px 100%, 0 50%)`;

        const left = isFirst ? 0 : `calc(${idx * slotPct}% - ${D}px)`;
        const width =
          !isFirst && !isLast ? `calc(${slotPct}% + ${2 * D}px)` : `calc(${slotPct}% + ${D}px)`;

        return (
          <div
            key={stage.uid}
            className="absolute inset-y-0 flex items-center select-none"
            style={{
              left,
              width,
              backgroundColor: bgColor,
              clipPath,
              zIndex: N - idx,
              paddingLeft: isFirst ? D + 12 : 2 * D + 12,
              paddingRight: isLast ? D + 12 : 2 * D + 12,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Step number — saturated bubble on pastel bg */}
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
                style={{ backgroundColor: accentColor }}
              >
                {idx + 1}
              </span>

              {/* Stage info */}
              <div className="min-w-0" style={{ color: textColor }}>
                <p className="text-[17px] font-bold leading-tight truncate tracking-wide">
                  {stage.name}
                </p>
                <p className="text-[12px] font-semibold leading-tight opacity-70 mt-0.5">
                  {prob}% prob. cierre
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
