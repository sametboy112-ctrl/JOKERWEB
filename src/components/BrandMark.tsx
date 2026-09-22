/**
 * JOKERTZ neon watermark — position switches per page to avoid overlapping
 * content. Bottom-left on the Home page, bottom-right on Movies / TV /
 * Search / Watchlist / detail pages. Neon glow matches the trending-row accents.
 */
import { useLocation } from "@/lib/router-compat";

export default function BrandMark() {
  const { pathname } = useLocation();

  // Home stays on the left; every other page moves to the right corner.
  const onRight = pathname !== "/";

  // Home → bottom-left. Right-side pages → bottom-right.
  const sideClasses = onRight
    ? "right-3 md:right-[96px]"
    : "left-3 md:left-[96px]";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none fixed z-40 bottom-[calc(4.9rem+env(safe-area-inset-bottom))] md:bottom-4 ${sideClasses}`}
    >
      <span className="jokertz-neon text-[15px] md:text-[19px] font-black italic tracking-[0.18em] uppercase">
        JOKERTZ
      </span>
    </div>
  );
}
