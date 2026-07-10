import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";

import { parseAndValidateOptions } from "@buttery/core/utils";
import { tryHandle } from "@buttery/utils/isomorphic";
import { confirm, input, select } from "@inquirer/prompts";


import type { ButteryDocsAddOptions } from "./_cli-scripts.utils.js";
import { butteryDocsAddOptionsSchema } from "./_cli-scripts.utils.js";

import { getButteryDocsConfig } from "../config/getButteryDocsConfig.js";
import { LOG } from "../utils/util.logger.js";

export type Template = {
  contentType: string;
  path: string;
  content: string;
};

export type TemplateMeta = {
  name: string;
  description: string;
};

export type TemplateManifestEntry = Template & TemplateMeta;

export type TemplateManifest = {
  [key: string]: TemplateManifestEntry;
};

export async function add(
  /**
   * A path relative to the .buttery/docs
   */
  userPath: string,
  options?: Partial<ButteryDocsAddOptions>
) {
  const parsedOptions = parseAndValidateOptions(
    butteryDocsAddOptionsSchema,
    options,
    LOG
  );
  LOG.level = parsedOptions.logLevel;

  const rConfig = await getButteryDocsConfig({
    prompt: parsedOptions.prompt,
    logLevel: parsedOptions.logLevel,
  });

  //
  if (parsedOptions.template) {
    LOG.debug("--template=true. Reading template manifest and prompting user");
    const fileContent = await readFile(rConfig.dirs.templates.manifest, "utf8");
    const templateManifest = JSON.parse(fileContent) as TemplateManifest;

    // let the user select a template
    const selectedTemplate = await select<TemplateManifestEntry>({
      message: "Please select a template to bootstrap doc",
      choices: Object.values(templateManifest).map((manifestEntry) => ({
        value: manifestEntry,
        name: manifestEntry.name,
        description: manifestEntry.description,
      })),
    });

    // select the format
    const selectedExt = await select({
      message: "Please select a format",
      choices: ["md", "mdx"],
    });

    const name = await input({ message: "Please name your document" });
    const navBarDisplay = await input({
      message:
        "How would you like this document to display in the navigation bar?",
      default: name,
    });

    // create the full path with the extensions
    const resolvedPath = path.join(
      rConfig.dirs.srcDocs.root,
      `${userPath}.${selectedExt}`
    );

    // have the user confirm that they want their file here
    const isConfirmed = await confirm({
      message: `Your doc will be created here: "${resolvedPath}". Is this correct?`,
    });
    if (!isConfirmed) {
      return LOG.fatal(
        new Error(
          "User has denied the output path of the file. All paths supplied should be relative to the `.buttery/docs` directory."
        )
      );
    }

    const decodedFileContent = Buffer.from(
      selectedTemplate.content,
      "base64"
    ).toString("utf-8");
    const content = `---
name: ${name} # this will display in the tab of the browser
meta:
  # this will display as the description tag More values can be found here: https://buttery.tools/docs/guides/seo
  - type: name
    name: description
    content: A description that will be located in the header of the document
config:
  navBarDisplay: ${navBarDisplay}
---

${decodedFileContent}
`;
    const createFile = await tryHandle(writeFile)(resolvedPath, content);

    if (createFile.hasError) {
      return LOG.fatal(createFile.error);
    }

    LOG.success(
      `Your new doc has successfully been created at: ${resolvedPath}`
    );
  }
}
