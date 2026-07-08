import { useEffect, type ReactNode } from "react";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  href,
  redirect,
  useLoaderData,
  useRevalidator
} from "react-router";

import "@chamfer-css/studio-tokens/root.css";
import type { LinksFunction } from "react-router";

import { makeColor, makeFontFamily, makeRem, makeReset } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import type { Route } from "./+types/root";
import { AdapterContext, IsLocalContext, TokensPathContext, VersionsDirContext } from "./context";
import { IconGridView } from "./icons/IconGridView";
import { IconPlusSign } from "./icons/IconPlusSign";
import { IconSettings04 } from "./icons/IconSettings04";
import { IconUserCircle } from "./icons/IconUserCircle";
import { UserContext } from "./saas/auth/auth.context";
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
    // React Router's single-fetch protocol requests route data via
    // `<path>.data` (e.g. /projects.data) instead of the bare pathname —
    // strip that suffix before comparing, or every data-only fetch to one of
    // these paths fails the checks below and gets redirected right back to
    // itself, forming an infinite client-side redirect loop.
    const pathname = url.pathname.replace(/\.data$/, "");
    const isProjectsPath = pathname === "/projects";
    const isSaasPagePath =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      isProjectsPath;

    // Local CLI mode has no accounts/projects concept — send any of these SaaS
    // pages straight to /config instead of each route guarding for IsLocalContext
    // individually.
    if (context.get(IsLocalContext)) {
      if (isSaasPagePath) throw redirect("/config");
      return;
    }

    const isAuthPath =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname.startsWith("/api/auth");

    const user = context.get(UserContext);
    if (!user && !isAuthPath) throw redirect("/login");
    if (user && pathname === "/login") throw redirect("/config");
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

const bodyStyles = css`
  height: 100dvh;
  width: 100dvw;
  overflow: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${makeRem(16)};

  :global() {
    html,
    body {
      margin: 0;
      padding: 0;
    }

    * {
      box-sizing: border-box;
      font-family: ${makeFontFamily("mulish")};

      &::after,
      &::before {
        box-sizing: border-box;
      }
    }
  }

  * {
    box-sizing: border-box;
    font-family: ${makeFontFamily("mulish")};
  }
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className={bodyStyles}>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({ context }: Route.LoaderArgs) {
  return {
    isLocal: context.get(IsLocalContext),
    user: context.get(UserContext)
  };
}

const navStyles = css`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr auto;
  border-right: 1px solid #e7e7e7;
  width: ${makeRem(64)};
  padding: ${makeRem(8)};

  a {
    ${makeReset("anchor")};
  }

  button {
    ${makeReset("button")};
  }

  a,
  button {
    width: 100%;
    display: grid;
    place-content: center;
    aspect-ratio: 1 / 1;
    padding: ${makeRem(8)};
    cursor: pointer;

    img,
    svg {
      scale: 1;
    }

    &:hover {
      img,
      svg {
        scale: 1.2;
        transition: all 0.1s ease-in-out;
      }
    }
  }

  img {
    width: 100%;
    aspect-ratio: 1 / 1;
  }

  .root {
    border-bottom: 1px solid #e7e7e7;
  }

  ul {
    ${makeReset("ul")};
    display: flex;
    flex-direction: column;
    gap: ${makeRem(8)};
    padding: ${makeRem(8)} 0;

    li {
      width: 100%;
    }

    a,
    button {
      background: transparent;
      transition: background 0.15s ease-in-out;
      border-radius: ${makeRem(4)};

      &:hover {
        background: ${makeColor("secondary-100", { opacity: 0.3 })};
      }
    }
  }

  .account {
    border-top: 1px solid #e7e7e7;
    align-self: end;
  }
`;

function LayoutNav() {
  return (
    <nav className={navStyles}>
      <div className="root">
        <Link to={href("/")}>
          <img alt="logo" src="/images/chamfer-logo.png" />
        </Link>
      </div>
      <div>
        <ul>
          <li>
            <Link to={href("/config")}>
              <IconSettings04 dxSize={20} />
            </Link>
          </li>
          <li>
            <Link to={href("/projects")}>
              <IconGridView dxSize={20} />
            </Link>
          </li>
          <li>
            <button>
              <IconPlusSign dxSize={20} />
            </button>
          </li>
        </ul>
      </div>
      <div className="account">
        <button>
          <IconUserCircle dxSize={20} />
        </button>
      </div>
    </nav>
  );
}

const mainStyles = css``;

function LayoutMain({ children }: { children?: ReactNode }) {
  return <main className={mainStyles}>{children}</main>;
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
    <>
      <LayoutNav />
      <LayoutMain>
        <Outlet />
      </LayoutMain>
    </>
  );
}
