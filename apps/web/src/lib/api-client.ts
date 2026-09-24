import { hcWithType } from "@jobtracker/api/client";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8787";

export const apiClient = hcWithType(API_BASE_URL, {
  init: {
    credentials: "include", // Ensures Better-Auth session cookies are sent
  },
});
