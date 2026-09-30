import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import { Activity, Clock, Send } from "lucide-react";

interface ActivePipelineCardProps {
  totalActive?: number;
  appliedCount?: number;
  inProgressCount?: number;
  isLoading?: boolean;
}

export const ActivePipelineCard = ({
  totalActive = 0,
  appliedCount = 0,
  inProgressCount = 0,
  isLoading = false,
}: ActivePipelineCardProps) => {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-1 h-8 w-16" />
        </CardHeader>
        <CardFooter className="flex flex-col items-start gap-2 pt-0">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Calculate percentage for the mini proportional bar
  const appliedPct = totalActive > 0 ? (appliedCount / totalActive) * 100 : 0;
  const inProgressPct =
    totalActive > 0 ? (inProgressCount / totalActive) * 100 : 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Active Pipeline</CardDescription>
        <CardTitle className="text-2xl font-bold tracking-tight tabular-nums @[250px]/card:text-3xl">
          {totalActive.toLocaleString()}
        </CardTitle>
        <CardAction>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Activity className="size-4" />
          </div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2.5 pt-0">
        {/* Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 font-medium text-sky-700 dark:text-sky-300">
            <Send className="size-3" />
            {appliedCount} Applied
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 font-medium text-purple-700 dark:text-purple-300">
            <Clock className="size-3" />
            {inProgressCount} In Progress
          </span>
        </div>
        {/* Proportional Pipeline Segment Bar */}
        {totalActive > 0 ? (
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="bg-sky-500 transition-all duration-300"
              style={{ width: `${appliedPct}%` }}
              title={`${appliedCount} Applied (${Math.round(appliedPct)}%)`}
            />
            <div
              className="bg-purple-500 transition-all duration-300"
              style={{ width: `${inProgressPct}%` }}
              title={`${inProgressCount} In Progress (${Math.round(inProgressPct)}%)`}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No active applications in pipeline
          </p>
        )}
      </CardFooter>
    </Card>
  );
};
