"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { usePortalStore } from "@/store/portal-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { examResultSchema } from "@/lib/utils";

type MockExamInput = z.input<typeof examResultSchema>;
type MockExamOutput = z.output<typeof examResultSchema>;

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
  const form = useForm<MockExamInput, unknown, MockExamOutput>({
    resolver: zodResolver(examResultSchema),
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deneme ekle</CardTitle>
        <CardDescription>Net ve accuracy verin analitik katmani besler.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            addMockExam(values);
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
          <Input placeholder="Kisa not" {...form.register("notes")} />
          <Button type="submit" className="w-full">
            Denemeyi kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
