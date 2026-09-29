import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@jobtracker/ui/components/sidebar";
import { cn } from "@jobtracker/ui/lib/utils";
import { Star } from "lucide-react";

export const SidebarLogo = ({
  className,
  ...props
}: React.ComponentProps<typeof SidebarMenu>) => {
  return (
    <SidebarMenu className={cn(className)} {...props}>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-sidebar-foreground">
            <Star className="text-sidebar" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">Jobtracker</span>
            <span className="text-xs text-muted-foreground">
              Candidate Dashboard
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
