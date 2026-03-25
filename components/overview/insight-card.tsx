"use client";

import { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InsightCardProps = {
  title: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
  footer: string;
};

export function InsightCard({
  title,
  description,
  bullets,
  icon: Icon,
  footer,
}: InsightCardProps) {
  return (
    <Card className="h-full border-white/10 bg-white/[0.04]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-white">
          <span className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
            <Icon className="h-5 w-5" />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-slate-300">{description}</p>
        <div className="space-y-2">
          {bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200"
            >
              {bullet}
            </div>
          ))}
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">{footer}</p>
      </CardContent>
    </Card>
  );
}
