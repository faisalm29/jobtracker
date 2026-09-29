import type { AnyRouteMatch } from "@tanstack/react-router";

export interface BreadcrumbItemData {
  label: string;
  href?: string;
}

export type BreadcrumbValue =
  | string
  | BreadcrumbItemData[]
  | ((match: AnyRouteMatch) => string | BreadcrumbItemData[] | undefined);

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    breadcrumb?: BreadcrumbValue;
  }
}
