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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jobtracker/ui/components/select";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ListFilter,
  SlidersHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@jobtracker/ui/components/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@jobtracker/ui/components/popover";

import { Filter } from "./Filter";
import { DebouncedInput } from "./DebouncedInput";

interface ApplicationTableProps {
  table: ReactTable<typeof features, Application>;
}

export const ApplicationTable = ({ table }: ApplicationTableProps) => {
  const { pageIndex, pageSize } = table.state.pagination;
  const totalRows = table.getRowCount();
  const visibleRows = table.getRowModel().rows.length;
  const firstRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min(firstRow + visibleRows - 1, totalRows);

  return (
    <div>
      <div className="flex justify-between py-4">
        <div>
          <DebouncedInput
            value={table.state.globalFilter ?? ""}
            onChange={(value) => table.setGlobalFilter(String(value))}
            placeholder="Search all columns..."
          />
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  <SlidersHorizontal /> Settings
                </Button>
              }
            />
            <DropdownMenuContent className="w-fit" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                {table.getAllLeafColumns().map((column) => {
                  const label =
                    typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id;
                  if (column.id !== "companyName" && column.id !== "actions") {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(checked)
                        }
                      >
                        {label}
                      </DropdownMenuCheckboxItem>
                    );
                  }
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const column = header.column;
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center justify-between gap-1.5">
                          <table.FlexRender header={header} />

                          <div className="flex items-center">
                            {column.getCanFilter() && (
                              <Popover>
                                <PopoverTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      aria-label={`Filter ${column.id}`}
                                    />
                                  }
                                >
                                  <ListFilter
                                    className={
                                      column.getIsFiltered()
                                        ? "text-primary"
                                        : undefined
                                    }
                                  />
                                </PopoverTrigger>
                                <PopoverContent
                                  align="end"
                                  className="w-56 p-2"
                                >
                                  <Filter column={column} table={table} />
                                </PopoverContent>
                              </Popover>
                            )}

                            {column.getCanSort() && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon-xs"
                                      aria-label={`Sort ${column.id}`}
                                    />
                                  }
                                >
                                  <ChevronDown />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuGroup>
                                    <DropdownMenuLabel>Sort</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        column.toggleSorting(false)
                                      }
                                    >
                                      <ArrowUp />
                                      Ascending
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => column.toggleSorting(true)}
                                    >
                                      <ArrowDown />
                                      Descending
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          {/* <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div className="flex items-center justify-between gap-1.5">
                          <table.FlexRender header={header} />
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button variant="ghost" size="icon-xs">
                                  <ChevronDown />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Sort</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <ArrowUp />
                                  Ascending
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ArrowDown />
                                  Descending
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Filter</DropdownMenuLabel>
                                {header.column.getCanFilter() ? (
                                  <Filter
                                    key={header.id}
                                    column={header.column}
                                    table={table}
                                  />
                                ) : null}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader> */}
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <p>Rows per page</p>
          <Select
            value={table.state.pagination.pageSize}
            onValueChange={(value) => {
              if (value !== null) {
                table.setPageSize(Number(value));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={table.state.pagination.pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[5, 10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <span>
            {firstRow} - {lastRow} of {totalRows}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          {/* <Input
          type="number"
          min="1"
          max={table.getPageCount()}
          value={table.state.pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            table.setPageIndex(page);
          }}
          className="page-size-input"
        /> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>

    // <div>
    //   <div className="overflow-hidden rounded-md border">
    //     <Table>
    //       <TableHeader>
    //         {table.getHeaderGroups().map((headerGroup) => (
    //           <TableRow key={headerGroup.id}>
    //             {headerGroup.headers.map((header) => {
    //               return (
    //                 <TableHead key={header.id} colSpan={header.colSpan}>
    //                   {header.isPlaceholder ? null : (
    //                     <Button
    //                       variant="ghost"
    //                       size="sm"
    //                       onClick={header.column.getToggleSortingHandler()}
    //                       title={
    //                         header.column.getCanSort()
    //                           ? header.column.getNextSortingOrder() === "asc"
    //                             ? "Sort ascending"
    //                             : header.column.getNextSortingOrder() === "desc"
    //                               ? "Sort descending"
    //                               : "Clear sort"
    //                           : undefined
    //                       }
    //                     >
    //                       <table.FlexRender header={header} />
    //                       {{ asc: <ChevronUp />, desc: <ChevronDown /> }[
    //                         header.column.getIsSorted() as string
    //                       ] ?? <ChevronsUpDown />}
    //                     </Button>
    //                   )}
    //                 </TableHead>
    //               );
    //             })}
    //           </TableRow>
    //         ))}
    //       </TableHeader>
    //       <TableBody>
    //         {table.getRowModel().rows.length ? (
    //           table.getRowModel().rows.map((row) => (
    //             <TableRow key={row.id}>
    //               {row.getAllCells().map((cell) => (
    //                 <TableCell key={cell.id}>
    //                   <table.FlexRender cell={cell} />
    //                 </TableCell>
    //               ))}
    //             </TableRow>
    //           ))
    //         ) : (
    //           <TableRow>
    //             <TableCell
    //               colSpan={table.getAllColumns().length}
    //               className="h-24 text-center"
    //             >
    //               No results.
    //             </TableCell>
    //           </TableRow>
    //         )}
    //       </TableBody>
    //     </Table>
    //   </div>
    //   <span className="inline-controls">
    //     <div>Page</div>
    //     <strong>
    //       {(table.state.pagination.pageIndex + 1).toLocaleString()} of{" "}
    //       {table.getPageCount().toLocaleString()}
    //     </strong>
    //   </span>
    //   <span className="inline-controls">
    //     | Go to page:
    //     <input
    //       type="number"
    //       min="1"
    //       max={table.getPageCount()}
    //       value={table.state.pagination.pageIndex + 1}
    //       onChange={(e) => {
    //         const page = e.target.value ? Number(e.target.value) - 1 : 0;
    //         table.setPageIndex(page);
    //       }}
    //       className="page-size-input"
    //     />
    //   </span>
    //   <select
    //     value={table.state.pagination.pageSize}
    //     onChange={(e) => {
    //       table.setPageSize(Number(e.target.value));
    //     }}
    //   >
    //     {[5, 10, 20, 30, 40, 50].map((pageSize) => (
    //       <option key={pageSize} value={pageSize}>
    //         Show {pageSize}
    //       </option>
    //     ))}
    //     <option value={Infinity}>Show All</option>
    //   </select>
    //   <div className="flex items-center justify-end space-x-2 py-4">
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       onClick={() => table.previousPage()}
    //       disabled={!table.getCanPreviousPage()}
    //     >
    //       <ChevronsLeft />
    //     </Button>
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       onClick={() => table.previousPage()}
    //       disabled={!table.getCanPreviousPage()}
    //     >
    //       <ChevronLeft />
    //     </Button>
    //     {/* <Input
    //       type="number"
    //       min="1"
    //       max={table.getPageCount()}
    //       value={table.state.pagination.pageIndex + 1}
    //       onChange={(e) => {
    //         const page = e.target.value ? Number(e.target.value) - 1 : 0;
    //         table.setPageIndex(page);
    //       }}
    //       className="page-size-input"
    //     /> */}
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       onClick={() => table.nextPage()}
    //       disabled={!table.getCanNextPage()}
    //     >
    //       <ChevronRight />
    //     </Button>
    //     <Button
    //       variant="outline"
    //       size="sm"
    //       onClick={() => table.nextPage()}
    //       disabled={!table.getCanNextPage()}
    //     >
    //       <ChevronsRight />
    //     </Button>
    //   </div>
    // </div>
  );
};
