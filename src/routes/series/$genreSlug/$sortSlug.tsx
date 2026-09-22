import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/series/$genreSlug/$sortSlug")({
  head: () => ({
    meta: [
      { title: "Sorted Series — JOKER MOVIES" },
      { name: "description", content: "TV series sorted by popularity, rating or air date on JOKER MOVIES." },
      { property: "og:title", content: "Sorted Series — JOKER MOVIES" },
      { property: "og:description", content: "TV series sorted by popularity, rating or air date on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/TV/Series")),
});
