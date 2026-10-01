import { type LucideIcon } from "lucide-react";
import { cn } from "@jobtracker/ui/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@jobtracker/ui/components/sidebar";
import type React from "react";
import { SidebarBranding } from "./SidebarBranding";
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
}

export const AppSidebar = ({
  nav,
  user,
  onLogout,
  isLoggingOut,
  className,
  ...props
}: AppSidebarProps) => {
  return (
    <Sidebar className={cn(className)} {...props}>
      <SidebarHeader>
        <SidebarBranding />
      </SidebarHeader>

      <SidebarContent>
        <NavMain nav={nav} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />
      </SidebarFooter>
    </Sidebar>
  );
};
