"use client";

import {
  Activity,
  BookOpenText,
  BrainCircuit,
  Flame,
  LineChart,
  Sparkles,
  Target,
} from "lucide-react";

import { HistoryTimeline } from "@/components/history/history-timeline";
import { InsightSummary } from "@/components/history/insight-summary";
import { MetricCard } from "@/components/overview/metric-card";
import { NetChartCard } from "@/components/overview/net-chart-card";
import { ProgressRing } from "@/components/overview/progress-ring";
import { StudyAreaCard } from "@/components/overview/study-area-card";
import { TaskListCard } from "@/components/overview/task-list-card";
import { TopicReviewCard } from "@/components/overview/topic-review-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortalStore } from "@/store/portal-store";

export function DashboardPage() {
  const dashboard = usePortalStore((state) => state.dashboard);
  const exams = usePortalStore((state) => state.exams);
  const studyAreas = usePortalStore((state) => state.studyAreas);
  const reviewItems = usePortalStore((state) => state.reviewItems);
  const mockNetSeries = usePortalStore((state) => state.mockNetSeries);
  const activityLog = usePortalStore((state) => state.activityLog);
  const streakDays = usePortalStore((state) => state.streakDays);
  const motivationMessage = usePortalStore((state) => state.motivationMessage);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Genel Dashboard"
        title="Canli sinav komuta merkezi"
        description="Kullanici girdileriyle ilerleyen, gecmisini tutan, kaynaklari yoneten ve calisma ritmini yorumlayan premium sistem."
        action={
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <Flame className="h-4 w-4 text-amber-300" />
            {streakDays} gun seri
          </Badge>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Haftalik odak saati"
          value={`${dashboard.kpis.studyHours} saat`}
          description="Calisma oturumlarindan hesaplanan canli saat."
          trendLabel={`${dashboard.quickInsights.length} aktif yorum`}
          icon={Activity}
        />
        <MetricCard
          title="Ortalama deneme neti"
          value={dashboard.kpis.averageNet.toFixed(1)}
          description="Girilen denemelere gore guncellenir."
          trendLabel={`${dashboard.dueReviews} tekrar bekliyor`}
          icon={LineChart}
        />
        <MetricCard
          title="Toplam soru hacmi"
          value={String(dashboard.totalSolvedQuestions)}
          description="Konu ve seans girisleriyle buyur."
          trendLabel={`${dashboard.kpis.completedTasks} gorev tamam`}
          icon={BookOpenText}
        />
        <MetricCard
          title="Motivasyon skoru"
          value={String(dashboard.kpis.motivationScore)}
          description={motivationMessage}
          trendLabel="Sistem yorumlu"
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
                  Sinav bazli ilerleme
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  HMGS + YDS + KPSS panoramasi
                </h2>
              </div>
              <Badge variant="secondary">Canli veri</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {exams.map((exam) => (
                <ProgressRing
                  key={exam.id}
                  value={exam.progress}
                  label={exam.name}
                  description={`${exam.completedTopics}/${exam.totalTopics} konu • ${exam.questionCount} soru`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <InsightSummary insights={usePortalStore.getState().generatedInsights} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NetChartCard
          title="Deneme net trendi"
          description="Kullanici tarafindan girilen deneme verilerine gore canli seri."
          data={mockNetSeries}
        />
        <TaskListCard title="Plan ve gorev akisi" description="Planlarini tamamladikca sistem gecmisi beslenir." />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {studyAreas.map((area) => (
          <StudyAreaCard key={`${area.exam}-${area.title}`} area={area} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopicReviewCard
          title="Tekrar zamani gelenler"
          description="Son seanslar ve konu basarisina gore hesaplanan tekrar listesi."
          items={reviewItems}
        />
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl border border-violet-400/20 bg-violet-400/10 p-2 text-violet-200">
                <BrainCircuit className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-violet-200/80">
                  Sistem yorumu
                </p>
                <h3 className="text-xl font-semibold text-white">Guclu ve zayif alanlar</h3>
              </div>
            </div>

            {dashboard.strengthWeakness.map((item) => (
              <div
                key={`${item.exam}-${item.label}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{item.exam}</p>
                    <h4 className="text-lg font-semibold text-white">{item.label}</h4>
                  </div>
                  <Badge variant={item.type === "strong" ? "success" : "warning"}>
                    {item.type === "strong" ? "Guclu" : "Gelistir"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-300">{item.summary}</p>
              </div>
            ))}

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <Target className="h-4 w-4" />
                Gunun odagi
              </div>
              {dashboard.focusInsight}
            </div>
          </CardContent>
        </Card>
      </div>

      <HistoryTimeline items={activityLog.slice(0, 8)} />
    </div>
  );
}
