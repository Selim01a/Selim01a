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
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type {
  ExamArea,
  ExamId,
  ExamTopic,
  HistoryItem,
  InsightItem,
  StudySession,
  StudyTask,
  TopicResource,
} from "@/lib/types";
import { getGoalTone, getPriorityTone, getStatusTone } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";

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

function TopicGrid({
  title,
  description,
  topics,
  resources,
}: {
  title: string;
  description: string;
  topics: ExamTopic[];
  resources: TopicResource[];
}) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <SectionHeader title={title} description={description} className="border-0 bg-transparent p-0" />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => {
          const topicResources = resources.filter((resource) => resource.topicId === topic.id);

          return (
            <div
              key={topic.id}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{topic.name}</p>
                  <p className="text-xs text-slate-400">{topic.exam}</p>
                </div>
                <Badge className={getStatusTone(topic.status)}>{topic.status}</Badge>
              </div>
              <div className="space-y-3">
                <Progress value={topic.progress} />
                <div className="grid grid-cols-3 gap-3 text-xs text-slate-300">
                  <div>
                    <p className="text-slate-500">Ilerleme</p>
                    <p className="mt-1 font-semibold text-white">%{topic.progress}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Soru</p>
                    <p className="mt-1 font-semibold text-white">{topic.questionCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Kaynak</p>
                    <p className="mt-1 font-semibold text-white">{topicResources.length}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Son tekrar: {topic.lastReview} • Sonraki tekrar: {topic.nextReview}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function CompactAreaGrid({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: ExamArea[];
}) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <SectionHeader title={title} description={description} className="border-0 bg-transparent p-0" />
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-white">{item.name}</p>
              <Badge className="bg-white/10 text-slate-200">{item.focus}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-400">{item.summary}</p>
            <div className="mt-4 space-y-3">
              <Progress value={item.progress} />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>%{item.progress} ilerleme</span>
                <span>%{item.successRate} basari</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SessionFeed({ sessions }: { sessions: StudySession[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Calisma seanslari</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.slice(0, 5).map((session) => (
          <div
            key={session.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{session.title}</p>
                <p className="text-xs text-slate-400">
                  {session.exam} • {session.minutes} dk • {session.date}
                </p>
              </div>
              <Badge className="bg-cyan-500/10 text-cyan-100">{session.mood}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-400">{session.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TopicHistoryBlock({
  history,
  insights,
}: {
  history: HistoryItem[];
  insights: InsightItem[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <HistoryTimeline items={history} />
      <InsightSummary insights={insights} />
    </div>
  );
}

function InteractivePlannerBlock({ tasks, sessions }: { tasks: StudyTask[]; sessions: StudySession[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <TaskForm />
        <StudySessionForm />
        <TaskListCard
          title="Plan ve gorev takibi"
          description="Kendi girdigin gorevleri tamamla, durumunu degistir ve ilerle."
          tasks={tasks}
        />
      </div>
      <SessionFeed sessions={sessions} />
    </div>
  );
}

function ResourceManagementBlock({ topics, resources }: { topics: ExamTopic[]; resources: TopicResource[] }) {
  return (
    <div className="space-y-6">
      <TopicResourceForm topics={topics} />
      <SourceLibrary resources={resources} />
    </div>
  );
}

function ProgressAnalysisBlock({
  title,
  data,
  radarData,
}: {
  title: string;
  data: Array<{ label: string; hmgs: number; yds: number; kpss: number }>;
  radarData: Array<{ subject: string; hmgs: number; yds: number; kpss: number }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <NetChartCard
        title={title}
        description="Kullanicinin girdigi deneme ve calisma verilerinden olusan trendler."
        data={data}
      />
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Alan dengesi</CardTitle>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(148,163,184,0.2)" />
              <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
              <PolarRadiusAxis stroke="#64748b" />
              <Radar dataKey="hmgs" stroke="#a855f7" fill="#a855f7" fillOpacity={0.18} />
              <Radar dataKey="yds" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} />
              <Radar dataKey="kpss" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
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
  const {
    getExamTopics,
    getExamAreas,
    getExamResources,
    getExamSessions,
    filteredHistory,
    generatedInsights,
    dashboard,
    profile,
  } = usePortalStore();

  const topics = getExamTopics(examId);
  const areas = getExamAreas(examId);
  const resources = getExamResources(examId);
  const sessions = getExamSessions(examId);

  return (
    <div className="space-y-6">
      <HeroModule
        icon={icon}
        title={title}
        description={description}
        eyebrow={`${profile.focusMode} • ${examId.toUpperCase()} takip`}
        stats={[
          { label: "Konu", value: String(topics.length), helper: "Kullanici tarafindan takip edilen aktif baslik" },
          { label: "Kaynak", value: String(resources.length), helper: "Eklenen ders notu, video ve kitap kaynagi" },
          { label: "Seans", value: String(sessions.length), helper: "Gecmiste kaydedilen calisma oturumu" },
        ]}
      />

      <ViewSwitcher
        title="Gorunum sec"
        views={[
          {
            id: "overview",
            label: "Genel gorunum",
            content: (
              <div className="space-y-6">
                <CompactAreaGrid
                  title="Alan bazli gorunum"
                  description="Performans ve odak alanlari"
                  items={areas}
                />
                <TopicGrid
                  title="Konu takibi"
                  description="Kullanici girdilerine gore olusan konu ve kaynak ekosistemi"
                  topics={topics}
                  resources={resources}
                />
              </div>
            ),
          },
          {
            id: "resources",
            label: "Kaynaklar",
            content: <ResourceManagementBlock topics={topics} resources={resources} />,
          },
          {
            id: "history",
            label: "Gecmis",
            content: (
              <TopicHistoryBlock
                history={filteredHistory(examId.toUpperCase() as "HMGS" | "YDS" | "KPSS")}
                insights={generatedInsights.filter((item) => item.exam === examId.toUpperCase())}
              />
            ),
          },
          {
            id: "analysis",
            label: "Yorum",
            content: (
              <ProgressAnalysisBlock
                title={`${title} performans trendi`}
                data={dashboard.mockNetSeries}
                radarData={dashboard.radarStats}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export function PlannerPageContent() {
  const { tasks, sessions, dashboard, filteredHistory, generatedInsights, topics, resources } =
    usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={CalendarRange}
        title="Planner"
        description="Kullanici verileriyle ilerleyen, plan, seans, gecmis ve yorum katmanlarini birlestiren planlama merkezi."
        eyebrow="Planlama"
        stats={[
          { label: "Bekleyen gorev", value: String(tasks.filter((task) => !task.completed).length), helper: "Bugun ve yakin odak bloklari" },
          { label: "Seans", value: String(sessions.length), helper: "Kaydedilen toplam calisma oturumu" },
          { label: "Seri", value: `${dashboard.streakDays} gun`, helper: "Tamamlanan gun devam dizisi" },
        ]}
      />

      <ViewSwitcher
        title="Planner modlari"
        views={[
          {
            id: "plan",
            label: "Plan + veri girisi",
            content: <InteractivePlannerBlock tasks={tasks} sessions={sessions} />,
          },
          {
            id: "history",
            label: "Gecmis",
            content: (
              <TopicHistoryBlock
                history={filteredHistory("all")}
                insights={generatedInsights}
              />
            ),
          },
          {
            id: "resources",
            label: "Konu kaynaklari",
            content: <ResourceManagementBlock topics={topics} resources={resources} />,
          },
        ]}
      />
    </div>
  );
}

export function ExamAttemptsPage() {
  const { mockExams, dashboard, generatedInsights, filteredHistory } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={LineChartIcon}
        title="Deneme Takibi"
        description="Kullanici deneme sonuclarini girer, sistem trendlere ve zayif alanlara gore yorum uretir."
        eyebrow="Deneme Intelligence"
        stats={[
          { label: "Toplam deneme", value: String(mockExams.length), helper: "Elle girilen deneme kayitlari" },
          { label: "Ortalama net", value: dashboard.averageNet.toFixed(1), helper: "Tum denemeler ortalamasi" },
          { label: "Insight", value: String(generatedInsights.length), helper: "Veri tabanli otomatik yorum" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <MockExamForm />
        <InsightSummary insights={generatedInsights} />
      </div>

      <ProgressAnalysisBlock
        title="Net trendi"
        data={dashboard.mockNetSeries}
        radarData={dashboard.radarStats}
      />

      <HistoryTimeline items={filteredHistory("all").filter((item) => item.type === "exam")} />
    </div>
  );
}

export function TopicTrackingPage() {
  const { topics, resources, generatedInsights, filteredHistory } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={BookOpenCheck}
        title="Konu Takibi"
        description="Konularini ekle, durumlarini guncelle, kaynak bagla ve tekrar ihtiyaclarini sistemin yorumlamasina izin ver."
        eyebrow="Topic Control"
        stats={[
          { label: "Aktif konu", value: String(topics.length), helper: "Kullanici tarafindan acilan konu havuzu" },
          { label: "Kaynak", value: String(resources.length), helper: "Konuya bagli kaynak kutuphaneleri" },
          { label: "Gecmis", value: String(filteredHistory("all").length), helper: "Degisiklik ve calisma kaydi" },
        ]}
      />

      <ViewSwitcher
        title="Konu merkezi"
        views={[
          {
            id: "topics",
            label: "Konu + kaynak",
            content: (
              <div className="space-y-6">
                <TopicResourceForm topics={topics} />
                <TopicGrid
                  title="Tum konular"
                  description="Durum, ilerleme, soru adedi ve bagli kaynaklar"
                  topics={topics}
                  resources={resources}
                />
                <SourceLibrary resources={resources} />
              </div>
            ),
          },
          {
            id: "history",
            label: "Gecmis",
            content: (
              <TopicHistoryBlock
                history={filteredHistory("all").filter((item) => item.type === "topic")}
                insights={generatedInsights}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export function WrongAnalysisPage() {
  const { dashboard, generatedInsights } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Brain}
        title="Yanlis Analizi"
        description="Kullanici girdigi deneme, seans ve konu verileri sistem tarafindan guclu-zayif alan yorumuna donusturulur."
        eyebrow="Root Cause"
        stats={[
          { label: "Zayif alan", value: String(dashboard.strengthWeakness.filter((item) => item.type === "weak").length), helper: "Otomatik tespit edilen riskli bolgeler" },
          { label: "Guclu alan", value: String(dashboard.strengthWeakness.filter((item) => item.type === "strong").length), helper: "Korunmasi gereken alanlar" },
          { label: "Insight", value: String(generatedInsights.length), helper: "Tum yorum katmani" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Yanlis neden dagilimi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboard.wrongReasonSeries}>
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

        <InsightSummary insights={generatedInsights} />
      </div>
    </div>
  );
}

export function GoalManagementPage() {
  const { goals } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Target}
        title="Hedef Yonetimi"
        description="Kullanici hedeflerini olculur sekilde ekler, sistem ilerleme durumu ve riski yorumlar."
        eyebrow="Targeting"
        stats={[
          { label: "Aktif hedef", value: String(goals.length), helper: "Kullanici tanimli hedefler" },
          { label: "Rayinda", value: String(goals.filter((goal) => goal.status === "Rayinda").length), helper: "Momentum korunan hedefler" },
          { label: "Riskli", value: String(goals.filter((goal) => goal.status === "Riskli").length), helper: "Dikkat isteyen basliklar" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Hedef portfoyu</CardTitle>
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
                <p className="mt-3 text-xs text-slate-400">Termin: {goal.deadline}</p>
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
  const { dashboard } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={BarChart3}
        title="Istatistikler"
        description="Girilen tum seans, gorev, deneme ve konu verilerini yorumlanabilir grafiklere donusturur."
        eyebrow="Analytics"
        stats={[
          { label: "Toplam saat", value: `${dashboard.totalStudyHours.toFixed(1)} sa`, helper: "Kaydedilen seanslardan hesaplandi" },
          { label: "Toplam soru", value: String(dashboard.totalSolvedQuestions), helper: "Konu ve deneme verilerinden toplandi" },
          { label: "Motivasyon", value: String(dashboard.motivationScore), helper: "Son aktivite ve seri bazli skor" },
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
                  data={dashboard.topicDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={4}
                >
                  {dashboard.topicDistribution.map((entry, index) => (
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
            <CardTitle className="text-white">Alan dengesi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={dashboard.radarStats}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="subject" stroke="#cbd5e1" />
                <PolarRadiusAxis stroke="#64748b" />
                <Radar dataKey="hmgs" stroke="#a855f7" fill="#a855f7" fillOpacity={0.18} />
                <Radar dataKey="yds" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.18} />
                <Radar dataKey="kpss" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ProfileSettingsPage() {
  const { profile, generatedInsights } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Settings2}
        title="Profil / Ayarlar"
        description="Kullanici hedef penceresi, odak modu ve haftalik hedefler burada yonetilir."
        eyebrow="Preferences"
        stats={[
          { label: "Aktif mod", value: profile.focusMode, helper: "Yorum motorunun agirliklandirmasi buna gore ayarlanir" },
          { label: "Gunluk hedef", value: `${profile.dailyGoalHours} saat`, helper: "Seans yorumlarinda kullanilir" },
          { label: "Insight", value: String(generatedInsights.length), helper: "Veri yorum sayisi" },
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
              ["Haftalik hedef", profile.weeklyGoal],
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

export function HmgsPageContent() {
  return (
    <ExamPage
      examId="hmgs"
      icon={ShieldCheck}
      title="HMGS"
      description="Hukuk derslerine konu bazli kaynak, seans, deneme ve gecmis takibi ekleyerek daha gercek bir sistemle ilerle."
    />
  );
}

export function YdsPageContent() {
  return (
    <ExamPage
      examId="yds"
      icon={BookOpen}
      title="YDS"
      description="Kelime, grammar, reading ve soru tipi calismalarini veri girerek izle; sistem tekrar ve zayif alan yorumlari uretsin."
    />
  );
}

export function KpssPageContent() {
  return (
    <ExamPage
      examId="kpss"
      icon={Flag}
      title="KPSS"
      description="Turkce, matematik, tarih, cografya, vatandaslik ve guncel bilgiler icin kullanici odakli konu ve kaynak takibi."
    />
  );
}

export function DataCenterPage() {
  const { topics, resources, tasks, sessions, mockExams, generatedInsights } = usePortalStore();

  return (
    <div className="space-y-6">
      <HeroModule
        icon={Database}
        title="Veri Giris Merkezi"
        description="Tum sistemi statik panelden cikarip gercek calisma komuta merkezine donusturen veri katmani."
        eyebrow="Data Input"
        stats={[
          { label: "Gorev", value: String(tasks.length), helper: "Elle tanimlanan plan" },
          { label: "Seans", value: String(sessions.length), helper: "Gecmiste yapilan calisma" },
          { label: "Insight", value: String(generatedInsights.length), helper: "Sistem yorumlari" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <TaskForm />
        <StudySessionForm />
        <MockExamForm />
        <TopicResourceForm topics={topics} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SourceLibrary resources={resources} />
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Veri ozetleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              `Toplam konu: ${topics.length}`,
              `Toplam kaynak: ${resources.length}`,
              `Toplam deneme: ${mockExams.length}`,
              `Toplam gorev: ${tasks.length}`,
              `Toplam seans: ${sessions.length}`,
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300"
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
