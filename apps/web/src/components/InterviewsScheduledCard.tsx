import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import { CalendarCheck, CalendarDays, Video } from "lucide-react";

interface InterviewsScheduledCardProps {
  count?: number;
  nextInterview?: {
    companyName: string;
    scheduledAt: Date | string;
  } | null;
  isLoading?: boolean;
}

export const InterviewsScheduledCard = ({
  count = 0,
  nextInterview,
  isLoading = false,
}: InterviewsScheduledCardProps) => {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-1 h-8 w-14" />
        </CardHeader>
        <CardFooter className="flex flex-col items-start gap-1.5 pt-0">
          <Skeleton className="h-5 w-28 rounded-md" />
        </CardFooter>
      </Card>
    );
  }

  const formattedNextDate = nextInterview?.scheduledAt
    ? new Date(nextInterview.scheduledAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Interviews Scheduled</CardDescription>
        <CardTitle className="text-2xl font-bold tracking-tight tabular-nums @[250px]/card:text-3xl">
          {count.toLocaleString()}
        </CardTitle>
        <CardAction>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <CalendarCheck className="size-4" />
          </div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2 pt-0">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {count > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 font-medium text-indigo-700 dark:text-indigo-300">
                <Video className="size-3" />
                {count === 1 ? "1 Round Active" : `${count} Rounds Active`}
              </span>
              {nextInterview && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  • Next:{" "}
                  <strong className="text-foreground">
                    {nextInterview.companyName}
                  </strong>{" "}
                  ({formattedNextDate})
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <CalendarDays className="size-3.5" /> No interviews scheduled
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
