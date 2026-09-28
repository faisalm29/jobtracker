import { AppSidebar } from "@/components/AppSidebar";
import { authClient } from "@/lib/auth-client";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@jobtracker/ui/components/breadcrumb";
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
} from "@tanstack/react-router";
import { ChartNoAxesCombined } from "lucide-react";
import { useState } from "react";

const nav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: ChartNoAxesCombined,
  },
];

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
      <AppSidebar nav={nav} user={user} onLogout={handleLogout} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="my-auto mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Build Your Application</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
