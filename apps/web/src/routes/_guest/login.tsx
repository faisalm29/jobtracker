import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/LoginForm";

export const Route = createFileRoute("/_guest/login")({
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectUrl } = Route.useSearch();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectUrl={redirectUrl} />
      </div>
    </div>
  );
}
