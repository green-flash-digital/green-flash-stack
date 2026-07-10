import { Meta } from "@buttery/meta/react";
import { Suspense, lazy, useMemo } from "react";
import { Link, Outlet, type RouteObject, useLocation } from "react-router";
import "@buttery/tokens/docs/css";

import { Layout } from "./components/Layout.js";
import { LayoutBody } from "./components/LayoutBody.js";
import { LayoutBodyBreadcrumb } from "./components/LayoutBodyBreadcrumb.js";
import { LayoutBodyBreadcrumbText } from "./components/LayoutBodyBreadcrumbText.js";
import { LayoutBodyMain } from "./components/LayoutBodyMain.js";
import { LayoutBodyNav } from "./components/LayoutBodyNav.js";
import { LayoutBodyTOC } from "./components/LayoutBodyTOC.js";
import { LayoutHeader } from "./components/LayoutHeader.js";
import { ButteryDocsRouteManifestGraphUtils } from "./utils/RouteGraph.js";

import type {
  ButteryDocsRouteManifestEntryDoc,
  ButteryDocsRouteManifestGraphObject,
} from "../../utils/util.types.js";
import type { ButteryDocsConfigHeader } from "../../config/_config.utils.js";

function createRoute(
  route: ButteryDocsRouteManifestEntryDoc,
  options: { isDocs: boolean }
) {
  const Component = lazy(async () => {
    // Import the .(md|mdx) file as a component and collect
    // the other information that was supplied to it
    const {
      default: DocumentComponent,
      tableOfContents,
      frontmatter,
    } = await route.importComponent();

    if (!options.isDocs) {
      return {
        default: () => (
          <>
            <Meta metaJSON={frontmatter} />
            <DocumentComponent />
          </>
        ),
      };
    }
    return {
      default: () => {
        return (
          <>
            <Meta metaJSON={frontmatter} />
            <LayoutBodyMain>
              <DocumentComponent />
            </LayoutBodyMain>
            <LayoutBodyTOC tableOfContents={tableOfContents} />
          </>
        );
      },
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
    ),
  };
}

function DocsLayout({
  routeModuleGraph,
}: {
  routeModuleGraph: ButteryDocsRouteManifestGraphUtils;
}) {
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
            if (i !== origArr.length - 1) {
              return (
                <li key={link.href}>
                  <Link to={link.href}>
                    <LayoutBodyBreadcrumbText>
                      {link.display}
                    </LayoutBodyBreadcrumbText>
                  </Link>
                </li>
              );
            }
            return (
              <li key={link.href}>
                <LayoutBodyBreadcrumbText dxIsActive>
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

export function createButteryDocsRoutes(props: {
  routeGraph: ButteryDocsRouteManifestGraphObject;
  header: ButteryDocsConfigHeader | undefined;
  routeDocs: ButteryDocsRouteManifestEntryDoc[];
  routeIndex: ButteryDocsRouteManifestEntryDoc;
}): RouteObject[] {
  const routeModuleGraph = new ButteryDocsRouteManifestGraphUtils(
    props.routeGraph
  );

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
          element: createRoute(props.routeIndex, { isDocs: false }).element,
        },
        {
          element: <DocsLayout routeModuleGraph={routeModuleGraph} />,
          children: props.routeDocs.map((route) =>
            createRoute(route, { isDocs: true })
          ),
        },
      ],
    },
  ];
}
