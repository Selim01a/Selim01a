"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { taskSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

type TaskFormValues = z.input<typeof taskSchema>;
type TaskSubmitValues = z.output<typeof taskSchema>;

const defaultValues: TaskFormValues = {
  title: "",
  exam: "Genel",
  duration: 45,
  priority: "medium",
  scheduledFor: "Bugun",
};

export function TaskForm() {
  const addTask = usePortalStore((state) => state.addTask);

  const form = useForm<TaskFormValues, unknown, TaskSubmitValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const onSubmit = (values: TaskSubmitValues) => {
    addTask(values);
    form.reset(defaultValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni görev ekle</CardTitle>
        <CardDescription>
          Günlük veya haftalık görevlerini gir ve tamamlandıkça takip et.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Görev</label>
            <Input {...form.register("title")} placeholder="Örn. HMGS medeni hukuk 50 soru" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sınav</label>
              <select
                {...form.register("exam")}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              >
                <option value="Genel">Genel</option>
                <option value="HMGS">HMGS</option>
                <option value="YDS">YDS</option>
                <option value="KPSS">KPSS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Süre (dk)</label>
              <Input type="number" {...form.register("duration", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Öncelik</label>
              <select
                {...form.register("priority")}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              >
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Zamanlama</label>
              <select
                {...form.register("scheduledFor")}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              >
                <option value="Bugun">Bugün</option>
                <option value="Bu hafta">Bu hafta</option>
                <option value="Bu ay">Bu ay</option>
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Görevi ekle
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
