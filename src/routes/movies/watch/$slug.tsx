import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/movies/watch/$slug")({
  head: () => ({
    meta: [
      { title: "Watch Movie — JOKER MOVIES" },
      { name: "description", content: "Watch this movie online free with cast, ratings and details on JOKER MOVIES." },
      { property: "og:title", content: "Watch Movie — JOKER MOVIES" },
      { property: "og:description", content: "Watch this movie online free with cast, ratings and details on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/Movie/MovieDetails")),
});
