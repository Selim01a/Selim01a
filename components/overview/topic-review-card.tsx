"use client";

import { Clock3, Repeat2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopicReviewItem } from "@/lib/types";
import { getPriorityTone } from "@/lib/utils";

type TopicReviewCardProps = {
  title: string;
  description: string;
  items: TopicReviewItem[];
};

export function TopicReviewCard({
  title,
  description,
  items,
}: TopicReviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>
        <Repeat2 className="h-5 w-5 text-cyan-300" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.exam}-${item.topic}`}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-white">{item.topic}</p>
                <p className="text-xs text-slate-400">
                  {item.exam} • {item.reason}
                </p>
              </div>
              <Badge className={getPriorityTone(item.priority)}>{item.priority}</Badge>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-slate-400">
              <Clock3 className="h-4 w-4" />
              {item.dueLabel}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
