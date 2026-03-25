import { clsx, type ClassValue } from "clsx";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

import type { GoalStatus, SessionMood, TaskPriority, TaskStatus, ViewMode } from "@/lib/types";

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

export function formatDateLabel(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

export function getTaskPriorityTone(priority: TaskPriority) {
  if (priority === "high") return "bg-rose-500/10 text-rose-200";
  if (priority === "medium") return "bg-amber-500/10 text-amber-200";
  return "bg-emerald-500/10 text-emerald-200";
}

export function getTaskStatusTone(status: TaskStatus) {
  if (status === "Tamamlandi") return "success";
  if (status === "Devam ediyor") return "warning";
  return "secondary";
}

export function getGoalTone(status: GoalStatus) {
  if (status === "Rayinda") return "success";
  if (status === "Izlenmeli") return "warning";
  return "outline";
}

export function getMoodTone(mood: SessionMood) {
  if (mood === "Harika") return "success";
  if (mood === "Iyi") return "secondary";
  if (mood === "Normal") return "outline";
  return "warning";
}

export function getViewModeLabel(mode: ViewMode) {
  if (mode === "overview") return "Genel Bakis";
  if (mode === "planning") return "Planlama";
  return "Analiz";
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

export const taskSchema = z.object({
  title: z.string().min(4, "Gorev basligi kisa kaldi."),
  exam: z.enum(["HMGS", "YDS", "KPSS", "Genel"]),
  duration: z.coerce.number().min(15).max(600),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["Planlandi", "Devam ediyor", "Tamamlandi"]),
});

export const topicSchema = z.object({
  exam: z.enum(["HMGS", "YDS", "KPSS"]),
  title: z.string().min(3, "Konu adi gerekli."),
  category: z.string().min(2, "Kategori gerekli."),
  progress: z.coerce.number().min(0).max(100),
  questionCount: z.coerce.number().min(0).max(100000),
  successRate: z.coerce.number().min(0).max(100),
  lastReview: z.string().min(2, "Son tekrar gerekli."),
  nextReview: z.string().min(2, "Sonraki tekrar gerekli."),
  note: z.string().optional(),
});

export const resourceSchema = z.object({
  topicId: z.string().min(1, "Konu seciniz."),
  title: z.string().min(3, "Kaynak adi gerekli."),
  type: z.enum(["Kitap", "Video", "PDF", "Not", "Soru Bankasi", "Link"]),
  url: z.string().optional(),
  note: z.string().optional(),
});

export const sessionSchema = z.object({
  exam: z.enum(["HMGS", "YDS", "KPSS", "Genel"]),
  title: z.string().min(3, "Oturum basligi gerekli."),
  durationMinutes: z.coerce.number().min(15).max(600),
  questionCount: z.coerce.number().min(0).max(5000),
  correctCount: z.coerce.number().min(0).max(5000),
  wrongCount: z.coerce.number().min(0).max(5000),
  date: z.string().min(2, "Tarih gerekli."),
  mood: z.enum(["Harika", "Iyi", "Normal", "Zorlayici"]),
  note: z.string().optional(),
});

export const examResultSchema = z.object({
  exam: z.enum(["HMGS", "YDS", "KPSS"]),
  title: z.string().min(3, "Deneme adi gerekli."),
  date: z.string().min(2, "Tarih gerekli."),
  net: z.coerce.number().min(0).max(200),
  accuracy: z.coerce.number().min(0).max(100),
  duration: z.coerce.number().min(15).max(400),
  note: z.string().optional(),
});
