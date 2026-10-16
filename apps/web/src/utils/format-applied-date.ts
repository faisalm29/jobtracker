import { formatDistanceToNow, isValid, parseISO } from "date-fns";

export const formatApplied = (appliedDate: Date | string | null): string => {
  if (!appliedDate) return "-";
  const date =
    typeof appliedDate === "string" ? parseISO(appliedDate) : appliedDate;
  return isValid(date) ? formatDistanceToNow(date, { addSuffix: true }) : "-";
};
