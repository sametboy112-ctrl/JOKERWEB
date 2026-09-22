import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/movies/")({
  head: () => ({
    meta: [
      { title: "Movies — JOKER MOVIES" },
      { name: "description", content: "Browse and stream free movies by genre, rating and release year on JOKER MOVIES." },
      { property: "og:title", content: "Movies — JOKER MOVIES" },
      { property: "og:description", content: "Browse and stream free movies by genre, rating and release year on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/Movie/Movie")),
});
