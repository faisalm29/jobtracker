import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@jobtracker/ui/components/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface BreakdownsData {
  byStatus: Array<{ status: string; count: number }>;
  bySourceCategory: Array<{ sourceCategory: string | null; count: number }>;
  byJobType: Array<{ jobType: string | null; count: number }>;
  byWorkplaceType: Array<{ workplaceType: string | null; count: number }>;
}

interface DistributionBreakdownsCardProps {
  breakdowns?: BreakdownsData;
  totalApplications?: number;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; fill: string }> = {
  saved: { label: "Saved", fill: "#94a3b8" },
  applied: { label: "Applied", fill: "#0ea5e9" },
  in_progress: { label: "In Progress", fill: "#a855f7" },
  offered: { label: "Offered", fill: "#10b981" },
  accepted: { label: "Accepted", fill: "#059669" },
  rejected: { label: "Rejected", fill: "#f43f5e" },
  ghosted: { label: "Ghosted", fill: "#f59e0b" },
  withdrawn: { label: "Withdrawn", fill: "#71717a" },
};

const SOURCE_LABELS: Record<string, string> = {
  job_board: "Job Board",
  company_website: "Company Site",
  referral: "Referral",
  recruiter_outreach: "Recruiter",
  other: "Other",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
  other: "Other",
};

const statusChartConfig = {
  count: { label: "Applications" },
  saved: { label: "Saved", color: "#94a3b8" },
  applied: { label: "Applied", color: "#0ea5e9" },
  in_progress: { label: "In Progress", color: "#a855f7" },
  offered: { label: "Offered", color: "#10b981" },
  accepted: { label: "Accepted", color: "#059669" },
  rejected: { label: "Rejected", color: "#f43f5e" },
  ghosted: { label: "Ghosted", color: "#f59e0b" },
  withdrawn: { label: "Withdrawn", color: "#71717a" },
} satisfies ChartConfig;

const workplaceChartConfig = {
  count: { label: "Count" },
  Remote: { label: "Remote", color: "#10b981" },
  Hybrid: { label: "Hybrid", color: "#0ea5e9" },
  Onsite: { label: "Onsite", color: "#f59e0b" },
} satisfies ChartConfig;

const sourceChartConfig = {
  count: { label: "Applications", color: "#6366f1" },
} satisfies ChartConfig;

const jobTypeChartConfig = {
  count: { label: "Applications", color: "#8b5cf6" },
} satisfies ChartConfig;

export function DistributionBreakdownsCard({
  breakdowns,
  totalApplications = 0,
  isLoading = false,
}: DistributionBreakdownsCardProps) {
  const [tab, setTab] = useState<"status" | "workplace" | "source" | "type">(
    "status"
  );

  if (isLoading) {
    return (
      <Card className="@container/card h-full">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // 1. Status Data
  const statusData = (breakdowns?.byStatus ?? [])
    .filter((s) => s.count > 0)
    .map((s) => ({
      status: s.status,
      label: STATUS_CONFIG[s.status]?.label ?? s.status,
      count: s.count,
      fill: STATUS_CONFIG[s.status]?.fill ?? "#94a3b8",
    }));

  // 2. Workplace Data
  const workplace = breakdowns?.byWorkplaceType ?? [];
  const totalWorkplace =
    workplace.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const workplaceData = [
    {
      name: "Remote",
      count: workplace.find((w) => w.workplaceType === "remote")?.count ?? 0,
      fill: "#10b981",
    },
    {
      name: "Hybrid",
      count: workplace.find((w) => w.workplaceType === "hybrid")?.count ?? 0,
      fill: "#0ea5e9",
    },
    {
      name: "Onsite",
      count: workplace.find((w) => w.workplaceType === "onsite")?.count ?? 0,
      fill: "#f59e0b",
    },
  ].filter((w) => w.count > 0);

  // 3. Source Channels Data
  const sourceData = (breakdowns?.bySourceCategory ?? [])
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: s.sourceCategory ?? "other",
      label: s.sourceCategory
        ? (SOURCE_LABELS[s.sourceCategory] ?? s.sourceCategory)
        : "Unspecified",
      count: s.count,
    }))
    .sort((a, b) => b.count - a.count);

  // 4. Job Types Data
  const jobTypeData = (breakdowns?.byJobType ?? [])
    .filter((j) => j.count > 0)
    .map((j) => ({
      name: j.jobType ?? "other",
      label: j.jobType
        ? (JOB_TYPE_LABELS[j.jobType] ?? j.jobType)
        : "Unspecified",
      count: j.count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <Card className="@container/card flex h-full flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <PieChartIcon className="size-4.5 text-purple-600 dark:text-purple-400" />
            Distribution
          </CardTitle>
          <CardDescription>
            Breakdown by stage, workplace & channel
          </CardDescription>

          <CardAction>
            {/* Sub-tabs */}
            <div className="inline-flex items-center rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setTab("status")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  tab === "status"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Status
              </button>
              <button
                type="button"
                onClick={() => setTab("workplace")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  tab === "workplace"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Work
              </button>
              <button
                type="button"
                onClick={() => setTab("source")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  tab === "source"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Source
              </button>
              <button
                type="button"
                onClick={() => setTab("type")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  tab === "type"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Type
              </button>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-2">
          {/* TAB 1: Status Distribution (Horizontal Bar Chart) */}
          {tab === "status" &&
            (statusData.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No applications to display
              </p>
            ) : (
              <ChartContainer
                config={statusChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={75}
                    fontSize={11}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{value}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              (
                              {Math.round(
                                ((Number(value) || 0) /
                                  (totalApplications || 1)) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="count" radius={4} maxBarSize={20}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ))}

          {/* TAB 2: Workplace Types (Donut Chart) */}
          {tab === "workplace" &&
            (workplaceData.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No workplace data recorded
              </p>
            ) : (
              <ChartContainer
                config={workplaceChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{name}:</span>
                            <span>{value}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              (
                              {Math.round(
                                ((Number(value) || 0) / totalWorkplace) * 100
                              )}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={workplaceData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    strokeWidth={2}
                  >
                    {workplaceData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ))}

          {/* TAB 3: Source Channels (Horizontal Bar Chart) */}
          {tab === "source" &&
            (sourceData.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No source channels recorded
              </p>
            ) : (
              <ChartContainer
                config={sourceChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={sourceData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={85}
                    fontSize={11}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{value}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              (
                              {Math.round(
                                ((Number(value) || 0) /
                                  (totalApplications || 1)) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--color-count)"
                    radius={4}
                    maxBarSize={20}
                  />
                </BarChart>
              </ChartContainer>
            ))}

          {/* TAB 4: Job Types (Horizontal Bar Chart) */}
          {tab === "type" &&
            (jobTypeData.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No job types recorded
              </p>
            ) : (
              <ChartContainer
                config={jobTypeChartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  data={jobTypeData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={85}
                    fontSize={11}
                  />
                  <XAxis type="number" hide />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => (
                          <div className="flex items-center gap-1.5 font-medium">
                            <span>{value}</span>
                            <span className="text-xs font-normal text-muted-foreground">
                              (
                              {Math.round(
                                ((Number(value) || 0) /
                                  (totalApplications || 1)) *
                                  100
                              )}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar
                    dataKey="count"
                    fill="#8b5cf6"
                    radius={4}
                    maxBarSize={20}
                  />
                </BarChart>
              </ChartContainer>
            ))}
        </CardContent>
      </div>
    </Card>
  );
}
