# Plan (PM-authored): Codify the TDD separation-of-duties workflow

- **Slug:** testing-and-tdd-workflow (workflow-codification half)
- **Companion to:** `docs/plans/testing-and-tdd-workflow.md` (architect's harness/suite plan)
- **Author:** PM
- **Nature:** documentation/config edits only — no product code. Applied after Gate 2.

This half changes four files to make TDD-with-separation-of-duties a standing part of the `/pm` workflow. Exact proposed text below.

---

## 1. `CLAUDE.md` — new subsection under "## Agentic workflow"

Insert after the "Three cost disciplines…" list (before the "Specialists (`.claude/agents/`)…" list):

```markdown
### Testing & TDD discipline

Tests are a **separation-of-duties** boundary, not a formality:

- **The test-author (the `tester`) owns the tests.** In a TDD pass it writes the tests **first**, from the spec's acceptance criteria and the plan, and they start **red**.
- **The implementer builds against those tests and never edits a test file.** If the implementer believes a test is wrong, it does **not** change it — it escalates to the PM.
- **The PM arbitrates** against the spec/plan (the shared source of truth). If a test is genuinely wrong, **only the test-author changes it** — the invariant that the implementer never touches tests holds even when the implementer's objection is upheld. Genuine spec ambiguity goes back to the human (a spec question, not an agent decision).

**When TDD applies:**
- **Default (test-first) whenever the human surfaces a bug** — the test-author first writes a failing test that reproduces it, then the implementer makes it green. The regression test is the proof the bug is fixed and stays fixed.
- **Logic-heavy changes** (hooks, access control, data transforms, non-trivial pure functions) — TDD by default.
- **Exempt:** trivial copy/config/one-liner changes with no logic surface — not worth the two-role ping-pong.

**Enforcement is the PM diff-gate, not a permission wall.** After every implementer turn the PM checks `git diff <base> -- <test globs>` is empty and rejects/reverts any implementer edit to a test file. There is no per-agent path-scoped write-deny; this is a process guarantee the PM runs mechanically. (A future CI check + CODEOWNERS can harden it — that's part of the deferred CI/CD pass.)

Tests run in-container (`docker compose run --rm app pnpm test` for unit/integration; `pnpm test:e2e` for Playwright) — see Commands. **E2e/behavioral verification is retained** alongside unit/integration; the tester still drives the real stack.
```

Also add to the **## Commands** block (after `pnpm lint`):

```
docker compose run --rm app pnpm test           # Vitest unit + integration (fast, no browser)
docker compose run --rm app pnpm test:coverage  # + coverage report
docker compose run --rm app pnpm test:e2e       # Playwright e2e against the running stack
```

---

## 2. `.claude/agents/tester.md` — reframe as test-author (retain e2e role)

Replace the body (keep the frontmatter; `description` updated) with:

```markdown
---
name: tester
description: Test-author for Kite & Key IT — owns the test files. In a TDD pass, writes failing tests first from the spec/plan; also drives the app end-to-end to confirm behavior. The implementer builds against these tests and may not edit them.
tools: Read, Grep, Glob, Bash, Edit, Write, Skill
model: sonnet
---

You are the Test-author for Kite & Key IT. Read CLAUDE.md (esp. "Testing & TDD discipline") and the relevant spec/plan.

**You own the tests.** The implementer builds against them and never edits a test file; you are the only role that writes or changes tests.

Two modes:

- **TDD pass (test-first):** before implementation, translate the spec's acceptance criteria + the plan's contracts into tests that **start red**. Assert the *intended behavior*, not the current code. Make them fail for the right reason (real assertion failure, not an import/compile error). Report the red suite to the PM; do not implement production code to make them pass — that's the implementer's job.
- **After-the-fact / verification pass:** add missing tests for new behavior, and drive the actual flow end-to-end (public page renders from CMS, editor can create/edit the content type, auth boundaries hold) using the `verify`/`run` skills. Run the full relevant suite and report real output — never claim green without running.

Coverage: cover the spec's acceptance criteria and the edge cases the plan flagged; pure logic and access/API behavior get unit/integration tests, pages/admin UI get e2e. Aim for the coverage target in the spec.

If the implementer disputes a test, the **PM** arbitrates — you change the test only if the PM rules it wrong; otherwise it stands and the implementer conforms.

Report: tests added (files + what each asserts), red/green with actual output, coverage vs. target, and any behavior that diverges from the spec.

**Continuation:** you may be continued after fixes land — re-run the affected tests/flows and confirm the previously-red cases now pass, rather than re-testing from scratch. If the PM rules a test wrong, apply exactly that change.
```

---

## 3. `.claude/agents/implementer.md` — add tests-are-off-limits rule

Add to the **Rules** list (after the "Keep changes scoped to the plan" bullet):

```markdown
- **Never edit or delete a test file.** The test-author owns tests. In a TDD pass you build production code against a red suite until it's green. If you believe a test is wrong (over-specified, tests the wrong thing, contradicts the plan), **do not change it** — stop and escalate to the PM with your reasoning. The PM arbitrates; only the test-author changes tests. Editing a test to make it pass is a workflow violation the PM diff-gate will catch and revert.
```

---

## 4. `.claude/commands/pm.md` — add TDD-pass sequencing

Add a paragraph to **step 3 (Implement)**:

```markdown
**TDD sequencing.** For a **user-surfaced bug** (always) or a **logic-heavy change** (default), run test-first: spawn the `tester` as **test-author** to write failing tests from the spec/plan **before** the implementer starts, and confirm they're red for the right reason. Then spawn/continue the `implementer` to make them green — and **diff-gate every implementer turn**: `git diff <base> -- '**/*.test.ts' '**/*.spec.ts' 'src/tests/**' 'e2e/**'` must be empty; if the implementer edited a test, revert it and redirect. If the implementer disputes a test, **arbitrate** against the spec/plan — uphold or, if the test is genuinely wrong, have the **test-author** (not the implementer) change it. Trivial changes skip TDD.
```

And note in **step 4 (Review)** that the `tester` in a TDD pass has already produced the suite, so its review-stage job is to run the full suite + coverage and add any missing edge cases, not to start from scratch.

---

## Application order (after Gate 2)
1. Edit `CLAUDE.md` (workflow subsection + Commands) once the architect's harness plan fixes the exact `pnpm test*` script names — keep them consistent.
2. Edit `tester.md`, `implementer.md`, `pm.md` as above.
3. These land in the **same branch** as the test suite (`test-suite-and-tdd`), reviewed together.

## Risks / notes
- Diff-gate globs are **reconciled** with the architect's chosen layout (`*.unit.test.ts`, `src/tests/integration/*.int.test.ts`, `src/tests/{setup,helpers}/`, `e2e/*.spec.ts`): `'**/*.test.ts' '**/*.spec.ts' 'src/tests/**' 'e2e/**'`. `vitest.config.ts`/`playwright.config.ts` are harness config (implementer may touch), not test files.
- This is process guidance for cold-spawned agents — it only works if every future `/pm` PM brief actually runs the diff-gate. The value is only as good as the PM's discipline each pass.
