"use client";

import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  trendLabel: string;
  trendPositive?: boolean;
  icon: LucideIcon;
};

export function MetricCard({
  title,
  value,
  description,
  trendLabel,
  trendPositive = true,
  icon: Icon,
}: MetricCardProps) {
  const TrendIcon = trendPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-6">
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-400">{title}</p>
            <h3 className="text-3xl font-semibold tracking-tight text-white">{value}</h3>
            <Badge
              className={cn(
                "gap-1 rounded-full px-2 py-1",
                trendPositive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-200",
              )}
            >
              <TrendIcon className="h-3.5 w-3.5" />
              {trendLabel}
            </Badge>
            <p className="text-sm leading-6 text-slate-400">{description}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-3">
            <Icon className="h-5 w-5 text-fuchsia-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
