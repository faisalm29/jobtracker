import { apiClient } from "@/lib/api-client";
import { queryOptions } from "@tanstack/react-query";

export const applicationsQueryOptions = (filters?: { status?: string }) =>
  queryOptions({
    queryKey: ["applications", filters ?? {}],
    queryFn: async () => {
      const res = await apiClient.applications.$get({
        query: filters ?? {},
      });

      if (!res.ok) {
        throw new Error(`Failed to load applications: ${res.statusText}`);
      }

      return res.json();
    },
  });

export const applicationDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["applications", id],
    queryFn: async () => {
      const res = await apiClient.applications[":id"].$get({
        param: {
          id,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load application: ${res.statusText} `);
      }

      return res.json();
    },
  });
