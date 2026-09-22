import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/movies/$genreSlug/$sortSlug")({
  head: () => ({
    meta: [
      { title: "Sorted Movies — JOKER MOVIES" },
      { name: "description", content: "Movies sorted by popularity, rating or release date on JOKER MOVIES." },
      { property: "og:title", content: "Sorted Movies — JOKER MOVIES" },
      { property: "og:description", content: "Movies sorted by popularity, rating or release date on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/Movie/Movie")),
});
