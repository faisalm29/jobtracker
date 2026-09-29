import { type LucideIcon } from "lucide-react";
import { cn } from "@jobtracker/ui/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@jobtracker/ui/components/sidebar";
import type React from "react";
import { SidebarLogo } from "./SidebarLogo";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  nav: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onLogout?: () => void;
  isLoggingOut?: boolean;
  pathname?: string;
}

export const AppSidebar = ({
  nav,
  user,
  onLogout,
  isLoggingOut,
  pathname,
  className,
  ...props
}: AppSidebarProps) => {
  return (
    <Sidebar className={cn(className)} {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain nav={nav} pathname={pathname} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />
      </SidebarFooter>
    </Sidebar>
  );
};
