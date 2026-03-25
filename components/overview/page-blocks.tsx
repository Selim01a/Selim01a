"use client";

import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Brain,
  CalendarRange,
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
import { NetChartCard } from "@/components/overview/net-chart-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { portalData } from "@/lib/mock-data";
import { getGoalTone, getPriorityTone } from "@/lib/utils";
import { usePortalStore } from "@/store/portal-store";
import type { ExamArea, ExamTopic, MockExam, TopicReviewItem } from "@/lib/types";

const pieColors = ["#22c55e", "#38bdf8", "#f59e0b", "#ef4444"];

export function HeroModule({
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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Badge className="bg-emerald-500/10 text-emerald-200">{eyebrow}</Badge>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="rounded-2xl bg-white/10 p-3 text-emerald-300">
                <Icon className="h-6 w-6" />
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-white/10 bg-slate-950/40 shadow-none backdrop-blur"
          >
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

export function TopicGrid({
  title,
  description,
  topics,
}: {
  title: string;
  description: string;
  topics: ExamTopic[];
}) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <SectionHeader
          title={title}
          description={description}
          className="border-0 bg-transparent p-0"
        />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-white">{topic.name}</p>
                <p className="text-xs text-slate-400">{topic.exam}</p>
              </div>
              <Badge
                className={
                  topic.reviewDue
                    ? "bg-amber-500/10 text-amber-200"
                    : "bg-emerald-500/10 text-emerald-200"
                }
              >
                {topic.reviewDue ? "Tekrar zamani" : "Rayinda"}
              </Badge>
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
                  <p className="text-slate-500">Basari</p>
                  <p className="mt-1 font-semibold text-white">%{topic.successRate}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Son tekrar: {topic.lastReview} • Sonraki tekrar: {topic.nextReview}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CompactAreaGrid({
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
        <SectionHeader
          title={title}
          description={description}
          className="border-0 bg-transparent p-0"
        />
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

function ExamTrendCard({
  title,
  description,
  exams,
}: {
  title: string;
  description: string;
  exams: MockExam[];
}) {
  const data = exams.map((exam, index) => ({
    label: exam.date,
    hmgs: exam.exam === "HMGS" ? exam.net : index === 0 ? 0 : exams[index - 1]?.net ?? 0,
    yds: exam.exam === "YDS" ? exam.net : index === 0 ? 0 : exams[index - 1]?.net ?? 0,
    kpss: exam.exam === "KPSS" ? exam.net : index === 0 ? 0 : exams[index - 1]?.net ?? 0,
  }));

  return <NetChartCard title={title} description={description} data={data} />;
}

function ReviewTimeline({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: TopicReviewItem[];
}) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <SectionHeader
          title={title}
          description={description}
          className="border-0 bg-transparent p-0"
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={`${item.exam}-${item.topic}`}
            className="flex items-start justify-between rounded-2xl border border-white/10 bg-slate-950/40 p-4"
          >
            <div>
              <p className="font-medium text-white">{item.topic}</p>
              <p className="mt-1 text-xs text-slate-400">
                {item.exam} • {item.reason}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-medium text-white">{item.dueLabel}</p>
              <p className="mt-1 text-slate-400">Oncelik: {item.priority}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TaskSnapshot({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <SectionHeader
          title={title}
          description={description}
          className="border-0 bg-transparent p-0"
        />
      </CardHeader>
      <CardContent className="space-y-3">
        {portalData.tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3"
          >
            <div>
              <p className="font-medium text-white">{task.title}</p>
              <p className="text-xs text-slate-400">
                {task.exam} • {task.duration} dk
              </p>
            </div>
            <Badge className={getPriorityTone(task.priority)}>{task.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PlannerPageContent() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={CalendarRange}
        title="Planner"
        description="Gunluk, haftalik ve aylik akisi gorev, odak bloklari ve tekrar temposuyla tek panelde yonet."
        eyebrow="Planlama"
        stats={[
          { label: "Bugun", value: "4 odak blok", helper: "2 tanesi derin calisma modunda" },
          { label: "Bu hafta", value: "41 saat", helper: "Planlanan toplam net odak suresi" },
          { label: "Aylik", value: "16 deneme", helper: "Dagitilmis sinav takvimi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Gunluk akis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {portalData.planner.daily.map((item) => (
              <div
                key={item.slot}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4"
              >
                <div>
                  <p className="text-sm text-slate-400">{item.slot}</p>
                  <p className="font-medium text-white">{item.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{item.duration}</p>
                  <p className="text-xs text-slate-400">{item.focus}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <TaskSnapshot
          title="Operasyon listesi"
          description="Planlanan ve aktif gorevlerin hizli gorunumu."
        />
      </div>
    </div>
  );
}

export function ExamAttemptsPage() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={LineChartIcon}
        title="Deneme Takibi"
        description="Sinav bazli deneme netleri, sure kullanimi ve basari oranindaki momentum degisimini takip et."
        eyebrow="Performans"
        stats={[
          { label: "Toplam deneme", value: "22", helper: "Son 8 haftaya yayilmis denemeler" },
          { label: "En yuksek net", value: "76", helper: "HMGS Premium Deneme 06" },
          { label: "Ortalama sure", value: "138 dk", helper: "Sure yonetimi stabil" },
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NetChartCard
          title="Sinav kulvarlarina gore net trendi"
          description="HMGS, YDS ve KPSS denemelerinde ilerleme bandi."
          data={portalData.mockNets}
        />
        <ReviewTimeline
          title="Deneme sonrasi odak alanlari"
          description="Son analizden cikan hizli aksiyon basliklari."
          items={portalData.reviewItems}
        />
      </div>
    </div>
  );
}

export function TopicTrackingPage() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={BookOpenCheck}
        title="Konu Takibi"
        description="Konu bazli ilerleme, soru hacmi, tekrar zamani ve zorluk durumunu premium tablo mantigiyla izle."
        eyebrow="Mastery"
        stats={[
          { label: "Takip edilen konu", value: "14", helper: "Uc sinava yayilmis aktif konu havuzu" },
          { label: "Tekrar bekleyen", value: "5", helper: "Onceligi yuksek odak listesi" },
          { label: "Mastery orani", value: "%68", helper: "Tamamlanan + rayinda konular" },
        ]}
      />

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Konu durum dagilimi</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {portalData.topicTracking.map((item) => (
            <div
              key={`${item.exam}-${item.topic}`}
              className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">{item.exam}</p>
                  <p className="font-medium text-white">{item.topic}</p>
                </div>
                <Badge className="bg-white/10 text-slate-200">{item.status}</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <Progress value={item.completion} />
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>%{item.completion} tamamlama</span>
                  <span>{item.questionCount} soru</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function WrongAnalysisPage() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={Brain}
        title="Yanlis Analizi"
        description="Yanlis nedenlerini sadece saymakla kalma; kok sebep, duzeltme aksiyonu ve zayif alan etkisini ayni anda gor."
        eyebrow="Root Cause"
        stats={[
          { label: "En kritik neden", value: "Bilgi eksigi", helper: "Ozellikle KPSS tarih ve HMGS idare" },
          { label: "Odak hatasi", value: "%23", helper: "Uzun bloklarin sonunda belirginlesiyor" },
          { label: "Strateji hatasi", value: "%10", helper: "Elenecek seceneklerde erken karar" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Yanlis neden dagilimi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portalData.wrongReasons}>
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

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Aciklamali analiz notlari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portalData.wrongReasons.map((reason) => (
              <div
                key={reason.label}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{reason.label}</p>
                  <Badge className="bg-white/10 text-slate-200">%{reason.value}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-400">{reason.note}</p>
              </div>
            ))}
          </CardContent>
        </Card>
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
        description="Net, tekrar backlog'u, calisma saati ve accuracy hedeflerini olculur metriklerle yonet."
        eyebrow="Targeting"
        stats={[
          { label: "Aktif hedef", value: `${goals.length}`, helper: "Sinav ve genel hedef karmasi" },
          {
            label: "Rayinda",
            value: `${goals.filter((g) => g.status === "Rayinda").length}`,
            helper: "Momentum korunan hedefler",
          },
          {
            label: "Riskli",
            value: `${goals.filter((g) => g.status === "Riskli").length}`,
            helper: "Aksiyon isteyen hedefler",
          },
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
  return (
    <div className="space-y-6">
      <HeroModule
        icon={BarChart3}
        title="Istatistikler"
        description="Tum sinav evreni icin veri odakli bakis: zaman kullanimi, net trendi, konu yayilimi ve isabet ritmi."
        eyebrow="Analytics"
        stats={[
          { label: "Toplam soru", value: "10.245", helper: "Uclu sinav ekosistemi genel hacmi" },
          { label: "Haftalik saat", value: "41.5", helper: "Ortalama odak suresi" },
          { label: "Enerji skoru", value: "84/100", helper: "Sureklilik ve motivasyon dengesi" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Konu dagilim pastasi</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portalData.topicDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={4}
                >
                  {portalData.topicDistribution.map((entry, index) => (
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
            <CardTitle className="text-white">Sinav bazli radar denge</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={portalData.radarStats}>
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
        description="Calisma ritmi, odak modu, gunluk hedefler ve kisisel dashboard tercihlerini yonet."
        eyebrow="Preferences"
        stats={[
          {
            label: "Aktif mod",
            value: profile.focusMode,
            helper: "Sinav agirligi bu moda gore dengeleniyor",
          },
          {
            label: "Gunluk hedef",
            value: `${profile.dailyGoalHours} saat`,
            helper: "Planner ve streak hesaplari buna gore kurulu",
          },
          {
            label: "Seri",
            value: `${profile.streakDays} gun`,
            helper: "Motivasyon bandi premium dashboarda yansiyor",
          },
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

export function HmgsPageContent() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={ShieldCheck}
        title="HMGS"
        description="Hukuk derslerini detayli konu ilerlemesi, soru hacmi, basari orani ve tekrar sistemiyle premium sekilde yonet."
        eyebrow="Hukuk Mastery"
        stats={[
          { label: "Toplam ilerleme", value: "%72", helper: "11 / 15 ana hukuk modulu aktif" },
          { label: "Soru havuzu", value: "4.860", helper: "Tamamlanan toplam HMGS soru sayisi" },
          { label: "Basari", value: "%79", helper: "Son 30 gun ortalama dogruluk" },
        ]}
      />
      <CompactAreaGrid
        title="Ders alanlari"
        description="HMGS hukuk eksenindeki ana kulvarlar."
        items={portalData.hmgsAreas}
      />
      <TopicGrid
        title="Detayli hukuk konu takibi"
        description="Konu ilerleme, soru sayisi, basari orani ve tekrar sisteminin birlesik gorunumu."
        topics={portalData.hmgsTopics}
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ExamTrendCard
          title="HMGS deneme netleri"
          description="Son denemelerde hukuk hakimiyetindeki artis."
          exams={portalData.hmgsTrials}
        />
        <ReviewTimeline
          title="HMGS tekrar zamani gelenler"
          description="Hukuk konularinda gecikmeden donulmesi gereken basliklar."
          items={portalData.reviewItems.filter((item) => item.exam === "HMGS")}
        />
      </div>
    </div>
  );
}

export function YdsPageContent() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={BookOpen}
        title="YDS"
        description="Kelime, grammar, reading ve soru tipi analizini kelime tekrar mantigi ve reading performans takibiyle birlestir."
        eyebrow="Language Intelligence"
        stats={[
          { label: "Kelime bankasi", value: "2.140", helper: "Tekrara dahil aktif kelime havuzu" },
          { label: "Reading accuracy", value: "%71", helper: "5 haftalik sprint sonrasi band" },
          { label: "Grammar bandi", value: "%73", helper: "Yukselen istikrar cizgisi" },
        ]}
      />

      <CompactAreaGrid
        title="YDS alan odaklari"
        description="Kelime, grammar, reading ve soru tiplerine gore denge."
        items={portalData.ydsAreas}
      />
      <TopicGrid
        title="YDS konu takibi"
        description="Vocabulary, grammar ve reading odaklarini soru tipi analiziyle izle."
        topics={portalData.ydsTopics}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Kelime tekrar mantigi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portalData.wordReviews.map((word) => (
              <div
                key={word.word}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{word.word}</p>
                  <Badge className="bg-cyan-500/10 text-cyan-200">
                    %{word.familiarity} tanisiklik
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Kaynak: {word.source} • Tekrar: {word.dueInDays} gun sonra
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Reading performans takibi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {portalData.readingPerformance.map((item) => (
              <div
                key={item.passageType}
                className="rounded-2xl border border-white/10 bg-slate-950/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{item.passageType}</p>
                  <Badge className="bg-white/10 text-slate-200">{item.solved} set</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">Accuracy</p>
                    <p className="font-semibold text-white">%{item.accuracy}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Ortalama sure</p>
                    <p className="font-semibold text-white">{item.avgMinutes} dk</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function KpssPageContent() {
  return (
    <div className="space-y-6">
      <HeroModule
        icon={Flag}
        title="KPSS"
        description="Turkce, matematik, tarih, cografya, vatandaslik ve guncel bilgiler icin konu ve deneme istatistiklerini ayni tabloda izle."
        eyebrow="Public Exam Control"
        stats={[
          { label: "Alan sayisi", value: "6", helper: "Genel yetenek + genel kultur dagilimi" },
          { label: "Toplam soru", value: "3.175", helper: "KPSS kulvarindaki cozulmus hacim" },
          { label: "Ortalama net", value: "66", helper: "Son premium deneme ortalamasi" },
        ]}
      />
      <CompactAreaGrid
        title="KPSS alanlari"
        description="Temel derslerin soru ve basari dengesini izle."
        items={portalData.kpssAreas}
      />
      <TopicGrid
        title="KPSS konu takibi"
        description="Konu ve deneme istatistiklerini detayli gorebilirsin."
        topics={portalData.kpssTopics}
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ExamTrendCard
          title="KPSS deneme trendi"
          description="Net bandi ve sure verimliligi zaman icinde."
          exams={portalData.kpssTrials}
        />
        <ReviewTimeline
          title="KPSS tekrar odaklari"
          description="Tarih ve guncel bilgiler icin oncelikli pencere."
          items={portalData.reviewItems.filter((item) => item.exam === "KPSS")}
        />
      </div>
    </div>
  );
}
