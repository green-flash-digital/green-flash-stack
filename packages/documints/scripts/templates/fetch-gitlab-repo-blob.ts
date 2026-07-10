import type { GitLabRepoBlob } from "./types.js";

import { LOG } from "../../src/utils/util.logger.js";

export async function fetchGitLabRepoBlob(
  projectId: string,
  blobId: string
): Promise<GitLabRepoBlob> {
  try {
    const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/blobs/${blobId}`;
    LOG.trace(url);
    const res = await fetch(url);
    if (!res.ok) throw res.statusText;
    const data = await res.json();
    return data as GitLabRepoBlob;
  } catch (error) {
    throw new Error(`Failed to fetch git lab blob: ${error}`);
  }
}
