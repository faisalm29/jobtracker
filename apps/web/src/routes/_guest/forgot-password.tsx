import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guest/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-bold">Forgot your password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password reset form coming soon
        </p>
      </div>
    </div>
  );
}
