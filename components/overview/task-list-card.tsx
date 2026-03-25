"use client";

import { CheckCircle2, Circle, Clock3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

export function TaskListCard({
  title = "Bugunun gorev akisi",
}: {
  title?: string;
}) {
  const tasks = usePortalStore((state) => state.tasks);
  const toggleTask = usePortalStore((state) => state.toggleTask);

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggleTask(task.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition",
              task.completed
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-white/10 bg-slate-950/40 hover:border-cyan-400/25 hover:bg-cyan-400/5",
            )}
          >
            {task.completed ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 text-slate-400" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p
                  className={cn(
                    "font-medium",
                    task.completed ? "text-emerald-100 line-through" : "text-white",
                  )}
                >
                  {task.title}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  {task.duration} dk
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-400">
                {task.exam} • {task.status}
              </p>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
