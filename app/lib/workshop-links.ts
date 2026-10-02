export const STORYBOOK_PORT = "6006";
export const SITE_PORT = "5173";
export const SITE_ORIGIN_KEY = "rent-or-buy-site-origin";

export type WorkshopView = "site" | "storybook";

export function storybookHref(
  location: { protocol: string; hostname: string; origin: string },
  storybookUrl?: string | null,
): string {
  const url = httpUrl(storybookUrl) ?? new URL(`${location.protocol}//${location.hostname}:${STORYBOOK_PORT}/`);
  url.searchParams.set("site", `${location.origin}/`);
  return url.toString();
}

export function storybookHome(
  location: { protocol: string; hostname: string },
  storybookUrl?: string | null,
): string {
  return httpUrl(storybookUrl)?.toString() ?? `${location.protocol}//${location.hostname}:${STORYBOOK_PORT}/`;
}

export function siteHref(input: {
  protocol: string;
  hostname: string;
  search: string;
  parentSearch: string | null;
  storedSite: string | null;
  storybookUrl?: string | null;
}): { href: string; storeSite: string | null } {
  const fromQuery = acceptedSite(readSiteParam(input.search), input.hostname, input.storybookUrl);
  if (fromQuery) {
    return { href: fromQuery, storeSite: fromQuery };
  }
  const fromParent = acceptedSite(
    input.parentSearch ? readSiteParam(input.parentSearch) : null,
    input.hostname,
    input.storybookUrl,
  );
  if (fromParent) {
    return { href: fromParent, storeSite: fromParent };
  }
  const stored = acceptedSite(input.storedSite, input.hostname, input.storybookUrl);
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

function acceptedSite(value: string | null, hostname: string, storybookUrl?: string | null): string | null {
  const url = httpUrl(value);
  if (!url) {
    return null;
  }
  if (url.hostname === hostname || httpUrl(storybookUrl)?.hostname === hostname) {
    return url.toString();
  }
  return null;
}

function httpUrl(value: string | null | undefined): URL | null {
  if (!value?.trim()) {
    return null;
  }
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}
