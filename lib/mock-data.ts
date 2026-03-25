"use client";

import type {
  AppView,
  DashboardInsight,
  ExamId,
  Goal,
  MockExamEntry,
  NavItem,
  ProfileData,
  SourceLink,
  StudySession,
  StudyTask,
  TopicEntry,
} from "@/lib/types";

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "dashboard", badge: "Genel" },
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

export const appViews: AppView[] = [
  { id: "overview", label: "Genel Bakis", description: "Tum alanlari bir arada gor" },
  { id: "entry", label: "Veri Girisi", description: "Yeni calisma, deneme ve konu kaydi ekle" },
  { id: "history", label: "Gecmis", description: "Gecmise donuk tum hareketleri izle" },
  { id: "analysis", label: "Yorumlar", description: "Sistemin yorumladigi icgoruleri incele" },
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
    dueDate: "2026-03-25",
    notes: "60 soru + 20 dakika hata analizi",
  },
  {
    id: "task-2",
    title: "YDS kelime + reading mini set",
    exam: "YDS",
    duration: 70,
    status: "Devam ediyor",
    priority: "medium",
    completed: false,
    dueDate: "2026-03-25",
    notes: "40 kelime, 2 passage",
  },
  {
    id: "task-3",
    title: "KPSS tarih kronoloji tekrar",
    exam: "KPSS",
    duration: 45,
    status: "Tamamlandi",
    priority: "high",
    completed: true,
    dueDate: "2026-03-24",
    notes: "Kartlarla aktif recall",
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
    note: "Haftada 2 deneme + detayli yanlis analizi",
  },
  {
    id: "goal-2",
    title: "YDS reading accuracy %80",
    exam: "YDS",
    progress: 68,
    target: "%80 accuracy",
    deadline: "3 haftalik sprint",
    status: "Izlenmeli",
    note: "Inference ve paraphrase sorularina odaklan",
  },
];

export const initialSources: SourceLink[] = [
  {
    id: "source-1",
    exam: "HMGS",
    title: "Medeni Hukuk Ders Notlari",
    type: "pdf",
    url: "https://ornek-kaynak.local/medeni-hukuk",
    topicTitle: "Medeni Hukuk",
    note: "Temel kavram tekrarinda kullan",
  },
  {
    id: "source-2",
    exam: "YDS",
    title: "Academic Vocabulary Listesi",
    type: "doc",
    url: "https://ornek-kaynak.local/yds-vocab",
    topicTitle: "Vocabulary",
    note: "Her gun 20 yeni kelime",
  },
];

export const initialTopics: TopicEntry[] = [
  {
    id: "topic-1",
    exam: "HMGS",
    title: "Medeni Hukuk",
    category: "Hukuk Dersleri",
    progress: 88,
    questionCount: 910,
    successRate: 86,
    reviewDue: false,
    lastReview: "2026-03-24",
    nextReview: "2026-03-29",
    weaknessReason: "Yok",
    strengthNote: "Kavram oturdu, soru hizi yuksek",
    sourceIds: ["source-1"],
  },
  {
    id: "topic-2",
    exam: "HMGS",
    title: "Idare Hukuku",
    category: "Hukuk Dersleri",
    progress: 61,
    questionCount: 520,
    successRate: 69,
    reviewDue: true,
    lastReview: "2026-03-18",
    nextReview: "2026-03-25",
    weaknessReason: "Bilgi eksigi ve tekrar gecikmesi",
    strengthNote: "Idari islem unsurlari kismen oturdu",
    sourceIds: [],
  },
  {
    id: "topic-3",
    exam: "YDS",
    title: "Reading Inference",
    category: "Reading",
    progress: 54,
    questionCount: 120,
    successRate: 61,
    reviewDue: true,
    lastReview: "2026-03-20",
    nextReview: "2026-03-25",
    weaknessReason: "Secenek eleme ve baglam yorumu zayif",
    strengthNote: "Main idea sorulari daha stabil",
    sourceIds: [],
  },
  {
    id: "topic-4",
    exam: "KPSS",
    title: "Tarih Kronoloji",
    category: "Tarih",
    progress: 48,
    questionCount: 220,
    successRate: 63,
    reviewDue: true,
    lastReview: "2026-03-17",
    nextReview: "2026-03-25",
    weaknessReason: "Backlog buyumus, tekrar ritmi zayif",
    strengthNote: "Kavram bilgisi fena degil",
    sourceIds: [],
  },
];

export const initialSessions: StudySession[] = [
  {
    id: "session-1",
    exam: "HMGS",
    topicTitle: "Medeni Hukuk",
    date: "2026-03-23",
    duration: 110,
    questionCount: 80,
    correctCount: 66,
    wrongCount: 14,
    note: "Miras ve hak ehliyeti tekrar edildi",
    energy: 4,
  },
  {
    id: "session-2",
    exam: "YDS",
    topicTitle: "Reading Inference",
    date: "2026-03-24",
    duration: 70,
    questionCount: 24,
    correctCount: 15,
    wrongCount: 9,
    note: "Inference sorularinda baglam kaciyor",
    energy: 3,
  },
  {
    id: "session-3",
    exam: "KPSS",
    topicTitle: "Tarih Kronoloji",
    date: "2026-03-24",
    duration: 45,
    questionCount: 30,
    correctCount: 19,
    wrongCount: 11,
    note: "Tanzimat-Islahat zinciri tekrar edildi",
    energy: 3,
  },
];

export const initialMockExams: MockExamEntry[] = [
  {
    id: "mock-1",
    exam: "HMGS",
    title: "HMGS Premium Deneme 06",
    date: "2026-03-24",
    net: 76,
    accuracy: 81,
    duration: 129,
    wrongReason: "Bilgi eksigi",
    notes: "Idare ve cezada dikkat dususu oldu",
  },
  {
    id: "mock-2",
    exam: "YDS",
    title: "YDS Reading Sprint 04",
    date: "2026-03-22",
    net: 59,
    accuracy: 74,
    duration: 164,
    wrongReason: "Soru kokunu yanlis okuma",
    notes: "Inference ve paragraf tamamlama zayif",
  },
  {
    id: "mock-3",
    exam: "KPSS",
    title: "KPSS Genel Yetenek 05",
    date: "2026-03-20",
    net: 66,
    accuracy: 77,
    duration: 118,
    wrongReason: "Zaman baskisi",
    notes: "Matematik son blokta yavaslama var",
  },
];

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
  weeklyGoal: "42 saat odakli calisma ve 3 tam deneme",
};

export function examTitle(exam: ExamId | "Genel" | "all") {
  if (exam === "all") return "Tum Sinavlar";
  return exam;
}

export function deriveGoalStatus(progress: number): Goal["status"] {
  if (progress >= 70) return "Rayinda";
  if (progress >= 45) return "Izlenmeli";
  return "Riskli";
}

export function buildInsightMessages(input: {
  topics: TopicEntry[];
  sessions: StudySession[];
  mockExams: MockExamEntry[];
  goals: Goal[];
}): DashboardInsight[] {
  const overdueTopics = input.topics.filter((topic) => topic.reviewDue);
  const weakestTopic = [...input.topics].sort((a, b) => a.successRate - b.successRate)[0];
  const latestExam = [...input.mockExams].sort((a, b) => b.date.localeCompare(a.date))[0];
  const atRiskGoals = input.goals.filter((goal) => goal.status === "Riskli").length;

  return [
    {
      id: "insight-1",
      title: "Tekrar baskisi haritasi",
      body:
        overdueTopics.length > 0
          ? `${overdueTopics.length} konu tekrar bekliyor. En kritik baslik: ${overdueTopics[0]?.title}.`
          : "Geciken tekrar bulunmuyor, tekrar sistemi dengede.",
      tone: overdueTopics.length > 2 ? "warning" : "good",
      metric: `${overdueTopics.length} geciken tekrar`,
    },
    {
      id: "insight-2",
      title: "Zayif alan yorumu",
      body: weakestTopic
        ? `${weakestTopic.title} basari orani %${weakestTopic.successRate}. Sistem bu konuyu mini tekrar ve kaynak takviyesi gerektiren alan olarak isaretliyor.`
        : "Yeterli veri olusmadi.",
      tone: weakestTopic && weakestTopic.successRate < 65 ? "warning" : "info",
      metric: weakestTopic ? `%${weakestTopic.successRate}` : "Veri yok",
    },
    {
      id: "insight-3",
      title: "Deneme yorumu",
      body: latestExam
        ? `${latestExam.title} denemesinde net ${latestExam.net}. Ana hata nedeni: ${latestExam.wrongReason}.`
        : "Henuz deneme verisi girilmedi.",
      tone: latestExam && latestExam.net >= 70 ? "good" : "info",
      metric: latestExam ? `${latestExam.net} net` : "0 net",
    },
    {
      id: "insight-4",
      title: "Hedef takibi yorumu",
      body:
        atRiskGoals > 0
          ? `${atRiskGoals} hedef riskte. Planner tarafinda kisa vadeli aksiyonlar ayarlanmali.`
          : "Aktif hedeflerin tamami izlenebilir bantta ilerliyor.",
      tone: atRiskGoals > 0 ? "warning" : "good",
      metric: `${atRiskGoals} riskli hedef`,
    },
  ];
}
