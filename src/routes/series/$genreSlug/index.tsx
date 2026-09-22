import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/series/$genreSlug/")({
  head: () => ({
    meta: [
      { title: "Browse Series by Genre — JOKER MOVIES" },
      { name: "description", content: "Explore TV series by genre and stream them free on JOKER MOVIES." },
      { property: "og:title", content: "Browse Series by Genre — JOKER MOVIES" },
      { property: "og:description", content: "Explore TV series by genre and stream them free on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/TV/Series")),
});
