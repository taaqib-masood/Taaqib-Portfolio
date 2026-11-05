# Graph Report - Taaqib-Portfolio  (2026-11-05)

## Corpus Check
- 95 files · ~51,673 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .woff 2, .example 1)

## Summary
- 514 nodes · 1147 edges · 31 communities (all shown)
- Extraction: 99.5% EXTRACTED · 0.5% INFERRED · 0.0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f01e2028`
- Source-aware freshness check (stale only if this command prints paths; documentation-only and graph-only commits do not count):

```sh
git diff --name-only f01e2028f37ece43968595c2f350565538540ade HEAD -- ':(glob)**/*.json' ':(glob)**/*.mjs' ':(glob)**/*.ts' ':(glob)**/*.tsx' ':(exclude)graphify-out/**'
```
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app/page.tsx
- stream/route.ts
- Globe3D.tsx
- EmbeddingSection.tsx
- layout.tsx
- Projects.tsx
- [slug]/page.tsx
- components.json
- dependencies
- Agent.tsx
- compilerOptions
- package.json
- Contact.tsx
- check-headers.mjs
- devDependencies
- check-ai-limits.mjs
- check-temp-artifacts.mjs
- github/route.ts
- ref_node_assert
- playground/page.tsx
- gen-land-mask.mjs
- check-chat-e2e.mjs
- repro-185.mjs
- check-content.mjs
- next.config.mjs
- scripts
- extends
- tailwindcss
- ref_node_fs
- postcss.config.mjs
- next-themes

## God Nodes (most connected - your core abstractions)
1. `useT()` - 43 edges
2. `react` - 29 edges
3. `framer-motion` - 24 edges
4. `next` - 21 edges
5. `Home()` - 19 edges
6. `lucide-react` - 18 edges
7. `TokenText()` - 18 edges
8. `ParallaxNumber()` - 17 edges
9. `Projects()` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `RootLayout()` --calls--> `localeFromCookie()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/i18n.ts
- `RootLayout()` --calls--> `cn()`  [EXTRACTED]
  src/app/layout.tsx → src/lib/utils.ts
- `Home()` --calls--> `AudienceToggle()`  [EXTRACTED]
  src/app/page.tsx → src/components/AudienceToggle.tsx
- `Home()` --calls--> `Projects()`  [EXTRACTED]
  src/app/page.tsx → src/components/Projects.tsx
- `Agent()` --calls--> `useLocale()`  [EXTRACTED]
  src/components/Agent.tsx → src/components/LocaleProvider.tsx

## Import Cycles
- None detected.

## Communities (31 total; all shown)

### Community 0 - "app/page.tsx"
Cohesion: 0.09
Nodes (69): react-activity-calendar, framer-motion, react, react-activity-calendar, GithubFeed, app/page.tsx, Agent, Contact (+61 more)

### Community 1 - "stream/route.ts"
Cohesion: 0.08
Nodes (54): @ai-sdk/groq@^3.0.52, zod@^4.4.3, ai, @ai-sdk/groq, zod, stream/route.ts, getSystemPrompt(), POST() (+46 more)

### Community 2 - "Globe3D.tsx"
Cohesion: 0.11
Nodes (31): check-globe.mjs, june, s, v, buildArc(), buildEarth(), buildUae(), DUBAI (+23 more)

### Community 3 - "EmbeddingSection.tsx"
Cohesion: 0.11
Nodes (30): check-embedding.mjs, centers, p(), projects, opengraph-image.tsx, alt, contentType, OgImage() (+22 more)

### Community 4 - "layout.tsx"
Cohesion: 0.13
Nodes (27): next@^15.5.25, next, src_app_globals, layout.tsx, dynamic, inter, metadata, plexArabic (+19 more)

### Community 5 - "Projects.tsx"
Cohesion: 0.20
Nodes (24): @base-ui/react, Projects.tsx, categories, EmbeddingSection(), projectYear(), getMetricTooltip(), GithubIcon(), Projects() (+16 more)

### Community 6 - "[slug]/page.tsx"
Cohesion: 0.16
Nodes (24): [slug]/page.tsx, CaseStudyPage(), dynamic, find(), generateMetadata(), Params, AudienceToggle.tsx, AudienceToggle() (+16 more)

### Community 7 - "components.json"
Cohesion: 0.09
Nodes (22): components.json, aliases, components, hooks, lib, ui, utils, iconLibrary (+14 more)

### Community 8 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, ai@^6.0.228, @base-ui/react@^1.6.0, class-variance-authority@^0.7.1, clsx@^2.1.1, framer-motion@^12.42.2, react@^19.3.0, react-activity-calendar@^3.2.1 (+12 more)

### Community 9 - "Agent.tsx"
Cohesion: 0.17
Nodes (20): check-agent.mjs, part(), Agent.tsx, Agent(), AnyPart, getContextualFollowUps(), getTextFromParts(), INTERVIEW_MODES (+12 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (19): tsconfig.json, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 11 - "package.json"
Cohesion: 0.12
Nodes (16): package.json, @ai-sdk/openai@^3.0.87, cmdk@^1.1.1, react-dom@^19.3.0, resend@^6.17.2, tailwind-merge@^3.6.0, name, overrides (+8 more)

### Community 12 - "Contact.tsx"
Cohesion: 0.17
Nodes (16): @hookform/resolvers@^5.4.0, lucide-react@^1.24.0, react-hook-form@^7.81.0, sonner@^2.0.7, @hookform/resolvers, lucide-react, react-hook-form, sonner (+8 more)

### Community 13 - "check-headers.mjs"
Cohesion: 0.13
Nodes (16): check-headers.mjs, a, api(), b, cspA, cspB, get(), headerEntries (+8 more)

### Community 14 - "devDependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint@^8, eslint-config-next@^15.5.25, postcss@^8.5.22, @types/node@^20, @types/react@^19.3.0, @types/react-dom@^19.3.0, @types/three@^0.186.0 (+7 more)

### Community 15 - "check-ai-limits.mjs"
Cohesion: 0.18
Nodes (13): ref_node_crypto, check-ai-limits.mjs, allowances, cache, cases, fakeFetch(), limiter, load() (+5 more)

### Community 16 - "check-temp-artifacts.mjs"
Cohesion: 0.18
Nodes (11): typescript@^5, ref_node_os, ref_node_vm, typescript, check-temp-artifacts.mjs, cases, logPath(), visit() (+3 more)

### Community 17 - "github/route.ts"
Cohesion: 0.33
Nodes (11): github/route.ts, contributions(), contributionsFromGraphql(), dynamic, GET(), getJson(), LEVELS, num() (+3 more)

### Community 18 - "ref_node_assert"
Cohesion: 0.22
Nodes (10): ref_node_assert, ref_node_module, check-browser.mjs, { chromium }, errors, require, check-mail.mjs, check-transcript.mjs (+2 more)

### Community 19 - "playground/page.tsx"
Cohesion: 0.25
Nodes (9): @ai-sdk/react@^3.0.230, react-markdown@^10.1.0, remark-gfm@^4.0.1, @ai-sdk/react, react-markdown, remark-gfm, playground/page.tsx, getTextFromParts() (+1 more)

### Community 20 - "gen-land-mask.mjs"
Cohesion: 0.25
Nodes (8): ref_d3_geo, ref_topojson_client, gen-land-mask.mjs, bits, { feature }, { geoContains }, land, require

### Community 21 - "check-chat-e2e.mjs"
Cohesion: 0.25
Nodes (8): ref_node_child_process, ref_node_timers, check-chat-e2e.mjs, { chromium }, errors, require, responses, server

### Community 22 - "repro-185.mjs"
Cohesion: 0.25
Nodes (8): repro-185.mjs, artifactDir, { chromium }, log(), on(), port, require, start()

### Community 23 - "check-content.mjs"
Cohesion: 0.33
Nodes (6): ref_node_path, check-content.mjs, dashes, strings, untranslated, walk()

### Community 24 - "next.config.mjs"
Cohesion: 0.40
Nodes (5): next, next.config.mjs, assetCache, nextConfig, securityHeaders

### Community 25 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 26 - "extends"
Cohesion: 0.50
Nodes (4): .eslintrc.json, extends, next/core-web-vitals, next/typescript

### Community 27 - "tailwindcss"
Cohesion: 0.50
Nodes (4): tailwindcss@^3.4.1, tailwindcss, tailwind.config.ts, config

### Community 28 - "ref_node_fs"
Cohesion: 0.50
Nodes (4): ref_node_fs, check-isr-cache.mjs, component, route

### Community 29 - "postcss.config.mjs"
Cohesion: 0.67
Nodes (3): postcss.config.mjs, config, postcss-load-config

### Community 30 - "next-themes"
Cohesion: 1.00
Nodes (2): next-themes@^0.4.6, next-themes

## Knowledge Gaps
- **2 isolated node(s):** `next/core-web-vitals`, `next/typescript`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 191 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `layout.tsx` to `app/page.tsx`, `stream/route.ts`, `EmbeddingSection.tsx`, `Projects.tsx`, `[slug]/page.tsx`, `package.json`, `check-headers.mjs`, `github/route.ts`, `playground/page.tsx`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **What connects `next/core-web-vitals`, `next/typescript` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09207161125319693 - nodes in this community are weakly interconnected._
- **Why does `react` connect `app/page.tsx` to `Globe3D.tsx`, `EmbeddingSection.tsx`, `layout.tsx`, `Projects.tsx`, `[slug]/page.tsx`, `dependencies`, `Agent.tsx`, `package.json`, `Contact.tsx`, `playground/page.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Should `stream/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0803633822501747 - nodes in this community are weakly interconnected._
- **Why does `typescript` connect `check-temp-artifacts.mjs` to `package.json`, `check-ai-limits.mjs`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `Globe3D.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11182795698924732 - nodes in this community are weakly interconnected._
## Build scope

AST-only extraction of 87 code files. Documents and media were not semantically extracted. Community names use deterministic hub labels. No LLM or paid API calls were made.

Raw pre-build extraction diagnostics (not exported-graph counts): dangling_endpoint_edges=1, self_loop_edges=2, undirected_same_endpoint_collapsed_edges=12. During build, endpoints may be resolved or external import stubs created; edges whose endpoints remain unresolved are dropped and are absent from `graph.json`. The exported graph has no dangling endpoints.
