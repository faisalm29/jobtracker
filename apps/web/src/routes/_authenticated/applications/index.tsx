import { applicationsQueryOptions } from "@/features/queries";
import { APPLICATION_STATUSES } from "@jobtracker/constants";
import { applicationsQuerySchema, type Application } from "@jobtracker/schemas";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  useTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { columns, features } from "@/features/applications/components/columns";
import { useState } from "react";
import { ApplicationTable } from "@/components/ApplicationTable";

// Fallback defaults
const defaultSearch = applicationsQuerySchema.parse({});
const defaultData: Array<Application> = [];

export const Route = createFileRoute("/_authenticated/applications/")({
  staticData: {
    breadcrumb: "Applications",
  },
  validateSearch: (search) => {
    const res = applicationsQuerySchema.safeParse(search);
    return res.success ? res.data : defaultSearch;
  },
  // loaderDeps tells the router which search params trigger loader re-execution
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    queryClient.query(applicationsQueryOptions(deps)),
  component: ApplicationsPage,
});

function ApplicationsPage() {
  // const search = Route.useSearch();
  // const { data: applications } = useSuspenseQuery(
  //   applicationsQueryOptions(search)
  // );

  // const navigate = Route.useNavigate();
  // const paginationState = {
  //   pageIndex: search.page - 1,
  //   pageSize: search.limit,
  // };

  // const sortingState = search.sortBy
  //   ? [{ id: search.sortBy, desc: search.sortOrder === "desc" }]
  //   : [];

  // const table = useTable({
  //   features,
  //   data: applications.data,
  //   columns,
  //   pageCount: applications.pagination.totalPages,
  //   manualPagination: true,
  //   manualSorting: true,
  //   manualFiltering: true,
  //   state: {
  //     pagination: paginationState,
  //     sorting: sortingState,
  //   },

  //   // 3. Sync changes back to TanStack Router URL
  //   onPaginationChange: (updater) => {
  //     const next =
  //       typeof updater === "function" ? updater(paginationState) : updater;
  //     navigate({
  //       search: (prev) => ({
  //         ...prev,
  //         page: next.pageIndex + 1,
  //         limit: next.pageSize,
  //       }),
  //     });
  //   },

  //   onSortingChange: (updater) => {
  //     const next =
  //       typeof updater === "function" ? updater(sortingState) : updater;
  //     const primarySort = next[0];
  //     navigate({
  //       search: (prev) => ({
  //         ...prev,
  //         page: 1,
  //         sortBy: primarySort?.id,
  //         sortOrder: primarySort?.desc ? "desc" : "asc",
  //       }),
  //     });
  //   },
  // });
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: applications } = useSuspenseQuery(
    applicationsQueryOptions(search)
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  // const [globalFilter, setGlobalFilter] = useState("");
  // const [pagination, setPagination] = useState<PaginationState>({
  //   pageIndex: 0,
  //   pageSize: 10,
  // });
  const pagination: PaginationState = {
    pageIndex: search.page - 1,
    pageSize: search.limit,
  };
  const columnFilters: ColumnFiltersState = search.status?.length
    ? [{ id: "status", value: search.status[0] }]
    : [];

  // const pageSizeQueryKey =
  //   pagination.pageSize === Infinity ? "all" : pagination.pageSize;

  const table = useTable(
    {
      features,
      columns,
      data: applications.data ?? defaultData,
      // rowCount: applications.pagination.totalItems,
      pageCount: applications.pagination.totalPages,
      getRowId: (row) => String(row.id),
      state: {
        sorting,
        globalFilter: search.search ?? "",
        columnFilters,
        pagination,
      },
      // onSortingChange: (updater) => {
      //   setSorting(updater);
      //   setPagination((previous) => ({ ...previous, pageIndex: 0 }));
      // },
      onSortingChange: setSorting,
      // onGlobalFilterChange: (updater) => {
      //   (setGlobalFilter(updater),
      //     setPagination((previous) => ({ ...previous, pageIndex: 0 })));
      // },
      onGlobalFilterChange: (updater) => {
        const currentFilter = search.search ?? "";
        const nextFilter =
          typeof updater === "function" ? updater(currentFilter) : updater;

        navigate({
          search: (previous) => ({
            ...previous,
            page: 1,
            search: nextFilter.trim() || undefined,
          }),
        });
      },
      onColumnFiltersChange: (updater) => {
        const nextFilters =
          typeof updater === "function" ? updater(columnFilters) : updater;
        const statusFilter = nextFilters.find(
          (filter) => filter.id === "status"
        )?.value;
        const status = APPLICATION_STATUSES.find(
          (candidate) => candidate === statusFilter
        );

        navigate({
          search: (previous) => ({
            ...previous,
            page: 1,
            status: status ? [status] : undefined,
          }),
        });
      },
      // onPaginationChange: setPagination,
      onPaginationChange: (updater) => {
        const next =
          typeof updater === "function" ? updater(pagination) : updater;
        navigate({
          search: (previous) => ({
            ...previous,
            page: next.pageIndex + 1,
            limit: next.pageSize,
          }),
        });
      },
      manualFiltering: true,
      manualPagination: true,
      manualSorting: true,
    },
    (state) => state
  );
  return (
    <>
      <h1>Applications</h1>
      <div className="container mx-auto py-10">
        <ApplicationTable table={table} />
      </div>
      {/* <div>
        <ul>
          {applications.data.map((app) => (
            <li>{app.companyName}</li>
          ))}
        </ul>
      </div> */}
    </>
  );
}
