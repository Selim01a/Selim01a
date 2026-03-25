"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { MockNetPoint } from "@/lib/types";

type NetChartCardProps = {
  title: string;
  description: string;
  data: MockNetPoint[];
};

export function NetChartCard({ title, description, data }: NetChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <SectionHeader title={title} description={description} className="border-0 bg-transparent p-0" />
      </CardHeader>
      <CardContent className="h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "rgba(2, 6, 23, 0.95)",
                border: "1px solid rgba(148, 163, 184, 0.2)",
                borderRadius: "16px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="hmgs" stroke="#a855f7" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="yds" stroke="#06b6d4" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="kpss" stroke="#f59e0b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
