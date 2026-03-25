"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  buildDerivedState,
  defaultViewPreferences,
  initialGoals,
  initialPlannerTasks,
  initialProfile,
  initialResources,
  initialStudySessions,
  initialTopics,
} from "@/lib/mock-data";
import type {
  Goal,
  PlannerTask,
  ProfileData,
  StudySession,
  SubjectResource,
  TopicEntry,
  ViewPreferenceMap,
} from "@/lib/types";

type ExamFilter = "all" | "HMGS" | "YDS" | "KPSS";

type TopicPayload = {
  exam: TopicEntry["exam"];
  title: string;
  category: string;
  sourceName: string;
};

type ResourcePayload = {
  topicId: string;
  exam: SubjectResource["exam"];
  title: string;
  type: SubjectResource["type"];
  url: string;
  note: string;
};

type SessionPayload = {
  exam: StudySession["exam"];
  topicId?: string;
  topicName: string;
  date: string;
  duration: number;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  note: string;
  sourceId?: string;
};

type TaskPayload = {
  title: string;
  exam: PlannerTask["exam"];
  scheduledDate: string;
  duration: number;
  type: PlannerTask["type"];
  priority: PlannerTask["priority"];
};

type PortalState = {
  examFilter: ExamFilter;
  profile: ProfileData;
  topics: TopicEntry[];
  resources: SubjectResource[];
  sessions: StudySession[];
  tasks: PlannerTask[];
  goals: Goal[];
  viewPreferences: ViewPreferenceMap;
  setExamFilter: (exam: ExamFilter) => void;
  setViewPreference: (key: keyof ViewPreferenceMap, value: ViewPreferenceMap[keyof ViewPreferenceMap]) => void;
  addTopic: (payload: TopicPayload) => void;
  updateTopicProgress: (topicId: string, progressDelta: number) => void;
  addResource: (payload: ResourcePayload) => void;
  addSession: (payload: SessionPayload) => void;
  addTask: (payload: TaskPayload) => void;
  toggleTask: (taskId: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "status" | "createdAt"> & { note?: string }) => void;
  updateProfile: (
    profile: Pick<
      ProfileData,
      "name" | "email" | "university" | "focusMode" | "dailyGoalHours" | "weeklyGoal"
    >,
  ) => void;
};

function deriveGoalStatus(progress: number): Goal["status"] {
  if (progress >= 70) return "Rayinda";
  if (progress >= 45) return "Izlenmeli";
  return "Riskli";
}

function safeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set) => ({
      examFilter: "all",
      profile: initialProfile,
      topics: initialTopics,
      resources: initialResources,
      sessions: initialStudySessions,
      tasks: initialPlannerTasks,
      goals: initialGoals,
      viewPreferences: defaultViewPreferences,
      setExamFilter: (examFilter) => set({ examFilter }),
      setViewPreference: (key, value) =>
        set((state) => ({
          viewPreferences: {
            ...state.viewPreferences,
            [key]: value,
          },
        })),
      addTopic: ({ exam, title, category, sourceName }) =>
        set((state) => ({
          topics: [
            {
              id: safeId("topic"),
              exam,
              title,
              category,
              progress: 0,
              questionCount: 0,
              correctCount: 0,
              wrongCount: 0,
              successRate: 0,
              reviewDue: false,
              sourceCount: sourceName ? 1 : 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastActivityAt: new Date().toISOString(),
              nextReviewAt: "",
            },
            ...state.topics,
          ],
          resources: sourceName
            ? [
                {
                  id: safeId("resource"),
                  topicId: state.topics[0]?.id ?? safeId("topic-ref"),
                  exam,
                  title: sourceName,
                  type: "Kitap",
                  url: "",
                  note: "Konu eklenirken olusturulan ilk kaynak.",
                  createdAt: new Date().toISOString(),
                },
                ...state.resources,
              ]
            : state.resources,
        })),
      updateTopicProgress: (topicId, progressDelta) =>
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  progress: Math.max(0, Math.min(100, topic.progress + progressDelta)),
                  updatedAt: new Date().toISOString(),
                }
              : topic,
          ),
        })),
      addResource: (payload) =>
        set((state) => ({
          resources: [
            {
              id: safeId("resource"),
              topicId: payload.topicId,
              exam: payload.exam,
              title: payload.title,
              type: payload.type,
              url: payload.url,
              note: payload.note,
              createdAt: new Date().toISOString(),
            },
            ...state.resources,
          ],
          topics: state.topics.map((topic) =>
            topic.id === payload.topicId
              ? {
                  ...topic,
                  sourceCount: topic.sourceCount + 1,
                }
              : topic,
          ),
        })),
      addSession: (payload) =>
        set((state) => {
          const successRate =
            payload.questionCount > 0 ? Math.round((payload.correctCount / payload.questionCount) * 100) : 0;
          return {
            sessions: [
              {
                id: safeId("session"),
                exam: payload.exam,
                topicId: payload.topicId,
                topicName: payload.topicName,
                date: payload.date,
                duration: payload.duration,
                questionCount: payload.questionCount,
                correctCount: payload.correctCount,
                wrongCount: payload.wrongCount,
                successRate,
                note: payload.note,
                sourceId: payload.sourceId,
                createdAt: new Date().toISOString(),
              },
              ...state.sessions,
            ],
            topics: state.topics.map((topic) =>
              topic.id === payload.topicId
                ? {
                    ...topic,
                    questionCount: topic.questionCount + payload.questionCount,
                    correctCount: topic.correctCount + payload.correctCount,
                    wrongCount: topic.wrongCount + payload.wrongCount,
                    successRate:
                      topic.questionCount + payload.questionCount > 0
                        ? Math.round(
                            ((topic.correctCount + payload.correctCount) /
                              (topic.questionCount + payload.questionCount)) *
                              100,
                          )
                        : 0,
                    progress: Math.min(100, topic.progress + Math.max(2, Math.round(payload.duration / 20))),
                    reviewDue: payload.wrongCount > payload.correctCount / 2,
                    lastActivityAt: payload.date,
                    updatedAt: new Date().toISOString(),
                    nextReviewAt: payload.wrongCount > 0 ? "48 saat icinde tekrar" : "5 gun sonra",
                  }
                : topic,
            ),
          };
        }),
      addTask: (payload) =>
        set((state) => ({
          tasks: [
            {
              id: safeId("task"),
              title: payload.title,
              exam: payload.exam,
              duration: payload.duration,
              status: "Planlandi",
              priority: payload.priority,
              completed: false,
              type: payload.type,
              scheduledDate: payload.scheduledDate,
              completedAt: "",
              note: "",
            },
            ...state.tasks,
          ],
        })),
      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: !task.completed,
                  status: !task.completed ? "Tamamlandi" : "Planlandi",
                  completedAt: !task.completed ? new Date().toISOString() : "",
                }
              : task,
          ),
        })),
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            {
              id: safeId("goal"),
              title: goal.title,
              exam: goal.exam,
              target: goal.target,
              progress: goal.progress,
              deadline: goal.deadline,
              status: deriveGoalStatus(goal.progress),
              createdAt: new Date().toISOString(),
              note: goal.note,
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
        })),
    }),
    {
      name: "premium-study-command-center",
      version: 1,
    },
  ),
);

export function usePortalDerived() {
  const profile = usePortalStore((state) => state.profile);
  const topics = usePortalStore((state) => state.topics);
  const resources = usePortalStore((state) => state.resources);
  const sessions = usePortalStore((state) => state.sessions);
  const tasks = usePortalStore((state) => state.tasks);
  const goals = usePortalStore((state) => state.goals);

  return buildDerivedState({
    profile,
    topics,
    resources,
    sessions,
    tasks,
    goals,
  });
}
