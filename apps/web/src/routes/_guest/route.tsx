import { authClient } from "@/lib/auth-client";
import { getSafeRedirect } from "@/utils/get-safe-redirect";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { z } from "zod";

const guestSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_guest")({
  validateSearch: guestSearchSchema,
  beforeLoad: async ({ search }) => {
    const { data: session } = await authClient.getSession();

    if (session) {
      throw redirect({
        to: getSafeRedirect(search.redirect),
      });
    }
  },
  component: GuestLayout,
});

function GuestLayout() {
  return <Outlet />;
}
