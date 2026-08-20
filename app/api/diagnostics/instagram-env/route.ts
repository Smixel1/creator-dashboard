import { NextResponse } from "next/server";

function envField(raw: string | undefined) {
  const trimmed = raw?.trim() ?? "";
  return {
    set: trimmed.length > 0,
    length: trimmed.length,
  };
}

function redirectUriField(raw: string | undefined) {
  const trimmed = raw?.trim() ?? "";
  const base = {
    set: trimmed.length > 0,
    length: trimmed.length,
  };

  if (!trimmed) {
    return base;
  }

  try {
    const url = new URL(trimmed);
    return {
      ...base,
      origin: url.origin,
      pathname: url.pathname,
    };
  } catch {
    return base;
  }
}

/** TEMPORARY local diagnostics — returns metadata only, never secret values. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    INSTAGRAM_CLIENT_ID: envField(process.env.INSTAGRAM_CLIENT_ID),
    INSTAGRAM_CLIENT_SECRET: envField(process.env.INSTAGRAM_CLIENT_SECRET),
    INSTAGRAM_REDIRECT_URI: redirectUriField(process.env.INSTAGRAM_REDIRECT_URI),
    APP_URL: { set: Boolean(process.env.APP_URL?.trim()) },
  });
}
