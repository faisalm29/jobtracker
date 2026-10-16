import {
  features,
  type FacetKey,
  type FacetOption,
} from "@/features/applications/components/columns";
import type { Application } from "@jobtracker/schemas";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@jobtracker/ui/components/field";
import { Checkbox } from "@jobtracker/ui/components/checkbox";
import { Input } from "@jobtracker/ui/components/input";
import type { Column, ReactTable } from "@tanstack/react-table";

interface FilterProps {
  column: Column<typeof features, Application>;
  table: ReactTable<typeof features, Application>;
}

export function Filter({ column, table }: FilterProps) {
  const { filterVariant, facetOptions } = column.columnDef.meta ?? {};
  return (
    <table.Subscribe selector={(state) => state.columnFilters}>
      {() =>
        filterVariant === "facets" && facetOptions ? (
          <FacetFilter
            column={column}
            options={facetOptions}
            selected={(column.getFilterValue() ?? []) as Array<FacetKey>}
            counts={column.getFacetedUniqueValues()}
          />
        ) : (
          <Input
            aria-label={`Filter ${column.id}`}
            value={(column.getFilterValue() ?? "") as string}
            onChange={(event) => column.setFilterValue(event.target.value)}
            placeholder="Search…"
          />
        )
      }
    </table.Subscribe>
  );
}

interface FacetFilterProps {
  column: Column<typeof features, Application>;
  options: ReadonlyArray<FacetOption>;
  selected: Array<FacetKey>;
  counts: Map<unknown, number>;
}

function FacetFilter({ column, options, selected, counts }: FacetFilterProps) {
  const allSelected = selected.length === 0;
  const totalCount = Array.from(counts.values()).reduce((a, b) => a + b, 0);

  const selectAll = () => column.setFilterValue(undefined);

  const toggleOption = (value: FacetKey) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];

    column.setFilterValue(
      next.length === 0 || next.length === options.length ? undefined : next
    );
  };

  const toggleBucket = (value: FacetKey) => {
    column.setFilterValue(
      selected.includes(value)
        ? selected.filter((selectedValue) => selectedValue !== value)
        : [...selected, value]
    );
  };

  return (
    <FieldSet className="px-2 py-1.5">
      <FieldLegend className="sr-only">Filter {column.id}</FieldLegend>
      <FieldGroup>
        <FacetRow
          id={`${column.id}-all`}
          label="All"
          count={totalCount}
          checked={allSelected}
          onCheckedChange={selectAll}
        />
        {options.map((option) => (
          <FacetRow
            key={option.value}
            id={`${column.id}-${option.value}`}
            label={option.label}
            count={counts.get(option.value) ?? 0}
            checked={selected.includes(option.value)}
            onCheckedChange={() => toggleOption(option.value)}
          />
        ))}
      </FieldGroup>
    </FieldSet>
  );
}

interface FacetRowProps {
  id: string;
  label: string;
  count: number;
  checked: boolean;
  onCheckedChange: () => void;
}

function FacetRow({
  id,
  label,
  count,
  checked,
  onCheckedChange,
}: FacetRowProps) {
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <FieldLabel htmlFor={id} className="flex-1">
        {label}
      </FieldLabel>
      <span className="text-xs text-muted-foreground tabular-nums">
        {count.toLocaleString()}
      </span>
    </Field>
  );
}
