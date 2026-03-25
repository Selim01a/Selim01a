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
  status: "Planlandi",
  scheduledDate: "",
  type: "deep-work",
};

export function TaskForm() {
  const addTask = usePortalStore((state) => state.addTask);

  const form = useForm<TaskFormValues, unknown, TaskSubmitValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni gorev ekle</CardTitle>
        <CardDescription>Planini kullanici verisiyle canli olarak insa et.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            addTask(values);
            form.reset(defaultValues);
          })}
        >
          <Input {...form.register("title")} placeholder="Orn. HMGS medeni hukuk 50 soru" />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              {...form.register("exam")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="Genel">Genel</option>
              <option value="HMGS">HMGS</option>
              <option value="YDS">YDS</option>
              <option value="KPSS">KPSS</option>
            </select>
            <Input type="number" min={15} max={600} {...form.register("duration", { valueAsNumber: true })} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <select
              {...form.register("priority")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="high">Yuksek</option>
              <option value="medium">Orta</option>
              <option value="low">Dusuk</option>
            </select>
            <select
              {...form.register("status")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="Planlandi">Planlandi</option>
              <option value="Devam ediyor">Devam ediyor</option>
              <option value="Tamamlandi">Tamamlandi</option>
            </select>
            <select
              {...form.register("type")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="deep-work">Calisma</option>
              <option value="review">Tekrar</option>
              <option value="mock">Deneme</option>
              <option value="admin">Planlama</option>
            </select>
          </div>

          <Input type="date" {...form.register("scheduledDate")} />

          <Button type="submit" className="w-full">
            Gorevi kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
