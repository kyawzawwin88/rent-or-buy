import { createElement } from "react";
import { act, create } from "react-test-renderer";
import { SITE_ORIGIN_KEY } from "../../lib/workshop-links";
import { WorkshopSwitch } from "./workshop-switch";

type FakeWindow = {
  location: { protocol: string; hostname: string; origin: string; search: string };
  sessionStorage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };
  parent: FakeWindow | { location: { search: string } };
};

function installWindow(search: string, parentSearch: string | null): FakeWindow {
  const store = new Map<string, string>();
  const win = {
    location: {
      protocol: "http:",
      hostname: "localhost",
      origin: "http://localhost:5174",
      search,
    },
    sessionStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
    },
    parent: undefined as unknown as FakeWindow,
  } satisfies Omit<FakeWindow, "parent"> & { parent?: FakeWindow };
  win.parent = parentSearch === null ? win : { location: { search: parentSearch } };
  (globalThis as { window?: FakeWindow }).window = win;
  return win;
}

describe("workshop switch", () => {
  const previous = (globalThis as { window?: unknown }).window;

  afterEach(() => {
    (globalThis as { window?: unknown }).window = previous;
  });

  it("sends the site view to storybook on this host", async () => {
    installWindow("", null);
    let renderer: ReturnType<typeof create> | undefined;
    await act(async () => {
      renderer = create(createElement(WorkshopSwitch, { current: "site" }));
    });
    const links = renderer?.root.findAllByType("a") ?? [];
    expect(links[0]?.props.href).toBe("/");
    expect(links[0]?.props["aria-current"]).toBe("page");
    expect(links[1]?.props.href).toBe("http://localhost:6006/?site=http%3A%2F%2Flocalhost%3A5174%2F");
  });

  it("returns from storybook to the stored site", async () => {
    const win = installWindow("", "?site=http://localhost:5174/");
    let renderer: ReturnType<typeof create> | undefined;
    await act(async () => {
      renderer = create(createElement(WorkshopSwitch, { current: "storybook" }));
    });
    const links = renderer?.root.findAllByType("a") ?? [];
    expect(links[0]?.props.href).toBe("http://localhost:5174/");
    expect(links[1]?.props["aria-current"]).toBe("page");
    expect(win.sessionStorage.getItem(SITE_ORIGIN_KEY)).toBe("http://localhost:5174/");
  });
});
