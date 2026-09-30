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
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

export interface TimelinePoint {
  period: string;
  label: string;
  applied: number;
  statusChanges: number;
}

export interface TimelineData {
  weekly: TimelinePoint[];
  monthly: TimelinePoint[];
}

interface ApplicationVelocityChartProps {
  data?: TimelineData;
  isLoading?: boolean;
}

const chartConfig = {
  applied: {
    label: "Applications",
    color: "#0ea5e9", // Sky 500
  },
  statusChanges: {
    label: "Status Transitions",
    color: "#a855f7", // Purple 500
  },
} satisfies ChartConfig;

export function ApplicationVelocityChart({
  data,
  isLoading = false,
}: ApplicationVelocityChartProps) {
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");

  if (isLoading) {
    return (
      <Card className="@container/card h-full">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const rawPoints = (mode === "weekly" ? data?.weekly : data?.monthly) ?? [];

  // Format short label for XAxis
  const chartData = rawPoints.map((p) => ({
    ...p,
    shortLabel:
      mode === "weekly"
        ? p.label.split(" - ")[0] // e.g. "Sep 14"
        : p.label.split(" ")[0], // e.g. "Sep"
  }));

  const totalApplied = chartData.reduce((acc, p) => acc + p.applied, 0);
  const totalChanges = chartData.reduce((acc, p) => acc + p.statusChanges, 0);

  return (
    <Card className="@container/card flex h-full flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="size-4.5 text-sky-600 dark:text-sky-400" />
            Application Velocity
          </CardTitle>
          <CardDescription>
            {totalApplied} applications & {totalChanges} status updates in this
            period
          </CardDescription>

          <CardAction>
            {/* Segmented Control Toggle */}
            <div className="inline-flex items-center rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setMode("weekly")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  mode === "weekly"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Weekly (12w)
              </button>
              <button
                type="button"
                onClick={() => setMode("monthly")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  mode === "monthly"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly (6m)
              </button>
            </div>
          </CardAction>
        </CardHeader>

        <CardContent className="pt-2">
          {chartData.length === 0 ? (
            <div className="flex h-[250px] flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <BarChart3 className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No timeline data recorded</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Activity will appear here once applications are submitted
              </p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[250px] w-full"
            >
              <ComposedChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="shortLabel"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickMargin={8}
                  fontSize={11}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_, payload) => {
                        return payload?.[0]?.payload?.label ?? "";
                      }}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="applied"
                  fill="var(--color-applied)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Line
                  type="monotone"
                  dataKey="statusChanges"
                  stroke="var(--color-statusChanges)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--color-statusChanges)" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ChartContainer>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
