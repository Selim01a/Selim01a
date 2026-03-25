"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { portalData } from "@/lib/mock-data";
import { profileSchema } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

type ProfileFormValues = z.infer<typeof profileSchema>;

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

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil / ayarlar</CardTitle>
        <CardDescription>
          Odak modu, gunluk hedef ve calisma tercihlerini buradan yonet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="profile-name">
                Ad soyad
              </label>
              <Input id="profile-name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="profile-email">
                E-posta
              </label>
              <Input id="profile-email" type="email" {...form.register("email")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="profile-university">
                Universite
              </label>
              <Input id="profile-university" {...form.register("university")} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="profile-daily">
                Gunluk hedef saat
              </label>
              <Input
                id="profile-daily"
                type="number"
                {...form.register("dailyGoalHours", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="profile-focus">
              Odak modu
            </label>
            <select
              id="profile-focus"
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
            <label className="text-sm text-slate-300" htmlFor="profile-weekly-goal">
              Haftalik ana hedef
            </label>
            <Textarea id="profile-weekly-goal" rows={4} {...form.register("weeklyGoal")} />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Tercihleri kaydet</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
