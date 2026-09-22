import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/tv/$slug")({
  head: () => ({
    meta: [
      { title: "Series Details — JOKER MOVIES" },
      { name: "description", content: "TV series details, seasons and streaming links on JOKER MOVIES." },
      { property: "og:title", content: "Series Details — JOKER MOVIES" },
      { property: "og:description", content: "TV series details, seasons and streaming links on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/TV/TvDetails")),
});
