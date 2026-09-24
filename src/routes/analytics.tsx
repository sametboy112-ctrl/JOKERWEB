import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Visitor Analytics — JOKER MOVIES" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Visitor and content-request analytics for JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/AnalyticsPage")),
});
