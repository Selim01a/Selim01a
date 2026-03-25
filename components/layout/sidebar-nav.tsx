"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  Database,
  Flag,
  LayoutDashboard,
  LineChart,
  ListChecks,
  Settings,
  ShieldCheck,
  Target,
  TrendingDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { portalData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const iconMap = {
  dashboard: LayoutDashboard,
  hmgs: ShieldCheck,
  yds: BookOpen,
  kpss: Flag,
  planner: CalendarCheck2,
  exam: LineChart,
  topic: ListChecks,
  wrong: TrendingDown,
  goal: Target,
  stats: BarChart3,
  profile: Settings,
  data: Database,
};

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 border-r border-white/10 bg-slate-950/85 px-5 py-6 backdrop-blur xl:block">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Premium</p>
          <h1 className="mt-2 text-xl font-semibold text-white">Sinav Komuta Merkezi</h1>
        </div>
        <Badge variant="secondary">2026</Badge>
      </div>

      <nav className="space-y-2">
        {portalData.nav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all",
                isActive
                  ? "border-cyan-400/30 bg-cyan-400/10 text-white shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                  : "border-transparent bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isActive ? "bg-cyan-400/15 text-cyan-300" : "bg-white/5 text-slate-400 group-hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">{item.title}</span>
              {item.badge ? <Badge variant="outline">{item.badge}</Badge> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
