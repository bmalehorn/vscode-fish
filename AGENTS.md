# Repository Guidelines

## Project Structure & Module Organization
Source for the VS Code extension lives in `src/`; `extension.ts` wires registration and delegates completions to `provideCompletionItems.ts`. Compiled output is emitted to `out/` by the TypeScript build. TextMate grammar files sit under `syntaxes/`, snippets in `snippets/`, and visual assets (gifs/pngs) reside at the repo root. Grammar fixtures are split between `tests/grammar/` (assertions) and `tests/grammar-snapshots/` (snapshot baselines); use `sample/` and `sample.fish` for quick manual checks.

## Build, Test, and Development Commands
Install dependencies with `yarn install`. Run `yarn compile` to transpile TypeScript once, or `yarn watch` to rebuild on change while developing. `yarn test` launches the VS Code test runner after compiling, `yarn test:grammar` verifies grammar fixtures, and `yarn test:grammar:snap` compares snapshots; append `--updateSnapshot` when regenerating fixtures. Before publishing, execute `yarn vscode:prepublish` so `out/` stays in sync with the shipped extension.

## Coding Style & Naming Conventions
TypeScript follows Prettier defaults (2-space indentation, double quotes, trailing commas where valid). Linting is governed by `tslint.json`; keep rule suppressions localized with comments when unavoidable. `simple-git-hooks` runs `prettier --write` via lint-staged on staged TypeScript, JSON, Markdown, and stylesheet files—run it manually with `npx prettier --write <paths>` if needed. Use descriptive camelCase for functions and variables, PascalCase for classes, and mirror fish command names verbatim inside grammar fixtures.

## Testing Guidelines
Favor targeted grammar tests in `tests/grammar/` for new syntax support; name fixtures `<feature>.test.fish` and keep assertions minimal but illustrative. Snapshot files in `tests/grammar-snapshots/` should only be updated alongside a reviewer note explaining the diff. Integration tests started by `yarn test` assume Fish binaries are available; set the `fish.path.*` settings in `.vscode/settings.json` when pointing to custom locations. Aim to add a regression test whenever fixing a parsing or formatting bug.

- `yarn test:grammar`: Run the hand-written grammar tests in `tests/grammar/*.test.fish`.


## Commit & Pull Request Guidelines
Commit summaries in this repo are short, present-tense imperatives (`add grammar for not`, `prettier: upgrade deps`). Keep them under ~72 characters and describe the primary change; include scoped prefixes like `tests:` or `prettier:` when clarifying intent. Pull requests should link related issues, outline test coverage, and include screenshots or recordings when UI-facing assets change. Mention any updates to shipped grammars or snippets so reviewers can double-check marketplace impact.
