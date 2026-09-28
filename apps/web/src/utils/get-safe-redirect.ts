const GUEST_ROUTES = ["/login", "/register", "/forgot-password"];

export const getSafeRedirect = (url?: string) =>
  url &&
  url.startsWith("/") &&
  !url.startsWith("//") &&
  !GUEST_ROUTES.some((route) => url.startsWith(route))
    ? url
    : "/applications";
