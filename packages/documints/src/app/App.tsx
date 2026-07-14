import { Suspense, lazy, useMemo } from "react";
import { Link, Outlet, type RouteObject, useLocation } from "react-router";

import "@documints/tokens/root.css";
import "./fonts/source-sans-3.css";

import type { DocumintResolvedHeader } from "../config/config.utils.js";
import type {
  DocumintRouteManifestEntryDoc,
  DocumintRouteManifestGraphObject
} from "../utils/util.types.js";
import { DocumintsMetaComponent } from "./components/DocumintsMetaComponent.js";
import { Layout } from "./components/Layout.js";
import { LayoutBody } from "./components/LayoutBody.js";
import { LayoutBodyBreadcrumb } from "./components/LayoutBodyBreadcrumb.js";
import { LayoutBodyBreadcrumbText } from "./components/LayoutBodyBreadcrumbText.js";
import { LayoutBodyMain } from "./components/LayoutBodyMain.js";
import { LayoutBodyNav } from "./components/LayoutBodyNav.js";
import { LayoutBodyTOC } from "./components/LayoutBodyTOC.js";
import { LayoutHeader } from "./components/LayoutHeader.js";
import { DocumintRouteManifestGraphUtils } from "./utils/RouteGraph.js";

function createRoute(route: DocumintRouteManifestEntryDoc, options: { isDocs: boolean }) {
  const Component = lazy(async () => {
    // Import the .(md|mdx) file as a component and collect
    // the other information that was supplied to it
    const { default: DocumentComponent, tableOfContents } = await route.importComponent();

    if (!options.isDocs) {
      return {
        default: () => (
          <>
            <DocumintsMetaComponent title={route.fileNameFormatted} />
            <DocumentComponent />
          </>
        )
      };
    }
    return {
      default: () => {
        return (
          <>
            <DocumintsMetaComponent title={route.fileNameFormatted} />
            <LayoutBodyMain>
              <DocumentComponent />
            </LayoutBodyMain>
            <LayoutBodyTOC tableOfContents={tableOfContents} />
          </>
        );
      }
    };
  });

  return {
    index: true,
    path: route.routePath,
    element: (
      <Suspense
        // We want to wait to render anything until the component is ready
        fallback={null}
      >
        <Component />
      </Suspense>
    )
  };
}

function DocsLayout({ routeModuleGraph }: { routeModuleGraph: DocumintRouteManifestGraphUtils }) {
  const { pathname } = useLocation();

  const graph = useMemo(() => {
    const pageRoute = pathname.split("/").filter(Boolean)[0];
    const graph = routeModuleGraph.getRouteGraphNodeByRoutePath(pageRoute);
    return graph;
  }, [pathname, routeModuleGraph]);

  const breadcrumbLinks = routeModuleGraph.constructBreadcrumbs(pathname);

  return (
    <LayoutBody>
      <LayoutBodyNav graph={graph} />
      <LayoutBodyBreadcrumb>
        <ul>
          {breadcrumbLinks.map((link, i, origArr) => {
            if (i !== origArr.length - 1 && !link.synthetic) {
              return (
                <li key={link.href}>
                  <Link to={link.href}>
                    <LayoutBodyBreadcrumbText>{link.display}</LayoutBodyBreadcrumbText>
                  </Link>
                </li>
              );
            }
            return (
              <li key={link.href || i}>
                <LayoutBodyBreadcrumbText dxIsActive={i === origArr.length - 1}>
                  {link.display}
                </LayoutBodyBreadcrumbText>
              </li>
            );
          })}
        </ul>
      </LayoutBodyBreadcrumb>
      <Outlet />
    </LayoutBody>
  );
}

export function createDocumintRoutes(props: {
  routeGraph: DocumintRouteManifestGraphObject;
  header: DocumintResolvedHeader | undefined;
  routeDocs: DocumintRouteManifestEntryDoc[];
  routeIndex: DocumintRouteManifestEntryDoc;
}): RouteObject[] {
  const routeModuleGraph = new DocumintRouteManifestGraphUtils(props.routeGraph);

  return [
    {
      path: "/",
      element: (
        <Layout>
          <LayoutHeader header={props.header} />
          <Outlet />
        </Layout>
      ),
      children: [
        {
          path: "/",
          index: true,
          element: createRoute(props.routeIndex, { isDocs: false }).element
        },
        {
          element: <DocsLayout routeModuleGraph={routeModuleGraph} />,
          children: props.routeDocs.map((route) => createRoute(route, { isDocs: true }))
        }
      ]
    }
  ];
}
