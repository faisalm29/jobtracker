import { dateFormatter } from "@/utils/date-formatter";
import { formatDeadline } from "@/utils/format-deadline";
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
  compareItems,
  rankItem,
  type RankingInfo,
} from "@tanstack/match-sorter-utils";
import {
  columnFacetingFeature,
  constructFilterFn,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  filterFn_includesString,
  columnVisibilityFeature,
  createColumnHelper,
  tableFeatures,
  globalFilteringFeature,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filterFn_equalsString,
  metaHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  filterFn_includesStringSensitive,
  type TableFeatures,
  type FilterFn,
  type SortFn,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

const deadlineToneClass = {
  danger: "text-red-600 font-medium",
  warning: "text-amber-600",
  neutral: "text-foreground",
  muted: "text-muted-foreground",
} as const;

type AppliedValue = Date | null;

function toAppliedValue(value: unknown): AppliedValue {
  if (value == null) return null; // null AND undefined (.nullish())
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date;
}

export type FacetKey = string;

type Bucket<TValue> = {
  value: FacetKey;
  label: string;
  test: (value: TValue) => boolean;
};

export type FacetOption = Pick<Bucket<unknown>, "value" | "label">;

interface MyColumnMeta {
  filterVariant?: "text" | "facets";
  facetOptions?: ReadonlyArray<FacetOption>;
}

const dataReferenceDate = new Date();
const now = dataReferenceDate;
const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const startOfYesterday = new Date(startOfToday);
startOfYesterday.setDate(startOfYesterday.getDate() - 1);
const startOfWeek = new Date(startOfToday);
const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

const appliedDateBuckets = [
  {
    value: "not-applied",
    label: "Not applied yet",
    test: (value: AppliedValue) => value === null,
  },
  {
    value: "today",
    label: "Today",
    test: (value: AppliedValue) => value !== null && value >= startOfToday,
  },
  {
    value: "yesterday",
    label: "Yesterday",
    test: (value: AppliedValue) => value !== null && value >= startOfYesterday,
  },
  {
    value: "this-week",
    label: "This week",
    test: (value: AppliedValue) => value !== null && value >= startOfWeek,
  },
  {
    value: "this-month",
    label: "This month",
    test: (value: AppliedValue) => value !== null && value >= startOfMonth,
  },
  {
    value: "older",
    label: "Older",
    test: () => true,
  },
] satisfies ReadonlyArray<Bucket<AppliedValue>>;

function getBucket<TValue>(
  value: TValue,
  buckets: ReadonlyArray<Bucket<TValue>>
): FacetKey {
  const bucket = buckets.find((candidate) => candidate.test(value));

  if (!bucket) {
    throw new Error(`No facet bucket matched ${String(value)}`);
  }

  return bucket.value;
}

function createBucketFilter<TValue>(
  buckets: ReadonlyArray<Bucket<TValue>>,
  normalize: (raw: unknown) => TValue
) {
  return constructFilterFn({
    resolveDataValue: (value) => getBucket(normalize(value), buckets),
    filter: (bucketValue, selectedBuckets: ReadonlyArray<FacetKey>) =>
      selectedBuckets.includes(bucketValue),
    autoRemove: (selectedBuckets: ReadonlyArray<FacetKey>) =>
      !selectedBuckets.length,
  });
}

const statusOptions = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "in_progress", label: "In progress" },
  { value: "offered", label: "Offered" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "ghosted", label: "Ghosted" },
  { value: "withdrawn", label: "Withdrawn" },
] satisfies ReadonlyArray<FacetOption>;

const statusFilterFn = constructFilterFn({
  resolveDataValue: (value) => value as string,
  filter: (status, selected: ReadonlyArray<FacetKey>) =>
    selected.includes(status),
  autoRemove: (selected: ReadonlyArray<FacetKey>) => !selected.length,
});

interface FuzzyFilterMeta {
  itemRank?: RankingInfo;
}

type FuzzyFeatures = TableFeatures & { filterMeta: FuzzyFilterMeta };

const fuzzyFilter: FilterFn<FuzzyFeatures, any> = (
  row,
  columnId,
  value,
  addMeta
) => {
  const itemRank = rankItem(row.getValue(columnId), value);

  addMeta?.({
    itemRank,
  });

  return itemRank.passed;
};

// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
const fuzzySort: SortFn<FuzzyFeatures, any> = (rowA, rowB, columnId) => {
  let dir = 0;

  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId].itemRank as RankingInfo,
      rowB.columnFiltersMeta[columnId].itemRank as RankingInfo
    );
  }

  return dir === 0 ? sortFn_alphanumeric(rowA, rowB, columnId) : dir;
};

export const features = tableFeatures({
  columnFacetingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: {
    equalsString: filterFn_equalsString,
    includesString: filterFn_includesString,
    includesStringSensitive: filterFn_includesStringSensitive,
    fuzzy: fuzzyFilter,
  },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    datetime: sortFn_datetime,
    text: sortFn_text,
    fuzzy: fuzzySort,
  },
  columnMeta: metaHelper<MyColumnMeta>(),
  filterMeta: metaHelper<FuzzyFilterMeta>(),
});

const columnHelper = createColumnHelper<typeof features, Application>();
export const columns = columnHelper.columns([
  columnHelper.accessor("companyName", {
    header: "Company",
    enableHiding: false,
    filterFn: "includesString",
    meta: { filterVariant: "text" },
  }),
  columnHelper.accessor("roleTitle", {
    header: "Role",
    filterFn: "includesString",
    meta: { filterVariant: "text" },
  }),
  columnHelper.accessor("status", {
    header: "Status",
    getUniqueValues: (row) => [row.status],
    filterFn: statusFilterFn,
    meta: {
      filterVariant: "facets",
      facetOptions: statusOptions,
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
    getUniqueValues: (row) => [
      getBucket(toAppliedValue(row.appliedDate), appliedDateBuckets),
    ],
    filterFn: createBucketFilter(appliedDateBuckets, toAppliedValue),
    meta: {
      filterVariant: "facets",
      facetOptions: appliedDateBuckets,
    },
  }),
  columnHelper.accessor("deadline", {
    header: "Deadline",
    cell: (props) => {
      const display = formatDeadline(
        props.getValue(),
        props.row.original.status
      );

      if (!display) {
        return (
          <span className="text-muted-foreground">
            <span aria-hidden="true">—</span>
            <span className="sr-only">No deadline</span>
          </span>
        );
      }

      return (
        <span title={display.title} className={deadlineToneClass[display.tone]}>
          {display.label}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: () => {
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
