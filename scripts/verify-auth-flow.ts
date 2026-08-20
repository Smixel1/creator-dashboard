import "dotenv/config";
import { prisma } from "../lib/prisma";

const BASE = process.env.APP_URL ?? "http://localhost:3000";

function parseCookies(setCookie: string | null): string {
  if (!setCookie) return "";
  return setCookie
    .split(/,(?=[^;]+?=)/)
    .map((part) => part.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

async function main() {
  const results: Record<string, unknown> = { baseUrl: BASE };

  const registerRes = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Creator",
      email: "test@creatorpulse.app",
      password: "Test123456!",
      confirmPassword: "Test123456!",
    }),
  });
  const registerBody = await registerRes.json().catch(() => null);
  const registerCookies = parseCookies(registerRes.headers.get("set-cookie"));
  results.register = {
    status: registerRes.status,
    body: registerBody,
    hasSessionCookie: registerCookies.includes("creator_session="),
  };

  let cookieHeader = registerCookies;

  if (registerRes.status === 409) {
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@creatorpulse.app",
        password: "Test123456!",
      }),
    });
    cookieHeader = parseCookies(loginRes.headers.get("set-cookie"));
    results.loginAfterExisting = {
      status: loginRes.status,
      hasSessionCookie: cookieHeader.includes("creator_session="),
    };
  }

  const dashboardRes = await fetch(`${BASE}/dashboard`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
    redirect: "manual",
  });
  results.dashboard = {
    status: dashboardRes.status,
    location: dashboardRes.headers.get("location"),
  };

  const logoutRes = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });
  results.logout = { status: logoutRes.status };

  const loginAnna = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "anna@creator.io",
      password: "password123",
    }),
  });
  results.loginAnna = {
    status: loginAnna.status,
    hasSessionCookie: parseCookies(loginAnna.headers.get("set-cookie")).includes(
      "creator_session="
    ),
  };

  const testUser = await prisma.user.findUnique({
    where: { email: "test@creatorpulse.app" },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  results.testUserInDb = testUser;

  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
