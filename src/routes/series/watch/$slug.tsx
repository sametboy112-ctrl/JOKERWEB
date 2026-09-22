import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/series/watch/$slug")({
  head: () => ({
    meta: [
      { title: "Watch Series — JOKER MOVIES" },
      { name: "description", content: "Watch TV episodes online free with season and episode picker on JOKER MOVIES." },
      { property: "og:title", content: "Watch Series — JOKER MOVIES" },
      { property: "og:description", content: "Watch TV episodes online free with season and episode picker on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/TV/TvDetails")),
});
