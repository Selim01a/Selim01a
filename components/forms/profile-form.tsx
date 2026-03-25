"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { portalData } from "@/lib/mock-data";
import { profileSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormValues = z.output<typeof profileSchema>;

const defaultValues: ProfileFormValues = {
  name: portalData.profile.name,
  email: portalData.profile.email,
  university: portalData.profile.university,
  focusMode: portalData.profile.focusMode,
  dailyGoalHours: portalData.profile.dailyGoalHours,
  weeklyGoal: portalData.profile.weeklyGoal,
};

export function ProfileForm() {
  const updateProfile = usePortalStore((state) => state.updateProfile);

  const form = useForm<z.input<typeof profileSchema>, undefined, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<ProfileFormValues> = (values) => {
    updateProfile(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil ve ayarlar</CardTitle>
        <CardDescription>
          Odak modu, gunluk hedef ve haftalik cizgini bu panelden guncelle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="name">
                Ad soyad
              </label>
              <Input id="name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="email">
                E-posta
              </label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="university">
                Universite
              </label>
              <Input id="university" {...form.register("university")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="dailyGoalHours">
                Gunluk hedef saat
              </label>
              <Input
                id="dailyGoalHours"
                type="number"
                {...form.register("dailyGoalHours", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="focusMode">
              Odak modu
            </label>
            <select
              id="focusMode"
              className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
              {...form.register("focusMode")}
            >
              <option value="Dengeli">Dengeli</option>
              <option value="HMGS Oncelikli">HMGS Oncelikli</option>
              <option value="YDS Oncelikli">YDS Oncelikli</option>
              <option value="KPSS Oncelikli">KPSS Oncelikli</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="weeklyGoal">
              Haftalik ana hedef
            </label>
            <Textarea id="weeklyGoal" rows={4} {...form.register("weeklyGoal")} />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Tercihleri kaydet</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
