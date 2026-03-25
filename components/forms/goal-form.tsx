"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { goalSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

type GoalFormInput = z.input<typeof goalSchema>;
type GoalFormOutput = z.output<typeof goalSchema>;

const defaultValues: GoalFormInput = {
  title: "",
  exam: "Genel",
  target: "",
  progress: 0,
  deadline: "",
  note: "",
};

export function GoalForm() {
  const addGoal = usePortalStore((state) => state.addGoal);

  const form = useForm<GoalFormInput, unknown, GoalFormOutput>({
    resolver: zodResolver(goalSchema),
    defaultValues,
  });

  const onSubmit = (values: GoalFormOutput) => {
    addGoal(values);
    form.reset(defaultValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hedef ekle</CardTitle>
        <CardDescription>
          Kullanici girdisiyle ilerleyen hedefler oluştur ve sistemin bunu takip etmesini sagla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-slate-300">Hedef basligi</label>
            <Input {...form.register("title")} placeholder="Orn. HMGS Medeni Hukuk %90 tamamlansin" />
          </div>

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
            <Input {...form.register("deadline")} placeholder="Orn. 20 Nisan" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Hedef metrik</label>
            <Input {...form.register("target")} placeholder="Orn. 80 net" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Mevcut ilerleme</label>
            <Input type="number" min={0} max={100} {...form.register("progress", { valueAsNumber: true })} />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" className="w-full">
              Hedefi kaydet
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
