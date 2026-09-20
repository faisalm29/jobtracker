import { Context } from "hono";
import { AppEnv } from "./types";

export const getSession = (c: Context<AppEnv>) => {
  return c.get("session")!;
};
