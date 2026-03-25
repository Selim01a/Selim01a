"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  buildDerivedState,
  defaultViewPreferences,
  initialGoals,
  initialMockExams,
  initialProfile,
  initialSources,
  initialStudySessions,
  initialTasks,
  initialTopics,
  navItems,
} from "@/lib/mock-data";
import type {
  DashboardInsight,
  DashboardSnapshot,
  ExamArea,
  ExamCardSummary,
  ExamId,
  ExamLabel,
  ExamSummary,
  Goal,
  HistoryItem,
  MockExamEntry,
  MockExamInput,
  MockNetPoint,
  PlannerTask,
  ProfileData,
  StudySession,
  StudySessionInput,
  SubjectResource,
  TaskPayload,
  TopicEntry,
  TopicResourceInput,
  TopicReviewItem,
  ViewPreferenceMap,
  WrongReason,
  TopicDistributionItem,
  RadarStat,
} from "@/lib/types";

type ExamFilter = "all" | ExamLabel;

type Derived = ReturnType<typeof buildDerivedState>;

type PortalState = {
  examFilter: ExamFilter;
  nav: typeof navItems;
  profile: ProfileData;
  topics: TopicEntry[];
  resources: SubjectResource[];
  sessions: StudySession[];
  tasks: PlannerTask[];
  goals: Goal[];
  mockExams: MockExamEntry[];
  viewPreferences: ViewPreferenceMap;
  dashboard: DashboardSnapshot;
  exams: ExamSummary[];
  studyAreas: ExamCardSummary[];
  reviewItems: TopicReviewItem[];
  mockNetSeries: MockNetPoint[];
  activityLog: HistoryItem[];
  history: HistoryItem[];
  insights: DashboardInsight[];
  generatedInsights: DashboardInsight[];
  streakDays: number;
  motivationMessage: string;
  wrongReasons: WrongReason[];
  topicDistribution: TopicDistributionItem[];
  radarStats: RadarStat[];
  setExamFilter: (exam: ExamFilter) => void;
  setViewPreference: <K extends keyof ViewPreferenceMap>(key: K, value: ViewPreferenceMap[K]) => void;
  addTask: (payload: TaskPayload) => void;
  toggleTask: (taskId: string) => void;
  addGoal: (goal: Omit<Goal, "id" | "status" | "createdAt"> & { note?: string }) => void;
  updateProfile: (
    profile: Pick<
      ProfileData,
      "name" | "email" | "university" | "focusMode" | "dailyGoalHours" | "weeklyGoal" | "targetExamWindow"
    >,
  ) => void;
  addStudySession: (input: StudySessionInput) => void;
  addSession: (input: StudySessionInput) => void;
  addMockExam: (input: MockExamInput) => void;
  addTopicWithResource: (input: TopicResourceInput) => void;
  getExamTopics: (examId: ExamId) => TopicEntry[];
  getExamAreas: (examId: ExamId) => ExamArea[];
  getExamResources: (examId: ExamId) => SubjectResource[];
  getExamSessions: (examId: ExamId) => StudySession[];
  filteredHistory: (examId?: ExamId) => HistoryItem[];
  syncDerived: () => void;
};

function safeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function examIdToLabel(examId: ExamId): ExamLabel {
  if (examId === "hmgs") return "HMGS";
  if (examId === "yds") return "YDS";
  return "KPSS";
}

function deriveGoalStatus(progress: number): Goal["status"] {
  if (progress >= 70) return "Rayinda";
  if (progress >= 45) return "Izlenmeli";
  return "Riskli";
}

function buildAreasFromCards(cards: ExamCardSummary[]): Record<ExamId, ExamArea[]> {
  return {
    hmgs: cards
      .filter((card) => card.exam === "HMGS")
      .map((card) => ({
        name: card.title,
        focus: card.helper,
        progress: card.progress,
        successRate: card.successRate,
        summary: card.summary,
      })),
    yds: cards
      .filter((card) => card.exam === "YDS")
      .map((card) => ({
        name: card.title,
        focus: card.helper,
        progress: card.progress,
        successRate: card.successRate,
        summary: card.summary,
      })),
    kpss: cards
      .filter((card) => card.exam === "KPSS")
      .map((card) => ({
        name: card.title,
        focus: card.helper,
        progress: card.progress,
        successRate: card.successRate,
        summary: card.summary,
      })),
  };
}

function pickDerived(input: Derived) {
  return {
    dashboard: input.dashboard,
    exams: input.exams,
    studyAreas: input.studyAreas,
    reviewItems: input.reviewItems,
    mockNetSeries: input.mockNetSeries,
    activityLog: input.history,
    history: input.history,
    insights: input.insights,
    generatedInsights: input.insights,
    streakDays: input.streakDays,
    motivationMessage: input.motivationMessage,
    wrongReasons: input.wrongReasons,
    topicDistribution: input.topicDistribution,
    radarStats: input.radarStats,
  };
}

const initialDerived = buildDerivedState({
  profile: initialProfile,
  topics: initialTopics,
  resources: initialSources,
  sessions: initialStudySessions,
  tasks: initialTasks,
  goals: initialGoals,
  mockExams: initialMockExams,
});

export const usePortalStore = create<PortalState>()(
  persist(
    (set, get) => ({
      examFilter: "all",
      nav: navItems,
      profile: initialProfile,
      topics: initialTopics,
      resources: initialSources,
      sessions: initialStudySessions,
      tasks: initialTasks,
      goals: initialGoals,
      mockExams: initialMockExams,
      viewPreferences: defaultViewPreferences,
      ...pickDerived(initialDerived),
      setExamFilter: (examFilter) => set({ examFilter }),
      setViewPreference: (key, value) =>
        set((state) => ({
          viewPreferences: {
            ...state.viewPreferences,
            [key]: value,
          },
        })),
      syncDerived: () => {
        const state = get();
        const derived = buildDerivedState({
          profile: state.profile,
          topics: state.topics,
          resources: state.resources,
          sessions: state.sessions,
          tasks: state.tasks,
          goals: state.goals,
          mockExams: state.mockExams,
        });
        set(pickDerived(derived));
      },
      addTask: (payload) => {
        set((state) => ({
          tasks: [
            {
              id: safeId("task"),
              title: payload.title,
              exam: payload.exam,
              duration: payload.duration,
              status: payload.status,
              priority: payload.priority,
              completed: payload.status === "Tamamlandi",
              createdAt: new Date().toISOString(),
              dueDate: payload.scheduledDate,
              scheduledDate: payload.scheduledDate,
              type: payload.type,
              notes: payload.note,
            },
            ...state.tasks,
          ],
        }));
        get().syncDerived();
      },
      toggleTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  completed: !task.completed,
                  status: !task.completed ? "Tamamlandi" : "Planlandi",
                  completedAt: !task.completed ? new Date().toISOString() : undefined,
                }
              : task,
          ),
        }));
        get().syncDerived();
      },
      addGoal: (goal) => {
        set((state) => ({
          goals: [
            {
              id: safeId("goal"),
              title: goal.title,
              exam: goal.exam,
              progress: goal.progress,
              target: goal.target,
              deadline: goal.deadline,
              note: goal.note,
              status: deriveGoalStatus(goal.progress),
              createdAt: new Date().toISOString(),
            },
            ...state.goals,
          ],
        }));
        get().syncDerived();
      },
      updateProfile: (profile) => {
        set((state) => ({
          profile: {
            ...state.profile,
            ...profile,
          },
        }));
        get().syncDerived();
      },
      addStudySession: (input) => {
        const accuracy =
          input.questionCount > 0 ? Math.round((input.correctCount / input.questionCount) * 100) : 0;

        set((state) => ({
          sessions: [
            {
              id: safeId("session"),
              exam: input.exam,
              title: input.title,
              topicName: input.title,
              date: input.date,
              minutes: input.durationMinutes,
              questionCount: input.questionCount,
              correctCount: input.correctCount,
              wrongCount: input.wrongCount,
              accuracy,
              mood: input.mood,
              note: input.note,
              createdAt: new Date().toISOString(),
            },
            ...state.sessions,
          ],
        }));
        get().syncDerived();
      },
      addSession: (input) => get().addStudySession(input),
      addMockExam: (input) => {
        set((state) => ({
          mockExams: [
            {
              id: safeId("mock"),
              exam: input.exam,
              title: input.title,
              date: input.date,
              net: input.net,
              accuracy: input.accuracy,
              duration: input.duration,
              notes: input.note,
              createdAt: new Date().toISOString(),
            },
            ...state.mockExams,
          ],
        }));
        get().syncDerived();
      },
      addTopicWithResource: (input) => {
        set((state) => ({
          topics: [
            {
              id: safeId("topic"),
              exam: input.exam,
              title: input.topicName,
              category: input.category,
              progress: input.progress,
              questionCount: 0,
              successRate: input.successRate,
              reviewDue: input.progress < 60,
              sourceCount: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastReview: "Henuz yok",
              nextReview: input.progress < 60 ? "Bugun" : "3 gun sonra",
              note: input.sourceNotes,
            },
            ...state.topics,
          ],
          resources: [
            {
              id: safeId("resource"),
              exam: input.exam,
              topic: input.topicName,
              resourceTitle: input.sourceTitle,
              resourceType: input.sourceType,
              status: "Aktif",
              note: input.sourceNotes,
              link: input.sourceLink,
              createdAt: new Date().toISOString(),
            },
            ...state.resources,
          ],
        }));
        get().syncDerived();
      },
      getExamTopics: (examId) => get().topics.filter((topic) => topic.exam === examIdToLabel(examId)),
      getExamAreas: (examId) => buildAreasFromCards(get().studyAreas)[examId],
      getExamResources: (examId) =>
        get().resources.filter((resource) => resource.exam === examIdToLabel(examId)),
      getExamSessions: (examId) =>
        get().sessions.filter((session) => session.exam === examIdToLabel(examId)),
      filteredHistory: (examId) =>
        examId
          ? get().history.filter((item) => item.description.includes(examIdToLabel(examId)))
          : get().history,
    }),
    {
      name: "premium-study-command-center-v4",
      version: 4,
      partialize: (state) => ({
        examFilter: state.examFilter,
        profile: state.profile,
        topics: state.topics,
        resources: state.resources,
        sessions: state.sessions,
        tasks: state.tasks,
        goals: state.goals,
        mockExams: state.mockExams,
        viewPreferences: state.viewPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.syncDerived();
      },
    },
  ),
);
