"use client";

import {
  Activity,
  ArrowUpRight,
  BrainCircuit,
  Flame,
  Radar,
  Sparkles,
  Target,
} from "lucide-react";

import { InsightCard } from "@/components/overview/insight-card";
import { MetricCard } from "@/components/overview/metric-card";
import { NetChartCard } from "@/components/overview/net-chart-card";
import { ProgressRing } from "@/components/overview/progress-ring";
import { StudyAreaCard } from "@/components/overview/study-area-card";
import { TaskListCard } from "@/components/overview/task-list-card";
import { TopicReviewCard } from "@/components/overview/topic-review-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { portalData } from "@/lib/mock-data";
import { usePortalStore } from "@/store/portal-store";

export function DashboardPage() {
  const { streakDays, motivationMessage } = usePortalStore();

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Genel Dashboard"
        title="Bugunun premium komuta merkezi"
        description="HMGS + YDS + KPSS hazirligini tek panelde birlestiren veri odakli, modern ve yuksek sinyal ureten calisma merkezi."
        action={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-slate-200">
            <Flame className="h-4 w-4 text-amber-300" />
            {streakDays} gunluk seri
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Haftalik odak saati"
          value={`${portalData.dashboard.kpis.studyHours} saat`}
          description="Planlanan saat hedefinin buyuk kismi tamamlandi."
          trendLabel="+6.2%"
          icon={Activity}
        />
        <MetricCard
          title="Ortalama deneme neti"
          value={portalData.dashboard.kpis.averageNet.toFixed(1)}
          description="Son sekiz denemenin agirlikli ortalamasi."
          trendLabel="+3.8 net"
          icon={ArrowUpRight}
        />
        <MetricCard
          title="Tamamlanan gorev"
          value={`${portalData.dashboard.kpis.completedTasks}/${portalData.tasks.length}`}
          description="Bugun planner ve tekrar listesinde biten gorevler."
          trendLabel="%75 oran"
          icon={Target}
        />
        <MetricCard
          title="Motivasyon skoru"
          value={portalData.dashboard.kpis.motivationScore.toString()}
          description={motivationMessage}
          trendLabel="+12 puan"
          icon={Sparkles}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/80">
                  Sinav kapsama alani
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Uclu sinav dominasyonu
                </h2>
              </div>
              <Badge variant="secondary">Premium analytics</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {portalData.exams.map((exam) => (
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

        <InsightCard
          title="Komuta ozeti"
          description={portalData.dashboard.focusInsight}
          bullets={portalData.dashboard.quickInsights}
          footer={`${portalData.dashboard.energyStatus} • En verimli pencere 19:30 - 22:00`}
          icon={Radar}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <NetChartCard
          title="Deneme net trendi"
          description="HMGS, YDS ve KPSS net momentumunu tek grafikte izle."
          data={portalData.mockNets}
        />
        <TaskListCard
          title="Bugunun operasyon listesi"
          description="Plan bloklari, tekrarlar ve analiz adimlari."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {portalData.studyAreas.map((area) => (
          <StudyAreaCard key={area.examId} area={area} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <TopicReviewCard
          title="Tekrar zamani gelen konular"
          description="Spaced repetition mantigina gore gecikmeden tamamlanmasi gereken basliklar."
          items={portalData.reviewItems}
        />
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-violet-200/80">
                  Guc haritasi
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Guclu ve zayif alan analizi
                </h3>
              </div>
              <BrainCircuit className="h-5 w-5 text-violet-200" />
            </div>

            <div className="space-y-4">
              {portalData.dashboard.strengthWeakness.map((item) => (
                <div
                  key={`${item.exam}-${item.label}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">{item.exam}</p>
                      <h4 className="text-lg font-semibold text-white">{item.label}</h4>
                    </div>
                    <Badge variant={item.type === "strong" ? "success" : "warning"}>
                      {item.type === "strong" ? "Guclu Alan" : "Gelistir"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{item.summary}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
