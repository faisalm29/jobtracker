import { apiClient } from "@/lib/api-client";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

export const applicationsQueryOptions = () =>
  queryOptions({
    queryKey: ["applications", "list"],
    queryFn: async () => {
      const res = await apiClient.applications.$get({
        query: {},
      });

      if (!res.ok) {
        throw new Error(`Failed to load applications: ${res.statusText}`);
      }

      return res.json();
    },
    placeholderData: keepPreviousData,
  });
