import CompletePage from "@/pages/complete";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/complete")({
  component: CompletePage,
});
