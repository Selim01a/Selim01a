"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { topicResourceSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

type TopicResourceInput = z.input<typeof topicResourceSchema>;
type TopicResourceOutput = z.output<typeof topicResourceSchema>;

export function TopicResourceForm({ examId }: { examId?: string } = {}) {
  const addTopicWithResource = usePortalStore((state) => state.addTopicWithResource);
  const topics = usePortalStore((state) => state.topics);

  const form = useForm<TopicResourceInput, unknown, TopicResourceOutput>({
    resolver: zodResolver(topicResourceSchema),
    defaultValues: {
      exam: examId?.toUpperCase() === "YDS" ? "YDS" : examId?.toUpperCase() === "KPSS" ? "KPSS" : "HMGS",
      topicName: "",
      category: "",
      progress: 0,
      successRate: 60,
      sourceTitle: "",
      sourceType: "Kitap",
      sourceLink: "",
      sourceNotes: "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konu ve kaynak ekle</CardTitle>
        <CardDescription>
          Yeni konu basligi ac, ilgili kaynagi ekle ve sistemin bunu yorumlamasini sagla.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            addTopicWithResource({
              ...values,
              sourceNotes: values.sourceNotes ?? "",
            });
            form.reset();
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sinav</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                {...form.register("exam")}
              >
                <option value="HMGS">HMGS</option>
                <option value="YDS">YDS</option>
                <option value="KPSS">KPSS</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Kategori</label>
              <Input {...form.register("category")} placeholder="Orn. Hukuk / Reading / Tarih" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Konu basligi</label>
            <Input {...form.register("topicName")} placeholder="Orn. Borclar Hukuku - Temerrut" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Ilerleme %</label>
              <Input type="number" min={0} max={100} {...form.register("progress", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Basari oranı %</label>
              <Input
                type="number"
                min={0}
                max={100}
                {...form.register("successRate", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Kaynak adi</label>
              <Input {...form.register("sourceTitle")} placeholder="Orn. Medeni Hukuk Fasikul" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Kaynak tipi</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                {...form.register("sourceType")}
              >
                <option value="Kitap">Kitap</option>
                <option value="Video">Video</option>
                <option value="PDF">PDF</option>
                <option value="Not">Not</option>
                <option value="Deneme">Deneme</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Link</label>
            <Input {...form.register("sourceLink")} placeholder="Istege bagli baglanti" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Not</label>
            <Textarea
              rows={4}
              {...form.register("sourceNotes")}
              placeholder={`Mevcut aktif konu sayisi: ${topics.length}. Bu kaynagin ne ise yaradigini yaz.`}
            />
          </div>

          <Button type="submit" className="w-full">
            Konu ve kaynak kaydet
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
