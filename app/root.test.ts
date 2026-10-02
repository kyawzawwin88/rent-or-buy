let loaderData: { storybookUrl: string | null; storybookLink: string } | undefined;

jest.mock("@remix-run/react", () => ({
  Links() {
    return null;
  },
  Meta() {
    return null;
  },
  Outlet() {
    return null;
  },
  Scripts() {
    return null;
  },
  ScrollRestoration() {
    return null;
  },
  useRouteLoaderData() {
    return loaderData;
  },
}));

describe("document shell", () => {
  const previous = process.env.STORYBOOK_URL;

  afterEach(() => {
    loaderData = undefined;
    if (previous === undefined) {
      delete process.env.STORYBOOK_URL;
    } else {
      process.env.STORYBOOK_URL = previous;
    }
  });

  it("renders the page shell, the outlet, and the error page", () => {
    const React = require("react") as typeof import("react");
    const { create } = require("react-test-renderer") as typeof import("react-test-renderer");
    const root = require("./root") as typeof import("./root");

    const shell = create(React.createElement(root.Layout, null, "child"));
    const shellText = JSON.stringify(shell.toJSON());
    expect(shellText).toContain("child");
    expect(shellText).toContain("Site");
    expect(shellText).toContain("Storybook");

    create(React.createElement(root.default));
    const error = create(React.createElement(root.ErrorBoundary));
    expect(JSON.stringify(error.toJSON())).toContain("This page hit a problem.");

    expect(root.links()).toEqual([
      { rel: "stylesheet", href: "asset.css" },
      { rel: "stylesheet", href: "asset.css" },
    ]);
    expect(root.meta()).toEqual([
      { title: "Rent or Buy? Let the numbers decide." },
      {
        name: "description",
        content:
          "Compare the cash, equity, and invested down payment of buying or renting. No account.",
      },
    ]);
  });

  it("points Storybook at STORYBOOK_URL", () => {
    const root = require("./root") as typeof import("./root");
    process.env.STORYBOOK_URL = " https://storybook.example.com/workshop ";
    expect(root.loader({ request: new Request("http://127.0.0.1:5173/") })).toEqual({
      storybookUrl: "https://storybook.example.com/workshop",
      storybookLink: "https://storybook.example.com/workshop?site=http%3A%2F%2F127.0.0.1%3A5173%2F",
    });

    delete process.env.STORYBOOK_URL;
    expect(root.loader({ request: new Request("http://127.0.0.1:5173/") }).storybookLink).toBe(
      "http://127.0.0.1:6006/?site=http%3A%2F%2F127.0.0.1%3A5173%2F",
    );

    loaderData = {
      storybookUrl: "https://storybook.example.com/workshop",
      storybookLink: "https://storybook.example.com/workshop?site=http%3A%2F%2F127.0.0.1%3A5173%2F",
    };
    const React = require("react") as typeof import("react");
    const { create } = require("react-test-renderer") as typeof import("react-test-renderer");
    const shell = create(React.createElement(root.Layout, null, "child"));
    expect(JSON.stringify(shell.toJSON())).toContain(
      "https://storybook.example.com/workshop?site=http%3A%2F%2F127.0.0.1%3A5173%2F",
    );
  });
});
