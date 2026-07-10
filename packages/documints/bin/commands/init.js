import{defineCommand as v}from"fizmoo";import t from"node:path";import{tryHandle as o}from"@green-flash/ts-utils/isomorphic";import{writeFileRecursive as r}from"@green-flash/ts-utils/node";import{confirm as E}from"@inquirer/prompts";import{default as P}from"esbuild";import S from"express";import $ from"open";import{build as L,createServer as x}from"vite";import{Logarhythm as g}from"logarhythm";var i=new g({name:"documints",pillColor:"#812c8d",logLevel:"debug"});var h=".documints";async function a(d=process.cwd()){let e=t.resolve(d,h),s=t.resolve(e,"./config.ts"),l=t.resolve(e,"./content/welcome.doc.md"),f=t.resolve(e,"./.gitignore"),m=`import { defineDocumintsConfig } from "documints";

export default defineDocumintsConfig({
  buildTarget: "basic",
});
`,p=`---
title: Welcome
home: true
---

# Welcome

This is your new documints site. Edit this file at \`.documints/content/welcome.doc.md\`,
or add more \`*.doc.md\` files anywhere under \`.documints/content/\` - their place in the
nav comes from their \`title\` frontmatter (e.g. "Guides/Deployment"), not where you put them.
`,n=await o(r)(s,m);if(n.success===!1)throw n.error;let c=await o(r)(l,p);if(c.success===!1)throw c.error;let u=await o(r)(f,`.vite-cache
`);if(u.success===!1)throw u.error;return s}var A=v({name:"init",description:"Bootstrap a new documints project in the current directory",action:async()=>{i.info("Initializing a new documints project..."),await a(),i.success("Done! Run `documints dev` to start the dev server or `documints build` to build for production.")}});export{A as default};
