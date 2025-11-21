import type { auth } from "@newslink/auth";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
  plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});

export type AuthClientType = typeof authClient;
export type AdditionalFields = typeof inferAdditionalFields<typeof auth>;
export type ErrorCode = keyof typeof authClient.$ERROR_CODES | "UNKNOWN";
export const { admin, signIn, signOut, signUp, getSession, useSession } =
  authClient;
