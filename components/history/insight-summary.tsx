"use client";

import { BrainCircuit } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalStore } from "@/store/portal-store";

export function InsightSummary() {
  const insights = usePortalStore((state) => state.insights);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-violet-300" />
          Veri yorumlari
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300"
          >
            {insight.message}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
