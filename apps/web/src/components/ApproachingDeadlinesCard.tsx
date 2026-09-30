import { getDeadlineStatus } from "@/utils/get-deadline-status";
import { buttonVariants } from "@jobtracker/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, BookmarkCheck, Clock } from "lucide-react";

export interface ApproachingDeadline {
  id: string; // application id
  companyName: string;
  roleTitle: string;
  status: string;
  deadline: Date | string;
}

interface ApproachingDeadlinesCardProps {
  deadlines?: ApproachingDeadline[];
  isLoading?: boolean;
}

export const ApproachingDeadlinesCard = ({
  deadlines = [],
  isLoading = false,
}: ApproachingDeadlinesCardProps) => {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-44" />
              </div>
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card flex flex-col justify-between">
      <div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Clock className="size-4.5 text-amber-600 dark:text-amber-400" />
            Approaching Deadlines
          </CardTitle>
          <CardDescription>
            Saved jobs closing within the next 14 days
          </CardDescription>
          <CardAction>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {deadlines.length} Due Soon
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-0">
          {deadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
              <BookmarkCheck className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No deadlines approaching</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You're all caught up on your saved jobs!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {deadlines.map((item) => {
                const urgency = getDeadlineStatus(item.deadline);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold">
                          {item.companyName}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${urgency.className}`}
                        >
                          <AlertCircle className="size-3" />
                          {urgency.text}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.roleTitle}
                      </p>
                    </div>
                    <Link
                      to="/applications/$id"
                      params={{ id: item.id }}
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                      })}
                    >
                      Apply
                      <ArrowRight className="size-3" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3">
          <Link
            to="/applications"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all saved jobs
            <ArrowRight className="size-3" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};
