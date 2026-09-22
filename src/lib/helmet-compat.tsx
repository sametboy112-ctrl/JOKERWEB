/**
 * Minimal react-helmet-async replacement that writes head tags directly to the
 * document. Aliased as "react-helmet-async" in vite.config.ts.
 */
import { Children, isValidElement, useEffect, type ReactNode } from "react";

export function HelmetProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function applyElement(element: any): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const type = element.type as string;
  const props = { ...(element.props ?? {}) } as Record<string, any>;

  if (type === "title") {
    const text = Children.toArray(props["children"]).join("");
    document.title = text;
    return null;
  }

  const node = document.createElement(type);
  node.setAttribute("data-legacy-helmet", "true");

  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (value == null) continue;
    node.setAttribute(key, String(value));
  }

  if (props["children"] != null && (type === "script" || type === "style")) {
    node.textContent = Children.toArray(props["children"]).join("");
  }

  // Replace an existing tag with the same identity (name/property/rel).
  const identity = props["name"]
    ? `${type}[name="${props["name"]}"]`
    : props["property"]
      ? `${type}[property="${props["property"]}"]`
      : props["rel"]
        ? `${type}[rel="${props["rel"]}"]`
        : null;

  // Only ever touch nodes this shim created — router-owned head tags must stay.
  if (identity) {
    document.head
      .querySelectorAll(`${identity}[data-legacy-helmet="true"]`)
      .forEach((existing) => existing.remove());
  }

  document.head.appendChild(node);
  return node;
}

export function Helmet({ children }: { children?: ReactNode }) {
  const elements = Children.toArray(children).filter(isValidElement);

  useEffect(() => {
    const added: HTMLElement[] = [];
    for (const element of elements) {
      const node = applyElement(element);
      if (node) added.push(node);
    }
    return () => {
      added.forEach((node) => {
        if (node.parentNode === document.head) node.remove();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(elements.map((el: any) => [el.type, el.props]))]);

  return null;
}

export default Helmet;
