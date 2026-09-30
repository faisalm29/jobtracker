// Formats upcoming interview time with relative countdown
export const formatCountdown = (dateInput: Date | string) => {
  const date = new Date(dateInput);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays <= 0) return `Today at ${timeStr}`;
  if (diffDays === 1) return `Tomorrow at ${timeStr}`;
  if (diffDays <= 7)
    return `In ${diffDays} days (${date.toLocaleDateString("en-US", { weekday: "short" })})`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
