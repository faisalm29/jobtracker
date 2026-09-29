import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/account/")({
  staticData: {
    breadcrumb: "Account",
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Account</h1>
      <div>
        <p>For changing name, username, and password</p>
      </div>
    </>
  );
}
