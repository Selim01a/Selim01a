"use client";

export type ExamId = "hmgs" | "yds" | "kpss";
export type ExamLabel = "HMGS" | "YDS" | "KPSS";
export type GoalStatus = "Rayinda" | "Izlenmeli" | "Riskli";
export type TaskPriority = "high" | "medium" | "low";
export type TaskStatus = "Planlandi" | "Devam ediyor" | "Tamamlandi";
export type SessionMood = "Harika" | "Iyi" | "Normal" | "Zorlayici";
export type ModuleView = "overview" | "tracking" | "resources" | "history";
export type PlannerView = "overview" | "input" | "history" | "insights";
export type ViewMode = "overview" | "entry" | "history" | "analysis";

export type NavItem = {
  title: string;
  href: string;
  icon: string;
  badge?: string;
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

export type DashboardInsight = {
  id: string;
  title: string;
  body: string;
  tone: "good" | "warning" | "info";
  metric: string;
};

export type InsightItem = DashboardInsight;

export type DashboardSnapshot = {
  kpis: DashboardKpi;
  focusInsight: string;
  quickInsights: string[];
  energyStatus: string;
  strengthWeakness: StrengthWeakness[];
  totalSolvedQuestions: number;
  dueReviews: number;
};

export type ExamSummary = {
  id: ExamId;
  name: ExamLabel;
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

export type ExamCardSummary = {
  examId: ExamId;
  exam: ExamLabel;
  title: string;
  accent: string;
  progress: number;
  questionCount: number;
  successRate: number;
  summary: string;
  helper: string;
};

export type StudyTopicArea = ExamCardSummary;

export type MockNetPoint = {
  label: string;
  hmgs: number;
  yds: number;
  kpss: number;
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
  exam: ExamLabel | "Genel";
  duration: number;
  status: TaskStatus;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  notes?: string;
  completedAt?: string;
  scheduledDate?: string;
  type?: "deep-work" | "review" | "mock" | "admin";
  note?: string;
};

export type PlannerTask = StudyTask;

export type TaskPayload = {
  title: string;
  exam: ExamLabel | "Genel";
  duration: number;
  priority: TaskPriority;
  status: TaskStatus;
  scheduledDate: string;
  type: "deep-work" | "review" | "mock" | "admin";
  note?: string;
};

export type Goal = {
  id: string;
  title: string;
  exam: ExamLabel | "Genel";
  progress: number;
  target: string;
  deadline: string;
  status: GoalStatus;
  note?: string;
  createdAt: string;
};

export type TopicEntry = {
  id: string;
  exam: ExamLabel;
  title: string;
  name?: string;
  category: string;
  progress: number;
  questionCount: number;
  successRate: number;
  reviewDue: boolean;
  sourceCount: number;
  createdAt: string;
  updatedAt: string;
  lastReview: string;
  nextReview: string;
  solvedQuestions?: number;
  accuracy?: number;
  lastStudiedAt?: string;
  nextReviewAt?: string;
  note?: string;
};

export type ExamTopic = {
  id: string;
  exam: ExamLabel;
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

export type SubjectResource = {
  id: string;
  exam: ExamLabel;
  topic: string;
  resourceTitle: string;
  resourceType: "Kitap" | "Video" | "PDF" | "Not" | "Deneme";
  status: "Planlandi" | "Aktif" | "Tamamlandi";
  note: string;
  link?: string;
  createdAt: string;
};

export type TopicResource = SubjectResource;
export type SourceLink = SubjectResource;

export type TopicResourceInput = {
  exam: ExamLabel;
  topicName: string;
  category: string;
  progress: number;
  successRate: number;
  sourceTitle: string;
  sourceType: SubjectResource["resourceType"];
  sourceLink?: string;
  sourceNotes: string;
};

export type StudySession = {
  id: string;
  exam: ExamLabel | "Genel";
  title: string;
  topicName: string;
  date: string;
  minutes: number;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  mood: SessionMood;
  note: string;
  createdAt: string;
};

export type StudySessionInput = {
  exam: ExamLabel | "Genel";
  title: string;
  date: string;
  durationMinutes: number;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  mood: SessionMood;
  note: string;
};

export type MockExam = {
  id: string;
  exam: ExamLabel;
  title: string;
  date: string;
  net: number;
  accuracy: number;
  duration: number;
  createdAt: string;
};

export type MockExamEntry = MockExam & {
  wrongReason?: string;
  notes?: string;
};

export type MockExamInput = {
  exam: ExamLabel;
  title: string;
  date: string;
  net: number;
  accuracy: number;
  duration: number;
  note?: string;
};

export type WrongReason = {
  label: string;
  value: number;
  note: string;
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

export type HistoryItem = {
  id: string;
  title: string;
  description: string;
  type: "session" | "task" | "topic" | "resource" | "goal" | "exam";
  createdAt: string;
  exam?: ExamLabel | "Genel";
};

export type StudyLog = HistoryItem;

export type ProfileData = {
  name: string;
  email: string;
  university: string;
  targetExamWindow: string;
  dailyGoalHours: number;
  focusMode: "Dengeli" | "HMGS Oncelikli" | "YDS Oncelikli" | "KPSS Oncelikli";
  notificationLevel: "Minimal" | "Standart" | "Yuksek";
  streakDays: number;
  avatarFallback: string;
  weeklyGoal: string;
};

export type ViewPreferenceMap = {
  dashboard: ViewMode;
  hmgs: ModuleView;
  yds: ModuleView;
  kpss: ModuleView;
  planner: PlannerView;
};

export type AppView = {
  id: "overview" | "entry" | "history" | "analysis";
  label: string;
  description: string;
};
