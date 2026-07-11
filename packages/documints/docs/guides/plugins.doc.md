---
title: Guides/Plugins
---

# Plugins

documints' dev server and build are real Vite underneath - `vitePlugins`
(see [Configuration](/guides/configuration)) is a direct line into that, accepting genuine
Vite plugins. There's nothing documints-specific about the plugin API itself; anything that
works as a Vite plugin works here.

## Third-party plugins from npm

Install any Vite plugin like you normally would, and pass it through `vitePlugins`:

```sh
yarn add --dev some-vite-plugin
```

```ts
import { defineDocumintsConfig } from "documints";
import someVitePlugin from "some-vite-plugin";

export default defineDocumintsConfig({
  vitePlugins: [someVitePlugin({ /* plugin options */ })],
});
```

If a plugin needs a path relative to your project (not wherever `documints`/`@documints/core`
themselves happen to be installed), use the function form instead - it receives
`{ rootDir }`, the directory containing `.documints/`:

```ts
export default defineDocumintsConfig({
  vitePlugins: ({ rootDir }) => [
    someVitePlugin({ configPath: `${rootDir}/some.config.json` }),
  ],
});
```

## Built-in plugins

`@documints/core` ships its own optional plugins, wired up the exact same way. Currently:

### Interactive preview

Renders a live, interactive component inline in an `.doc.mdx` file, with a toggle to reveal
its source code - useful for documenting a component library alongside working examples
instead of static code fences.

```ts
import path from "node:path";
import { defineDocumintsConfig } from "documints";
import { vitePluginDocumintInteractivePreview } from "@documints/core/plugins/interactive-preview";

export default defineDocumintsConfig({
  vitePlugins: ({ rootDir }) => [
    vitePluginDocumintInteractivePreview({
      componentRootDir: path.resolve(rootDir, "components"),
    }),
  ],
});
```

`componentRootDir` is the directory your preview paths below are resolved against. In an
`.doc.mdx` file, reference a component with a comment in this shape:

````md
{/* preview: type="interactive"; path="./Button.tsx"; export="Button" */}
````

This renders the exported component live, with a button to reveal `Button.tsx`'s source
alongside it. Use `type="fence"` instead (with a `lang` param) to just inline a file's
contents as a syntax-highlighted code block, without the live-render/toggle behavior.
