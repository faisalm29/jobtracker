import { applicationsQueryOptions } from "@/features/queries";
import { type Application } from "@jobtracker/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { columns, features } from "@/features/applications/components/columns";
import { ApplicationTable } from "@/components/ApplicationTable";
import { useTable } from "@tanstack/react-table";

// Fallback defaults
const defaultData: Array<Application> = [];

export const Route = createFileRoute("/_authenticated/applications/")({
  staticData: {
    breadcrumb: "Applications",
  },
  loader: ({ context: { queryClient } }) =>
    queryClient.query(applicationsQueryOptions()),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { data: applications } = useSuspenseQuery(applicationsQueryOptions());

  const table = useTable(
    {
      features,
      columns,
      data: applications.data ?? defaultData,
      globalFilterFn: "fuzzy",
    },
    (state) => state
  );

  return (
    <>
      <h1>Applications</h1>
      <div className="container mx-auto py-10">
        <ApplicationTable table={table} />
      </div>
    </>
  );
}
