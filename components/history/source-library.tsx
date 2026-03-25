"use client";

import { ExternalLink, Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopicResource } from "@/lib/types";
import { usePortalStore } from "@/store/portal-store";

export function SourceLibrary({ resources }: { resources?: TopicResource[] }) {
  const fallback = usePortalStore((state) => state.resources);
  const items = resources ?? fallback;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kaynak kutuphanesi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-cyan-300" />
                <p className="font-medium text-white">{resource.resourceTitle}</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {resource.exam} • {resource.topic} • {resource.resourceType}
              </p>
              <p className="mt-2 text-sm text-slate-300">{resource.note}</p>
            </div>
            {resource.link ? (
              <a
                href={resource.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-cyan-200"
              >
                Ac <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
