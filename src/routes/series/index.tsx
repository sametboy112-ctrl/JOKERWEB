import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/series/")({
  head: () => ({
    meta: [
      { title: "TV Series — JOKER MOVIES" },
      { name: "description", content: "Browse and stream free TV series by genre and rating on JOKER MOVIES." },
      { property: "og:title", content: "TV Series — JOKER MOVIES" },
      { property: "og:description", content: "Browse and stream free TV series by genre and rating on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/TV/Series")),
});
