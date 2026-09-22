import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/watchlist")({
  head: () => ({
    meta: [
      { title: "My Watchlist — JOKER MOVIES" },
      { name: "description", content: "Your saved movies and TV shows, ready to watch on JOKER MOVIES." },
      { property: "og:title", content: "My Watchlist — JOKER MOVIES" },
      { property: "og:description", content: "Your saved movies and TV shows, ready to watch on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/WatchlistPage")),
});
