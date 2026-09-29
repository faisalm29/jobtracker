import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { AppSidebar } from "@/components/AppSidebar";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@jobtracker/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@jobtracker/ui/components/sidebar";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { ChartNoAxesCombined } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          // Keep redirect param so user returns here after login
          redirect: location.href,
        },
      });
    }

    return {
      session: session.session,
      user: session.user,
    };
  },
  component: AuthenticatedLayout,
});

const nav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartNoAxesCombined,
  },
];

// // Label dictionary for custom friendly breadcrumb names
// const ROUTE_LABELS: Record<string, string> = {
//   dashboard: "Dashboard",
//   applications: "Applications",
//   account: "Account"
// }

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      queryClient.clear();

      await router.invalidate();
      await router.navigate({ to: "/login" });
    } catch (err) {
      console.error("Logout failed:", err);
      setIsLoggingOut(false);
    }
  };
  return (
    <SidebarProvider>
      <AppSidebar
        nav={nav}
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        pathname={pathname}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="my-auto mr-2 data-[orientation=vertical]:h-4"
          />
          {/* <Breadcrumb>
            <BreadcrumbList>
              {segments.map((segment, index) => {
                const isLast = index === segments.length - 1;
                const href = "/" + segments.slice(0, index + 1).join("/");

                return (
                  <Fragment key={href}>
                    <BreadcrumbItem className="hidden md:block">
                      {isLast ? (
                        <BreadcrumbPage className="capitalize">
                          {segment}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          render={
                            <Link to={href} className="capitalize">
                              {segment}
                            </Link>
                          }
                        />
                      )}
                    </BreadcrumbItem>
                    {!isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb> */}
          <AppBreadcrumbs />
        </header>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
