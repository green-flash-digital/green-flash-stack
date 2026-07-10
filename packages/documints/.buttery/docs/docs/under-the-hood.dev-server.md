---
title: Development
---

# Development

This article details how Buttery Docs finds, parses and displays your Buttery Docs app to you in real time as you edit.

## Overview

As explained in the writing section, in order to write docs and see their updates, you must run the development server.

```bash
yarn buttery-docs dev
```

This launches a `vite` server that is instantiated using the
[createSever](https://vitejs.dev/guide/api-javascript.html#createserver) Vite JavaScript API.

This then launches a simple client side React application that reads your `/docs` folder, parses it and then automatically creates the routes based upon the established file conventions in that docs folder.

Each time you save a document, Vite recognizes this through a custom plugin and (if necessary) makes the update to the file and re-builds the routing structure to enable you to view your changes right away through Mot Module Replacement (HMR).

This is, at 30,000 feet, the methodology that is used to enable you to instantly see your documentation site as you write them .There are a lot more nuances that go on during this process that are explained below.

## Process

### 1. Parse the `/docs`

### 2. Graph creation

### 3. Create a temporary sandbox

### 4. Reload on changes
