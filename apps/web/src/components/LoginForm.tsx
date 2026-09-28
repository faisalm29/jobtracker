import { Briefcase } from "lucide-react";
import { Button } from "@jobtracker/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@jobtracker/ui/components/field";
import { Input } from "@jobtracker/ui/components/input";
import { cn } from "@jobtracker/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { getSafeRedirect } from "@/utils/get-safe-redirect";

interface LoginFormProps extends React.ComponentProps<"div"> {
  redirectUrl?: string;
}

export function LoginForm({
  className,
  redirectUrl,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Please enter a valid email address"),
        password: z.string().min(1, "Password is required"),
      }),
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (error) {
        setServerError(error.message ?? "Failed to sign in. Please try again.");
        return;
      }

      await router.invalidate();
      await router.navigate({
        to: getSafeRedirect(redirectUrl) ?? "/applications",
      });
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <Briefcase className="size-6" />
            </div>
            <span className="sr-only">Jobtracker</span>

            <h1 className="text-xl font-bold">Welcome to Jobtracker</h1>
            <FieldDescription>Login with your email</FieldDescription>
          </div>

          {/* Server-level error message */}
          {serverError && (
            <div
              role="alert"
              className="rounded-md bg-destructive/15 p-3 text-center text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          {/* Email field */}
          <form.Field
            name="email"
            children={(field) => {
              const hasErrors =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;

              return (
                <Field data-invalid={hasErrors}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="m@example.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {hasErrors && (
                    <FieldError>
                      {field.state.meta.errors
                        .map((err) =>
                          typeof err === "string" ? err : err?.message
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          />

          {/* Password field */}
          <form.Field
            name="password"
            children={(field) => {
              const hasErrors =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              return (
                <Field data-invalid={hasErrors}>
                  <div className="flex items-center">
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {hasErrors && (
                    <FieldError>
                      {field.state.meta.errors
                        .map((err) =>
                          typeof err === "string" ? err : err?.message
                        )
                        .filter(Boolean)
                        .join(", ")}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          />

          {/* Submit button with loading state */}
          <Field>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              )}
            />
          </Field>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
