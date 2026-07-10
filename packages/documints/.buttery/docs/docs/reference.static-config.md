---
title: Configuration file
---

# Buttery Config

The `buttery.config.ts` file is the main configuration file needed to customize the docs in the way that you see fit. ButteryDocs provides some but not a lot of configurations to keep things simple as possible and allow you to focus on writing docs rather than fighting with configurations and non-value added tasks.

All configurations for ButteryDocs are namespaced under the `config.docs` key.

## `docs.order`

Allows you to fully configure the order in which your pages appear in your side navigation

## `docs.header`

Provides a few configuration points to be able to customize what appears in the header of the app

```ts
type ButteryConfigDocsHeader = {
  /**
   * Adds a title in the upper left hand of the application
   */
  title?: string;
  /**
   * Adds a logo that is at a particular URL to be displayed in the top
   * left hand corner of the docs app
   */
  logo?: {
    src: string;
    alt: string;
  };
  /**
   * Links that will appear in order from left to right that link
   * out to different external pages or to places inside of the
   * documents app
   */
  links?: ButteryConfigDocsHeaderLink[][];
};
```

### `docs.header.title`

The title of the application that will display in the upper left hand of the application

```ts
const config: ButteryConfig = {
  docs: {
    header: {
      title: "Your Title Here",
    },
  },
};
```

### `docs.header.logo`

Adds a logo that is at a particular URL to be displayed in the top left hand corner of the docs app.

You can co-locate publicly deployable assets by adding them inside of the `/docs/public` directory.

```ts
const config: ButteryConfig = {
  docs: {
    header: {
      logo: {
        src: "/images/logo/my-logo-256x256.png",
        alt: "my-logo",
      },
    },
  },
};
```

### `docs.header.links`

Links that will appear in order from left to right that link out to different external pages or to places inside of the documents app.

The `links` key is a 2D array that can contain as many links as possible. Each nested array denotes a section that is separated by a pipe in the header.

```ts
type ButteryConfigDocsHeaderLink =
  | { type: "social"; provider: "github" | "discord"; href: string }
  | { type: "text"; text: string; href: string }
  | { type: "internal"; text: string; href: string };
```

There are 3 kinds of links that can be created in n number of sections the header as shown above:

1. **Internal**: `href` points to a page in the app relative to the root
2. **Social**: A pre-defined set of links that has their own icons that can link to various social providers
3. **External**: Any link that links out to any other. By default it opens in another tab.

All links are a discriminated union so depending upon the `type`, intellisense will know which other properties to surface when declaratively writing links.

```ts
const config: ButteryConfig = {
  docs: {
    header: {
      links: [
        // left most section
        [
          {
            type: "internal",
            text: "Under the hood",
            href: "/under-the-hood",
          },
        ],
        // right most section
        [
          {
            type: "social",
            provider: "github",
            href: "https://github.com/your-repo.git",
          },
        ],
      ],
    },
  },
};
```
