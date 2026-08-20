import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getAnalyticsOverview } from "@/services/reels/reel-service";
import { getRequestTranslator } from "@/lib/i18n/request";
import type { AnalyticsPeriod } from "@/types";

const VALID_PERIODS: AnalyticsPeriod[] = ["7d", "30d", "90d", "all"];

function parsePeriod(value: string | null): AnalyticsPeriod {
  if (value && VALID_PERIODS.includes(value as AnalyticsPeriod)) {
    return value as AnalyticsPeriod;
  }
  return "30d";
}

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  const { t } = await getRequestTranslator();

  if (!userId) {
    return NextResponse.json({ error: t("api.unauthorized") }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = parsePeriod(searchParams.get("period"));

  try {
    const analytics = await getAnalyticsOverview(userId, period);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("[api/analytics]", error);
    return NextResponse.json(
      { error: t("api.loadAnalyticsFailed") },
      { status: 500 }
    );
  }
}
