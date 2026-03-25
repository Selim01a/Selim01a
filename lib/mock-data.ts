"use client";

import type {
  ExamArea,
  ExamSummary,
  ExamTopic,
  Goal,
  MockExam,
  MockNetPoint,
  PlannerBoardData,
  PortalData,
  ProfileData,
  ReadingPerformance,
  TopicReviewItem,
  TopicTrackingItem,
  StudyArea,
  StudyTask,
  WrongReason,
  WordReview,
} from "@/lib/types";

const exams: ExamSummary[] = [
  {
    id: "hmgs",
    name: "HMGS",
    description: "Hukuk dersleri, detayli konu takibi ve tekrar sistemi",
    progress: 74,
    completedTopics: 58,
    totalTopics: 78,
    questionCount: 4860,
    successRate: 81,
    weeklyHours: 23,
    focus: "Medeni hukuk + idare tekrar senkronu",
    nextMilestone: "Ceza genel hukumler denemesi",
  },
  {
    id: "yds",
    name: "YDS",
    description: "Kelime tekrar, grammar, reading ve soru tipi analizi",
    progress: 67,
    completedTopics: 34,
    totalTopics: 51,
    questionCount: 2210,
    successRate: 73,
    weeklyHours: 11,
    focus: "Reading inference ve vocabulary retention",
    nextMilestone: "Akademik reading sprint 05",
  },
  {
    id: "kpss",
    name: "KPSS",
    description: "Genel yetenek-genel kultur icin veri odakli ilerleme takibi",
    progress: 62,
    completedTopics: 43,
    totalTopics: 69,
    questionCount: 3175,
    successRate: 70,
    weeklyHours: 15,
    focus: "Tarih tekrar backlog'unu eritmek",
    nextMilestone: "Genel yetenek karma deneme",
  },
];

const nav: PortalData["nav"] = [
  { title: "Genel Dashboard", href: "/dashboard", icon: "layout-dashboard" },
  { title: "HMGS", href: "/hmgs", icon: "scale", badge: "Hukuk" },
  { title: "YDS", href: "/yds", icon: "languages", badge: "Dil" },
  { title: "KPSS", href: "/kpss", icon: "landmark", badge: "Kamu" },
  { title: "Planner", href: "/planner", icon: "calendar-days" },
  { title: "Deneme Takibi", href: "/deneme-takibi", icon: "line-chart" },
  { title: "Konu Takibi", href: "/konu-takibi", icon: "book-copy" },
  { title: "Yanlis Analizi", href: "/yanlis-analizi", icon: "triangle-alert" },
  { title: "Hedef Yonetimi", href: "/hedef-yonetimi", icon: "target" },
  { title: "Istatistikler", href: "/istatistikler", icon: "bar-chart-3" },
  { title: "Profil / Ayarlar", href: "/profil", icon: "settings-2" },
];

const studyAreas: StudyArea[] = [
  {
    examId: "hmgs",
    title: "HMGS premium takip",
    progress: 74,
    solvedQuestions: 4860,
    targetQuestions: 6800,
    successRate: 81,
    summary:
      "Hukuk fakultesi son sinif temposuna uygun sekilde konu, soru ve tekrar dongusu birlikte izleniyor.",
    recommendation: "Idare hukuku ve ceza ozel hukumler icin mini sprint planla.",
  },
  {
    examId: "yds",
    title: "YDS language lab",
    progress: 67,
    solvedQuestions: 2210,
    targetQuestions: 3400,
    successRate: 73,
    summary:
      "Kelime retention guclu; reading inference ve paragraph completion alanlari ekstra takipte.",
    recommendation: "Kelime tekrarlarini reading bloklarinin hemen onune koy.",
  },
  {
    examId: "kpss",
    title: "KPSS command grid",
    progress: 62,
    solvedQuestions: 3175,
    targetQuestions: 5200,
    successRate: 70,
    summary:
      "Turkce ve vatandaslik stabil; tarih ve guncel bilgiler tarafinda hizli tekrar gerekiyor.",
    recommendation: "Haftada iki tarih mikro tekrar seansi ekle.",
  },
];

const mockNets: MockNetPoint[] = [
  { label: "D1", hmgs: 61, yds: 48, kpss: 54 },
  { label: "D2", hmgs: 64, yds: 50, kpss: 57 },
  { label: "D3", hmgs: 68, yds: 52, kpss: 59 },
  { label: "D4", hmgs: 71, yds: 55, kpss: 61 },
  { label: "D5", hmgs: 74, yds: 57, kpss: 64 },
  { label: "D6", hmgs: 76, yds: 59, kpss: 66 },
];

const reviewItems: TopicReviewItem[] = [
  {
    exam: "HMGS",
    topic: "Borclar Hukuku - Kusursuz sorumluluk",
    dueLabel: "Bugun",
    reason: "Son iki denemede hata yogunlugu artti",
    priority: "Yuksek",
  },
  {
    exam: "YDS",
    topic: "Academic Vocabulary Set 12",
    dueLabel: "Yarin",
    reason: "Hatirlama egrisi dusmeye basladi",
    priority: "Orta",
  },
  {
    exam: "KPSS",
    topic: "Tarih - Tanzimat ve Islahat fermani",
    dueLabel: "2 gun sonra",
    reason: "Kronoloji zinciri kiriliyor",
    priority: "Yuksek",
  },
  {
    exam: "HMGS",
    topic: "Idare Hukuku - Idari islem unsurlari",
    dueLabel: "3 gun sonra",
    reason: "Tekrar penceresi acik",
    priority: "Dusuk",
  },
];

const tasks: StudyTask[] = [
  {
    id: "task-1",
    title: "HMGS medeni hukuk 60 soru + 20 dk tekrar",
    exam: "HMGS",
    duration: 95,
    status: "Planlandi",
    priority: "high",
    completed: false,
  },
  {
    id: "task-2",
    title: "YDS 40 kelime tekrar + 2 reading passage",
    exam: "YDS",
    duration: 75,
    status: "Devam ediyor",
    priority: "medium",
    completed: false,
  },
  {
    id: "task-3",
    title: "KPSS tarih tekrar kartlari",
    exam: "KPSS",
    duration: 45,
    status: "Tamamlandi",
    priority: "high",
    completed: true,
  },
  {
    id: "task-4",
    title: "Yanlis analizi notlarini temizle",
    exam: "Genel",
    duration: 35,
    status: "Planlandi",
    priority: "low",
    completed: false,
  },
];

const hmgsTopics: ExamTopic[] = [
  {
    id: "hmgs-1",
    exam: "HMGS",
    name: "Anayasa Hukuku",
    progress: 82,
    questionCount: 740,
    successRate: 84,
    reviewDue: false,
    lastReview: "2 gun once",
    nextReview: "4 gun sonra",
  },
  {
    id: "hmgs-2",
    exam: "HMGS",
    name: "Medeni Hukuk",
    progress: 88,
    questionCount: 910,
    successRate: 86,
    reviewDue: false,
    lastReview: "Dun",
    nextReview: "5 gun sonra",
  },
  {
    id: "hmgs-3",
    exam: "HMGS",
    name: "Borclar Hukuku",
    progress: 73,
    questionCount: 645,
    successRate: 78,
    reviewDue: true,
    lastReview: "6 gun once",
    nextReview: "Bugun",
  },
  {
    id: "hmgs-4",
    exam: "HMGS",
    name: "Ceza Hukuku",
    progress: 67,
    questionCount: 590,
    successRate: 74,
    reviewDue: true,
    lastReview: "5 gun once",
    nextReview: "Yarin",
  },
];

const ydsTopics: ExamTopic[] = [
  {
    id: "yds-1",
    exam: "YDS",
    name: "Vocabulary",
    progress: 79,
    questionCount: 1260,
    successRate: 81,
    reviewDue: false,
    lastReview: "Bugun",
    nextReview: "Yarin",
  },
  {
    id: "yds-2",
    exam: "YDS",
    name: "Grammar",
    progress: 68,
    questionCount: 420,
    successRate: 73,
    reviewDue: false,
    lastReview: "2 gun once",
    nextReview: "3 gun sonra",
  },
  {
    id: "yds-3",
    exam: "YDS",
    name: "Reading",
    progress: 63,
    questionCount: 310,
    successRate: 66,
    reviewDue: true,
    lastReview: "4 gun once",
    nextReview: "Bugun",
  },
  {
    id: "yds-4",
    exam: "YDS",
    name: "Question Types",
    progress: 57,
    questionCount: 220,
    successRate: 64,
    reviewDue: true,
    lastReview: "5 gun once",
    nextReview: "Yarin",
  },
];

const kpssTopics: ExamTopic[] = [
  {
    id: "kpss-1",
    exam: "KPSS",
    name: "Turkce",
    progress: 72,
    questionCount: 560,
    successRate: 77,
    reviewDue: false,
    lastReview: "2 gun once",
    nextReview: "4 gun sonra",
  },
  {
    id: "kpss-2",
    exam: "KPSS",
    name: "Matematik",
    progress: 66,
    questionCount: 610,
    successRate: 71,
    reviewDue: false,
    lastReview: "Dun",
    nextReview: "3 gun sonra",
  },
  {
    id: "kpss-3",
    exam: "KPSS",
    name: "Tarih",
    progress: 54,
    questionCount: 530,
    successRate: 63,
    reviewDue: true,
    lastReview: "7 gun once",
    nextReview: "Bugun",
  },
  {
    id: "kpss-4",
    exam: "KPSS",
    name: "Vatandaslik",
    progress: 76,
    questionCount: 505,
    successRate: 79,
    reviewDue: false,
    lastReview: "3 gun once",
    nextReview: "4 gun sonra",
  },
  {
    id: "kpss-5",
    exam: "KPSS",
    name: "Cografya",
    progress: 58,
    questionCount: 420,
    successRate: 67,
    reviewDue: false,
    lastReview: "2 gun once",
    nextReview: "5 gun sonra",
  },
  {
    id: "kpss-6",
    exam: "KPSS",
    name: "Guncel Bilgiler",
    progress: 43,
    questionCount: 120,
    successRate: 61,
    reviewDue: true,
    lastReview: "8 gun once",
    nextReview: "Yarin",
  },
];

const hmgsAreas: ExamArea[] = [
  {
    name: "Medeni Hukuk",
    focus: "Net kazanimi",
    progress: 88,
    successRate: 86,
    summary: "Temel kavramlar ve soru hizi guclu.",
  },
  {
    name: "Ceza Hukuku",
    focus: "Karar kalitesi",
    progress: 67,
    successRate: 74,
    summary: "Kusurluluk ve tesebbuste mini tekrar gerekli.",
  },
  {
    name: "Idare Hukuku",
    focus: "Tekrar sistemi",
    progress: 61,
    successRate: 69,
    summary: "Notlar daginik, tekrar penceresi optimize edilmeli.",
  },
];

const ydsAreas: ExamArea[] = [
  {
    name: "Vocabulary",
    focus: "Retention",
    progress: 79,
    successRate: 81,
    summary: "Kelime tekrar mantigi iyi calisiyor.",
  },
  {
    name: "Grammar",
    focus: "Dogruluk",
    progress: 68,
    successRate: 73,
    summary: "Baglaclar ve tense gecisleri izleniyor.",
  },
  {
    name: "Reading",
    focus: "Inference",
    progress: 63,
    successRate: 66,
    summary: "Paragraf ici iliski kurma sorulari zayif halka.",
  },
];

const kpssAreas: ExamArea[] = [
  {
    name: "Turkce",
    focus: "Stabil performans",
    progress: 72,
    successRate: 77,
    summary: "Paragraf ve anlam bilgisi dengeli.",
  },
  {
    name: "Tarih",
    focus: "Backlog temizligi",
    progress: 54,
    successRate: 63,
    summary: "Kronoloji ve kavram ciftleri zayif.",
  },
  {
    name: "Vatandaslik",
    focus: "Koruma fazi",
    progress: 76,
    successRate: 79,
    summary: "Mini tekrarlarla netler korunuyor.",
  },
];

const hmgsTrials: MockExam[] = [
  { id: "hmgs-t1", exam: "HMGS", date: "10 Mar", net: 68, accuracy: 76, duration: 136 },
  { id: "hmgs-t2", exam: "HMGS", date: "17 Mar", net: 72, accuracy: 79, duration: 133 },
  { id: "hmgs-t3", exam: "HMGS", date: "24 Mar", net: 76, accuracy: 81, duration: 129 },
];

const ydsTrials: MockExam[] = [
  { id: "yds-t1", exam: "YDS", date: "08 Mar", net: 52, accuracy: 69, duration: 172 },
  { id: "yds-t2", exam: "YDS", date: "16 Mar", net: 56, accuracy: 72, duration: 168 },
  { id: "yds-t3", exam: "YDS", date: "22 Mar", net: 59, accuracy: 74, duration: 164 },
];

const kpssTrials: MockExam[] = [
  { id: "kpss-t1", exam: "KPSS", date: "09 Mar", net: 58, accuracy: 72, duration: 124 },
  { id: "kpss-t2", exam: "KPSS", date: "18 Mar", net: 63, accuracy: 75, duration: 121 },
  { id: "kpss-t3", exam: "KPSS", date: "20 Mar", net: 66, accuracy: 77, duration: 118 },
];

const plannerSlots: PlannerBoardData["daily"] = [
  { slot: "07:30", title: "YDS kelime tekrar", duration: "30 dk", focus: "Aktif recall" },
  { slot: "09:00", title: "HMGS medeni hukuk konu + 60 soru", duration: "120 dk", focus: "Derin calisma" },
  { slot: "13:30", title: "KPSS tarih hizli tekrar", duration: "45 dk", focus: "Mikro tekrar" },
  { slot: "18:00", title: "Deneme analizi", duration: "60 dk", focus: "Analitik blok" },
];

const planner: PlannerBoardData = {
  daily: plannerSlots,
  weeklySummary: [
    { label: "Planlanan odak", value: "42 saat" },
    { label: "Tamamlanan blok", value: "18 / 24" },
    { label: "Bekleyen tekrar", value: "18 konu" },
    { label: "Deneme hedefi", value: "3 / 4" },
  ],
};

const wrongReasons: WrongReason[] = [
  { label: "Bilgi eksigi", value: 34, note: "Ozellikle KPSS tarih ve HMGS idare hukukunda." },
  { label: "Dikkat kaybi", value: 23, note: "Uzun bloklarin son 20 sorusunda artis var." },
  { label: "Soru kokunu yanlis okuma", value: 18, note: "YDS reading ve HMGS ayrim sorularinda goruluyor." },
  { label: "Zaman baskisi", value: 15, note: "Deneme sonlarinda karar kalitesi dusuyor." },
  { label: "Yanlis strateji", value: 10, note: "Secenek eleme sureci yeterince disiplinli degil." },
];

const goals: Goal[] = [
  {
    id: "goal-1",
    title: "HMGS netini 80+ bandina tasimak",
    exam: "HMGS",
    progress: 76,
    target: "80 net",
    deadline: "Nisan sonu",
    status: "Rayinda",
  },
  {
    id: "goal-2",
    title: "YDS reading accuracy %80",
    exam: "YDS",
    progress: 68,
    target: "%80 accuracy",
    deadline: "3 haftalik sprint",
    status: "Izlenmeli",
  },
  {
    id: "goal-3",
    title: "KPSS tarih tekrar backlog'unu sifirlamak",
    exam: "KPSS",
    progress: 42,
    target: "0 geciken tekrar",
    deadline: "Bu ay",
    status: "Riskli",
  },
];

const readingPerformance: ReadingPerformance[] = [
  { passageType: "Main idea", accuracy: 74, avgMinutes: 6.8, solved: 32 },
  { passageType: "Inference", accuracy: 61, avgMinutes: 8.1, solved: 28 },
  { passageType: "Paragraph completion", accuracy: 69, avgMinutes: 5.9, solved: 24 },
  { passageType: "Cloze test", accuracy: 72, avgMinutes: 7.2, solved: 20 },
];

const wordReviews: WordReview[] = [
  { word: "allege", familiarity: 82, dueInDays: 1, source: "Academic Set 08" },
  { word: "notwithstanding", familiarity: 68, dueInDays: 0, source: "Grammar Connectors" },
  { word: "constraint", familiarity: 74, dueInDays: 2, source: "Reading Sprint 03" },
  { word: "discern", familiarity: 59, dueInDays: 0, source: "Inference Vocabulary" },
];

const topicTracking: TopicTrackingItem[] = [
  { exam: "HMGS", topic: "Ceza Hukuku - Kusurluluk", completion: 64, status: "Gelisiyor", questionCount: 180 },
  { exam: "YDS", topic: "Reading - Main Idea", completion: 72, status: "Guclu", questionCount: 74 },
  { exam: "YDS", topic: "Reading - Inference", completion: 52, status: "Zayif", questionCount: 48 },
  { exam: "KPSS", topic: "Tarih - Islahat Fermani", completion: 48, status: "Zayif", questionCount: 36 },
  { exam: "HMGS", topic: "Medeni Hukuk - Miras", completion: 87, status: "Guclu", questionCount: 214 },
];

const profile: ProfileData = {
  name: "Selim Kaya",
  email: "selim.kaya@example.com",
  university: "Istanbul Universitesi Hukuk Fakultesi",
  targetExamWindow: "2026 yaz donemi",
  dailyGoalHours: 6,
  focusMode: "Dengeli",
  notificationLevel: "Standart",
  streakDays: 7,
  weeklyGoal: "42 saat odakli calisma ve 3 tam deneme",
  avatarFallback: "SK",
};

export const portalData: PortalData = {
  nav,
  exams,
  dashboard: {
    kpis: {
      studyHours: 36,
      averageNet: 67.4,
      completedTasks: 3,
      motivationScore: 91,
    },
    focusInsight:
      "HMGS medeni hukuk ivmesi yuksek, YDS inference sorulari zayif halka, KPSS tarih tekrar gecikmesi ise genel performans tavanini sinirliyor.",
    quickInsights: [
      "HMGS tarafinda son 3 denemede +8 net artis var.",
      "YDS kelime retention guclu ama reading inference %61'de.",
      "KPSS tarih tekrar backlog'u 8 gunden fazla gecikiyor.",
    ],
    energyStatus: "Aksam odak penceresi yuksek",
    strengthWeakness: [
      {
        exam: "HMGS",
        label: "Medeni Hukuk",
        summary: "Konu bitirme hizi ve soru dogrulugu premium bantta.",
        type: "strong",
      },
      {
        exam: "YDS",
        label: "Reading Inference",
        summary: "Paragraf ici iliski kurma ve secenek eleme kaslari zayif.",
        type: "weak",
      },
      {
        exam: "KPSS",
        label: "Vatandaslik",
        summary: "Kisa tekrarlarla netler stabil sekilde korunuyor.",
        type: "strong",
      },
      {
        exam: "KPSS",
        label: "Tarih Kronoloji",
        summary: "Olay-orgu zinciri ve tarih-surec baglari tekrar istiyor.",
        type: "weak",
      },
    ],
  },
  mockNets,
  studyAreas,
  reviewItems,
  tasks,
  hmgsTopics,
  ydsTopics,
  kpssTopics,
  hmgsAreas,
  ydsAreas,
  kpssAreas,
  hmgsTrials,
  ydsTrials,
  kpssTrials,
  planner,
  wrongReasons,
  goals,
  readingPerformance,
  wordReviews,
  topicTracking,
  profile,
};

