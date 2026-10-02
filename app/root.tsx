import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import publicSans400 from "@fontsource/public-sans/400.css?url";
import { WorkshopSwitch } from "./components/molecules/workshop-switch";
import { storybookHref } from "./lib/workshop-links";
import stylesheet from "./tailwind.css?url";

export function loader({ request }: LoaderFunctionArgs) {
  const site = new URL(request.url);
  const storybookUrl = process.env.STORYBOOK_URL?.trim() || null;
  return {
    storybookUrl,
    storybookLink: storybookHref(
      { protocol: site.protocol, hostname: site.hostname, origin: site.origin },
      storybookUrl,
    ),
  };
}

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: publicSans400 },
  { rel: "stylesheet", href: stylesheet },
];

export const meta: MetaFunction = () => [
  { title: "Rent or Buy? Let the numbers decide." },
  {
    name: "description",
    content:
      "Compare the cash, equity, and invested down payment of buying or renting. No account.",
  },
];

export function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const data = useRouteLoaderData<typeof loader>("root");
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-canvas font-sans text-ink antialiased">
        <div className="mx-auto flex w-full max-w-[90rem] justify-end px-4 pt-4 sm:px-8 lg:px-12">
          <WorkshopSwitch
            current="site"
            storybookUrl={data?.storybookUrl}
            storybookLink={data?.storybookLink}
          />
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl">This page hit a problem.</h1>
      <p className="mt-4 text-lg">Reload it and enter the figures again.</p>
    </main>
  );
}
