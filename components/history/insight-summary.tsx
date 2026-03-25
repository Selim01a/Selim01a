"use client";

import { BrainCircuit } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalStore } from "@/store/portal-store";

type InsightSummaryProps = {
  insights?: ReturnType<typeof usePortalStore.getState>["generatedInsights"];
};

export function InsightSummary({ insights }: InsightSummaryProps) {
  const generatedInsights = usePortalStore((state) => state.generatedInsights);
  const items = insights ?? generatedInsights;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-violet-300" />
          Veri yorumlari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((insight) => (
          <div
            key={insight.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium text-white">{insight.title}</p>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {insight.tone}
              </span>
            </div>
            <p className="text-sm text-slate-300">{insight.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
