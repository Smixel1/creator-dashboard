import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret } from "@/lib/auth-session";

const OAUTH_STATE_TTL_SECONDS = 60 * 10;

export async function createInstagramOAuthState(userId: string): Promise<string> {
  return new SignJWT({ userId, purpose: "instagram_oauth" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${OAUTH_STATE_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifyInstagramOAuthState(
  state: string
): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(state, getAuthSecret());

  if (payload.purpose !== "instagram_oauth" || typeof payload.userId !== "string") {
    throw new Error("Invalid OAuth state");
  }

  return { userId: payload.userId };
}
