import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@jobtracker/ui/components/card";
import { Separator } from "@jobtracker/ui/components/separator";
import { Skeleton } from "@jobtracker/ui/components/skeleton";
import { Target, Trophy } from "lucide-react";

interface ConversionRatesCardProps {
  responseRate?: number;
  offerRate?: number;
  offersReceived?: number;
  isLoading?: boolean;
}

export const ConversionRatesCard = ({
  responseRate = 0,
  offerRate = 0,
  offersReceived = 0,
  isLoading = false,
}: ConversionRatesCardProps) => {
  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
          <div className="mt-1 flex items-center gap-4">
            <div className="space-y-1">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-8 w-px" />
            <div className="space-y-1">
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="pt-0">
          <Skeleton className="h-5 w-24 rounded-md" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>Conversion Rates</CardDescription>
        {/* Dual Metric Split */}
        <div className="flex items-center gap-3.5 pt-0.5">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight tabular-nums @[250px]/card:text-3xl">
              {responseRate.toFixed(1)}%
            </CardTitle>
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Response
            </span>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div>
            <div className="text-2xl font-bold tracking-tight text-emerald-600 tabular-nums @[250px]/card:text-3xl dark:text-emerald-400">
              {offerRate.toFixed(1)}%
            </div>
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Offer
            </span>
          </div>
        </div>
        <CardAction>
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Target className="size-4" />
          </div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 pt-0">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {offersReceived > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
              <Trophy className="size-3" />
              {offersReceived === 1
                ? "1 Offer Received"
                : `${offersReceived} Offers Received`}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Based on submitted applications
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
