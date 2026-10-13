import { apiClient } from "@/lib/api-client";
import type { ApplicationsQuery } from "@jobtracker/schemas";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

export const applicationsQueryOptions = (params?: ApplicationsQuery) =>
  queryOptions({
    queryKey: ["applications", "list", params ?? {}],
    queryFn: async () => {
      const res = await apiClient.applications.$get({
        query: {
          ...params,
          status: Array.isArray(params?.status)
            ? params.status.join(",")
            : params?.status,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load applications: ${res.statusText}`);
      }

      return res.json();
    },
    placeholderData: keepPreviousData,
  });
