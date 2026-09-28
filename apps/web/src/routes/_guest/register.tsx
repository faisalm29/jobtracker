import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_guest/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-bold">Create an account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registration form coming soon
        </p>
      </div>
    </div>
  );
}
