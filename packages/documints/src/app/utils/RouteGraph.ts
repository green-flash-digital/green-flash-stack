import type { DocumintRouteManifestGraphObject } from "../../utils/util.types.js";

import { LOG } from "./LOG.js";

/**
 * A collection of utilities to easily transact on the route manifest
 * graph to display and work with recursive data.
 */
export class DocumintRouteManifestGraphUtils {
  private routeManifestGraph: DocumintRouteManifestGraphObject;
  breadcrumbLinks: string[];

  constructor(routeManifestGraph: DocumintRouteManifestGraphObject) {
    this.routeManifestGraph = routeManifestGraph;
    this.breadcrumbLinks = [];
  }

  get graph() {
    return this.routeManifestGraph;
  }

  /**
   * Provided a route path (that is a slash delimited route that will)
   * render on the front-end, this function will return the graph node
   * that matches that browser route path
   */
  getRouteGraphNodeByRoutePath(routePath: string): DocumintRouteManifestGraphObject {
    const segments = routePath.split("/").filter(Boolean);
    const routeGraphNode = segments.reduce<DocumintRouteManifestGraphObject>(
      (accum, segment, i) => {
        if (accum[segment] && i < segments.length - 1) {
          return accum[segment].pages;
        }
        if (accum[segment]) {
          return { [segment]: accum[segment] };
        }
        return accum;
      },
      this.routeManifestGraph
    );

    if (Object.values(routeGraphNode).length === 0) {
      throw LOG.fatal(
        new Error(`Cannot locate a DocumintRouteManifestGraph node for the path: ${routePath}`)
      );
    }

    return routeGraphNode;
  }

  constructBreadcrumbs(pathname: string) {
    const segments = pathname.split("/").filter(Boolean);
    const links: { href: string; display: string }[] = [];

    let currentGraph = this.routeManifestGraph;

    for (const segment of segments) {
      const graphEntry = currentGraph[segment];
      links.push({
        href: graphEntry.routePath,
        display: graphEntry.fileNameFormatted
      });
      currentGraph = graphEntry.pages;
    }

    return links;
  }
}
