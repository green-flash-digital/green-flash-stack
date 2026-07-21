---
title: Guides/Introduction/How Documints Compares
description: How Documints compares to Docusaurus, VitePress, Starlight, and Mintlify—architecturally, not just feature by feature.
related:
  - /guides/introduction/why-documints
  - /guides/advanced/using-documints-with-ai
---

# How Documints Compares

Most documentation tools now share a similar surface-level feature list: Markdown authoring, themes, search, static output, and some form of AI support.

The more important difference is underneath:

> **Most tools build documentation websites. Documints builds a documentation corpus.**

Documints publishes one canonical set of documents as polished HTML for people, direct Markdown for agents, structured JSON for tools, full-text search, and site-wide discovery artifacts.

**One corpus. Multiple first-class representations. No scraping required.**

<!-- Add the full architectural visualization here. -->

## Reading the comparisons

The compact grids below focus on architectural defaults, not everything that can be achieved with plugins or custom development.

| Symbol | Meaning                                                        |
| ------ | -------------------------------------------------------------- |
| 🟢     | Built in or first-class                                        |
| 🟡     | Available through plugins, configuration, or a separate system |
| ⚪     | Not offered as a core capability                               |
| ☁️     | Provided as part of a managed platform                         |
| ➖     | Not a core capability                                          |

---

## Documints vs. Docusaurus

Docusaurus is a mature, extensible React framework for building documentation websites. It has a large ecosystem, established versioning and localization support, and broad community adoption.

Documints is narrower by design. It focuses on publishing a repository-owned documentation corpus for both humans and machines, with fewer separate systems to configure.

| Capability                                | Documints                             | Docusaurus                                |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------- |
| Static HTML                               | 🟢 Built in                           | 🟢 Built in                               |
| Markdown and MDX                          | 🟢 First-class documents              | 🟢 First-class documents                  |
| Full React page                           | 🟢 Same docs pipeline with `.doc.tsx` | 🟡 Separate pages mechanism               |
| Docs beside code                          | 🟢 Discovered anywhere by glob        | 🟡 Possible with configuration            |
| Public route independent of file location | 🟢 Metadata-driven                    | 🟡 IDs, slugs, and filesystem conventions |
| Navigation from document graph            | 🟢 Built in                           | 🟡 Auto-generated or configured sidebars  |
| Raw `.md` page                            | 🟢 Built in                           | 🟡 Plugin or custom work                  |
| Structured `.json` page                   | 🟢 Built in                           | ⚪ Custom work                            |
| Site-wide document manifest               | 🟢 Built in                           | ⚪ Custom work                            |
| `llms.txt` / `llms-full.txt`              | 🟢 Built in                           | 🟡 Plugin                                 |
| Plugin model                              | 🟢 Standard Vite plugins              | 🟢 Mature Docusaurus ecosystem            |
| Hosting                                   | 🟢 Any static host                    | 🟢 Any static host                        |

Docusaurus is the stronger choice when ecosystem maturity, built-in versioning, localization, and extensive framework customization are the priority.

Documints is the stronger fit when documentation should live throughout a repository and publish directly into synchronized human- and machine-readable forms.

**Docusaurus builds a highly extensible docs site. Documints publishes a document corpus as a site.**

---

## Documints vs. VitePress

VitePress is a focused, fast documentation framework built around Vue and Vite. It is especially attractive to Vue teams that want excellent Markdown authoring and straightforward static output.

Documints shares the Vite foundation, but uses React and places more emphasis on repository-wide discovery, full application pages, and first-class machine outputs.

| Capability                         | Documints                          | VitePress                                                  |
| ---------------------------------- | ---------------------------------- | ---------------------------------------------------------- |
| Static HTML                        | 🟢 Built in                        | 🟢 Built in                                                |
| Primary UI framework               | React                              | Vue                                                        |
| Markdown authoring                 | 🟢 Built in                        | 🟢 Built in                                                |
| Embedded components                | 🟢 MDX and React                   | 🟢 Vue in Markdown                                         |
| Full application page              | 🟢 `.doc.tsx` in the docs pipeline | 🟡 Custom routes, layouts, or theme work                   |
| Docs beside code                   | 🟢 Glob discovery anywhere         | 🟡 Possible, but content is conventionally site-structured |
| Routing model                      | 🟢 Document metadata               | 🟡 Primarily filesystem-based                              |
| Raw `.md` page                     | 🟢 Built in                        | 🟡 Plugin or custom work                                   |
| Structured `.json` page            | 🟢 Built in                        | ⚪ Custom work                                             |
| Document manifest and AI discovery | 🟢 Built in                        | ⚪ Custom work                                             |
| Search                             | 🟢 Pagefind, self-hosted           | 🟢 Built-in local search or hosted options                 |
| Plugin model                       | 🟢 Standard Vite plugins           | 🟢 Vite and Vue ecosystem                                  |
| Hosting                            | 🟢 Any static host                 | 🟢 Any static host                                         |

VitePress is ideal when simplicity, Vue integration, and a conventional documentation-site structure are the priority.

Documints is designed for teams that want documents discovered across a codebase, a React-native escape hatch for full pages, and machine-readable outputs generated from the same corpus.

**VitePress is a streamlined Vue docs framework. Documints is document-native infrastructure built on React and Vite.**

---

## Documints vs. Starlight

Starlight is Astro's polished documentation framework. It provides strong documentation defaults, static output, content collections, internationalization, and access to Astro's multi-framework component model.

Documints is more opinionated around React, flexible document placement, and direct corpus outputs for agents and tools.

| Capability                         | Documints                          | Starlight                                        |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------ |
| Static HTML                        | 🟢 Built in                        | 🟢 Built in                                      |
| Core framework                     | React and Vite                     | Astro                                            |
| Markdown and MDX                   | 🟢 Built in                        | 🟢 Built in                                      |
| Full custom page                   | 🟢 `.doc.tsx` in the same pipeline | 🟡 Astro page outside the normal docs collection |
| Docs beside code                   | 🟢 Discovered anywhere by glob     | 🟡 Possible through Astro project structure      |
| Routing model                      | 🟢 Metadata-driven                 | 🟡 Content and filesystem driven                 |
| Navigation                         | 🟢 Generated from document graph   | 🟢 Auto-generated, with configuration options    |
| Raw `.md` page                     | 🟢 Built in                        | 🟡 Plugin or custom work                         |
| Structured `.json` page            | 🟢 Built in                        | ⚪ Custom work                                   |
| Document manifest and AI discovery | 🟢 Built in                        | ⚪ Custom work                                   |
| Search                             | 🟢 Pagefind, self-hosted           | 🟢 Pagefind integration                          |
| Extension model                    | 🟢 React and standard Vite plugins | 🟢 Astro integrations and components             |
| Hosting                            | 🟢 Any static host                 | 🟢 Any static host                               |

Starlight is an excellent fit for teams that want Astro, mature documentation defaults, and multi-framework islands.

Documints is aimed at teams that want React across the entire authoring spectrum and treat machine-readable documentation as part of the core build architecture.

**Starlight builds a polished Astro documentation site. Documints builds a synchronized corpus for readers, tools, and agents.**

---

## Documints vs. Mintlify

Mintlify is a managed documentation and knowledge platform. It combines a polished hosted experience with collaboration, analytics, search, API documentation, and AI-oriented capabilities.

Documints takes the opposite infrastructure position: open source, repository-owned, static-first, and deployable anywhere.

| Capability                   | Documints                            | Mintlify                                            |
| ---------------------------- | ------------------------------------ | --------------------------------------------------- |
| Product model                | 🟢 Open framework                    | ☁️ Managed platform                                 |
| Markdown and MDX             | 🟢 Built in                          | 🟢 Built in                                         |
| Full custom application page | 🟢 `.doc.tsx` in the docs pipeline   | ➖ MDX-focused authoring                            |
| Docs beside code             | 🟢 Glob discovery anywhere           | 🟡 Git-backed docs project conventions              |
| Routing and navigation       | 🟢 Derived from document metadata    | 🟡 Managed through project navigation configuration |
| Raw `.md` page               | 🟢 Built in                          | 🟢 Built in                                         |
| Structured `.json` page      | 🟢 Built in                          | ➖ Not a public page-level core contract            |
| Site-wide document manifest  | 🟢 Built in                          | ☁️ Platform-managed knowledge and AI features       |
| `llms.txt` / `llms-full.txt` | 🟢 Built in                          | 🟢 Built in                                         |
| AI discovery and agent tools | 🟢 Open static discovery artifacts   | ☁️ Managed AI and agent capabilities                |
| Search                       | 🟢 Pagefind, self-hosted             | ☁️ Hosted search                                    |
| Analytics and collaboration  | ⚪ Bring your own                    | ☁️ Built in                                         |
| Hosting                      | 🟢 Any static host                   | ☁️ Hosted SaaS                                      |
| Output ownership             | 🟢 Repository-owned static artifacts | ☁️ Platform-managed deployment                      |

Mintlify is the stronger choice when a team wants a managed product with hosted collaboration, analytics, search, and AI services.

Documints is the stronger fit when the documentation system and every generated artifact should remain open, portable, versioned with the codebase, and deployable without a platform dependency.

**Mintlify manages the documentation platform for you. Documints gives you the infrastructure to own it.**

---

## Which tool is the best fit?

| Tool           | Best for                                                                 | Defining strength                                             | Main tradeoff                                                 |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------- |
| **Documints**  | Teams that want colocated docs and first-class human and machine outputs | One repository-owned corpus with synchronized representations | Smaller ecosystem and fewer managed services                  |
| **Docusaurus** | Teams with large, mature, versioned documentation sites                  | Ecosystem, extensibility, versioning, and localization        | More framework surface and less emphasis on corpus outputs    |
| **VitePress**  | Vue teams that value speed and simplicity                                | Focused authoring and a lightweight Vite foundation           | Advanced machine outputs require more work                    |
| **Starlight**  | Astro teams wanting polished documentation defaults                      | Astro integration and strong content tooling                  | Full custom pages and corpus outputs use different mechanisms |
| **Mintlify**   | Product and documentation teams wanting a managed platform               | Hosted collaboration, analytics, search, and AI               | Platform dependency and less control over infrastructure      |

## Where Documints does not try to compete

Documints is intentionally focused. It does not currently try to replace:

- Docusaurus's mature versioning and localization systems
- Astro's broader content and multi-framework ecosystem
- VitePress's deeply Vue-native experience
- Mintlify's hosted editor, analytics, access controls, and managed services
- a general-purpose marketing-site or blog framework
- a hosted retrieval or AI platform
