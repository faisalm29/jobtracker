import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/applications/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Application Detail</h1>
      <p>Page for application detail</p>
    </>
  );
}
