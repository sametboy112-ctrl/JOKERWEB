import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JOKER MOVIES — Stream Movies & TV Shows Free" },
      {
        name: "description",
        content:
          "JOKER MOVIES is a free streaming site. Watch trending movies and TV series online, browse by genre and stream instantly.",
      },
      { property: "og:title", content: "JOKER MOVIES — Stream Movies & TV Shows Free" },
      {
        property: "og:description",
        content: "Watch trending movies and TV series online free on JOKER MOVIES.",
      },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/HomePage")),
});
