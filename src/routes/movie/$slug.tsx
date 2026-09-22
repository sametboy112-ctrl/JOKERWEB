import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/movie/$slug")({
  head: () => ({
    meta: [
      { title: "Movie Details — JOKER MOVIES" },
      { name: "description", content: "Movie details, cast and streaming links on JOKER MOVIES." },
      { property: "og:title", content: "Movie Details — JOKER MOVIES" },
      { property: "og:description", content: "Movie details, cast and streaming links on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/Movie/MovieDetails")),
});
