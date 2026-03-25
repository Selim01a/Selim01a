"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { goalSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

type GoalFormValues = z.input<typeof goalSchema>;
type GoalSubmitValues = z.output<typeof goalSchema>;

const defaultValues: GoalFormValues = {
  title: "",
  exam: "Genel",
  target: "",
  progress: 0,
  deadline: "",
  note: "",
};

export function GoalForm() {
  const addGoal = usePortalStore((state) => state.addGoal);

  const form = useForm<GoalFormValues, unknown, GoalSubmitValues>({
    resolver: zodResolver(goalSchema),
    defaultValues,
  });

  const onSubmit = (values: GoalSubmitValues) => {
    addGoal(values);
    form.reset(defaultValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni hedef tanimla</CardTitle>
        <CardDescription>
          Net, konu tamamlama veya soru hacmi odakli hedeflerini sisteme ekle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Hedef basligi</label>
            <Input {...form.register("title")} placeholder="Orn. HMGS Medeni Hukuk %90 tamamlansin" />
            {form.formState.errors.title ? (
              <p className="text-xs text-rose-300">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sinav</label>
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
              <label className="text-sm text-slate-300">Termin</label>
              <Input {...form.register("deadline")} placeholder="Orn. Nisan sonu" />
              {form.formState.errors.deadline ? (
                <p className="text-xs text-rose-300">{form.formState.errors.deadline.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Hedef metrik</label>
              <Input {...form.register("target")} placeholder="Orn. 82 net" />
              {form.formState.errors.target ? (
                <p className="text-xs text-rose-300">{form.formState.errors.target.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Baslangic ilerleme %</label>
              <Input
                type="number"
                min={0}
                max={100}
                {...form.register("progress", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Strateji notu</label>
            <Textarea {...form.register("note")} placeholder="Kisa plan, tekrar mantigi veya milestone yaz." />
          </div>

          <Button type="submit" className="w-full">
            Hedefi kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
