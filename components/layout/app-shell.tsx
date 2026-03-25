"use client";

import { ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopBar } from "@/components/layout/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-6 px-4 py-4 md:px-6 xl:px-8">
        <SidebarNav />
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-6">
          <TopBar />
          <main className="flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_30px_90px_rgba(8,15,28,0.45)] backdrop-blur-xl md:p-6 xl:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
