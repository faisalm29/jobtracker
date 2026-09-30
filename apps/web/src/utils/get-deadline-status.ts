// Determines alert color based on urgency (<= 1 day red, <= 3 days amber, otherwise normal)
export const getDeadlineStatus = (deadlineInput: Date | string) => {
  const deadline = new Date(deadlineInput);
  const now = new Date();
  const diffDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays <= 0) {
    return {
      text: "Due Today",
      className:
        "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    };
  }
  if (diffDays === 1) {
    return {
      text: "1 day left",
      className:
        "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
    };
  }
  if (diffDays <= 3) {
    return {
      text: `${diffDays} days left`,
      className:
        "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    };
  }
  return {
    text: `${diffDays} days left`,
    className: "bg-muted text-muted-foreground border-border",
  };
};
