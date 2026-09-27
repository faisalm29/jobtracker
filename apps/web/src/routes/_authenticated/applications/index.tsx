import { apiClient } from "@/lib/api-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/applications/")({
  loader: async () => {
    const res = await apiClient.applications.$get({
      query: {},
    });

    if (!res.ok) {
      throw Error(res.statusText);
    }

    return res.json();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = Route.useLoaderData();
  return (
    <>
      <h1>Applications</h1>
      <div>
        <ul>
          {data.map((app) => (
            <li>{app.companyName}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
