import { useEffect } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  redirect,
  useLoaderData,
  useRevalidator
} from "react-router";

import "@keystone-css/studio-tokens/root.css";
import type { LinksFunction } from "react-router";

import type { Route } from "./+types/root";
import { Label } from "./components/Label";
import { Layout as LayoutBody } from "./components/Layout";
import { LayoutHeader } from "./components/LayoutHeader";
import { LayoutHeaderLogo } from "./components/LayoutHeaderLogo";
import { LayoutMain } from "./components/LayoutMain";
import { AdapterContext, IsLocalContext, TokensPathContext, VersionsDirContext } from "./context";
import { UserContext } from "./saas/auth/auth.context";
import { LayoutHeaderUserMenu } from "./saas/auth/LayoutHeaderUserMenu";
import { ActiveProjectContext } from "./saas/projects/projects.context";
import { saasMiddlewares } from "./saas/saas.middleware";
import { FileSystemAdapter } from "./utils/StorageAdapter";

export const middleware: Route.MiddlewareFunction[] = [
  ({ context }) => {
    const tokensPath = process.env.STUDIO_TOKENS_PATH ?? "";
    const versionsDir = process.env.STUDIO_VERSIONS_DIR ?? "";
    context.set(TokensPathContext, tokensPath);
    context.set(VersionsDirContext, versionsDir);
    context.set(IsLocalContext, process.env.STUDIO_IS_LOCAL === "true");

    // Local path: create FileSystemAdapter from env vars.
    // SaaS path: saasMiddleware (below) sets AdapterContext instead, from the
    // active project resolved via the Cloudflare env workers/app.ts seeds.
    if (tokensPath) {
      context.set(AdapterContext, new FileSystemAdapter(tokensPath, versionsDir));
    }
  },
  ...saasMiddlewares,
  ({ context, request }) => {
    const url = new URL(request.url);
    const isProjectsPath = url.pathname === "/projects";
    const isSaasPagePath =
      url.pathname === "/login" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password" ||
      url.pathname === "/reset-password" ||
      isProjectsPath;

    // Local CLI mode has no accounts/projects concept — send any of these SaaS
    // pages straight to /config instead of each route guarding for IsLocalContext
    // individually.
    if (context.get(IsLocalContext)) {
      if (isSaasPagePath) throw redirect("/config");
      return;
    }

    const isAuthPath =
      url.pathname === "/login" ||
      url.pathname === "/signup" ||
      url.pathname === "/forgot-password" ||
      url.pathname === "/reset-password" ||
      url.pathname.startsWith("/api/auth");

    const user = context.get(UserContext);
    if (!user && !isAuthPath) throw redirect("/login");
    if (user && url.pathname === "/login") throw redirect("/config");
    if (user && !isAuthPath && !isProjectsPath && !context.get(ActiveProjectContext)) {
      throw redirect("/projects");
    }
  }
];

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Mulish:wght@100..900"
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000"
  },
  {
    rel: "stylesheet",
    href: "/font/consolas.css"
  }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <>
        {children}
        <ScrollRestoration />
        <Scripts />
      </>
    </html>
  );
}

export async function loader({ context }: Route.LoaderArgs) {
  return {
    isLocal: context.get(IsLocalContext),
    user: context.get(UserContext)
  };
}

export default function App() {
  const { isLocal, user } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (!isLocal) return;
    const es = new EventSource("/api/tokens-watch");
    es.onmessage = () => revalidator.revalidate();
    return () => es.close();
  }, [isLocal, revalidator]);

  return (
    <LayoutBody>
      <LayoutHeader>
        <LayoutHeaderLogo
          dxSrc="/images/buttery-logo-tokens.png"
          dxAlt="keystone-css-logo"
          dxLabel={
            isLocal && (
              <div>
                <Label dxSize="dense" dxColor="primary">
                  LOCAL MODE
                </Label>
              </div>
            )
          }
        >
          Keystone CSS
        </LayoutHeaderLogo>
        <div />
        {!isLocal && user && <LayoutHeaderUserMenu user={user} />}
      </LayoutHeader>
      <LayoutMain>
        <Outlet />
      </LayoutMain>
    </LayoutBody>
  );
  return;
}
