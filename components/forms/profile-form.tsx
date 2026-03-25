"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { profileSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormValues = z.input<typeof profileSchema>;
type ProfileSubmitValues = z.output<typeof profileSchema>;

export function ProfileForm() {
  const profile = usePortalStore((state) => state.profile);
  const updateProfile = usePortalStore((state) => state.updateProfile);

  const form = useForm<ProfileFormValues, unknown, ProfileSubmitValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: profile.name,
      email: profile.email,
      university: profile.university,
      targetExamWindow: profile.targetExamWindow,
      focusMode: profile.focusMode,
      dailyGoalHours: profile.dailyGoalHours,
      weeklyGoal: profile.weeklyGoal,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil ve ayarlar</CardTitle>
        <CardDescription>Gunluk hedeflerini ve odak modunu guncelle.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            updateProfile(values);
          })}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Ad soyad</label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">E-posta</label>
              <Input type="email" {...form.register("email")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Universite</label>
              <Input {...form.register("university")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Sinav penceresi</label>
              <Input {...form.register("targetExamWindow")} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Gunluk hedef saat</label>
              <Input type="number" {...form.register("dailyGoalHours", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Odak modu</label>
              <select
                {...form.register("focusMode")}
                className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white"
              >
                <option value="Dengeli">Dengeli</option>
                <option value="HMGS Oncelikli">HMGS Oncelikli</option>
                <option value="YDS Oncelikli">YDS Oncelikli</option>
                <option value="KPSS Oncelikli">KPSS Oncelikli</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Haftalik ana hedef</label>
            <Textarea rows={4} {...form.register("weeklyGoal")} />
          </div>
          <Button type="submit">Tercihleri kaydet</Button>
        </form>
      </CardContent>
    </Card>
  );
}
