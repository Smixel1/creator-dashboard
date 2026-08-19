import { format, subDays } from "date-fns";
import type { AnalyticsPeriod, ChartDataPoint, FollowersMetrics } from "@/types";

/** Canonical end-of-period followers count (mock). */
const CURRENT_FOLLOWERS = 12_482;

/** Anchor curve for 30-day growth (mock Instagram-style progression). */
const GROWTH_CURVE: { day: number; followers: number }[] = [
  { day: 1, followers: 11_910 },
  { day: 5, followers: 11_980 },
  { day: 10, followers: 12_050 },
  { day: 15, followers: 12_140 },
  { day: 20, followers: 12_260 },
  { day: 25, followers: 12_350 },
  { day: 30, followers: 12_482 },
];

const PREVIOUS_BY_PERIOD: Record<AnalyticsPeriod, number> = {
  "7d": 12_410,
  "30d": 11_910,
  "90d": 11_580,
  all: 10_840,
};

function interpolateFollowers(day: number): number {
  const clamped = Math.max(1, Math.min(30, day));
  for (let i = 0; i < GROWTH_CURVE.length - 1; i++) {
    const start = GROWTH_CURVE[i];
    const end = GROWTH_CURVE[i + 1];
    if (clamped >= start.day && clamped <= end.day) {
      const ratio = (clamped - start.day) / (end.day - start.day);
      return Math.round(start.followers + (end.followers - start.followers) * ratio);
    }
  }
  return GROWTH_CURVE[GROWTH_CURVE.length - 1].followers;
}

function periodDayCount(period: AnalyticsPeriod): number {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 30;
  }
}

/** Shared mock followers snapshot — Dashboard & Analytics use the same source. */
export function getMockFollowersMetrics(
  period: AnalyticsPeriod = "30d"
): FollowersMetrics {
  const previous = PREVIOUS_BY_PERIOD[period];
  const growth = CURRENT_FOLLOWERS - previous;
  const growthPercent = (growth / previous) * 100;

  return {
    current: CURRENT_FOLLOWERS,
    previous,
    growth,
    growthPercent,
  };
}

/** Shared mock followers time series for charts. */
export function getMockFollowersOverTime(
  period: AnalyticsPeriod = "30d"
): ChartDataPoint[] {
  const days = periodDayCount(period);
  const now = new Date();
  const points: ChartDataPoint[] = [];

  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const dayInCurve =
      period === "30d" || period === "7d"
        ? Math.max(1, 30 - i)
        : Math.max(1, Math.round(((days - i) / days) * 30));
    const followers =
      period === "all"
        ? Math.round(
            PREVIOUS_BY_PERIOD.all +
              ((CURRENT_FOLLOWERS - PREVIOUS_BY_PERIOD.all) * (days - i)) / days
          )
        : interpolateFollowers(dayInCurve);

    points.push({
      date: format(date, "MMM d"),
      isoDate: date.toISOString(),
      views: 0,
      followers,
    });
  }

  return points;
}
