import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/movies/$genreSlug/")({
  head: () => ({
    meta: [
      { title: "Browse Movies by Genre — JOKER MOVIES" },
      { name: "description", content: "Explore movies by genre and stream them free on JOKER MOVIES." },
      { property: "og:title", content: "Browse Movies by Genre — JOKER MOVIES" },
      { property: "og:description", content: "Explore movies by genre and stream them free on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/Movie/Movie")),
});
