import { writeFile } from "node:fs/promises";
import path from "node:path";

import { tryHandle } from "@buttery/utils/isomorphic";

import { fetchGitLabRepoBlob } from "./fetch-gitlab-repo-blob.js";
import { fetchGitLabRepoTree } from "./fetch-gitlab-repo-tree.js";
import { getTemplateMeta } from "./get-template-meta.js";

import type { Template, TemplateManifest } from "../../src/cli-scripts/add.js";
import { LOG } from "../../src/utils/util.logger.js";

export async function createTemplateManifest() {
  const goodDocsRepoName = encodeURIComponent("tgdp/templates");

  // Get the good docs repo assets
  const goodDocsRepoNodes = await tryHandle(fetchGitLabRepoTree)(
    goodDocsRepoName
  );
  if (goodDocsRepoNodes.hasError) {
    return LOG.fatal(goodDocsRepoNodes.error);
  }

  // Create an array of promises that will loop through
  // all of the repo entries, find the template path and
  // then fetch the Blob
  const getTemplates = goodDocsRepoNodes.data.reduce<
    Array<() => Promise<Template>>
  >((accum, entry) => {
    if (!entry.path.includes("/template_")) {
      return accum;
    }
    const contentType = entry.path.split("/template_")[0];
    const fn = async (): Promise<Template> => {
      LOG.debug(`Fetching template: "${contentType}"...`);
      const templateBlobRes = await tryHandle(fetchGitLabRepoBlob)(
        goodDocsRepoName,
        entry.id
      );
      if (templateBlobRes.hasError) {
        throw templateBlobRes.error;
      }
      LOG.debug(`Fetching template: "${contentType}"... done.`);
      return {
        contentType,
        path: entry.path,
        content: templateBlobRes.data.content,
      };
    };
    return accum.concat(fn);
  }, []);

  /**
   * Get the descriptions of each of the templates by fetching
   * and parsing the README.md tables.
   */
  const templateMeta = await tryHandle(getTemplateMeta)(
    goodDocsRepoName,
    goodDocsRepoNodes.data
  );
  if (templateMeta.hasError) {
    return LOG.fatal(templateMeta.error);
  }

  // Assemble the template manifest by sequentially each promise
  // created in the getTemplates reducer
  const templateManifest: TemplateManifest = {};
  for (const getTemplate of getTemplates) {
    const templateRes = await tryHandle(getTemplate)();
    if (templateRes.hasError) {
      return LOG.fatal(templateRes.error);
    }

    const contentTypeFolderPath = `/${templateRes.data.path.split("/")[0]}`;
    LOG.trace(contentTypeFolderPath);

    templateManifest[templateRes.data.contentType] = {
      ...templateRes.data,
      ...templateMeta.data[contentTypeFolderPath],
    };
  }

  try {
    LOG.debug("Writing template manifest to disk...");
    await writeFile(
      path.resolve(
        import.meta.dirname,
        "../../templates/template-manifest.json"
      ),
      JSON.stringify(templateManifest, null, 2)
    );
    LOG.debug("Writing template manifest to disk... done.");
  } catch (error) {
    return LOG.fatal(new Error(String(error)));
  }
}

createTemplateManifest();
