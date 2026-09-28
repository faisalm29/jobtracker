import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { LoginForm } from "@/components/LoginForm";
import { authClient } from "@/lib/auth-client";
import { getSafeRedirect } from "@/utils/get-safe-redirect";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  beforeLoad: async ({ search }) => {
    const { data: session } = await authClient.getSession();

    if (session) {
      throw redirect({
        to: getSafeRedirect(search.redirect),
      });
    }
  },
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
