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

export const dashboardQueries = {
  stats: (filters?: { appliedFrom?: string; appliedTo?: string }) =>
    queryOptions({
      queryKey: ["dashboard", "stats", filters ?? {}],
      queryFn: async () => {
        const res = await apiClient.dashboard.stats.$get({
          query: filters ?? {},
        });

        if (!res.ok) throw new Error("Failed to load dashboard stats");

        return res.json();
      },
    }),

  upcoming: (
    params: { days?: number; limit?: number } = { days: 14, limit: 5 }
  ) =>
    queryOptions({
      queryKey: ["dashboard", "upcoming", params],
      queryFn: async () => {
        const res = await apiClient.dashboard.upcoming.$get({
          query: {
            days: params.days?.toString(),
            limit: params.limit?.toString(),
          },
        });

        if (!res.ok) throw new Error("Failed to load upcoming events");

        return res.json();
      },
    }),

  timeline: (
    params: { weeks?: number; months?: number } = { weeks: 12, months: 6 }
  ) =>
    queryOptions({
      queryKey: ["dashboard", "timeline", params],
      queryFn: async () => {
        const res = await apiClient.dashboard.timeline.$get({
          query: {
            weeks: params.weeks?.toString(),
            months: params.months?.toString(),
          },
        });

        if (!res.ok) throw new Error("Failed to load dashboard timeline");

        return res.json();
      },
    }),

  recentActivity: (
    params: { page?: number; limit?: number } = { page: 1, limit: 10 }
  ) =>
    queryOptions({
      queryKey: ["dashboard", "recent-activity", params],
      queryFn: async () => {
        const res = await apiClient.dashboard["recent-activity"].$get({
          query: {
            page: params.page?.toString(),
            limit: params.limit?.toString(),
          },
        });

        if (!res.ok) throw new Error("Failed to load recent activity");

        return res.json();
      },
    }),
};
