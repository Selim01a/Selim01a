"use client";

import type {
  DashboardInsight,
  DashboardSnapshot,
  ExamCardSummary,
  ExamId,
  ExamLabel,
  ExamSummary,
  Goal,
  GoalStatus,
  HistoryItem,
  MockExamEntry,
  MockNetPoint,
  NavItem,
  ProfileData,
  RadarStat,
  StudySession,
  StudyTask,
  SubjectResource,
  TopicDistributionItem,
  TopicEntry,
  TopicReviewItem,
  ViewPreferenceMap,
  WrongReason,
} from "@/lib/types";

export const navItems: NavItem[] = [
  { title: "Genel Dashboard", href: "/dashboard", icon: "dashboard", badge: "Canli" },
  { title: "HMGS", href: "/hmgs", icon: "hmgs", badge: "Hukuk" },
  { title: "YDS", href: "/yds", icon: "yds", badge: "Dil" },
  { title: "KPSS", href: "/kpss", icon: "kpss", badge: "Kamu" },
  { title: "Planner", href: "/planner", icon: "planner" },
  { title: "Deneme Takibi", href: "/deneme-takibi", icon: "exam" },
  { title: "Konu Takibi", href: "/konu-takibi", icon: "topic" },
  { title: "Yanlis Analizi", href: "/yanlis-analizi", icon: "wrong" },
  { title: "Hedef Yonetimi", href: "/hedef-yonetimi", icon: "goal" },
  { title: "Istatistikler", href: "/istatistikler", icon: "stats" },
  { title: "Profil / Ayarlar", href: "/profil", icon: "profile" },
];

function isoDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const initialProfile: ProfileData = {
  name: "Selim Kaya",
  email: "selim.kaya@example.com",
  university: "Istanbul Universitesi Hukuk Fakultesi",
  targetExamWindow: "2026 yaz donemi",
  dailyGoalHours: 6,
  focusMode: "Dengeli",
  notificationLevel: "Standart",
  streakDays: 7,
  avatarFallback: "SK",
  weeklyGoal: "42 saat odakli calisma ve 3 deneme",
};

export const initialTopics: TopicEntry[] = [
  {
    id: "topic-1",
    exam: "HMGS",
    title: "Medeni Hukuk",
    name: "Medeni Hukuk",
    category: "Hukuk Dersleri",
    progress: 82,
    questionCount: 910,
    successRate: 85,
    reviewDue: false,
    sourceCount: 1,
    createdAt: isoDaysAgo(20),
    updatedAt: isoDaysAgo(1),
    lastReview: "Dun",
    nextReview: "4 gun sonra",
    note: "Miras ve hak ehliyeti guclu.",
  },
  {
    id: "topic-2",
    exam: "HMGS",
    title: "Idare Hukuku",
    name: "Idare Hukuku",
    category: "Hukuk Dersleri",
    progress: 61,
    questionCount: 520,
    successRate: 69,
    reviewDue: true,
    sourceCount: 0,
    createdAt: isoDaysAgo(18),
    updatedAt: isoDaysAgo(7),
    lastReview: "7 gun once",
    nextReview: "Bugun",
    note: "Tekrar penceresi gecikiyor.",
  },
  {
    id: "topic-3",
    exam: "YDS",
    title: "Reading Inference",
    name: "Reading Inference",
    category: "Reading",
    progress: 54,
    questionCount: 120,
    successRate: 61,
    reviewDue: true,
    sourceCount: 0,
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(3),
    lastReview: "3 gun once",
    nextReview: "Bugun",
    note: "Baglam yorumu zayif.",
  },
  {
    id: "topic-4",
    exam: "KPSS",
    title: "Tarih Kronoloji",
    name: "Tarih Kronoloji",
    category: "Tarih",
    progress: 48,
    questionCount: 220,
    successRate: 63,
    reviewDue: true,
    sourceCount: 0,
    createdAt: isoDaysAgo(16),
    updatedAt: isoDaysAgo(5),
    lastReview: "5 gun once",
    nextReview: "Yarin",
    note: "Backlog buyumus.",
  },
];

export const initialSources: SubjectResource[] = [
  {
    id: "resource-1",
    exam: "HMGS",
    topic: "Medeni Hukuk",
    resourceTitle: "Medeni Hukuk Ders Notlari",
    resourceType: "PDF",
    status: "Aktif",
    note: "Temel kavram tekrarinda kullan.",
    link: "https://example.com/medeni-hukuk",
    createdAt: isoDaysAgo(10),
  },
];

export const initialStudySessions: StudySession[] = [
  {
    id: "session-1",
    exam: "HMGS",
    title: "Medeni hukuk soru kampi",
    topicName: "Medeni Hukuk",
    date: isoDaysAgo(1),
    minutes: 110,
    questionCount: 80,
    correctCount: 66,
    wrongCount: 14,
    accuracy: 83,
    mood: "Iyi",
    note: "Miras ve hak ehliyeti tekrar edildi.",
    createdAt: isoDaysAgo(1),
  },
  {
    id: "session-2",
    exam: "YDS",
    title: "Reading inference sprint",
    topicName: "Reading Inference",
    date: isoDaysAgo(2),
    minutes: 70,
    questionCount: 24,
    correctCount: 15,
    wrongCount: 9,
    accuracy: 63,
    mood: "Zorlayici",
    note: "Secenek eleme yetersiz.",
    createdAt: isoDaysAgo(2),
  },
  {
    id: "session-3",
    exam: "KPSS",
    title: "Tarih kronoloji tekrar",
    topicName: "Tarih Kronoloji",
    date: isoDaysAgo(3),
    minutes: 45,
    questionCount: 30,
    correctCount: 19,
    wrongCount: 11,
    accuracy: 63,
    mood: "Normal",
    note: "Kronoloji karisti.",
    createdAt: isoDaysAgo(3),
  },
];

export const initialSessions = initialStudySessions;

export const initialMockExams: MockExamEntry[] = [
  {
    id: "mock-1",
    exam: "HMGS",
    title: "HMGS Premium Deneme 06",
    date: isoDaysAgo(1),
    net: 76,
    accuracy: 81,
    duration: 129,
    wrongReason: "Bilgi eksigi",
    notes: "Idare ve cezada dikkat dususu oldu.",
    createdAt: isoDaysAgo(1),
  },
  {
    id: "mock-2",
    exam: "YDS",
    title: "YDS Reading Sprint 04",
    date: isoDaysAgo(3),
    net: 59,
    accuracy: 74,
    duration: 164,
    wrongReason: "Soru kokunu yanlis okuma",
    notes: "Inference zayif.",
    createdAt: isoDaysAgo(3),
  },
  {
    id: "mock-3",
    exam: "KPSS",
    title: "KPSS Genel Yetenek 05",
    date: isoDaysAgo(5),
    net: 66,
    accuracy: 77,
    duration: 118,
    wrongReason: "Zaman baskisi",
    notes: "Matematik son blokta yavaslama var.",
    createdAt: isoDaysAgo(5),
  },
];

export const initialTasks: StudyTask[] = [
  {
    id: "task-1",
    title: "HMGS Medeni Hukuk tekrar blogu",
    exam: "HMGS",
    duration: 90,
    status: "Planlandi",
    priority: "high",
    completed: false,
    dueDate: isoDaysAgo(0),
    notes: "60 soru + 20 dakika hata analizi",
    createdAt: isoDaysAgo(0),
    type: "deep-work",
    scheduledDate: isoDaysAgo(0),
  },
  {
    id: "task-2",
    title: "YDS kelime + reading mini set",
    exam: "YDS",
    duration: 70,
    status: "Devam ediyor",
    priority: "medium",
    completed: false,
    dueDate: isoDaysAgo(0),
    notes: "40 kelime, 2 passage",
    createdAt: isoDaysAgo(0),
    type: "review",
    scheduledDate: isoDaysAgo(0),
  },
  {
    id: "task-3",
    title: "KPSS tarih kronoloji tekrar",
    exam: "KPSS",
    duration: 45,
    status: "Tamamlandi",
    priority: "high",
    completed: true,
    dueDate: isoDaysAgo(1),
    notes: "Kartlarla aktif recall",
    createdAt: isoDaysAgo(1),
    completedAt: isoDaysAgo(1),
    type: "review",
    scheduledDate: isoDaysAgo(1),
  },
];

export const initialGoals: Goal[] = [
  {
    id: "goal-1",
    title: "HMGS netini 80+ bandina tasimak",
    exam: "HMGS",
    progress: 76,
    target: "80 net",
    deadline: "Nisan sonu",
    status: "Rayinda",
    note: "Haftada 2 deneme + detayli analiz",
    createdAt: isoDaysAgo(12),
  },
  {
    id: "goal-2",
    title: "YDS reading accuracy %80",
    exam: "YDS",
    progress: 68,
    target: "%80 accuracy",
    deadline: "3 haftalik sprint",
    status: "Izlenmeli",
    note: "Inference ve paraphrase odagi",
    createdAt: isoDaysAgo(9),
  },
];

export const defaultViewPreferences: ViewPreferenceMap = {
  dashboard: "overview",
  hmgs: "overview",
  yds: "overview",
  kpss: "overview",
  planner: "overview",
};

export function deriveGoalStatus(progress: number): GoalStatus {
  if (progress >= 70) return "Rayinda";
  if (progress >= 45) return "Izlenmeli";
  return "Riskli";
}

function buildExamSummaries(topics: TopicEntry[], sessions: StudySession[]): ExamSummary[] {
  const exams: ExamId[] = ["hmgs", "yds", "kpss"];
  const labels: Record<ExamId, ExamLabel> = { hmgs: "HMGS", yds: "YDS", kpss: "KPSS" };

  return exams.map((examId) => {
    const examLabel = labels[examId];
    const examTopics = topics.filter((topic) => topic.exam === examLabel);
    const examSessions = sessions.filter((session) => session.exam === examLabel);
    const questionCount = examTopics.reduce((sum, topic) => sum + topic.questionCount, 0);
    const successRate =
      examTopics.length > 0
        ? Math.round(examTopics.reduce((sum, topic) => sum + topic.successRate, 0) / examTopics.length)
        : 0;
    const progress =
      examTopics.length > 0
        ? Math.round(examTopics.reduce((sum, topic) => sum + topic.progress, 0) / examTopics.length)
        : 0;

    return {
      id: examId,
      name: examLabel,
      description: `${examLabel} canli performans ozeti`,
      progress,
      completedTopics: examTopics.filter((topic) => topic.progress >= 80).length,
      totalTopics: Math.max(1, examTopics.length),
      questionCount,
      successRate,
      weeklyHours: Math.round(examSessions.reduce((sum, session) => sum + session.minutes, 0) / 60),
      focus: examTopics[0]?.title ?? "Veri girisi bekleniyor",
      nextMilestone: examTopics.find((topic) => topic.reviewDue)?.title ?? "Yeni milestone ekle",
    };
  });
}

function buildStudyAreas(exams: ExamSummary[]): ExamCardSummary[] {
  const accentMap: Record<ExamId, string> = {
    hmgs: "from-fuchsia-500 via-violet-500 to-indigo-500",
    yds: "from-cyan-500 via-sky-500 to-blue-500",
    kpss: "from-amber-500 via-orange-500 to-rose-500",
  };

  return exams.map((exam) => ({
    examId: exam.id,
    exam: exam.name,
    title: `${exam.name} canli takip`,
    accent: accentMap[exam.id],
    progress: exam.progress,
    questionCount: exam.questionCount,
    successRate: exam.successRate,
    summary: `${exam.completedTopics}/${exam.totalTopics} konu takipte.`,
    helper: exam.nextMilestone,
  }));
}

function buildReviewItems(topics: TopicEntry[]): TopicReviewItem[] {
  return topics
    .filter((topic) => topic.reviewDue)
    .map((topic) => ({
      exam: topic.exam,
      topic: topic.title,
      dueLabel: topic.nextReview || "Bugun",
      reason: topic.note || "Tekrar zamani geldi",
      priority: topic.progress < 55 ? "Yuksek" : topic.progress < 75 ? "Orta" : "Dusuk",
    }));
}

function buildHistory(
  topics: TopicEntry[],
  sessions: StudySession[],
  tasks: StudyTask[],
  goals: Goal[],
  mockExams: MockExamEntry[],
): HistoryItem[] {
  return [
    ...sessions.map((session) => ({
      id: `history-session-${session.id}`,
      title: `${session.exam} seansi`,
      description: `${session.topicName} • ${session.minutes} dk • %${session.accuracy}`,
      type: "session" as const,
      createdAt: session.createdAt,
      exam: session.exam,
    })),
    ...tasks.map((task) => ({
      id: `history-task-${task.id}`,
      title: `${task.exam} gorevi`,
      description: `${task.title} • ${task.status}`,
      type: "task" as const,
      createdAt: task.createdAt,
      exam: task.exam,
    })),
    ...goals.map((goal) => ({
      id: `history-goal-${goal.id}`,
      title: `${goal.exam} hedefi`,
      description: `${goal.title} • %${goal.progress}`,
      type: "goal" as const,
      createdAt: goal.createdAt,
      exam: goal.exam,
    })),
    ...mockExams.map((exam) => ({
      id: `history-exam-${exam.id}`,
      title: `${exam.exam} denemesi`,
      description: `${exam.title} • ${exam.net} net`,
      type: "exam" as const,
      createdAt: exam.createdAt,
      exam: exam.exam,
    })),
    ...topics.map((topic) => ({
      id: `history-topic-${topic.id}`,
      title: `${topic.exam} konusu`,
      description: `${topic.title} • %${topic.successRate} basari • ${topic.category}`,
      type: "topic" as const,
      createdAt: topic.updatedAt,
      exam: topic.exam,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function buildInsights(topics: TopicEntry[], mockExams: MockExamEntry[], goals: Goal[]): DashboardInsight[] {
  const weakest = [...topics].sort((a, b) => a.successRate - b.successRate)[0];
  const latestExam = [...mockExams].sort((a, b) => b.date.localeCompare(a.date))[0];
  const riskGoalCount = goals.filter((goal) => goal.status === "Riskli").length;

  return [
    {
      id: "insight-1",
      title: "Tekrar baskisi",
      body: `${topics.filter((topic) => topic.reviewDue).length} konu tekrar bekliyor.`,
      tone: "warning",
      metric: `${topics.filter((topic) => topic.reviewDue).length} tekrar`,
    },
    {
      id: "insight-2",
      title: "Zayif alan",
      body: weakest ? `${weakest.title} basari orani %${weakest.successRate}.` : "Veri yok.",
      tone: weakest && weakest.successRate < 65 ? "warning" : "info",
      metric: weakest ? `%${weakest.successRate}` : "0",
    },
    {
      id: "insight-3",
      title: "Deneme yorumu",
      body: latestExam ? `${latestExam.title} denemesi ${latestExam.net} net.` : "Deneme verisi yok.",
      tone: latestExam && latestExam.net >= 70 ? "good" : "info",
      metric: latestExam ? `${latestExam.net} net` : "0",
    },
    {
      id: "insight-4",
      title: "Hedef baskisi",
      body:
        riskGoalCount > 0
          ? `${riskGoalCount} hedef riskte, planner tarafinda aksiyon gerekebilir.`
          : "Hedefler izlenebilir bantta.",
      tone: riskGoalCount > 0 ? "warning" : "good",
      metric: `${riskGoalCount} riskli`,
    },
  ];
}

function buildMockNetSeries(mockExams: MockExamEntry[]): MockNetPoint[] {
  return [...mockExams]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((exam) => ({
      label: new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit" }).format(new Date(exam.date)),
      hmgs: exam.exam === "HMGS" ? exam.net : 0,
      yds: exam.exam === "YDS" ? exam.net : 0,
      kpss: exam.exam === "KPSS" ? exam.net : 0,
    }));
}

function buildWrongReasons(mockExams: MockExamEntry[]): WrongReason[] {
  const counts = new Map<string, number>();
  for (const exam of mockExams) {
    const key = exam.wrongReason || "Belirsiz";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, value]) => ({ label, value, note: "Deneme notlarindan uretilir." }));
}

function buildTopicDistribution(topics: TopicEntry[]): TopicDistributionItem[] {
  return [
    { name: "Guclu", value: topics.filter((topic) => topic.successRate >= 75).length },
    { name: "Gelisiyor", value: topics.filter((topic) => topic.successRate >= 60 && topic.successRate < 75).length },
    { name: "Zayif", value: topics.filter((topic) => topic.successRate < 60).length },
    { name: "Tekrar", value: topics.filter((topic) => topic.reviewDue).length },
  ];
}

function buildRadarStats(exams: ExamSummary[]): RadarStat[] {
  return [
    { subject: "Ilerleme", hmgs: exams[0]?.progress ?? 0, yds: exams[1]?.progress ?? 0, kpss: exams[2]?.progress ?? 0 },
    { subject: "Basari", hmgs: exams[0]?.successRate ?? 0, yds: exams[1]?.successRate ?? 0, kpss: exams[2]?.successRate ?? 0 },
    {
      subject: "Soru Hacmi",
      hmgs: Math.min(100, (exams[0]?.questionCount ?? 0) / 15),
      yds: Math.min(100, (exams[1]?.questionCount ?? 0) / 15),
      kpss: Math.min(100, (exams[2]?.questionCount ?? 0) / 15),
    },
  ];
}

export function buildDerivedState(input: {
  profile: ProfileData;
  topics: TopicEntry[];
  resources: SubjectResource[];
  sessions: StudySession[];
  tasks: StudyTask[];
  goals: Goal[];
  mockExams: MockExamEntry[];
}) {
  const exams = buildExamSummaries(input.topics, input.sessions);
  const studyAreas = buildStudyAreas(exams);
  const reviewItems = buildReviewItems(input.topics);
  const history = buildHistory(input.topics, input.sessions, input.tasks, input.goals, input.mockExams);
  const insights = buildInsights(input.topics, input.mockExams, input.goals);
  const mockNetSeries = buildMockNetSeries(input.mockExams);
  const wrongReasons = buildWrongReasons(input.mockExams);
  const topicDistribution = buildTopicDistribution(input.topics);
  const radarStats = buildRadarStats(exams);

  const totalSolvedQuestions =
    input.topics.reduce((sum, topic) => sum + topic.questionCount, 0) +
    input.sessions.reduce((sum, session) => sum + session.questionCount, 0);

  const dashboard: DashboardSnapshot = {
    kpis: {
      studyHours: Math.round(input.sessions.reduce((sum, session) => sum + session.minutes, 0) / 60),
      averageNet:
        input.mockExams.length > 0
          ? input.mockExams.reduce((sum, exam) => sum + exam.net, 0) / input.mockExams.length
          : 0,
      completedTasks: input.tasks.filter((task) => task.completed).length,
      motivationScore: Math.min(98, 55 + input.profile.streakDays * 3),
    },
    focusInsight: insights[0]?.body ?? "Veri girildikce sistem yorumlari burada olusacak.",
    quickInsights: insights.map((insight) => insight.metric),
    energyStatus: input.sessions[0]?.mood === "Harika" ? "Enerji yuksek" : "Enerji dengeli",
    strengthWeakness: exams.map((exam) => ({
      exam: exam.name,
      label: exam.focus,
      summary:
        exam.successRate >= 75
          ? "Bu alanda veri guclu, tempoyu koruyabilirsin."
          : "Bu alan daha fazla tekrar ve kaynak destegi istiyor.",
      type: exam.successRate >= 75 ? "strong" : "weak",
    })),
    totalSolvedQuestions,
    dueReviews: reviewItems.length,
  };

  return {
    dashboard,
    exams,
    studyAreas,
    reviewItems,
    mockNetSeries,
    history,
    activityLog: history,
    insights,
    generatedInsights: insights,
    streakDays: input.profile.streakDays,
    motivationMessage: `${input.profile.dailyGoalHours} saat hedefini koru; sistem bugun kisa ama kaliteli bloklari oneriyor.`,
    wrongReasons,
    topicDistribution,
    radarStats,
  };
}

export const portalData = { nav: navItems };
