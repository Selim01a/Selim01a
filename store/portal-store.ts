"use client";

import { create } from "zustand";

import { portalData } from "@/lib/mock-data";
import type { Goal, ProfileData, StudyTask } from "@/lib/types";

type ExamFilter = "all" | "HMGS" | "YDS" | "KPSS";

type PortalState = {
  examFilter: ExamFilter;
  streakDays: number;
  motivationMessage: string;
  tasks: StudyTask[];
  goals: Goal[];
  profile: ProfileData;
  setExamFilter: (exam: ExamFilter) => void;
  toggleTask: (taskId: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "status"> & { note?: string }) => void;
  updateProfile: (
    profile: Pick<ProfileData, "name" | "email" | "university" | "focusMode" | "dailyGoalHours" | "weeklyGoal">,
  ) => void;
};

function deriveGoalStatus(progress: number): Goal["status"] {
  if (progress >= 70) return "Rayinda";
  if (progress >= 45) return "Izlenmeli";
  return "Riskli";
}

export const usePortalStore = create<PortalState>((set) => ({
  examFilter: "all",
  streakDays: portalData.profile.streakDays,
  motivationMessage:
    "Seriyi korumak icin bugun yalnizca iki kaliteli odak blogu daha yeterli.",
  tasks: portalData.tasks,
  goals: portalData.goals,
  profile: portalData.profile,
  setExamFilter: (examFilter) => set({ examFilter }),
  toggleTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              status: !task.completed ? "Tamamlandi" : "Planlandi",
            }
          : task,
      ),
    })),
  addGoal: (goal) =>
    set((state) => ({
      goals: [
        {
          id: `goal-${state.goals.length + 1}`,
          title: goal.title,
          exam: goal.exam,
          target: goal.target,
          progress: goal.progress,
          deadline: goal.deadline,
          status: deriveGoalStatus(goal.progress),
        },
        ...state.goals,
      ],
    })),
  updateProfile: (profile) =>
    set((state) => ({
      profile: {
        ...state.profile,
        ...profile,
      },
      streakDays: state.profile.streakDays,
    })),
}));
