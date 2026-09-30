import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import { Briefcase, Ghost, XCircle } from "lucide-react";

interface TotalApplicationsCardProps {
  total?: number;
  rejections?: number;
  ghosted?: number;
  isLoading?: boolean;
}

export const TotalApplicationsCard = ({
  total = 0,
  rejections = 0,
  ghosted = 0,
  isLoading = false,
}: TotalApplicationsCardProps) => {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-1 h-8 w-16" />
        </CardHeader>
        <CardFooter className="flex flex-wrap gap-2 pt-0">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-18 rounded-full" />
        </CardFooter>
      </Card>
    );
  }
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Total Applications</CardDescription>
        <CardTitle className="text-2xl font-bold tracking-tight tabular-nums @[250px]/card:text-3xl">
          {total.toLocaleString()}
        </CardTitle>
        <CardAction>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Briefcase className="size-4" />
          </div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2 pt-0">
        {/* Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {rejections > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 font-medium text-rose-700 dark:text-rose-300">
              <XCircle className="size-3" />
              {rejections} Rejected
            </span>
          )}
          {ghosted > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
              <Ghost className="size-3" />
              {ghosted} Ghosted
            </span>
          )}
          {rejections === 0 && ghosted === 0 && (
            <span className="text-muted-foreground">
              All applications active
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
    // <Card className="@container/card">
    //   <CardHeader>
    //     <CardDescription>Total Revenue</CardDescription>
    //     <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
    //       $1,250.00
    //     </CardTitle>
    //   </CardHeader>
    //   <CardFooter className="flex-col items-start gap-1.5 text-sm">
    //     <div className="line-clamp-1 flex gap-2 font-medium">
    //       Trending up this month
    //     </div>
    //     <div className="text-muted-foreground">
    //       Visitors for the last 6 months
    //     </div>
    //   </CardFooter>
    // </Card>
  );
};
