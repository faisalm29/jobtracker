import { features } from "@/features/applications/components/columns";
import type { Application } from "@jobtracker/schemas";
import type { ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jobtracker/ui/components/table";
import { Button } from "@jobtracker/ui/components/button";
import { Input } from "@jobtracker/ui/components/input";
import { APPLICATION_STATUSES } from "@jobtracker/constants";

export const ApplicationTable = ({
  table,
}: {
  table: ReactTable<typeof features, Application>;
}) => {
  return (
    <>
      <div className="mb-4 max-w-sm">
        <Input
          aria-label="Search applications"
          placeholder="Search company or role..."
          value={String(table.state.globalFilter ?? "")}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div>
                            <table.FlexRender header={header} />
                          </div>
                          {header.column.id === "status" ? (
                            <div className="mt-2">
                              <select
                                aria-label="Filter by status"
                                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                                value={String(
                                  header.column.getFilterValue() ?? ""
                                )}
                                onChange={(event) =>
                                  header.column.setFilterValue(
                                    event.target.value || undefined
                                  )
                                }
                              >
                                <option value="">All statuses</option>
                                {APPLICATION_STATUSES.map((status) => (
                                  <option key={status} value={status}>
                                    {status
                                      .split("_")
                                      .map(
                                        (part) =>
                                          part.charAt(0).toUpperCase() +
                                          part.slice(1)
                                      )
                                      .join(" ")}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  // colSpan={table.getColumn.length}
                  colSpan={table.getAllLeafColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  );
};
