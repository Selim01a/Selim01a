"use client";

import {
  Activity,
  BookOpenText,
  BrainCircuit,
  Clock3,
  Flame,
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
import { ViewSwitcher } from "@/components/overview/view-switcher";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { usePortalStore } from "@/store/portal-store";

export function DashboardPage() {
  const dashboard = usePortalStore((state) => state.dashboard);
  const exams = usePortalStore((state) => state.exams);
  const studyAreas = usePortalStore((state) => state.studyAreas);
  const reviewItems = usePortalStore((state) => state.reviewItems);
  const taskCount = usePortalStore((state) => state.tasks.length);
  const streakDays = usePortalStore((state) => state.streakDays);
  const motivationMessage = usePortalStore((state) => state.motivationMessage);
  const mockNets = usePortalStore((state) => state.mockNetSeries);
  const activityLog = usePortalStore((state) => state.activityLog);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Genel Dashboard"
        title="Canli sinav komuta merkezi"
        description="Kullanici girdileriyle ilerleyen, gecmisini gosteren ve verileri yorumlayan premium calisma paneli."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="gap-2 px-4 py-2">
              <Flame className="h-4 w-4 text-amber-300" />
              {streakDays} gun seri
            </Badge>
            <ViewSwitcher />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Haftalik odak saati"
          value={`${dashboard.kpis.studyHours} saat`}
          description="Calisma oturumlarindan toplanan gercek veriler."
          trendLabel={`${dashboard.kpis.completedTasks} aktif tamamlanan gorev`}
          icon={Clock3}
        />
        <MetricCard
          title="Ortalama deneme neti"
          value={dashboard.kpis.averageNet.toFixed(1)}
          description="Kullanici tarafindan girilen denemeler baz aliniyor."
          trendLabel={`${dashboard.quickInsights.length} aktif icgoru`}
          icon={Activity}
        />
        <MetricCard
          title="Toplam soru hacmi"
          value={dashboard.totalSolvedQuestions.toString()}
          description="Konu, deneme ve oturum girdilerinden hesaplanir."
          trendLabel={`${dashboard.dueReviews} tekrar bekliyor`}
          icon={BookOpenText}
        />
        <MetricCard
          title="Motivasyon skoru"
          value={dashboard.kpis.motivationScore.toString()}
          description={motivationMessage}
          trendLabel={`${taskCount} gorev listede`}
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
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

        <InsightSummary />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <NetChartCard
          title="Deneme net trendi"
          description="Girilen denemelerden olusan zaman serisi."
          data={mockNets}
        />
        <TaskListCard
          title="Plan ve gorev akisi"
          description="Tamamlandikca dashboard ve gecmis kayitlari guncellenir."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {studyAreas.map((area) => (
          <StudyAreaCard key={area.examId} area={area} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopicReviewCard
          title="Tekrar zamani gelenler"
          description="Konu ilerleme ve son tekrar girislerine gore hesaplanir."
          items={reviewItems}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BrainCircuit className="h-5 w-5 text-violet-300" />
              Sistem yorumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                Yorumlanan hedef odagi
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
