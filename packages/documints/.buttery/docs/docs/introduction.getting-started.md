---
title: Getting Started
---

# Getting Started

**ButteryDocs** is designed to be as low overhead as possible to get started creating documentation. There are various ways to get started; the CLI being the easiest way.

## Installation

The below methods assume that you have the follwing setup on your machine

- NodeJS - LTS Preferred
- A package manager such as `yarn`, `pnpm`, `npm`, `bun`, etc...

Install the `buttery-docs` package from the NPM registry

```sh
yarn add buttery-docs --dev
```

## Quick Start

ButteryDocs requires **zero** directory or configuration setup. The CLI will do this for you so all you need to do is run one command to get started.

Run the `dev` command in your directory that contains your `package.json`.

```sh
yarn buttery-docs dev
```

If this is the first time running the CLI or if you're missing some files or configuration items, it will ask you to answer a few questions. Based upon the answers to those questions it will create the necessary configs, directories and files it needs to run.

> If you would like to opt out of this, you can run the dev command with `--no-init` and the CLI will create the files it needs without prompting you for your preferences. To learn more about this option and to get a more detailed understanding about the questions that you'll be prompted for, visit the [CLI Reference](./reference.cli.md)

## Manual

It's not recommended, but it's pretty easy to do

> **NOTE** The following assumes that your terminal is at the root directory that you want to store and write your docs.

### Create a `/docs` directory

Create a `/docs` directory adjacent to your `package.json` and add a `_index.md` file inside of that direcotry

```sh
mkdir ./docs
touch ./docs/_index.md
```

Copy the below into the `_index.md` file

```md
---
title: Welcome
---

# Welcome to the docs!

This is the root page that is served at the basename of your site.
```

### Create the `buttery.config.ts` file

Create a `buttery.config.ts` adjacent to your recently created docs directory.

```sh
touch buttery.config.ts
```

Copy the below into the file

```ts
import type { ButteryConfig } from "@buttery/core";

const config: ButteryConfig = {
  docs: {
    header: {
      title: "Your Docs Name",
    },
  },
};
```

> If you want to configure this further, then view the [config reference documentation](./reference.static-config.md)

### Run the `dev` command

This will launch the UI in development mode where you can write your docs with full HMR.
