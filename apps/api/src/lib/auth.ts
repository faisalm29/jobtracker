import { createDb, db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { bearer, openAPI } from "better-auth/plugins";
import { AppEnv } from "./types";

// for better auth schema generation
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    schema,
    provider: "sqlite",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:5173",
    "https://faisalownedjobtracker.pages.dev",
  ],
  plugins: [bearer(), openAPI()],
});

// for use within hono handlers where we can access cloudflare bindings
export const createAuth = (env: AppEnv["Bindings"]) => {
  return betterAuth({
    database: drizzleAdapter(createDb(env), {
      schema,
      provider: "sqlite",
      usePlural: true,
    }),
    emailAndPassword: {
      enabled: true,
    },
    trustedOrigins: [
      "http://localhost:5173",
      "https://faisalownedjobtracker.pages.dev",
    ],
    plugins: [bearer(), openAPI()],
  });
};
