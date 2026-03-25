"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { usePortalStore } from "@/store/portal-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockExamSchema } from "@/lib/utils";
import type { MockExamInput } from "@/lib/types";

const defaultValues: MockExamInput = {
  exam: "HMGS",
  title: "",
  date: "",
  net: 0,
  accuracy: 0,
  duration: 120,
  notes: "",
};

export function MockExamForm() {
  const addMockExam = usePortalStore((state) => state.addMockExam);
  const form = useForm<MockExamInput>({
    resolver: zodResolver(mockExamSchema),
    defaultValues,
  });

  const onSubmit = (values: MockExamInput) => {
    addMockExam(values);
    form.reset(defaultValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deneme ekle</CardTitle>
        <CardDescription>
          Net, sure ve accuracy gir; sistem trend ve analizleri otomatik guncellesin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              {...form.register("exam")}
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              <option value="HMGS">HMGS</option>
              <option value="YDS">YDS</option>
              <option value="KPSS">KPSS</option>
            </select>
            <Input type="date" {...form.register("date")} />
          </div>

          <Input placeholder="Deneme adi" {...form.register("title")} />

          <div className="grid gap-4 md:grid-cols-3">
            <Input type="number" min={0} max={100} placeholder="Net" {...form.register("net", { valueAsNumber: true })} />
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="Accuracy"
              {...form.register("accuracy", { valueAsNumber: true })}
            />
            <Input
              type="number"
              min={1}
              max={240}
              placeholder="Sure"
              {...form.register("duration", { valueAsNumber: true })}
            />
          </div>

          <Input placeholder="Notlar" {...form.register("notes")} />

          <Button type="submit" className="w-full">
            Denemeyi kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
