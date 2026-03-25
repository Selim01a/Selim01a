"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { usePortalStore } from "@/store/portal-store";
import { studySessionSchema } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SessionInput = z.input<typeof studySessionSchema>;
type SessionOutput = z.output<typeof studySessionSchema>;

const defaultValues: SessionInput = {
  exam: "HMGS",
  title: "",
  duration: 60,
  focusScore: 80,
  notes: "",
  date: "",
};

export function StudySessionForm() {
  const addStudySession = usePortalStore((state) => state.addStudySession);

  const form = useForm<SessionInput, unknown, SessionOutput>({
    resolver: zodResolver(studySessionSchema),
    defaultValues,
  });

  const onSubmit = (values: SessionOutput) => {
    addStudySession(values);
    form.reset(defaultValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calisma oturumu ekle</CardTitle>
        <CardDescription>
          Gecmise dusen oturumlar sistemin yorumlarini ve istatistiklerini besler.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sinav</label>
              <select
                {...form.register("exam")}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              >
                <option value="HMGS">HMGS</option>
                <option value="YDS">YDS</option>
                <option value="KPSS">KPSS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Tarih</label>
              <Input type="date" {...form.register("date")} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Oturum basligi</label>
            <Input {...form.register("title")} placeholder="Orn. HMGS medeni hukuk tekrar blogu" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sure (dk)</label>
              <Input type="number" {...form.register("duration", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Odak skoru</label>
              <Input type="number" {...form.register("focusScore", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Not</label>
            <Textarea
              rows={4}
              {...form.register("notes")}
              placeholder="Bugun zorlayan yerler, hizli kazanimlar, tekrar ihtiyaci..."
            />
          </div>

          <Button type="submit" className="w-full">
            Oturumu kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
