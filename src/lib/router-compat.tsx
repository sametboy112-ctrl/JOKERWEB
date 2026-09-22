/**
 * Compatibility layer that maps the legacy app's routing API onto
 * TanStack Router. Aliased as "react-router-dom" in vite.config.ts.
 */
import { forwardRef, useCallback, useMemo } from "react";
import {
  Outlet,
  useNavigate as useTanstackNavigate,
  useParams as useTanstackParams,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";

export { Outlet };

export function useLocation() {
  const location = useRouterState({ select: (s) => s.location });
  return useMemo(
    () => ({
      pathname: location.pathname,
      search: location.searchStr ?? "",
      hash: location.hash ?? "",
      state: location.state,
      key: location.href,
    }),
    [location],
  );
}

export function useNavigate() {
  const navigate = useTanstackNavigate();
  const router = useRouter();

  return useCallback(
    (to: any, options: any = {}) => {
      if (typeof to === "number") {
        if (to < 0) router.history.back();
        else router.history.forward();
        return;
      }
      const target =
        typeof to === "string"
          ? to
          : `${to?.pathname ?? ""}${to?.search ?? ""}${to?.hash ?? ""}`;
      navigate({ to: target, replace: !!options.replace, state: options.state } as any);
    },
    [navigate, router],
  );
}

export function useParams() {
  return useTanstackParams({ strict: false }) as Record<string, string>;
}

export function useSearchParams(): [URLSearchParams, (next: any, opts?: any) => void] {
  const searchStr = useRouterState({ select: (s) => s.location.searchStr ?? "" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const setSearchParams = useCallback(
    (next: any, opts: any = {}) => {
      const resolved = typeof next === "function" ? next(new URLSearchParams(searchStr)) : next;
      const usp =
        resolved instanceof URLSearchParams ? resolved : new URLSearchParams(resolved ?? {});
      const qs = usp.toString();
      navigate(`${pathname}${qs ? `?${qs}` : ""}`, opts);
    },
    [navigate, pathname, searchStr],
  );

  return [params, setSearchParams];
}

export const Link = forwardRef<HTMLAnchorElement, any>(function Link(
  { to, replace, state, children, onClick, ...rest },
  ref,
) {
  const navigate = useNavigate();
  const href = typeof to === "string" ? to : `${to?.pathname ?? ""}${to?.search ?? ""}`;

  return (
    <a
      ref={ref}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        navigate(href, { replace, state });
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export const NavLink = Link;
