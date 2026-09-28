import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface MyRouterContext {
  queryClient: QueryClient;
}

const RootLayout = () => (
  <>
    {/* <div className="flex gap-2 p-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
    </div>
    <hr /> */}
    <Outlet />
    <TanStackRouterDevtools position="bottom-right" />
  </>
);

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootLayout,
});
