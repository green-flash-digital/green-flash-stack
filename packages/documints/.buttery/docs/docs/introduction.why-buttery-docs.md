---
title: Why Buttery Docs?
---

# Why Buttery Docs?

## Background

The need for Buttery Docs arose while writing the [Buttery Tools](https://buttery-tools.com) suite. Each package needed to have it's own documentation which would ultimately be referenced in the buttery tools docs. However, it didn't make sense to create a package or a documentation app for each of the directories in the mono-repo since that would have re-located the package's docs _outside_ of the context of the code they we're describing.

In addition, the mental load of conventional static site generators or SSR meta frameworks is a lot especially when trying to incorporate them into an existing package or repo that already subscribes to various conventions and configurations.

These basic requirements are what prompted the **Buttery Docs** package to be created; each mono-package or (any directory for that matter) should contain a directory with a flat file structure that will be read, parsed and then assembled into a website that can be easily published to any target.

## Requirements

Based upon the need the below requirements we're created:

- Build a complete SSR / SSG documentation website from one directory with only a few conventions
- Require as little configuration points as possible; grow with the demand
- Hide implementation details of development server as well as framework.
- Use the Vite ecosystem with flat file routing conventions established by Remix
- Use existing conventions such as Frontmatter for SEO and flat file routing to visually parse the routing structure

## Problems

**Buttery Docs** attempts to solve a few problems that exist with other static site generators. You can read about those concepts below.

### Identity

**Buttery Docs** is designed to be a _documentation_ only tool. It doesn't have configurations options to be anything more than a parser and renderer of the files contained in the `/docs` directory. It has basic configuration points of customization that allow you to configure how you view the navigation bar and what links you can create in the header and footer, but outside of that, Buttery Docs is intended to help you document your code next to your code. full stop.

### Convention based routing

File based routing is all of the rage these days with meta frameworks like NextJS, Remix, etc... however as applications scale, it's easy to get lost in the nested directory conventions they employ. Take the below example

```txt
/src
/docs
  |-- /introduction
    |-- /getting-started
      |-- /basics
        |-- route.md
package.json
```

**Buttery Docs** aims to solve this by employing a derivation of the flat file routing convention that Remix popularized to easily group documents into sections and then subsequently derive a routing structure from them

```txt
introduction.getting-started.basics.md
```

You can read more by viewing the docs on [Routing Conventions](./conventions.routing.md)

## Basic

### Reduce the mental load

Reduce the mental load of where things should go in your docs. Multiple pages with multiple routing trees, etc... In this case we wanted one page that has all of your documentation that can easily be organized with an expressive configuration object.

## The state of documentation

- Docusaurus
-

## The need

The need was simple. I needed a _very_ easy way of creating documentation for various endeavors and I needed all of my documentation in the same directory as my project.

- The directory had to be in the same folder as my other project

## The problems

### Config overload

### Complex routing

### Convoluted setup

- too much configuration. CLI first and then configure later
- SEO & SSR first. Vite second, profit

## Aimed solutions

**Buttery Docs** aims to get you started with a full server rendered documentation website with just a few conventions and potentially zero configuration.

### Docs first, config second

### Dead simple routing

### Extensive CLI

### Multiple build targets
