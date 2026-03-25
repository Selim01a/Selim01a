import { clsx, type ClassValue } from "clsx";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

import type { GoalStatus, TaskPriority, TaskStatus } from "@/lib/types";

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

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
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
  targetExamWindow: z.string().min(2, "Sinav penceresi gerekli."),
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
  scheduledDate: z.string().min(2, "Planlanan tarih gerekli."),
  type: z.enum(["deep-work", "review", "mock", "admin"]),
});

export const studySessionSchema = z.object({
  exam: z.enum(["HMGS", "YDS", "KPSS", "Genel"]),
  title: z.string().min(3, "Oturum basligi gerekli."),
  date: z.string().min(2, "Tarih gerekli."),
  minutes: z.coerce.number().min(15).max(600),
  questionCount: z.coerce.number().min(0).max(5000),
  correctCount: z.coerce.number().min(0).max(5000),
  wrongCount: z.coerce.number().min(0).max(5000),
  mood: z.enum(["Harika", "Iyi", "Normal", "Zorlayici"]),
  note: z.string().optional(),
});

export const sessionSchema = studySessionSchema;

export const topicResourceSchema = z.object({
  exam: z.enum(["HMGS", "YDS", "KPSS"]),
  topicName: z.string().min(3, "Konu adi gerekli."),
  category: z.string().min(2, "Kategori gerekli."),
  progress: z.coerce.number().min(0).max(100),
  successRate: z.coerce.number().min(0).max(100),
  sourceTitle: z.string().min(2, "Kaynak adi gerekli."),
  sourceType: z.enum(["Kitap", "Video", "PDF", "Not", "Deneme"]),
  sourceLink: z.string().optional(),
  sourceNotes: z.string().optional(),
});

export const mockExamSchema = z.object({
  exam: z.enum(["HMGS", "YDS", "KPSS"]),
  title: z.string().min(3, "Deneme adi gerekli."),
  date: z.string().min(2, "Tarih gerekli."),
  net: z.coerce.number().min(0).max(200),
  accuracy: z.coerce.number().min(0).max(100),
  duration: z.coerce.number().min(15).max(400),
  notes: z.string().optional(),
});

export const examResultSchema = mockExamSchema;
