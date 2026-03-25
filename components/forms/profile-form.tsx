"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { profileSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

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
      focusMode: profile.focusMode,
      dailyGoalHours: profile.dailyGoalHours,
      weeklyGoal: profile.weeklyGoal,
      targetExamWindow: profile.targetExamWindow,
    },
  });

  const onSubmit = (values: ProfileSubmitValues) => {
    updateProfile(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil ve ayarlar</CardTitle>
        <CardDescription>
          Hedef penceresi, odak modu ve haftalik stratejini duzenle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Ad soyad" {...form.register("name")} />
            <Input type="email" placeholder="E-posta" {...form.register("email")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Universite" {...form.register("university")} />
            <Input placeholder="Sinav penceresi" {...form.register("targetExamWindow")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              {...form.register("focusMode")}
            >
              <option value="Dengeli">Dengeli</option>
              <option value="HMGS Oncelikli">HMGS Oncelikli</option>
              <option value="YDS Oncelikli">YDS Oncelikli</option>
              <option value="KPSS Oncelikli">KPSS Oncelikli</option>
            </select>
            <Input type="number" placeholder="Gunluk hedef saat" {...form.register("dailyGoalHours")} />
          </div>
          <Textarea rows={4} placeholder="Haftalik ana hedef" {...form.register("weeklyGoal")} />
          <div className="flex justify-end">
            <Button type="submit">Profili kaydet</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
