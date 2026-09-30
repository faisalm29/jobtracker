import { useMemo, useState } from "react";
import { ActivePipelineCard } from "@/components/ActivePipelineCard";
import { ApplicationVelocityChart } from "@/components/ApplicationVelocityChart";
import { ApproachingDeadlinesCard } from "@/components/ApproachingDeadlinesCard";
import { ConversionRatesCard } from "@/components/ConversionRatesCard";
import { CreateApplicationDialog } from "@/components/CreateApplicationDialog";
import { DistributionBreakdownsCard } from "@/components/DistributionBreakdownsCard";
import { InterviewsScheduledCard } from "@/components/InterviewsScheduledCard";
import { RecentActivityFeed } from "@/components/RecentActivityFeed";
import { TotalApplicationsCard } from "@/components/TotalApplicationsCard";
import { UpcomingInterviewsCard } from "@/components/UpcomingInterviewsCard";
import { dashboardQueries } from "@/features/applications/queries";
import { Button, buttonVariants } from "@jobtracker/ui/components/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Plus, RotateCw } from "lucide-react";
import { cn } from "@jobtracker/ui/lib/utils";

export type DateRangePreset = "all" | "30d" | "90d" | "year";

function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(preset: DateRangePreset): {
  appliedFrom?: string;
  appliedTo?: string;
} {
  if (preset === "all") return {};

  const now = new Date();
  const todayStr = formatDateToYMD(now);

  if (preset === "30d") {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { appliedFrom: formatDateToYMD(from), appliedTo: todayStr };
  }

  if (preset === "90d") {
    const from = new Date();
    from.setDate(from.getDate() - 90);
    return { appliedFrom: formatDateToYMD(from), appliedTo: todayStr };
  }

  if (preset === "year") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { appliedFrom: formatDateToYMD(from), appliedTo: todayStr };
  }

  return {};
}

const noop = () => {};

export const Route = createFileRoute("/_authenticated/dashboard/")({
  loader: async ({ context: { queryClient } }) => {
    queryClient.query(dashboardQueries.stats()).catch(noop);
    queryClient.query(dashboardQueries.upcoming()).catch(noop);
    queryClient.query(dashboardQueries.timeline()).catch(noop);
    queryClient.query(dashboardQueries.recentActivity()).catch(noop);
  },
  staticData: {
    breadcrumb: "Dashboard",
  },
  component: DashboardPage,
});

function DashboardPage() {
  const queryClient = useQueryClient();
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all");
  const [activityPage, setActivityPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Memoize dateFilters so the queryKey remains stable between renders
  const dateFilters = useMemo(() => getDateRange(datePreset), [datePreset]);

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useQuery(dashboardQueries.stats(dateFilters));

  const {
    data: upcoming,
    isLoading: upcomingLoading,
    isError: upcomingError,
    refetch: refetchUpcoming,
  } = useQuery(dashboardQueries.upcoming());

  const {
    data: timeline,
    isLoading: timelineLoading,
    isError: timelineError,
    refetch: refetchTimeline,
  } = useQuery(dashboardQueries.timeline());

  const {
    data: recentActivity,
    isLoading: recentActivityLoading,
    isError: recentActivityError,
    refetch: refetchRecentActivity,
  } = useQuery({
    ...dashboardQueries.recentActivity({ page: activityPage, limit: 10 }),
    placeholderData: (prev) => prev,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setIsRefreshing(false);
  };

  const hasAnyError =
    statsError || upcomingError || timelineError || recentActivityError;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* 1. Header with Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Job Search Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Track pipeline status, upcoming interviews, and recent progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Presets */}
          <div className="inline-flex items-center rounded-lg bg-muted p-1 text-xs">
            {(
              [
                { id: "all", label: "All Time" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "year", label: "This Year" },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  datePreset === preset.id
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh dashboard data"
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCw
              className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {/* New Application Button */}
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <Plus className="size-3.5" />
            New Application
          </Button>
        </div>
      </div>

      {/* Error Alert Banner (if any query failed) */}
      {hasAnyError && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>
              Some dashboard data failed to load. Please check your connection.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 border-destructive/30 bg-background text-xs text-destructive hover:bg-destructive/10"
            onClick={() => {
              refetchStats();
              refetchUpcoming();
              refetchTimeline();
              refetchRecentActivity();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalApplicationsCard
          total={stats?.overview.totalApplications}
          rejections={stats?.overview.rejections}
          ghosted={stats?.overview.ghosted}
          isLoading={statsLoading}
        />
        <ActivePipelineCard
          totalActive={stats?.overview.activePipeline}
          appliedCount={
            stats?.breakdowns.byStatus.find((s) => s.status === "applied")
              ?.count ?? 0
          }
          inProgressCount={
            stats?.breakdowns.byStatus.find((s) => s.status === "in_progress")
              ?.count ?? 0
          }
          isLoading={statsLoading}
        />
        <InterviewsScheduledCard
          count={stats?.overview.interviewsScheduled}
          nextInterview={upcoming?.interviews?.[0]}
          isLoading={statsLoading || upcomingLoading}
        />
        <ConversionRatesCard
          responseRate={stats?.overview.responseRate}
          offerRate={stats?.overview.offerRate}
          offersReceived={stats?.overview.offersReceived}
          isLoading={statsLoading}
        />
      </div>

      {/* 3. Section 2: Actionable Urgency (Interviews & Deadlines) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingInterviewsCard
          interviews={upcoming?.interviews}
          isLoading={upcomingLoading}
        />
        <ApproachingDeadlinesCard
          deadlines={upcoming?.deadlines}
          isLoading={upcomingLoading}
        />
      </div>

      {/* 4. Section 3: Visual Insights (Timeline & Breakdowns) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApplicationVelocityChart
            data={timeline?.timeline}
            isLoading={timelineLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <DistributionBreakdownsCard
            breakdowns={stats?.breakdowns}
            totalApplications={stats?.overview.totalApplications}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* 5. Section 4: Live Activity Feed */}
      <RecentActivityFeed
        activities={recentActivity?.data}
        pagination={recentActivity?.pagination}
        isLoading={recentActivityLoading}
        onPageChange={(page) => setActivityPage(page)}
      />

      {/* 6. Create Application Dialog */}
      <CreateApplicationDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}
