---
title: Deployment
config:
  navBarDisplay: Deploying your application
---

# Deployment

## Overview

Buttery Docs aims to ensure that you can deploy your app anywhere using any service, instead of deciding for you what targets you can. If you want to deploy a static site, then you can select a deployment target for that. If you want to deploy a server rendered app on Cloudflare, then you can also choose that as well.

Buttery Docs doesn't try to pigeon hole you into what framework you use, instead it ensures that you can deploy your documentation however and wherever you want. Not every meta framework supports the same outputs so Buttery Docs removes those decisions for you when building and shipping your app and allows you to just focus on where and how you want to host it.

- depending upon the target, a different meta framework is going to be used
  The idea is to ensure that the docs are setting you up for the end result. It doesn't take an opinion on which meta framework you use, only on where you want to deploy your docs.

So for instance, if you wanted to deploy to cloudflare pages, Buttery Docs is going to use Remix for the meta framework and it will build a distribution directory with the Remix distributor files in it.

If you wanted to deploy a static site, then Buttery Docs is going to use NextJS.

The idea here is not to pidgin hole you into a specific framework, but instead to ensure that _wherever_ you want to deploy your stuff you can. Another example is that let's say you have a tight budget... a static site can be hosted for free on a lot of turnkey services like Render, Vercel, Cloudflare so it make sense to use the meta framework that best suite that deployment target... not the other way around.
