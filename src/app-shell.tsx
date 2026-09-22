import { useEffect } from "react";
import { WatchlistProvider } from "./legacy/context/WatchlistContext";
import ParentComponent from "./legacy/pages/Home/ParentComponent";
import BrandMark from "./components/BrandMark";

/** Warm the code-split page chunks once the browser is idle so tab
 *  switches (Movies / TV / Search / Watchlist) render immediately. */
function usePrefetchPages() {
  useEffect(() => {
    const warm = () => {
      import("./legacy/pages/Home/Movie/Movie");
      import("./legacy/pages/Home/TV/Series");
      import("./legacy/pages/Home/SearchPage");
      import("./legacy/pages/Home/WatchlistPage");
      import("./legacy/pages/Home/Movie/MovieDetails");
      import("./legacy/pages/Home/TV/TvDetails");
    };
    const w = window as unknown as { requestIdleCallback?: (cb: () => void) => number };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(warm);
      return () => {};
    }
    const t = setTimeout(warm, 800);
    return () => clearTimeout(t);
  }, []);
}

export default function AppShell() {
  usePrefetchPages();

  return (
    <WatchlistProvider>
      <ParentComponent />
      <BrandMark />
    </WatchlistProvider>
  );
}
