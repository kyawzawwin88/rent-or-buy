import { siteHref, storybookHome, storybookHref } from "./workshop-links";

describe("workshop links", () => {
  it("points the storybook link at this host and remembers the site origin", () => {
    expect(
      storybookHref({
        protocol: "http:",
        hostname: "localhost",
        origin: "http://localhost:5174",
      }),
    ).toBe("http://localhost:6006/?site=http%3A%2F%2Flocalhost%3A5174%2F");
  });

  it("returns to the site origin carried on the storybook address", () => {
    expect(
      siteHref({
        protocol: "http:",
        hostname: "localhost",
        search: "?site=http%3A%2F%2Flocalhost%3A5174%2F",
        parentSearch: null,
        storedSite: null,
      }),
    ).toEqual({ href: "http://localhost:5174/", storeSite: "http://localhost:5174/" });
  });

  it("reads the site origin from the parent address", () => {
    expect(
      siteHref({
        protocol: "http:",
        hostname: "127.0.0.1",
        search: "",
        parentSearch: "?site=http://127.0.0.1:5174/",
        storedSite: null,
      }).href,
    ).toBe("http://127.0.0.1:5174/");
  });

  it("uses a stored origin when the address has none", () => {
    expect(
      siteHref({
        protocol: "http:",
        hostname: "localhost",
        search: "",
        parentSearch: "",
        storedSite: "http://localhost:5174/calculator",
      }),
    ).toEqual({ href: "http://localhost:5174/calculator", storeSite: null });
  });

  it("uses STORYBOOK_URL when storybook is on another domain", () => {
    expect(
      storybookHref(
        {
          protocol: "http:",
          hostname: "127.0.0.1",
          origin: "http://127.0.0.1:5173",
        },
        "https://storybook.example.com/workshop",
      ),
    ).toBe("https://storybook.example.com/workshop?site=http%3A%2F%2F127.0.0.1%3A5173%2F");
    expect(storybookHome({ protocol: "http:", hostname: "127.0.0.1" }, "https://storybook.example.com")).toBe(
      "https://storybook.example.com/",
    );
  });

  it("ignores a storybook url that is not http", () => {
    expect(
      storybookHref(
        { protocol: "https:", hostname: "localhost", origin: "https://localhost:5173" },
        "javascript:alert(1)",
      ),
    ).toBe("https://localhost:6006/?site=https%3A%2F%2Flocalhost%3A5173%2F");
    expect(
      storybookHome({ protocol: "https:", hostname: "localhost" }, "  "),
    ).toBe("https://localhost:6006/");
  });

  it("returns to a site on another domain when this page is the configured storybook", () => {
    expect(
      siteHref({
        protocol: "https:",
        hostname: "storybook.example.com",
        search: "?site=https://rent.example.com/calculator",
        parentSearch: null,
        storedSite: null,
        storybookUrl: "https://storybook.example.com/",
      }),
    ).toEqual({
      href: "https://rent.example.com/calculator",
      storeSite: "https://rent.example.com/calculator",
    });
  });

  it("ignores a foreign site when this page is not the configured storybook", () => {
    expect(
      siteHref({
        protocol: "https:",
        hostname: "localhost",
        search: "?site=https://evil.example/",
        parentSearch: null,
        storedSite: null,
        storybookUrl: "https://storybook.example.com/",
      }).href,
    ).toBe("https://localhost:5173/");
  });

  it("ignores another host and falls back to the site port", () => {
    expect(
      siteHref({
        protocol: "https:",
        hostname: "localhost",
        search: "?site=https://example.com/",
        parentSearch: "?site=javascript:alert(1)",
        storedSite: "not a url",
      }),
    ).toEqual({ href: "https://localhost:5173/", storeSite: null });
  });
});
