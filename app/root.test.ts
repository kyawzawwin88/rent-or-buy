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
}));

describe("document shell", () => {
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
});
