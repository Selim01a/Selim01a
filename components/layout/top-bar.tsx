"use client";

import { Bell, Flame, Search, Sparkles } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePortalStore } from "@/store/portal-store";

export function TopBar() {
  const { examFilter, setExamFilter, streakDays, profile } = usePortalStore();

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          Premium sinav komuta merkezi
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Hos geldin
          </p>
          <h2 className="text-2xl font-semibold text-white">
            {profile.name}, bugun odakli ilerlemeyi tek panelden yonet.
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:min-w-[440px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-10"
            placeholder="Konu, gorev, deneme veya tekrar ara..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(["all", "HMGS", "YDS", "KPSS"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setExamFilter(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                examFilter === value
                  ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
              }`}
            >
              {value === "all" ? "Tum sinavlar" : value}
            </button>
          ))}

          <Badge variant="outline" className="gap-2 px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            {streakDays} gun seri
          </Badge>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            <Bell className="h-4 w-4" />
          </button>

          <Avatar>
            <AvatarFallback>{profile.avatarFallback}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
