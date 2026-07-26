import ComposePage from "@/pages/compose";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/compose")({
  component: ComposePage,
});
