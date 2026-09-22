import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/auth-action")({
  head: () => ({
    meta: [
      { title: "Account Action — JOKER MOVIES" },
      { name: "description", content: "Complete your JOKER MOVIES account action such as email verification or password reset." },
      { property: "og:title", content: "Account Action — JOKER MOVIES" },
      { property: "og:description", content: "Complete your JOKER MOVIES account action such as email verification or password reset." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/AuthActionPage")),
});
