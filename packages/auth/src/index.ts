/** biome-ignore-all lint/performance/noNamespaceImport: <> */
import { expo } from "@better-auth/expo";
import { db } from "@newslink/db";
import * as schema from "@newslink/db/schema/auth";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  trustedOrigins: [
    ...(process.env.CORS_ORIGIN?.split(",").map((o) => o.trim()) || []),
    "mybettertapp://",
    "exp://",
  ],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [expo()],
});
