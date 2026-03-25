import { clsx, type ClassValue } from "clsx";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `%${Math.round(value)}`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function getPriorityTone(priority: "high" | "medium" | "low") {
  if (priority === "high") return "bg-rose-500/10 text-rose-200";
  if (priority === "medium") return "bg-amber-500/10 text-amber-200";
  return "bg-emerald-500/10 text-emerald-200";
}

export function getGoalTone(status: "Rayinda" | "Izlenmeli" | "Riskli") {
  if (status === "Rayinda") return "success";
  if (status === "Izlenmeli") return "warning";
  return "outline";
}

export const goalSchema = z.object({
  title: z.string().min(4, "Hedef basligi en az 4 karakter olmali."),
  exam: z.enum(["HMGS", "YDS", "KPSS", "Genel"]),
  target: z.string().min(2, "Hedef metrigi gerekli."),
  progress: z.coerce.number().min(0).max(100),
  deadline: z.string().min(2, "Bir termin giriniz."),
  note: z.string().optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Ad soyad gerekli."),
  email: z.string().email("Gecerli bir e-posta girin."),
  university: z.string().min(2, "Universite bilgisi gerekli."),
  focusMode: z.enum(["Dengeli", "HMGS Oncelikli", "YDS Oncelikli", "KPSS Oncelikli"]),
  dailyGoalHours: z.coerce.number().min(1).max(16),
  weeklyGoal: z.string().min(4, "Haftalik hedef gerekli."),
});
