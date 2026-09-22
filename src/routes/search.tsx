import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — JOKER MOVIES" },
      { name: "description", content: "Search thousands of movies and TV shows and start streaming on JOKER MOVIES." },
      { property: "og:title", content: "Search — JOKER MOVIES" },
      { property: "og:description", content: "Search thousands of movies and TV shows and start streaming on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/SearchPage")),
});
