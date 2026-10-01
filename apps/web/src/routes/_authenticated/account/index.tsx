import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account/")({
  staticData: {
    breadcrumb: "Account",
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/account"!</div>;
}
