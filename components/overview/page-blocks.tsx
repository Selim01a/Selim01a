"use client";

import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Brain,
  CalendarRange,
  Database,
  Flag,
  LineChart as LineChartIcon,
  Settings2,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { GoalForm } from "@/components/forms/goal-form";
import { ProfileForm } from "@/components/forms/profile-form";
import { MockExamForm } from "@/components/data-entry/mock-exam-form";
import { StudySessionForm } from "@/components/data-entry/study-session-form";
import { TaskForm } from "@/components/data-entry/task-form";
import { TopicResourceForm } from "@/components/data-entry/topic-resource-form";
import { HistoryTimeline } from "@/components/history/history-timeline";
import { InsightSummary } from "@/components/history/insight-summary";
import { SourceLibrary } from "@/components/history/source-library";
import { NetChartCard } from "@/components/overview/net-chart-card";
import { TaskListCard } from "@/components/overview/task-list-card";
import { ViewSwitcher } from "@/components/overview/view-switcher";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getGoalTone } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";
import type { ExamId } from "@/lib/types";

const pieColors = ["#22c55e", "#38bdf8", "#f59e0b", "#ef4444"];

function HeroModule({
  icon: Icon,
  title,
  description,
  eyebrow,
  stats,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  eyebrow: string;
  stats: Array<{ label: string; value: string; helper: string }>;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
      <div className="mb-8 space-y-3">
        <Badge className="bg-emerald-500/10 text-emerald-200">{eyebrow}</Badge>
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/10 p-3 text-emerald-300">
            <Icon className="h-6 w-6" />
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-slate-950/40 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-400">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ModuleOverview({ examId }: { examId: ExamId }) {
  const topics = usePortalStore((state) => state.getExamTopics(examId));
  const areas = usePortalStore((state) => state.getExamAreas(examId));
  const resources = usePortalStore((state) => state.getExamResources(examId));
  const sessions = usePortalStore((state) => state.getExamSessions(examId));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Konu takibi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
              {topics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{topic.title}</p>
                    <p className="text-xs text-slate-400">{topic.exam}</p>
                  </div>
                  <Badge className="bg-white/10 text-slate-200">
                    %{topic.accuracy} basari
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={topic.progress} />
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{topic.solvedQuestions} soru</span>
                    <span>{topic.nextReviewAt || "Planlanmadi"}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Kaynaklar ve seanslar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Kaynak sayisi</p>
              <p className="mt-2 text-3xl font-semibold text-white">{resources.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-sm text-slate-400">Kayitli calisma seansi</p>
              <p className="mt-2 text-3xl font-semibold text-white">{sessions.length}</p>
            </div>
            <div className="grid gap-3">
              {areas.map((area) => (
                <div
                  key={area.name}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">{area.name}</span>
                    <span className="text-sm text-slate-400">%{area.progress}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ModuleResources({ examId }: { examId: ExamId }) {
  const topics = usePortalStore((state) => state.getExamTopics(examId));
  const resources = usePortalStore((state) => state.getExamResources(examId));

  return (
    <div className="space-y-6">
      <TopicResourceForm examId={examId} />
      <SourceLibrary resources={resources} />
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Kaynaklanan konular</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
              {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
                  <p className="font-medium text-white">{topic.title}</p>
              <p className="mt-2 text-sm text-slate-400">
                    Son tekrar: {topic.lastStudiedAt || "Henuz yok"} • Sonraki: {topic.nextReviewAt || "Planlanmadi"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleHistory({ examId }: { examId: ExamId }) {
  const history = usePortalStore((state) => state.filteredHistory(examId));
  const insights = usePortalStore((state) => state.generatedInsights);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <HistoryTimeline items={history} />
      <InsightSummary insights={insights} />
    </div>
  );
}

function ModuleAnalysis({ examId }: { examId: ExamId }) {
  const mockSeries = usePortalStore((state) => state.mockNetSeries);
  const reviewItems = usePortalStore((state) =>
    state.reviewItems.filter((item) => item.exam === examId.toUpperCase()),
  );
  const insights = usePortalStore((state) => state.generatedInsights);

  return (
    <div className="space-y-6">
      <NetChartCard
        title="Sinav bazli net trendi"
        description="Kullanici girdisiyle olusan deneme hareketi."
        data={mockSeries}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Tekrar odaklari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewItems.map((item) => (
              <div
                key={`${item.exam}-${item.topic}`}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <p className="font-medium text-white">{item.topic}</p>
                <p className="mt-2 text-sm text-slate-400">
                  {item.reason} • {item.dueLabel}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <InsightSummary insights={insights} />
      </div>
    </div>
  );
}

function ExamPage({
  examId,
  icon,
  title,
  description,
}: {
  examId: ExamId;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  const view = usePortalStore((state) => state.viewPreferences[examId]);
  const setViewPreference = usePortalStore((state) => state.setViewPreference);
  const topics = usePortalStore((state) => state.getExamTopics(examId));
  const resources = usePortalStore((state) => state.getExamResources(examId));
  const sessions = usePortalStore((state) => state.getExamSessions(examId));

  return (
    <div className="space-y-6">
      <HeroModule
        icon={icon}
        title={title}
        description={description}
        eyebrow={`${examId.toUpperCase()} modul`}
        stats={[
          { label: "Takip edilen konu", value: String(topics.length), helper: "Kullanici tarafindan eklenir" },
          { label: "Kaynak", value: String(resources.length), helper: "Konuya bagli kutuphane" },
          { label: "Seans", value: String(sessions.length), helper: "Gecmise dusen kayitlar" },
        ]}
      />

      <ViewSwitcher
        value={view}
        onChange={(value) => setViewPreference(examId, value as never)}
        options={[
          { value: "overview", label: "Genel" },
          { value: "tracking", label: "Takip" },
          { value: "resources", label: "Kaynaklar" },
          { value: "history", label: "Gecmis" },
        ]}
      />

      {view === "overview" ? <ModuleOverview examId={examId} /> : null}
      {view === "tracking" ? <ModuleAnalysis examId={examId} /> : null}
      {view === "resources" ? <ModuleResources examId={examId} /> : null}
      {view === "history" ? <ModuleHistory examId={examId} /> : null}
    </div>
  );
}

export function HmgsPageContent() {
  return (
    <ExamPage
      examId="hmgs"
      icon={ShieldCheck}
      title="HMGS"
      description="Hukuk dersleri icin detayli konu ilerleme, kaynak, tekrar ve gecmis kaydi yonetimi."
    />
  );
}

export function YdsPageContent() {
  return (
    <ExamPage
      examId="yds"
      icon={BookOpen}
      title="YDS"
      description="Kelime, grammar, reading ve soru tipi performansini veri girerek takip et."
    />
  );
}

export function KpssPageContent() {
  return (
    <ExamPage
      examId="kpss"
      icon={Flag}
      title="KPSS"
      description="Turkce, matematik, tarih, cografya ve vatandaslikta kaynakli ve gecmisli takip."
    />
  );
}

export function PlannerPageContent() {
  const view = usePortalStore((state) => state.viewPreferences.planner);
  const setViewPreference = usePortalStore((state) => state.setViewPreference);
  const tasks = usePortalStore((state) => state.tasks);
  const sessions = usePortalStore((state) => state.sessions);
  const history = usePortalStore((state) => state.filteredHistory());
  const insights = usePortalStore((state) => state.generatedInsights);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={CalendarRange}
        title="Planner"
        description="Planlarini ekle, calisma oturumlarini kaydet, gecmisi incele ve sistem yorumlarini takip et."
        eyebrow="Interaktif planlama"
        stats={[
          { label: "Gorev", value: String(tasks.length), helper: "Tamamlandikca gecmise yazilir" },
          { label: "Oturum", value: String(sessions.length), helper: "Calisma gechmisi" },
          { label: "Icgoru", value: String(insights.length), helper: "Verilerin yorumlanmis hali" },
        ]}
      />

      <ViewSwitcher
        value={view}
        onChange={(value) => setViewPreference("planner", value as never)}
        options={[
          { value: "overview", label: "Genel" },
          { value: "input", label: "Veri girisi" },
          { value: "history", label: "Gecmis" },
          { value: "insights", label: "Yorumlar" },
        ]}
      />

      {view === "overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <TaskListCard
            title="Aktif plan"
            description="Gorevlerini tamamla ve tarihsel akista gor."
          />
          <HistoryTimeline items={history.slice(0, 8)} />
        </div>
      ) : null}

      {view === "input" ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <TaskForm />
          <StudySessionForm />
        </div>
      ) : null}

      {view === "history" ? <HistoryTimeline items={history} /> : null}
      {view === "insights" ? <InsightSummary insights={insights} /> : null}
    </div>
  );
}

export function ExamAttemptsPage() {
  const history = usePortalStore((state) => state.filteredHistory());
  const mockExams = usePortalStore((state) => state.mockExams);
  const series = usePortalStore((state) => state.mockNetSeries);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={LineChartIcon}
        title="Deneme Takibi"
        description="Kendi girdigin denemeleri zaman icinde karsilastir ve notlarini sakla."
        eyebrow="Deneme kayitlari"
        stats={[
          { label: "Toplam deneme", value: String(mockExams.length), helper: "Kullanici girdileri" },
          { label: "Son net", value: mockExams[0] ? String(mockExams[0].net) : "0", helper: "En guncel deneme" },
          { label: "Gecmis hareket", value: String(history.length), helper: "Zaman cizelgesi olusur" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <MockExamForm />
        <InsightSummary />
      </div>

      <NetChartCard
        title="Canli deneme trendi"
        description="Eklenen denemelerden uretilen grafik."
        data={series}
      />
    </div>
  );
}

export function TopicTrackingPage() {
  const topics = usePortalStore((state) => state.topics);
  const resources = usePortalStore((state) => state.resources);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={BookOpenCheck}
        title="Konu Takibi"
        description="Konularini ve onlara bagli kaynaklari kendin yonet; sistem tekrar ve zayif alanlari yorumlasin."
        eyebrow="Konu + kaynak"
        stats={[
          { label: "Konu", value: String(topics.length), helper: "Takip ettigin toplam konu" },
          { label: "Kaynak", value: String(resources.length), helper: "Eklenen kaynak kutuphanesi" },
          { label: "Tekrar", value: String(topics.filter((t) => Boolean(t.nextReviewAt)).length), helper: "Yaklasan tekrar" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopicResourceForm />
        <SourceLibrary resources={resources} />
      </div>
    </div>
  );
}

export function WrongAnalysisPage() {
  const wrongReasons = usePortalStore((state) => state.wrongReasons);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Brain}
        title="Yanlis Analizi"
        description="Girilmis deneme ve seanslardan hata nedenlerini gormeni saglar."
        eyebrow="Yorumlu analiz"
        stats={[
          { label: "Neden sayisi", value: String(wrongReasons.length), helper: "Otomatik dagitim" },
          { label: "En yuksek", value: wrongReasons[0]?.label ?? "-", helper: "Su an en baskin hata tipi" },
          { label: "Aksiyon", value: "Tekrar + kaynak", helper: "Sistem onerisi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Yanlis neden dagilimi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wrongReasons}>
                <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="#94a3b8" />
                <YAxis tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "16px",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <InsightSummary />
      </div>
    </div>
  );
}

export function GoalManagementPage() {
  const goals = usePortalStore((state) => state.goals);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Target}
        title="Hedef Yonetimi"
        description="Kendi hedeflerini ekle, sistem ilerleme ve risk durumunu yorumlasin."
        eyebrow="Hedefler"
        stats={[
          { label: "Aktif hedef", value: String(goals.length), helper: "Toplam aktif hedef" },
          { label: "Rayinda", value: String(goals.filter((g) => g.status === "Rayinda").length), helper: "Saglikli ilerleme" },
          { label: "Riskli", value: String(goals.filter((g) => g.status === "Riskli").length), helper: "Aksiyon gerekebilir" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Hedef listesi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{goal.exam}</p>
                    <p className="font-medium text-white">{goal.title}</p>
                  </div>
                  <Badge variant={getGoalTone(goal.status)}>{goal.status}</Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <Progress value={goal.progress} />
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>%{goal.progress} ilerleme</span>
                    <span>{goal.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <GoalForm />
      </div>
    </div>
  );
}

export function StatisticsPage() {
  const topicDistribution = usePortalStore((state) => state.topicDistribution);
  const radarStats = usePortalStore((state) => state.radarStats);
  const dashboard = usePortalStore((state) => state.dashboard);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={BarChart3}
        title="Istatistikler"
        description="Tum kullanici girdileri uzerinden olusan grafik ve ozetler."
        eyebrow="Analitik"
        stats={[
          { label: "Toplam soru", value: String(dashboard.totalSolvedQuestions), helper: "Canli hesaplanir" },
          { label: "Haftalik saat", value: String(dashboard.kpis.studyHours), helper: "Oturumlardan uretilir" },
          { label: "Tamamlanan gorev", value: String(dashboard.kpis.completedTasks), helper: "Planner verisi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Konu dagilimi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={4}
                >
                  {topicDistribution.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(2, 6, 23, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "16px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Sinav dengesi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarStats}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
                <PolarRadiusAxis stroke="#64748b" />
                <Radar dataKey="hmgs" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} />
                <Radar dataKey="yds" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} />
                <Radar dataKey="kpss" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.14} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProfileSettingsPage() {
  const profile = usePortalStore((state) => state.profile);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Settings2}
        title="Profil / Ayarlar"
        description="Kisisel hedeflerini, odak modunu ve bildirim ayarlarini guncelle."
        eyebrow="Profil"
        stats={[
          { label: "Odak modu", value: profile.focusMode, helper: "Aktif senaryo" },
          { label: "Gunluk hedef", value: `${profile.dailyGoalHours} saat`, helper: "Kullanici tercihi" },
          { label: "Haftalik hedef", value: profile.weeklyGoal, helper: "Ana hedef cizgisi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Profil ozeti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Ad", profile.name],
              ["E-posta", profile.email],
              ["Universite", profile.university],
              ["Sinav penceresi", profile.targetExamWindow],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-1 text-white">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <ProfileForm />
      </div>
    </div>
  );
}

export function DataCenterPage() {
  const history = usePortalStore((state) => state.filteredHistory());

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Database}
        title="Veri Merkezi"
        description="Tum veri girislerini tek yerden yonet; gorev, oturum, deneme ve konu kaydi ekle."
        eyebrow="Input hub"
        stats={[
          { label: "Gorev girisi", value: "Aktif", helper: "Planner ile senkron" },
          { label: "Deneme girisi", value: "Aktif", helper: "Grafiklere islenir" },
          { label: "Gecmis", value: String(history.length), helper: "Tum hareketlerin zaman akisi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TaskForm />
        <StudySessionForm />
        <MockExamForm />
        <TopicResourceForm />
      </div>
    </div>
  );
}
