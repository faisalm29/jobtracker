import {
  Briefcase,
  CirclePlus,
  Star,
  LogOut,
  Bell,
  CreditCard,
  UserCircle,
  EllipsisVertical,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@jobtracker/ui/lib/utils";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar,
} from "@jobtracker/ui/components/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@jobtracker/ui/components/dropdown-menu";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@jobtracker/ui/components/avatar";
import { Button } from "@jobtracker/ui/components/button";
import { calculateInitials } from "@/utils/calculate-initials";
import { Link } from "@tanstack/react-router";

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
}

export const AppSidebar = ({
  nav,
  user,
  onLogout,
  className,
  ...props
}: AppSidebarProps) => {
  const { isMobile } = useSidebar();
  const initials = calculateInitials(user.name);

  return (
    <Sidebar className={cn(className)} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <a href="#">
                  <Star className="size-5!" />
                  <span className="text-base font-semibold">Jobtracker</span>
                </a>
              }

              className="data-[slot=sidebar-menu-button]:p-1.5!"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* NavMain */}
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  tooltip="Applications"
                  className="min-w-8"
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
                  <span className="sr-only">Create an application</span>
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip={item.title}
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
      </SidebarContent>
      <SidebarFooter>
        {/* NavUser */}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
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
                    <EllipsisVertical className="ml-auto size-4" />
                  </SidebarMenuButton>
                }
              ></DropdownMenuTrigger>
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
                          alt="user.name"
                        />
                        <AvatarFallback className="rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserCircle />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
