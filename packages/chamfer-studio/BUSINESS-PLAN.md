# Chamfer Studio — Business Plan (Draft)

Status: **on hold, revisit later.** Decided next step (2026-07-09): use Chamfer in real projects before deciding anything here. Every candidate below is still speculative — dogfooding is how we find out which gaps in the experience are real and painful enough to be worth paying to solve, instead of guessing from first principles. Revisit this doc once that usage surfaces actual friction points, and let those (not this list) drive which monetization angle gets picked.

---

## The problem we ran into

The original plan was: every user gets 1 free design system; additional design systems require a paid subscription.

That model doesn't hold up. A "design system" in Chamfer is just a `.chamfer/config.ts` file — plain data, no proprietary format, no server-side computation. The local CLI (`chamfer build`) is fully free and fully functional with no account needed. So a user who wants a 2nd, 3rd, 10th design system can just copy the config file into their own repo and run the local CLI against it — there's nothing to enforce the paywall against. Gating on _count of config files_ is gating on something that isn't actually scarce.

This isn't a bug to fix — the local tool being complete and free is correct (that's what makes people trust and adopt it in the first place, and it's the standard shape for this category: Vercel, Prisma, Supabase CLI all give away the core engine for free). The fix is to stop trying to paywall something copyable, and instead find the part of the product that genuinely requires our server.

---

## What actually can't be copied

Anything that requires the server to keep existing and to mediate between multiple people or multiple systems. Two candidates came out of this discussion:

### 1. Team collaboration (primary recommendation)

A design system used by a team needs things a single local config file can't provide on its own:

- Multiple people invited to the same design system
- Roles/permissions (who can change the primary brand color vs. who can just view)
- An approval flow before a token change goes live
- A change/audit log (who changed what, when)
- Notifications when something changes (Slack-style)

This is the classic, proven SaaS moat for "config that a team has to agree on" (see: Figma, Linear, Vercel). It also reframes pricing into something enforceable: **pay per collaborator/seat on a design system**, not "pay per design system." Plugs directly into the project/design-system data model that already exists (`ProjectsController`, D1-backed projects).

### 2. Figma sync (secondary — the differentiator)

Pull color/type/spacing variables from Figma into Chamfer, or push Chamfer tokens back into Figma styles. This is specific to _design tokens_ (not just "config as code with a nicer UI") — it requires real ongoing infrastructure (OAuth, webhooks/polling) a local CLI user can't replicate by hand, and it directly attacks the actual problem design tokens exist to solve: design/engineering drift.

This is the feature that makes the marketing story compelling — "Chamfer keeps design and engineering in sync" is a much bigger pitch than "Chamfer is a nicer way to write CSS variables."

### 3. Accessibility compliance reporting (strongest quick win)

`SemanticPreviewContent.tsx` already computes AA/AAA contrast via `ColorAccessibilityChecker`. Turning that into an exportable compliance report (WCAG 2.1 AA sign-off, PDF/CSV) is a small lift from what's already built, and it's the kind of thing legal/compliance-driven orgs (larger companies, anything government-adjacent) pay for specifically — they need paper to point to, not just a green checkmark in a UI.

### 4. Visual change-impact diffing

"You changed `primary-500` from X to Y — here's a screenshot diff of everywhere it's used." Requires real infra (headless rendering, storage, diffing) a local user structurally can't replicate. Pairs naturally with the team-collaboration approval flow — you shouldn't be able to approve a token change without seeing its blast radius.

### 5. Multi-platform export

Chamfer is CSS-only right now. Companies with a _real_ design system usually need one source of truth across web and mobile too (iOS/Swift, Android/Kotlin, React Native, Style Dictionary JSON). This is genuinely ongoing engineering work (platform APIs shift over time), which is exactly the kind of thing worth paying a subscription for rather than building in-house.

### 6. Hosted npm publishing

Auto-publish tokens as a versioned, scoped package (`@company/design-tokens`) on every save, so every consuming repo just `npm install`s the latest instead of copy-pasting files. Solves a real multi-repo pain point and requires actual registry/versioning infra to run.

### 7. Design-token governance bot

A GitHub/GitLab App that scans PRs across a company's repos and flags hardcoded values that should reference a token ("this hex should be `--primary-500`"), or blocks merges that violate token rules. The "Renovate bot, but for design tokens" pitch — real ongoing infra (webhooks, static analysis across many repos) — and it ties directly into the compliance-reporting angle (#3).

### 8. Adoption/usage analytics dashboard

Scan a company's consuming repos to show what % of colors/spacing/type actually reference tokens vs. hardcoded values, which tokens are unused, where drift is creeping in. This is the data an internal design-system team needs to justify its own existence to leadership — a real, recurring pain point, and not something a local user can replicate without meaningful scanning infrastructure.

### 9. Agency/reseller tier

Plugs directly into the theming/white-labeling architecture above: an agency managing design systems for many clients wants one account, one login, with each client as a themed variant or sub-workspace, and team permissions per client. This is a distinct customer _segment_ (agencies, not just single companies) that "1 design system per account" doesn't address at all — it turns the multi-theme architecture into a sales angle, not just a UX nicety.

### 10. Self-hosted enterprise license

A different revenue _shape_, not per-seat SaaS: some large enterprises won't put design tokens in a third-party cloud at all for security/compliance reasons. Selling a Docker-packaged, license-key-gated version of the Studio app itself (not the open local CLI) for them to run on their own infra is the classic open-core play (GitLab, Sentry). An alternate path, not necessarily near-term.

### Weaker ideas (not worth building as pillars)

- **AI-assisted palette/theme generation** — easy for a competitor to bolt on with an LLM wrapper; not a moat.
- **Priority support / SLA** — fine as a generic enterprise add-on later, not a differentiator on its own.
- **SSO / enterprise auth (SAML, Okta)** — standard enterprise checkbox, not specific to this product, but worth bundling into a future enterprise tier once one exists.
- **Embeddable style-guide widget** — drop a live token reference into Notion/Confluence so non-technical stakeholders don't need repo access. Nice complement to team collaboration, not its own pillar.
- **Full component-library generation** (actual styled buttons/inputs, not just tokens) — tempting, but risks diluting the "design tokens" focus into a much bigger, harder-to-maintain product.

### Considered and deprioritized: hosted CDN for generated output

Serving the generated `root.css` / tokens from a stable hosted URL. Rejected as a _standalone_ pillar — the output is small enough (a CSS/JS file) that self-hosting it is trivial (any static host, GitHub Pages, a committed file in the repo). Fine as a bundled convenience alongside one of the above, not defensible on its own.

### Considered and rejected: require sign-in to use the CLI at all (gate local usage to 1 design system)

Floated as "just make the CLI phone home and enforce the 1-design-system limit server-side." Rejected:

- Breaks the core promise of a local-first tool (runs entirely on your machine, no network dependency, no vendor lock-in) — that promise is exactly what makes a solo dev trust the tool enough to bring it to their team, which is the real path to the team-collaboration tier.
- Doesn't actually close the loophole — `@chamfer-css/core`'s `Chamfer.build()` has to stay open/auditable for anyone to trust installing it, so a determined user can call it directly in their own script and skip the CLI's account check entirely.
- Precedent (Prisma, Supabase CLI, Vercel CLI) is to never gate local/free usage behind auth — sign-in only appears when opting into something genuinely server-dependent.

---

## Theming & white-labeling (product architecture, not a paywall pillar)

Question raised: should a "theme" (light/dark, multi-brand, white-label, seasonal) require multiple separate design systems, or should one design system support multiple themes?

**Current state:** there's no general theme concept in the schema today (confirmed — no hits for "theme" anywhere in `chamfer-core`'s schemas/templates). The only variant mechanism that exists is light/dark, and it's baked into the semantic-color layer itself (`SemanticEntrySchema = { light, dark }`, resolved via CSS `light-dark()`) — not a broader theming system.

**Recommendation: one design system, multiple theme overlays — not N separate design systems.** Reasoning:

- Most of a design system (spacing scale, typography, breakpoints, custom tokens) is shared across themes; only a subset (usually colors, sometimes fonts) actually varies. Forcing users into N fully separate design systems duplicates everything else N times, with real drift risk (update the type scale in one, forget the other three).
- It avoids a business-model trap: if "I need 3 brand variants of the same product" required 3 separate design systems, that would shove a legitimate, common need straight into the design-system paywall for something that isn't conceptually "another design system" — punishing normal use, not abuse.

**Likely shape (not designed yet):** a `themes` map alongside the base config, each theme overriding a scoped set of tokens (primarily colors), with the build step emitting scoped custom properties per theme, toggled via something like `data-theme` — the same pattern light/dark already uses via `light-dark()`.

**Monetization angle:** don't paywall the underlying capability — a themes map is still just config data, same copyability problem as the original "pay per design system" mistake. If there's a gate here, it belongs on **the Studio UI's ability to visually manage/preview multiple themes** (e.g., free plan manages 1–2 themes visually, paid unlocks unlimited theme management), consistent with the "Studio-managed projects" framing in the open questions below — not on whether the config format supports theming at all.

---

## Recommended direction (tentative, not decided)

Ten paywall candidates are on the table now (#1–#10 above). Not yet ranked against each other beyond the rough notes below — deliberately deferred until we revisit.

1. Build toward **team collaboration** first — it's the most defensible, plugs into existing data model, and gives a natural, enforceable pricing lever (seats, not files).
2. Treat **Figma sync** as the differentiator to build once the collaboration foundation exists — it's a bigger lift (external OAuth integration) and is more valuable once there's a multi-person workspace for it to sync into.
3. **Accessibility compliance reporting** is the standout quick win if we want something sellable sooner — half the underlying logic (`ColorAccessibilityChecker`) already exists in the codebase.
4. Multi-platform export and hosted npm publishing are good later-stage additions once there's a team tier to attach them to.
5. **Governance bot, adoption analytics, agency tier, and self-hosted enterprise** (#7–#10) are newer additions that still need to be weighed against #1–#6 — no ordering assumed yet.
6. Do not resurrect "pay per design system" — it's unenforceable and not worth chasing.

## Open questions for when we revisit

- What does a "workspace" or "organization" concept look like on top of the current per-user `projects` model? Does a design system belong to a user or to a team?
- Pricing shape: per-seat? Per-workspace with a seat cap? Flat team tier?
- Does the free tier still get unlimited _solo_ design systems (no collaborators), or does it stay capped at 1 and only collaboration unlocks more? (Given the copyability problem, capping solo usage at all may not be worth enforcing — the free tier could just be "unlimited local + 1 hosted/Studio-managed project," with paid unlocking more Studio-managed projects _and_ collaboration.)
- Figma sync: one-way (Figma → Chamfer) or two-way? Where do conflicts get resolved?
- Theme schema shape: what exactly can a theme override (colors only, or fonts/spacing too)? How does theme switching interact with the existing light/dark `light-dark()` mechanism — is light/dark itself just "a theme," or a separate orthogonal axis every theme gets for free?
- What does "shoring up the experience" concretely include before revisiting this? (Candidates so far this session: CI/CD verification against a real GitHub Actions run, remote D1 migration, sign-in/sign-up page redesign, `@greenflash/http-errors` migration.)

---

_Last updated: 2026-07-09, captured from a planning conversation. Not an implementation plan — no code should be written against this until the direction is confirmed._
