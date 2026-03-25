"use client";

import { ExternalLink, Link2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalStore } from "@/store/portal-store";

export function SourceLibrary() {
  const topics = usePortalStore((state) => state.topics);
  const topicsWithSources = topics.filter((topic) => topic.resources.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kaynak kutuphanesi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topicsWithSources.map((topic) => (
          <div
            key={topic.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-cyan-300" />
              <div>
                <p className="font-medium text-white">{topic.name}</p>
                <p className="text-xs text-slate-400">{topic.exam}</p>
              </div>
            </div>
            <div className="space-y-2">
              {topic.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{resource.title}</p>
                    <p className="text-xs text-slate-400">
                      {resource.type} • {resource.note || "Not eklenmedi"}
                    </p>
                  </div>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-200"
                  >
                    Ac <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
