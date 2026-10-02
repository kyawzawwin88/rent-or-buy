import { useEffect, useState } from "react";
import {
  SITE_ORIGIN_KEY,
  siteHref,
  storybookHome,
  storybookHref,
  type WorkshopView,
} from "../../lib/workshop-links";

const linkClass = "inline-flex min-h-11 items-center border-b-2 px-3 text-base text-ink";

export function WorkshopSwitch({
  current,
  storybookUrl = null,
  storybookLink = null,
}: Readonly<{
  current: WorkshopView;
  storybookUrl?: string | null;
  storybookLink?: string | null;
}>) {
  const [hrefs, setHrefs] = useState({
    site: current === "site" ? "/" : "http://localhost:5173/",
    storybook: storybookLink ?? "http://localhost:6006/",
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const { protocol, hostname, origin, search } = window.location;
    if (current === "site") {
      setHrefs({
        site: "/",
        storybook: storybookHref({ protocol, hostname, origin }, storybookUrl),
      });
      return;
    }

    let parentSearch: string | null = null;
    if (window.parent !== window) {
      try {
        parentSearch = window.parent.location.search;
      } catch {
        parentSearch = null;
      }
    }
    const storedSite = window.sessionStorage.getItem(SITE_ORIGIN_KEY);
    const next = siteHref({ protocol, hostname, search, parentSearch, storedSite, storybookUrl });
    if (next.storeSite) {
      window.sessionStorage.setItem(SITE_ORIGIN_KEY, next.storeSite);
    }
    setHrefs({
      site: next.href,
      storybook: storybookHome({ protocol, hostname }, storybookUrl),
    });
  }, [current, storybookUrl]);

  return (
    <nav aria-label="Workshop" className="inline-flex rounded-field border border-line bg-canvas p-1">
      <WorkshopLink href={hrefs.site} current={current === "site"}>
        Site
      </WorkshopLink>
      <WorkshopLink href={hrefs.storybook} current={current === "storybook"}>
        Storybook
      </WorkshopLink>
    </nav>
  );
}

function WorkshopLink({
  href,
  current,
  children,
}: Readonly<{ href: string; current: boolean; children: string }>) {
  return (
    <a
      href={href}
      target="_top"
      aria-current={current ? "page" : undefined}
      className={`${linkClass} ${current ? "border-ink" : "border-transparent"}`}
    >
      {children}
    </a>
  );
}
