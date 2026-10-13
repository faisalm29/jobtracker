import { dateFormatter } from "@/utils/date-formatter";
import type { Application } from "@jobtracker/schemas";
import { Button } from "@jobtracker/ui/components/button";
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
  createColumnHelper,
  tableFeatures,
  globalFilteringFeature,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filterFn_equalsString,
  metaHelper,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

interface MyColumnMeta {
  filterVariant?: "select" | "text";
}

export const features = tableFeatures({
  globalFilteringFeature,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filterFns: {
    equalsString: filterFn_equalsString,
  },
  columnMeta: metaHelper<MyColumnMeta>(),
});

const columnHelper = createColumnHelper<typeof features, Application>();
export const columns = columnHelper.columns([
  columnHelper.accessor("companyName", {
    header: "Company",
  }),
  columnHelper.accessor("roleTitle", {
    header: "Role",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    filterFn: "equalsString",
    meta: {
      filterVariant: "select",
    },
  }),
  columnHelper.accessor("appliedDate", {
    header: "Applied Date",
    cell: (info) => {
      const date = info.getValue();
      if (!date) {
        return (
          <span className="text-muted-foreground" aria-label="Not applied yet">
            —
          </span>
        );
      }
      return dateFormatter.format(new Date(date));
    },
  }),
  columnHelper.display({
    id: "actions",
    cell: ({ row }) => {
      const application = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Action 1</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Action 2</DropdownMenuItem>
              <DropdownMenuItem>Action 3</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
]);
