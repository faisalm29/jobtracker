import { AppOpenAPI } from "@/lib/types";
import index from "./index.routes";
import applications from "./applications/applications.index";
import dashboard from "./dashboard/dashboard.index";
import { createRouter } from "@/lib/create-router";

export const registerRoutes = (app: AppOpenAPI) => {
  return app
    .route("/", index)
    .route("/applications", applications)
    .route("/dashboard", dashboard);
};

export const router = registerRoutes(createRouter().basePath("/"));
export type Router = typeof router;
