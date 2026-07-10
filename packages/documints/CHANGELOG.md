# @buttery/docs

<!-- MONOWEAVE:BELOW -->

## @buttery/docs (v0.2.9) <a name="0.2.9"></a>

Removes the inclusion of the `@buttery/tokens/docs` CSS file since it is being built at build time and then statically supplied to the development server of the `@buttery/docs` app. This will fix a runtime error in DEV and PROD instances where the browser is looking for a file that doesn't exist.



## @buttery/docs (v0.2.8) <a name="0.2.8"></a>

Upgrades `@buttery/docs` to use ReactRouter v7. This changeset is important in order to support the ongoing major releases of React Router and eventually React 19.



## @buttery/docs (v0.2.7) <a name="0.2.7"></a>

Upgrades dependencies to their latest versions. No breaking changes.



## @buttery/docs (v0.2.6) <a name="0.2.6"></a>

Builds the shared `App` of the `entry.client` and `entry.server` when the `@buttery/docs` library is built. This was necessary for ensuring that all styles and other assets were built and bundled for use in external packages / libraries. In addition, this allows for faster startup times since the main part of the app is already built and the modules are the only things that need to be resolved. That means layouts, routes, etc... are all prebuilt.



## @buttery/docs (v0.2.4) <a name="0.2.4"></a>

This changeset primarily focuses on changing some of the logic to resolve the buttery directory in directory structures outside of the mono-repo. The logic was updated to look for a buttery directory each time a node_modules directory was located up the structure. Once it's found it then attempts to find the target that it was looking for.

In addition, a required configuration parameter was added to the script so the logLevel that was passed into into the script was then reflected in the `@buttery/core` logger. This allows us to debug the resolution of the buttery module at CLI runtime.



## @buttery/docs (v0.2.3) <a name="0.2.3"></a>

Adds more logging to the `@buttery/docs` development package



## @buttery/docs (v0.2.2) <a name="0.2.2"></a>

Adds CLI options to the `buttery docs dev|build|add` commands.



## @buttery/docs (v0.2.1) <a name="0.2.1"></a>

This changeset fixes some bugs with the bundling and transpilation of the assets needed to be run from the CLI. It's another step to providing the full mono-repo stability while dog-fooding the rest of the application.

- `@buttery/builtins` - Adds full type-safety to the `inlineTryCatch` function
- `@buttery/cli` - Adds docs to the buttery tools documentation
- Organizes the docs in the CLI package
- `@buttery/core` - Changes the to resolve files using `NodeNext` which requires file extensions on imports. This allows the CLI to reference barrel imports as well as singular file imports while running in a purely node context.
- `@buttery/docs` - Re-loads the manifest and graph when files are added and changed by correctly invalidating the virtual modules.



## @buttery/docs (v0.2.0) <a name="0.2.0"></a>

Adds a new `@buttery/docs` API called `add` which allows you to either programmatically or via the `@buttery/cli` to add a new buttery doc by means of a few prompts.

```bash
buttery docs add <relative-path-to-.buttery/docs>
```

It has support for an optional boolean argument `--template, -t` to create the new doc based upon one of the [The Good Docs Project](https://www.thegooddocsproject.dev/template) templates.

```bash
buttery docs add <relative-path-to-.buttery/docs> --template
```



## @buttery/docs (v0.1.4) <a name="0.1.4"></a>

Removes `changeset` and adds `monoweave` to be able to version, release and manage changelogs for the monorepo using yarn modern (yarn berry).

This changeset also adds some comments to the changelogs so `monoweave` has the ability to understand where it needs to add the changesets to each of the packages' changelogs.



## 0.1.2

### Patch Changes

- d8f4a0d: Changes all internal cross-references to exact references upon `npm publish`
- Updated dependencies [d8f4a0d]
  - @buttery/components@0.1.1
  - @buttery/core@0.1.1
  - @buttery/meta@0.1.1

## 0.1.1

### Patch Changes

- fa36ab7: Pattern matches the route against the manifest to serve the correct static assets

  This changeset adjusts the ordering of how the production request is handled in the cloudflare functions directory when you deploy a `@buttery/docs` application to Cloudflare Pages. Previously, the handler was searching for a specific namespace which led to the exclusion of specific assets (in the bugs case images). Instead, the handler now attempts to match the pathname against the buttery manifest which in turns tries to render the SSR app first instead of the other way round.

  ```ts
  // Get only the route paths
  const routes = Object.values(bManifest).map(
    (manifestEntry) => manifestEntry.routePath
  );

  // try the route first
  if (routes.includes(pathname)) {
    try {
    } catch {}
  }

  // try the asset fetcher last
  try {
    const asset = await context.env.ASSETS.fetch(context.request);
    return asset;
  } catch (error) {
    console.error(`Error serving static file: ${pathname}`, error);
    return new Response("Not Found", { status: 404 });
  }
  ```

  If the path doesn't match anything in the buttery manifest we fallback to trying to render any static assets that we're included in the client build. Eventually we throw a 404 if we can't find anything and a 500 of the route doesn't render correctly.

## 0.1.0

### Minor Changes

- 61f5b2e: Re-architects the repository to become a modular focused repo

  This changeset does a good deal of architecting to break the modules back out into their own packages. This ensures that all functionality associated with that particular tool is kept local to that package. A new package called `@buttery/core` has been added to easily distribute core modules to each of the `@buttery/tools`. These tools then use the core module to transpile, build, and distribute the local scripts externally.

  Another package called `@buttery/cli` has been created that should be installed alongside of whatever tool is desired to use. This ensures that we're not downloading too many dependencies and makes the CLI modules opt-in rather than a "nuts and bolts" approach.

### Patch Changes

- Updated dependencies [61f5b2e]
  - @buttery/components@0.1.0
  - @buttery/core@0.1.0
  - @buttery/meta@0.1.0
