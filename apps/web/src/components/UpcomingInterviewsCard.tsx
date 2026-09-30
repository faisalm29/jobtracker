import { formatCountdown } from "@/utils/format-countdown";
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
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarCheck,
  Clock,
  FileText,
} from "lucide-react";

// Color mapping for interview stage types
const STAGE_TYPE_STYLES: Record<string, { label: string; className: string }> =
  {
    screening: {
      label: "Screening",
      className:
        "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
    },
    skills_test: {
      label: "Skills Test",
      className:
        "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
    },
    behavioral: {
      label: "Behavioral",
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    },
    presentation: {
      label: "Presentation",
      className:
        "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/20",
    },
    final_round: {
      label: "Final Round",
      className:
        "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
    },
    other: {
      label: "Interview",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

export interface UpcomingInterview {
  id: string;
  applicationId: string;
  companyName: string;
  roleTitle: string;
  stageName: string;
  stageType: string;
  scheduledAt: Date | string;
  notes: string | null;
}

interface UpcomingInterviewsCardProps {
  interviews?: UpcomingInterview[];
  isLoading?: boolean;
}

export const UpcomingInterviewsCard = ({
  interviews = [],
  isLoading = false,
}: UpcomingInterviewsCardProps) => {
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
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
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
            <CalendarCheck className="size-4.5 text-indigo-600 dark:text-indigo-400" />
            Upcoming Interviews
          </CardTitle>
          <CardDescription>
            Scheduled rounds in the next 14 days
          </CardDescription>
          <CardAction>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {interviews.length} Scheduled
            </span>
          </CardAction>
        </CardHeader>
        <CardContent className="pt-0">
          {interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
              <Calendar className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No interviews scheduled</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Keep submitting applications to fill your pipeline!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {interviews.map((interview) => {
                const stageStyle =
                  STAGE_TYPE_STYLES[interview.stageType] ??
                  STAGE_TYPE_STYLES.other;
                return (
                  <div
                    key={interview.id}
                    className="group relative flex flex-col gap-2 rounded-lg border bg-card p-3.5 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-semibold">
                            {interview.companyName}
                          </h4>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${stageStyle.className}`}
                          >
                            {stageStyle.label}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {interview.roleTitle}
                        </p>
                      </div>
                      <Link
                        to="/applications/$id"
                        params={{ id: interview.applicationId }}
                        className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
                        title="View Application"
                      >
                        <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                    {/* Countdown and time */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span>{formatCountdown(interview.scheduledAt)}</span>
                    </div>
                    {/* Notes preview if available */}
                    {interview.notes && (
                      <p className="line-clamp-1 flex items-center gap-1 rounded bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground italic">
                        <FileText className="size-3 shrink-0" />
                        {interview.notes}
                      </p>
                    )}
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
            View all active applications
            <ArrowRight className="size-3" />
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
};
