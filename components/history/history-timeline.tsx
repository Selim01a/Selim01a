"use client";

import { History, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistoryItem } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function HistoryTimeline({ items }: { items: HistoryItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gecmis kayitlari</CardTitle>
          <p className="mt-2 text-sm text-slate-400">
            Girilen veriler, tamamlanan planlar ve sistem hareketleri zaman akisinda.
          </p>
        </div>
        <History className="h-5 w-5 text-cyan-300" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <span className="mt-1 rounded-full bg-cyan-400/10 p-2 text-cyan-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-white">{item.title}</p>
                <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-slate-300">{item.description}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                {item.type}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
