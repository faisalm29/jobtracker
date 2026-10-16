import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

type DeadlineDisplay = {
  label: string;
  tone: "neutral" | "warning" | "danger" | "muted";
  title: string;
};

export const formatDeadline = (
  deadline: Date | string | null,
  status: string,
  now = new Date()
): DeadlineDisplay | null => {
  if (!deadline) return null;

  const date = typeof deadline === "string" ? parseISO(deadline) : deadline;
  if (!isValid(date)) return null;

  const title = format(date, "d MMMM yyyy");

  if (status !== "saved") {
    return { label: title, tone: "muted", title };
  }

  const diff = differenceInCalendarDays(date, now);

  if (diff < 0) return { label: `Overdue by ${-diff}d`, tone: "danger", title };
  if (diff === 0) return { label: "Due today", tone: "danger", title };
  if (diff === 1) return { label: "Due tomorrow", tone: "warning", title };
  if (diff <= 3)
    return { label: `Due in ${diff} days`, tone: "warning", title };
  if (diff <= 7)
    return { label: `Due in ${diff} days`, tone: "neutral", title };

  return { label: format(date, "d MMM"), tone: "neutral", title };
};
