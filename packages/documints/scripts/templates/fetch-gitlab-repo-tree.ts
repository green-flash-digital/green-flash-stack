import type { GitLabRepoTreeNode } from "./types.js";

import { LOG } from "../../src/utils/util.logger.js";

export async function fetchGitLabRepoTree(repoName: string) {
  try {
    LOG.trace("Fetching good docs repository tree...");
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${repoName}/repository/tree?ref=main&recursive=true&per_page=500`
    );

    if (!response.ok) throw response.statusText;
    const repoEntries = await response.json();
    LOG.trace("Fetching good docs repository tree... done.");
    return repoEntries as GitLabRepoTreeNode[];
  } catch (error) {
    throw new Error(`Failed to fetch good docs repo: ${error}`);
  }
}
