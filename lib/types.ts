"use client";

export type ExamId = "hmgs" | "yds" | "kpss";

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  badge?: string;
};

export type ExamSummary = {
  id: ExamId;
  name: string;
  description: string;
  progress: number;
  completedTopics: number;
  totalTopics: number;
  questionCount: number;
  successRate: number;
  weeklyHours: number;
  focus: string;
  nextMilestone: string;
};

export type DashboardKpi = {
  studyHours: number;
  averageNet: number;
  completedTasks: number;
  motivationScore: number;
};

export type StrengthWeakness = {
  exam: string;
  label: string;
  summary: string;
  type: "strong" | "weak";
};

export type DashboardSnapshot = {
  kpis: DashboardKpi;
  focusInsight: string;
  quickInsights: string[];
  energyStatus: string;
  strengthWeakness: StrengthWeakness[];
};

export type MockNetPoint = {
  label: string;
  hmgs: number;
  yds: number;
  kpss: number;
};

export type StudyArea = {
  examId: ExamId;
  title: string;
  progress: number;
  solvedQuestions: number;
  targetQuestions: number;
  successRate: number;
  summary: string;
  recommendation: string;
  accent: string;
};

export type TopicReviewItem = {
  exam: string;
  topic: string;
  dueLabel: string;
  reason: string;
  priority: "Yuksek" | "Orta" | "Dusuk";
};

export type StudyTask = {
  id: string;
  title: string;
  exam: string;
  duration: number;
  status: "Planlandi" | "Devam ediyor" | "Tamamlandi";
  priority: "high" | "medium" | "low";
  completed: boolean;
};

export type ExamTopic = {
  id: string;
  exam: string;
  name: string;
  progress: number;
  questionCount: number;
  successRate: number;
  reviewDue: boolean;
  lastReview: string;
  nextReview: string;
};

export type ExamArea = {
  name: string;
  focus: string;
  progress: number;
  successRate: number;
  summary: string;
};

export type MockExam = {
  id: string;
  exam: string;
  date: string;
  net: number;
  accuracy: number;
  duration: number;
};

export type WrongReason = {
  label: string;
  value: number;
  note: string;
};

export type Goal = {
  id: string;
  title: string;
  exam: string;
  progress: number;
  target: string;
  deadline: string;
  status: "Rayinda" | "Izlenmeli" | "Riskli";
};

export type ReadingPerformance = {
  passageType: string;
  accuracy: number;
  avgMinutes: number;
  solved: number;
};

export type WordReview = {
  word: string;
  familiarity: number;
  dueInDays: number;
  source: string;
};

export type TopicTrackingItem = {
  exam: string;
  topic: string;
  completion: number;
  status: "Guclu" | "Gelisiyor" | "Zayif";
  questionCount: number;
};

export type PlannerSlot = {
  slot: string;
  title: string;
  duration: string;
  focus: string;
};

export type PlannerBoardData = {
  daily: PlannerSlot[];
  weeklySummary: Array<{ label: string; value: string }>;
};

export type TopicDistributionItem = {
  name: string;
  value: number;
};

export type RadarStat = {
  subject: string;
  hmgs: number;
  yds: number;
  kpss: number;
};

export type ProfileData = {
  name: string;
  email: string;
  university: string;
  targetExamWindow: string;
  dailyGoalHours: number;
  focusMode:
    | "Dengeli"
    | "HMGS Oncelikli"
    | "YDS Oncelikli"
    | "KPSS Oncelikli";
  notificationLevel: "Minimal" | "Standart" | "Yuksek";
  streakDays: number;
  avatarFallback: string;
  weeklyGoal: string;
};

export type PortalData = {
  nav: NavItem[];
  exams: ExamSummary[];
  dashboard: DashboardSnapshot;
  mockNets: MockNetPoint[];
  studyAreas: StudyArea[];
  reviewItems: TopicReviewItem[];
  tasks: StudyTask[];
  hmgsTopics: ExamTopic[];
  ydsTopics: ExamTopic[];
  kpssTopics: ExamTopic[];
  hmgsAreas: ExamArea[];
  ydsAreas: ExamArea[];
  kpssAreas: ExamArea[];
  hmgsTrials: MockExam[];
  ydsTrials: MockExam[];
  kpssTrials: MockExam[];
  planner: PlannerBoardData;
  plannerSlots: PlannerSlot[];
  wrongReasons: WrongReason[];
  goals: Goal[];
  readingPerformance: ReadingPerformance[];
  wordReviews: WordReview[];
  topicTracking: TopicTrackingItem[];
  topicDistribution: TopicDistributionItem[];
  radarStats: RadarStat[];
  profile: ProfileData;
};
