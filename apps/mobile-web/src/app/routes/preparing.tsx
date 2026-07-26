import PreparingPage from "@/pages/preparing";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/preparing")({
  component: PreparingPage,
});
