import{defineCommand as v}from"fizmoo";import t from"node:path";import{tryHandle as i}from"@green-flash/ts-utils/isomorphic";import{writeFileRecursive as r}from"@green-flash/ts-utils/node";import{confirm as P}from"@inquirer/prompts";import{default as R}from"esbuild";import S from"express";import L from"open";import{build as B,createServer as F}from"vite";import{Logarhythm as h}from"logarhythm";var o=new h({name:"documints",pillColor:"#812c8d",logLevel:"debug"});var g=".documints";async function u(d=process.cwd()){let e=t.resolve(d,g),s=t.resolve(e,"./config.ts"),l=t.resolve(e,"./content/welcome.doc.md"),f=t.resolve(e,"./.gitignore"),m=`import { defineDocumintsConfig } from "documints";

export default defineDocumintsConfig({});
`,p=`---
title: Welcome
home: true
---

# Welcome

This is your new documints site. Edit this file at \`.documints/content/welcome.doc.md\`,
or add more \`*.doc.md\` files anywhere under \`.documints/content/\` - their place in the
nav comes from their \`title\` frontmatter (e.g. "Guides/Deployment"), not where you put them.
`,n=await i(r)(s,m);if(n.success===!1)throw n.error;let c=await i(r)(l,p);if(c.success===!1)throw c.error;let a=await i(r)(f,`.vite-cache
`);if(a.success===!1)throw a.error;return s}var A=v({name:"init",description:"Bootstrap a new documints project in the current directory",action:async()=>{o.info("Initializing a new documints project..."),await u(),o.success("Done! Run `documints dev` to start the dev server or `documints build` to build for production.")}});export{A as default};
