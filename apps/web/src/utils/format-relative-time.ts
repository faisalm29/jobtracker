export function formatRelativeTime(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  // If in the future or under 60 seconds ago
  if (Math.abs(diffInSeconds) < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    return rtf.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    return rtf.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) <= 7) {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    return rtf.format(diffInDays, "day");
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
