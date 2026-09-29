import { applicationDetailQueryOptions } from "@/features/applications/queries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/applications/$id/")({
  loader: async ({ params, context: { queryClient } }) => {
    return queryClient.query({
      ...applicationDetailQueryOptions(params.id),
      staleTime: "static",
    });
  },
  staticData: {
    breadcrumb: (match) =>
      match.loaderData?.companyName ?? "Application Details",
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/applications/$id"!</div>;
}
