import { createFileRoute } from "@tanstack/react-router";
import { clientPage } from "@/lib/client-page";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — JOKER MOVIES" },
      { name: "description", content: "Reset the password for your JOKER MOVIES account." },
      { property: "og:title", content: "Reset Password — JOKER MOVIES" },
      { property: "og:description", content: "Reset the password for your JOKER MOVIES account." },
    ],
  }),
  component: clientPage(() => import("@/legacy/pages/Home/ResetPasswordPage")),
});
