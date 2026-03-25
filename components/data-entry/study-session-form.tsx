"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sessionSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

type SessionInput = z.input<typeof sessionSchema>;
type SessionOutput = z.output<typeof sessionSchema>;

const defaultValues: SessionInput = {
  exam: "HMGS",
  title: "",
  date: "",
  minutes: 60,
  questionCount: 20,
  correctCount: 14,
  wrongCount: 6,
  mood: "Iyi",
  note: "",
};

export function StudySessionForm() {
  const addStudySession = usePortalStore((state) => state.addStudySession);

  const form = useForm<SessionInput, unknown, SessionOutput>({
    resolver: zodResolver(sessionSchema),
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calisma oturumu ekle</CardTitle>
        <CardDescription>
          Gecmise kayit dus, soru verisini ekle ve sistemin yorumlarini besle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            addStudySession({
              ...values,
              durationMinutes: values.minutes,
              note: values.note ?? "",
            });
            form.reset(defaultValues);
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <select
              {...form.register("exam")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="HMGS">HMGS</option>
              <option value="YDS">YDS</option>
              <option value="KPSS">KPSS</option>
              <option value="Genel">Genel</option>
            </select>
            <Input type="date" {...form.register("date")} />
          </div>

          <Input placeholder="Oturum basligi" {...form.register("title")} />

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              type="number"
              min={15}
              max={600}
              placeholder="Sure"
              {...form.register("minutes", { valueAsNumber: true })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Soru"
              {...form.register("questionCount", { valueAsNumber: true })}
            />
            <select
              {...form.register("mood")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
            >
              <option value="Harika">Harika</option>
              <option value="Iyi">Iyi</option>
              <option value="Normal">Normal</option>
              <option value="Zorlayici">Zorlayici</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="number"
              min={0}
              placeholder="Dogru"
              {...form.register("correctCount", { valueAsNumber: true })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Yanlis"
              {...form.register("wrongCount", { valueAsNumber: true })}
            />
          </div>

          <Textarea rows={4} placeholder="Seans notu" {...form.register("note")} />

          <Button type="submit" className="w-full">
            Oturumu kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
