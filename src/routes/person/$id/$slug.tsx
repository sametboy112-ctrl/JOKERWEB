import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/person/$id/$slug")({
  head: () => ({
    meta: [
      { title: "Cast & Crew — JOKER MOVIES" },
      { name: "description", content: "Filmography, biography and known titles for cast and crew on JOKER MOVIES." },
      { property: "og:title", content: "Cast & Crew — JOKER MOVIES" },
      { property: "og:description", content: "Filmography, biography and known titles for cast and crew on JOKER MOVIES." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/Person/PersonPage")),
});
