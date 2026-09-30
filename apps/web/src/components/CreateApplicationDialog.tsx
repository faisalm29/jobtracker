import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  APPLICATION_STATUSES,
  JOB_TYPES,
  WORKPLACE_TYPES,
  type ApplicationStatus,
  type JobType,
  type WorkplaceType,
} from "@jobtracker/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@jobtracker/ui/components/dialog";
import { Button } from "@jobtracker/ui/components/button";
import { Input } from "@jobtracker/ui/components/input";
import { Label } from "@jobtracker/ui/components/label";
import { AlertCircle, Loader2 } from "lucide-react";

interface CreateApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<string, string> = {
  saved: "Saved",
  applied: "Applied",
  in_progress: "In Progress",
  offered: "Offered",
  accepted: "Accepted",
  rejected: "Rejected",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

const WORKPLACE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "Onsite",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
  other: "Other",
};

export function CreateApplicationDialog({
  open,
  onOpenChange,
}: CreateApplicationDialogProps) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      companyName: "",
      roleTitle: "",
      status: "applied" as ApplicationStatus,
      workplaceType: "remote" as WorkplaceType,
      jobType: "full_time" as JobType,
      location: "",
      jobUrl: "",
      salary: "",
      deadline: "",
      notes: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const payload = {
          companyName: value.companyName.trim(),
          roleTitle: value.roleTitle.trim(),
          status: value.status,
          workplaceType: value.workplaceType || undefined,
          jobType: value.jobType || undefined,
          location: value.location ? value.location.trim() : undefined,
          jobUrl: value.jobUrl ? value.jobUrl.trim() : undefined,
          salary: value.salary ? parseInt(value.salary, 10) : undefined,
          deadline: value.deadline ? new Date(value.deadline) : undefined,
          appliedDate: value.status === "applied" ? new Date() : undefined,
          notes: value.notes ? value.notes.trim() : undefined,
        };

        const res = await apiClient.applications.$post({
          json: payload as any,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            (err as any)?.message ||
              `Failed to create application (${res.status})`
          );
        }

        // Invalidate queries so dashboard and applications lists refresh
        await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        await queryClient.invalidateQueries({ queryKey: ["applications"] });

        form.reset();
        onOpenChange(false);
      } catch (err: any) {
        setServerError(err?.message || "An unexpected error occurred");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            New Application
          </DialogTitle>
          <DialogDescription>
            Add a new job application to start tracking its stages and progress.
          </DialogDescription>
        </DialogHeader>

        {serverError && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Row 1: Company Name & Role Title */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field
              name="companyName"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length === 0
                    ? "Company name is required"
                    : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Company Name *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Google, Stripe"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[11px] text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="roleTitle"
              validators={{
                onChange: ({ value }) =>
                  !value || value.trim().length === 0
                    ? "Role title is required"
                    : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Role Title *</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-[11px] text-destructive">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Row 2: Status, Workplace Type, Job Type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <form.Field name="status">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Status</Label>
                  <select
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as ApplicationStatus)
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {APPLICATION_STATUSES.map((st) => (
                      <option
                        key={st}
                        value={st}
                        className="bg-popover text-popover-foreground"
                      >
                        {STATUS_LABELS[st] ?? st}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="workplaceType">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Workplace</Label>
                  <select
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as WorkplaceType)
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {WORKPLACE_TYPES.map((wp) => (
                      <option
                        key={wp}
                        value={wp}
                        className="bg-popover text-popover-foreground"
                      >
                        {WORKPLACE_LABELS[wp] ?? wp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="jobType">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Job Type</Label>
                  <select
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(e.target.value as JobType)
                    }
                    className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    {JOB_TYPES.map((jt) => (
                      <option
                        key={jt}
                        value={jt}
                        className="bg-popover text-popover-foreground"
                      >
                        {JOB_TYPE_LABELS[jt] ?? jt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </form.Field>
          </div>

          {/* Row 3: Salary, Location, Deadline */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <form.Field name="salary">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Salary (Optional)</Label>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. 15000000"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="location">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Location (Optional)</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Jakarta, ID"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="deadline">
              {(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name}>Deadline (Optional)</Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Row 4: Job URL */}
          <form.Field name="jobUrl">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Job Post URL (Optional)</Label>
                <Input
                  id={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                />
              </div>
            )}
          </form.Field>

          {/* Row 5: Notes */}
          <form.Field name="notes">
            {(field) => (
              <div className="space-y-1.5">
                <Label htmlFor={field.name}>Notes (Optional)</Label>
                <textarea
                  id={field.name}
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. Referral from Sarah, applied with custom resume"
                  className="w-full rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                />
              </div>
            )}
          </form.Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Application"
                  )}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
