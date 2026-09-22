import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/verify-email")({
  head: () => ({
    meta: [
      { title: "Verify Email — JOKER MOVIES" },
      { name: "description", content: "Verify your email address to finish setting up your JOKER MOVIES account." },
      { property: "og:title", content: "Verify Email — JOKER MOVIES" },
      { property: "og:description", content: "Verify your email address to finish setting up your JOKER MOVIES account." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/EmailVerificationPage")),
});
