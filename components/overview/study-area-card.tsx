"use client";

import { ArrowUpRight, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ExamCardSummary } from "@/lib/types";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

export function StudyAreaCard({ area }: { area: ExamCardSummary }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/5">
      <div className={`h-1 w-full bg-gradient-to-r ${area.accent}`} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="secondary" className="mb-3">
              {area.exam}
            </Badge>
            <CardTitle>{area.title}</CardTitle>
          </div>
          <span className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200">
            <Target className="h-5 w-5" />
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">{area.summary}</p>
        <Progress value={area.progress} />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-xs text-slate-500">Ilerleme</p>
            <p className="mt-1 text-xl font-semibold text-white">%{area.progress}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-xs text-slate-500">Soru</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {formatCompactNumber(area.questionCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
            <p className="text-xs text-slate-500">Basari</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {formatPercent(area.successRate)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <span>{area.helper}</span>
          <span className="inline-flex items-center gap-1 text-cyan-200">
            Ayrinti <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
