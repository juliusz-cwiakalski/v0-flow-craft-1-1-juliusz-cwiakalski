Agent Guide for this Repo (Next.js 14 + TS, pnpm)

- Setup/Build: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`.
- Tests: none configured; single test examples — Vitest: `pnpm vitest path/to.test.ts -t "name"`; Jest: `pnpm jest path/to.test.ts --testNamePattern="name"`.
- Lint/Fix: `pnpm lint --fix`; manually address remaining warnings.
- Imports: Node/third-party → `@/*` alias → relative; avoid default imports; side-effects last.
- Paths/Alias: use `@/*` from `tsconfig.json`; prefer `@/lib/*` utilities (e.g., `cn`).
- Components: `PascalCase` exports; files `kebab-case` (see `components/*`).
- Formatting: 2 spaces, double quotes, no semicolons, trailing commas; wrap long JSX props.
- Types: strict TS; type exported APIs/props; prefer `unknown` over `any`; validate with `zod`.
- State: Redux Toolkit in `lib/redux/slices/*`; pure reducers; async via thunks; persist via `lib/redux/middleware/localStorage.ts`.
- Errors: catch async; surface via `hooks/use-toast.ts`; avoid throwing in render; add contextual logs in dev.
- Styling: Tailwind; compose with `cn`; prefer variants over inline conditionals.
- V0: ALWAYS adhere to `.ai/rules/rules.md` coding standards.
- V0: New features as change specs in `doc/changes/<id>-<slug>/<slug>.md`.
- V0: After implementation, update `doc/spec/specification.md` (or referenced specs).
- V0: Record user-visible changes in `lib/changelog.ts`.
- V0: If `doc/spec/specification.md` grows, split into `doc/spec/*` and reference in index.
- V0: Use `doc/templates/feature-specification-template.md` for new specs.
- V0: Consult and maintain `doc/technical-design.md` for technical decisions.
