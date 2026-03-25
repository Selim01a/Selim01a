"use client";

import { cn } from "@/lib/utils";

type ViewSwitcherProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
};

export function ViewSwitcher({ value, onChange, options }: ViewSwitcherProps) {
  return (
    <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-xl px-3 py-2 text-sm transition",
            value === option.value
              ? "bg-cyan-400/15 text-cyan-100"
              : "text-slate-300 hover:bg-white/5 hover:text-white",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
