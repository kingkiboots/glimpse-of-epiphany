import ErrorPage from "@/pages/error";
import type { ERROR_TYPES } from "@/shared/consts";
import { createFileRoute } from "@tanstack/react-router";

type ErrorSearch = {
  type?: keyof typeof ERROR_TYPES;
};

export const Route = createFileRoute("/error")({
  component: ErrorPage,
  validateSearch: (search: Record<string, unknown>): ErrorSearch => {
    return {
      type: typeof search.type === "string" ? search.type : undefined,
    };
  },
});
