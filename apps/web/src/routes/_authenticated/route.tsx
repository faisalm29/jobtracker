import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@jobtracker/ui/components/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { ChartNoAxesCombined } from "lucide-react";
import { useState } from "react";
import { Separator } from "@jobtracker/ui/components/separator";
import { AppBreadcrumb } from "@/components/AppBreadcrumb";

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

function AuthenticatedLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
      />
      <div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="my-auto mr-2 data-[orientation=vertical]:h-4"
          />
          <AppBreadcrumb />
        </header>
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
