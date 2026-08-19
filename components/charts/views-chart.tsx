"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartAxisDate } from "@/lib/format";
import { useFormatters } from "@/hooks/use-formatters";
import { useCssVariable } from "@/hooks/use-css-variable";
import { useTranslations } from "@/components/providers/locale-provider";
import type { ChartDataPoint } from "@/types";

interface ViewsChartProps {
  data: ChartDataPoint[];
  dataKey?: keyof ChartDataPoint;
  /** CSS variable name, e.g. "--chart-1" */
  colorVar?: string;
  height?: number;
  gradientId?: string;
}

export function ViewsChart({
  data,
  dataKey = "views",
  colorVar = "--chart-1",
  height = 260,
  gradientId = "viewsGradient",
}: ViewsChartProps) {
  const t = useTranslations();
  const { formatNumber, formatDate, locale } = useFormatters();
  const color = useCssVariable(colorVar, "#e05a4f");

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        date: point.isoDate
          ? formatChartAxisDate(point.isoDate, locale)
          : point.date,
      })),
    [data, locale]
  );

  const seriesLabels: Record<string, string> = {
    views: t("common.views"),
    likes: t("common.likes"),
    comments: t("common.comments"),
    engagement: t("common.engagement"),
    followers: t("common.followers"),
  };

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        {t("metrics.noDataForPeriod")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 4, right: 4, left: -12, bottom: 0 }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 6"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          dy={6}
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000
              ? `${formatNumber(Math.round(v / 1000))}K`
              : formatNumber(v)
          }
          width={36}
        />
        <Tooltip
          cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.4 }}
          contentStyle={{
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--popover)",
            boxShadow: "0 4px 16px -4px rgba(42, 36, 32, 0.08)",
            fontSize: "12px",
            padding: "8px 12px",
          }}
          formatter={(value, name) => {
            const label = seriesLabels[String(name)] ?? String(name);
            const num = Number(value);
            const formatted =
              String(name) === "engagement"
                ? `${num.toFixed(1)}%`
                : formatNumber(num);
            return [formatted, label];
          }}
          labelFormatter={(_label, payload) => {
            const point = payload?.[0]?.payload as ChartDataPoint | undefined;
            if (point?.isoDate) {
              return formatDate(point.isoDate);
            }
            return point?.date ?? "";
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name={seriesLabels[dataKey] ?? String(dataKey)}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{
            r: 4,
            fill: color,
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
