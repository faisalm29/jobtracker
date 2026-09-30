import { applicationsQueryOptions } from "@/features/applications/queries";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/applications/")({
  loader: ({ context: { queryClient } }) => {
    return queryClient.query({
      ...applicationsQueryOptions(),
      staleTime: "static",
    });
  },
  staticData: {
    breadcrumb: "Applications",
  },
  component: ApplicationsPage,
});

function ApplicationsPage() {
  const { data: response } = useSuspenseQuery(applicationsQueryOptions());
  return (
    <>
      <h1>Applications</h1>
      <div>
        <ul>
          {response.data.map((app) => (
            <li>{app.companyName}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
