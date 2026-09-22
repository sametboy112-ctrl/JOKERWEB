import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, type ComponentType } from "react";

/**
 * Legacy pages are browser-only (Firebase auth, window/localStorage access).
 * They are lazily imported after hydration so SSR never evaluates them.
 */
export function clientPage(loader: () => Promise<{ default: ComponentType<any> }>) {
  const Lazy = lazy(loader);

  return function ClientPage() {
    return (
      <ClientOnly fallback={<div className="min-h-screen bg-[#0a0c12]" />}>
        <Suspense fallback={<div className="min-h-screen bg-[#0a0c12]" />}>
          <Lazy />
        </Suspense>
      </ClientOnly>
    );
  };
}
