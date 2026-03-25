"use client";

import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type ViewItem = {
  id: string;
  label: string;
  content: React.ReactNode;
};

type ControlledProps = {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  views?: never;
};

type StaticProps = {
  title?: string;
  views: ViewItem[];
  value?: never;
  onChange?: never;
  options?: never;
};

type ViewSwitcherProps = ControlledProps | StaticProps;

export function ViewSwitcher(props: ViewSwitcherProps) {
  if ("views" in props) {
    const views = props.views ?? [];
    const active = views[0];

    return (
      <div className="space-y-4">
        {props.title ? <h3 className="text-lg font-semibold text-white">{props.title}</h3> : null}
        <div className="inline-flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
          {views.map((view, index) => (
            <div
              key={view.id}
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                index === 0 ? "bg-cyan-400/15 text-cyan-100" : "text-slate-400",
              )}
            >
              {view.label}
            </div>
          ))}
        </div>
        <div>{active?.content}</div>
      </div>
    );
  }

  const { title, value, onChange, options } = props;

  return (
    <div className="space-y-3">
      {title ? <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3> : null}
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
    </div>
  );
}
