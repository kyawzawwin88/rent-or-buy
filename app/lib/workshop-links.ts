export const STORYBOOK_PORT = "6006";
export const SITE_PORT = "5173";
export const SITE_ORIGIN_KEY = "rent-or-buy-site-origin";

export type WorkshopView = "site" | "storybook";

export function storybookHref(location: { protocol: string; hostname: string; origin: string }): string {
  const url = new URL(`${location.protocol}//${location.hostname}:${STORYBOOK_PORT}/`);
  url.searchParams.set("site", `${location.origin}/`);
  return url.toString();
}

export function siteHref(input: {
  protocol: string;
  hostname: string;
  search: string;
  parentSearch: string | null;
  storedSite: string | null;
}): { href: string; storeSite: string | null } {
  const fromQuery = sameHostHttp(readSiteParam(input.search), input.hostname);
  if (fromQuery) {
    return { href: fromQuery, storeSite: fromQuery };
  }
  const fromParent = sameHostHttp(
    input.parentSearch ? readSiteParam(input.parentSearch) : null,
    input.hostname,
  );
  if (fromParent) {
    return { href: fromParent, storeSite: fromParent };
  }
  const stored = sameHostHttp(input.storedSite, input.hostname);
  if (stored) {
    return { href: stored, storeSite: null };
  }
  return {
    href: `${input.protocol}//${input.hostname}:${SITE_PORT}/`,
    storeSite: null,
  };
}

function readSiteParam(search: string): string | null {
  return new URLSearchParams(search).get("site");
}

function sameHostHttp(value: string | null, hostname: string): string | null {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    if (url.hostname !== hostname) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
