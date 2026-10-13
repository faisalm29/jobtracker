import type { BreadcrumbItemData } from "@/types/router";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@jobtracker/ui/components/breadcrumb";
import { Link, useMatches } from "@tanstack/react-router";
import { Fragment } from "react";

export const AppBreadcrumb = () => {
  const matches = useMatches();

  const breadcrumbs: BreadcrumbItemData[] = [];

  for (const match of matches) {
    const crumbDef = match.staticData?.breadcrumb;
    if (!crumbDef) continue;

    const resolved =
      typeof crumbDef === "function" ? crumbDef(match) : crumbDef;

    if (!resolved) continue;

    if (Array.isArray(resolved)) {
      breadcrumbs.push(...resolved);
    } else {
      const normalizedPath = match.pathname.replace(/\/+$/, "");
      const isSubRoute =
        normalizedPath.startsWith("/applications/") &&
        resolved !== "Applications";

      if (
        isSubRoute &&
        !breadcrumbs.some(
          (b) => b.href?.replace(/\/+$/, "") === "/applications"
        )
      ) {
        breadcrumbs.push({ label: "Applications", href: "/applications" });
      }

      breadcrumbs.push({
        label: resolved,
        href: normalizedPath || "/",
      });
    }
  }

  if (breadcrumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <Fragment key={crumb.href ?? index}>
              <BreadcrumbItem>
                {isLast || !crumb.href ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={crumb.href}>{crumb.label}</Link>}
                  />
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
