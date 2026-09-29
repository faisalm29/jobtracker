import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@jobtracker/ui/components/sidebar";
import { cn } from "@jobtracker/ui/lib/utils";
import type React from "react";
import { Briefcase, CirclePlus, type LucideIcon } from "lucide-react";
import { Button } from "@jobtracker/ui/components/button";
import { Link } from "@tanstack/react-router";

interface NavMainProps extends React.ComponentProps<typeof SidebarGroup> {
  nav: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
  pathname?: string;
}

export const NavMain = ({
  nav,
  pathname,
  className,
  ...props
}: NavMainProps) => {
  return (
    <SidebarGroup className={cn(className)} {...props}>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Applications"
              isActive={pathname === "/applications"}
              render={
                <Link to="/applications">
                  <Briefcase />
                  <span>Applications</span>
                </Link>
              }
            />
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <CirclePlus />
              <span className="sr-only">Create application</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {nav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={pathname === item.url}
                render={
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                }
              />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
