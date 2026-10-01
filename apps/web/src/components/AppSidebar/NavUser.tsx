import { calculateInitials } from "@/utils/calculate-initials";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@jobtracker/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@jobtracker/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@jobtracker/ui/components/sidebar";
import { cn } from "@jobtracker/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { EllipsisVertical, LogOut, UserCircle } from "lucide-react";
import type React from "react";

interface NavUserProps extends React.ComponentProps<typeof SidebarMenu> {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export const NavUser = ({
  user,
  onLogout,
  isLoggingOut,
  className,
  ...props
}: NavUserProps) => {
  const { isMobile } = useSidebar();
  const initials = calculateInitials(user.name);

  return (
    <SidebarMenu className={cn(className)} {...props}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src={user.image ?? undefined} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <EllipsisVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={
                  <Link to="/account">
                    <UserCircle />
                    Account
                  </Link>
                }
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={isLoggingOut ? undefined : onLogout}
              disabled={isLoggingOut}
            >
              <LogOut />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
