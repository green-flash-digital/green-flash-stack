# Chamfer Components: CLI-bootstrapped component library

## Context

`chamfer` (the design-tokens CLI, built on the user's own `fizmoo` CLI framework) already generates typed token utilities (`makeColor`, `makeSpace`, `makeFontVariant`, etc. via `@chamfer-css/core`). `@stratum-ui/core` + `@stratum-ui/react` already exist as headless, unstyled interaction engines (Modal, Popover, Tooltip, Toggletip, Menu, Toast) — the deliberate alternative to Radix. What's missing is the styled presentation layer that ties tokens + stratum-ui together into actual components, packaged so a CLI can bootstrap them into a consumer's project. This plan is the roadmap for that: a new `@chamfer-css/components` package plus a `chamfer components add` CLI command family.

Decided so far, in order:
- **Distribution**: primary path is shadcn-style — the CLI copies real, editable Linaria source into the consumer's repo (not an installed runtime dependency for presentational components). A pre-compiled, framework-agnostic `npm install`-only distribution (for Next.js/non-Vite consumers who can't run the Linaria build plugin) is a legitimate but explicitly deferred later phase — not blocking v1, since this is primarily the user's own tooling right now.
- **Complex/stateful components stay npm-installed**: Modal/Popover/Tooltip/Toggletip/Menu/Toast are hard to get right (focus traps, positioning, a11y state machines) — `@stratum-ui/react` stays a normal versioned dependency, updated via ordinary `yarn upgrade`. The bootstrapped file for these is a *thin* wrapper (imports stratum-ui's hooks, applies chamfer-css styling, exposes a few theming levers) — not a copy of stratum-ui's actual logic. This also mostly sidesteps the update/diff problem (deferred to a later phase anyway) for the hard part of these components.
- **Styling: Linaria**, not CSS Modules/vanilla-extract/utility classes — because `@chamfer-css/core`'s token functions (`makeColor`, `makeSpace`, ...) are architected as literal-value-returning JS meant to be inlined in a Linaria `css` tagged template and compiled away at build time, not as CSS-custom-property emitters. Switching styling engines would mean redesigning chamfer-css's own token model, which is out of scope here.
- **A prerequisite `chamfer` gap found while designing this**: `chamfer components add` should not silently drop in a component that renders unstyled if the target project has no Linaria bundler plugin configured — verify-and-instruct (clear error message) rather than attempt to auto-patch an arbitrary `vite.config.ts` (much riskier than shadcn's Tailwind-config/CSS-file edits, since a JS/TS config file isn't a predictable shape to parse).
- **Copy-paste first, variant-picking as the very next increment — not marker-comment codegen.** First considered generating a tailored file per-project by stripping unwanted variants out via marker-comment regions scattered across the type union, the CSS, and any switch/match arms — rejected as too fragile (multi-location surgery on every removal). Revised: every variant-bearing Tier 0/1 component is built around a **centralized variant-config object** instead (the same pattern `class-variance-authority` uses, adapted to Linaria) —
  ```tsx
  const buttonVariants = {
    primary: css`background: ${makeColor("primary")};`,
    secondary: css`background: ${makeColor("secondary")};`,
    warning: css`background: ${makeColor("warning")};`
  } as const;
  export type ButtonProps = { variant: keyof typeof buttonVariants; /* ... */ };
  ```
  With variant data centralized like this, "the user doesn't want `warning`" becomes "delete one key from one object" — safe and mechanical, whether done by hand or by the CLI. This is good component architecture on its own merits, independent of the codegen question.

  **Sequencing**: prove the simplest path first — v1 of `chamfer components add` copies the full reference component (every variant included), so the whole pipeline (picker → copy → manifest → working styled output) gets validated end-to-end without also needing variant-selection logic to be right on the first try. The interactive "which variants do you want?" prompt (filtering the centralized config object before writing the file, updating the manifest with which keys were selected) is the very next increment after that — not a "maybe later," a planned fast-follow, made cheap specifically by the centralized-object architecture above.

## Existing CLI structure (confirmed by reading `packages/chamfer/.fizmoo/`)

```
.fizmoo/config.ts                     — command("./commands/add.ts", [command("./commands/add/template.ts")]), build, dev, studio
.fizmoo/commands/add.ts                — parent command, no action, just description
.fizmoo/commands/add/template.ts        — `chamfer add template <name>` — scaffolds a new custom token template into .chamfer/templates/
```
`add` already means "scaffold a new chamfer-css asset" (currently just `template`) — components are a different enough domain (their own lifecycle: add, upgrade, eventually list/remove) to deserve a **new top-level command family instead of nesting under `add`**:

```
.fizmoo/commands/components.ts               — parent, new
.fizmoo/commands/components/add.ts             — `chamfer components add`
.fizmoo/commands/components/upgrade.ts          — `chamfer components upgrade` (name/slot reserved now; implementation deferred, see below)
```

`chamfer components add` takes **no required positional component name**. Default UX: read whatever manifest tracks already-bootstrapped components, diff against the full set `@chamfer-css/components` offers, and present an interactive multi-select checklist of only what *isn't* installed yet (`@inquirer/prompts` — already a `fizmoo-core` dependency, confirmed via its `package.json`, so no new dependency needed). A positional/flag form for scripted, non-interactive use is worth keeping too, but the picker is the primary experience.

`chamfer components upgrade` is a named, reserved command slot — its actual implementation (the 3-way diff/merge mechanism discussed earlier) is explicitly deferred to a later phase. Reserving the name now just means the command family reads coherently (`add`/`upgrade`/...) from day one instead of being retrofitted later.

## Builtin tokens vs. composed patterns

Went through candidate "vibe" tokens (radius, focus ring, icon sizing, border-width) and landed on a tight principle: **only genuinely primitive, single-dimension scales belong in `@chamfer-css/core`** (next to `makeColor`, `makeSpace`, `makeSize`) — anything that composes multiple concerns into one opinionated recipe belongs in `@chamfer-css/components` instead, built from primitives.

- **`makeRadius`** — genuinely new primitive, nothing else covers corner rounding. Add to `@chamfer-css/core`'s template set (`packages/chamfer-core/src/templates/`), same shape as the existing `Template.make-size.ts`/`Template.make-space.ts` (a named scale, px+rem CSS variable variants). This is the one concrete addition needed before Tier 0.
- **Icon sizing — no new builtin.** Checked `Template.make-size.ts`'s own description: *"Generates size tokens for named element heights (buttons, inputs, rows)"* — already exactly the right scale for icons living inside those same elements. Icon just consumes the existing `makeSize`; at most a project might add smaller variants to its own `sizeAndSpace.size.variants` config if its scale doesn't go small enough — that's project-level config, not new core code.
- **Focus ring — not a core primitive.** It's a composed pattern (a color reference + a border-width + maybe radius), not a single-dimension scale. Lives as a shared style snippet inside `@chamfer-css/components`, imported by every interactive component, built from `makeColor` + a plain border-width value.
- **Border-width — likely a plain constant, not a scale.** Most design systems treat this as near-fixed (1px, maybe 2px for emphasis) rather than something requiring user-configurable scale/tokens. Leaning toward a plain shared constant inside `@chamfer-css/components` rather than a `@chamfer-css/core` template — revisit only if real variation across designs shows up.
- **Shadow/elevation, z-index/layering** — deferred to Tier 2 design specifically. Already checked `stratum-ui`'s source: `Toaster.tsx` uses `createPortal`, and the Menu implementation has a comment about escaping clipping ancestors "without a portal or manual z-index" — stratum-ui may already sidestep stacking-context problems per-component, so whether a z-index *token* is even needed depends on reading each engine (Modal, Popover, Toast, Menu) individually once Tier 2 design starts, not something to decide now.
- **Motion/transition, opacity scale** — lower priority, not blocking anything currently scoped; revisit only if real duplication shows up.

## Monorepo package scaffolding

The user mostly works in monorepos (confirmed: this repo has `packages/chamfer-studio-tokens` as a dedicated, shared tokens package consumed by `chamfer-studio` — exactly the pattern to replicate). `chamfer components add` should:
1. Detect a monorepo (root `package.json` `workspaces` field / `pnpm-workspace.yaml` / `turbo.json`).
2. If detected and no components package is registered yet, prompt to scaffold one (name, default `packages/components`) — `package.json`, `tsconfig.json`, `.storybook/`, Linaria/Vite config wired up.
3. Ask (or auto-detect, if exactly one candidate exists in the workspace) which existing package provides the consumer's chamfer-css tokens, and have the new components package depend on *that* package rather than generating its own separate token set — avoids duplicate/conflicting design-token sources living side by side in the same monorepo.
4. Outside a monorepo: fall back to a configured components directory within the single app (ask once, persist the choice — similar in spirit to shadcn's `components.json` path aliases, but this is app-local, not a components-only theming file per the point above).

## Starter component set (tiers, in build order)

**Tier 0 — pure styling, no state, build and design first:**
Typography (wraps `makeFontVariant`/`makeFontFamily`/`makeFontWeight`), Button (primary/secondary/warning color variants — same variant/color shape as `chamfer-studio`'s existing `ButtonRegular.tsx`, generalized), Icon (hugeicons wrapper — not yet a dependency anywhere in the monorepo, needs adding), Image (`<picture>`, art direction, sane `loading`/`decoding` defaults).

**Prop naming: no `dx`-prefix convention for this package.** `chamfer-studio`'s internal components use `dxVariant`/`dxColor`/`DXIconStart` — deliberately not carried over here. `@chamfer-css/components` is meant for broader consumption (not just this monorepo's internal app), so props use plain, conventional names (`variant`, `color`, `iconStart`) matching how every other mainstream component library names things — more familiar to any consumer, not just this codebase.

**Every variant-bearing component uses the centralized variant-config-object pattern** (see the Context section's copy-paste/variant-picking note) from the start — not something retrofitted once the CLI needs to filter it.

**Tier 1 — form inputs, still no complex state machines:**
Extract and generalize from `chamfer-studio`'s existing `InputText.tsx`/`InputCheckbox.tsx`/`InputRadio.tsx`/`InputSelect.tsx` — already-proven reference implementations in production use there.

**Tier 2 — do last, and only after a prerequisite refactor:**
Modal, Popover, Tooltip, Toggletip, Menu, Toast. `chamfer-studio` currently has its *own* hand-rolled versions of these (`Modal.useModal.ts`, `Popover.usePopover.ts`, `DialogEngine.ts`) that do **not** yet consume `@stratum-ui/react` — duplicated logic sitting right next to the package meant to replace it. Migrate `chamfer-studio`'s own components onto `@stratum-ui/react` first (dogfoods the abstraction against real usage, deletes the duplication, and leaves one clean, battle-tested source to extract from) before designing the thin bootstrapped wrappers for `chamfer-components`.

## Sequencing — concrete next steps, in order

1. Add `makeRadius` to `@chamfer-css/core`'s template set — the one concrete token-layer prerequisite for Tier 0.
2. Scaffold the new `@chamfer-css/components` package (Storybook + Linaria configured, empty — matches `chamfer-studio-tokens`'s role as a standalone dev/test package for `chamfer-core`).
3. Hand-write Tier 0 (Typography, Button, Icon w/ hugeicons, Image) directly in the new package — no CLI automation yet, just get the reference implementations right and previewable in Storybook. Includes the shared focus-ring style pattern (composed from `makeColor` + a plain border-width constant) that Button and every later interactive component reuses.
4. Build the `chamfer components` fizmoo command family: `components.ts` parent, `components/add.ts` (interactive not-yet-installed picker via `@inquirer/prompts`, monorepo-package-scaffolding/detection logic, copy-source mechanics — copying the *full* reference component, every variant included), `components/upgrade.ts` (name reserved, implementation deferred — see below). Target Tier 0 first since it's the simplest end-to-end path to prove out.
5. Fast-follow, right after step 4 proves the pipeline works: add the variant-picker prompt to `components/add.ts` — filters each component's centralized variant-config object down to the selected keys before writing the file, and records the selected variants in the manifest.
6. Extract Tier 1 (form inputs) from `chamfer-studio`.
7. Independent track, needs to land before step 8 but not necessarily before steps 1–6: refactor `chamfer-studio`'s `Modal`/`Popover`/`Tooltip` to consume `@stratum-ui/react` instead of their own hand-rolled engines (dogfoods the abstraction, deletes the duplication, leaves one clean source to extract from).
8. Design and extract Tier 2 as thin `@stratum-ui/react`-backed wrappers — read each of `stratum-ui`'s Modal/Popover/Toast/Menu engines individually first to settle the shadow/z-index question per-component rather than assuming a shared token is needed.
9. Later, not blocking: the pre-compiled/publishable distribution path for Next.js/non-Linaria consumers.
10. Later, explicitly deferred by the user: the `chamfer components upgrade` diff/merge implementation for already-bootstrapped, user-customized files.

## Verification

- Storybook running against the new `@chamfer-css/components` package renders each Tier 0 component correctly, light/dark or whatever schemes `chamfer-css` tokens already support.
- `chamfer components add` run against a scratch Vite+Linaria test project (inside and outside a monorepo) shows an interactive picker listing only not-yet-installed components, and selecting Button actually produces a working, styled component (not a bare unstyled `<button>`).
- Running it again shows Button excluded from the picker (manifest correctly tracks what's installed), and a second component's styling (radius, etc.) is visually consistent with the first.
- Once the variant-picker fast-follow (step 5) lands: selecting only `primary`/`secondary` for Button produces a file with no trace of `warning` anywhere (type, styles, or otherwise) — not a hidden/disabled option, genuinely absent — and the manifest records exactly which variants were selected.
- `chamfer-studio` itself, after step 7's stratum-ui migration, has zero remaining hand-rolled Modal/Popover/Tooltip logic duplicating `@stratum-ui/react`.
