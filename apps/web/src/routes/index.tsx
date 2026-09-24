import { apiClient } from "@/lib/api-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: async () => {
    const res = await apiClient.index.$get();
    if (!res.ok) {
      throw new Error(`Failed to fetch index: ${res.statusText}`);
    }
    return await res.json();
  },
  component: Index,
});

function Index() {
  const { message } = Route.useLoaderData();
  return (
    <div className="p-2">
      <h3>Welcome to the {message}!</h3>
    </div>
  );
}
