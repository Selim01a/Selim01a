"use client";

import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  label: string;
  description: string;
  className?: string;
};

export function ProgressRing({
  value,
  label,
  description,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur",
        className,
      )}
    >
      <div className="relative mx-auto flex h-36 w-36 items-center justify-center">
        <svg className="h-36 w-36 -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="none"
          />
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="55%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-white">%{clamped}</span>
          <span className="mt-1 text-sm text-slate-400">{label}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
