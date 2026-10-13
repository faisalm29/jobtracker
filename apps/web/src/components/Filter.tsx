import { features } from "@/features/applications/components/columns";
import type { Application } from "@jobtracker/schemas";
import type { ReactTable } from "@tanstack/react-table";

export const Filter = ({
  table,
}: {
  table: ReactTable<typeof features, Application>;
}) => {
  const columnFilterValue = table.state.return();
};
