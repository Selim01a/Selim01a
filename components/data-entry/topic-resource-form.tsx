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

const defaultValues: TopicResourceInput = {
  exam: "HMGS",
  topicName: "",
  category: "",
  progress: 0,
  successRate: 60,
  sourceTitle: "",
  sourceType: "Kitap",
  sourceLink: "",
  sourceNotes: "",
};

export function TopicResourceForm() {
  const addTopicWithResource = usePortalStore((state) => state.addTopicWithResource);

  const form = useForm<TopicResourceInput, unknown, TopicResourceOutput>({
    resolver: zodResolver(topicResourceSchema),
    defaultValues,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Konu ve kaynak ekle</CardTitle>
        <CardDescription>
          Konu başlıklarını, kullandığın kaynakları ve notlarını sisteme gir.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            addTopicWithResource(values);
            form.reset(defaultValues);
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sınav</label>
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
              <Input {...form.register("category")} placeholder="Örn. Hukuk / Reading / Tarih" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Konu başlığı</label>
            <Input {...form.register("topicName")} placeholder="Örn. Borçlar Hukuku - Temerrüt" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">İlerleme %</label>
              <Input type="number" min={0} max={100} {...form.register("progress", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Başarı oranı %</label>
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
              <label className="text-sm text-slate-300">Kaynak adı</label>
              <Input {...form.register("sourceTitle")} placeholder="Örn. İpek Hoca Borçlar PDF" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Kaynak türü</label>
              <select
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
                {...form.register("sourceType")}
              >
                <option value="Kitap">Kitap</option>
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Not">Not</option>
                <option value="Soru Bankası">Soru Bankası</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Kaynak linki</label>
            <Input {...form.register("sourceLink")} placeholder="İsteğe bağlı bağlantı" />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300">Kaynak notları</label>
            <Textarea
              rows={4}
              {...form.register("sourceNotes")}
              placeholder="Bu kaynak hangi konu boşluğunu kapatıyor, hangi kısım önemli?"
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
