import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Button } from "@jobtracker/ui/components/button";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import { Avatar, AvatarFallback } from "@jobtracker/ui/components/avatar";
import { Link } from "@tanstack/react-router";
import { formatRelativeTime } from "@/utils/format-relative-time";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  PlusCircle,
} from "lucide-react";

export interface RecentActivityItem {
  id: string;
  applicationId: string;
  companyName: string;
  roleTitle: string;
  fromStatus: string | null;
  toStatus: string;
  changedAt: Date | string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface RecentActivityFeedProps {
  activities?: RecentActivityItem[];
  pagination?: PaginationMeta;
  isLoading?: boolean;
  onPageChange?: (page: number) => void;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  saved: {
    label: "Saved",
    className:
      "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20",
  },
  applied: {
    label: "Applied",
    className: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  offered: {
    label: "Offered",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-emerald-600/10 text-emerald-800 dark:text-emerald-200 border-emerald-600/20",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
  },
  ghosted: {
    label: "Ghosted",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
  withdrawn: {
    label: "Withdrawn",
    className:
      "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function RecentActivityFeed({
  activities = [],
  pagination,
  isLoading = false,
  onPageChange,
}: RecentActivityFeedProps) {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-28 rounded-md" />
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
            <History className="size-4.5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Audit log of status updates and application movements
          </CardDescription>

          {pagination && pagination.totalItems > 0 && (
            <CardAction>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                {pagination.totalItems} Events
              </span>
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center">
              <History className="mb-2 size-8 text-muted-foreground/40" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Status updates will automatically appear here as your
                applications progress
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border bg-card">
              {activities.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-3.5 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Avatar + Company + Role */}
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-9 shrink-0 rounded-lg border bg-muted/60 text-xs font-semibold text-foreground">
                      <AvatarFallback className="rounded-lg">
                        {item.companyName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="truncate text-sm font-semibold">
                          {item.companyName}
                        </h4>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.roleTitle}
                        </span>
                      </div>

                      {/* Status Transition Badges */}
                      <div className="mt-1 flex items-center gap-1.5">
                        {item.fromStatus ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <StatusBadge status={item.fromStatus} />
                            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                            <StatusBadge status={item.toStatus} />
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                              <PlusCircle className="size-3" />
                              Application Created
                            </span>
                            <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                            <StatusBadge status={item.toStatus} />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Relative Time + Link */}
                  <div className="flex shrink-0 items-center justify-between gap-3 pt-1 pl-12 sm:justify-end sm:pt-0 sm:pl-0">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3 text-muted-foreground" />
                      {formatRelativeTime(item.changedAt)}
                    </span>

                    <Link
                      to="/applications/$id"
                      params={{ id: item.applicationId }}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="View Application"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Page{" "}
            <strong className="font-semibold text-foreground">
              {pagination.page}
            </strong>{" "}
            of{" "}
            <strong className="font-semibold text-foreground">
              {pagination.totalPages}
            </strong>{" "}
            ({pagination.totalItems} total updates)
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasPrevPage || isLoading}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="h-8 gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!pagination.hasNextPage || isLoading}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="h-8 gap-1 text-xs"
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
