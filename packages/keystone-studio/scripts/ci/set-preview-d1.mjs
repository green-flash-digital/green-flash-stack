#!/usr/bin/env node
// Used by .github/workflows/keystone-studio-preview.yml to wire a PR's
// preview D1 database into a *throwaway* copy of wrangler.jsonc (never the
// tracked file — CI copies wrangler.jsonc to a temp path outside the repo
// before calling this, so the checked-in config stays untouched).
//
// Only needed when the preview database already exists (a re-run on a later
// push to the same PR) — on a first run, `wrangler d1 create ... --env
// preview --update-config` writes this same env.preview.d1_databases entry
// itself, against that same temp file.
//
// Usage: node scripts/ci/set-preview-d1.mjs <config-path> <database_name> <database_id>
import { readFileSync, writeFileSync } from "node:fs";

import { applyEdits, modify } from "jsonc-parser";

const [, , configPath, databaseName, databaseId] = process.argv;
if (!configPath || !databaseName || !databaseId) {
  console.error("Usage: set-preview-d1.mjs <config-path> <database_name> <database_id>");
  process.exit(1);
}

const original = readFileSync(configPath, "utf8");

const d1Databases = [{ binding: "keystone_studio", database_name: databaseName, database_id: databaseId }];
const edits = modify(original, ["env", "preview", "d1_databases"], d1Databases, {
  formattingOptions: { insertSpaces: true, tabSize: 2 }
});

writeFileSync(configPath, applyEdits(original, edits));
console.log(`${configPath}: env.preview.d1_databases -> ${databaseName} (${databaseId})`);
