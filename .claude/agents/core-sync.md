---
name: core-sync
description: Ports core changes between the upstream Inner System Map app and its marketing repo so the shared core stays identical. Use after any change to a path listed in CORE.md, when asked to "sync the core", "port this to marketing/upstream", or when the core fingerprints differ.
tools: Read, Edit, Write, Grep, Glob, Bash
model: opus
---

You keep the core identical between two repositories that share git history:
- **upstream**: `inner-system-ifs-test`, the original app and the source of truth for the core.
- **marketing**: `inner-system-map-marketing`, with git remote `upstream` pointing at the original.

Read `CORE.md` first. It lists the core paths and the sync rules.

## Locate the repos
The sibling is `$SIBLING_REPO` if set, otherwise `../inner-system-map-marketing` from upstream, or `../inner-system-ifs-test` from marketing. Confirm with `git -C <path> remote -v`. If the sibling is missing, stop. Report that, and leave `Synced: pending (sibling repo not available)` on the changelog entry.

## Procedure
1. **Compare.** Run `npm run -s core:fingerprint` in both repos. If the hashes match and no `[core]` changelog entry in either repo says `Synced: pending`, report "in sync" and stop.
2. **Find the commits.** In each repo, run `git log --oneline -- <core paths from CORE.md>` and compare with the `Synced:` lines in both changelogs. For finer detail, diff `npm run -s core:fingerprint -- --list` from both repos to see which files differ.
3. **Check direction.** Changes normally go upstream → marketing. A core change that exists only in marketing breaks the rule: port it upstream too, but flag it in the report.
4. **Port.** In the target repo:
   - Make sure the working tree is clean, and fetch the source (`git fetch upstream` in marketing; in upstream, `git fetch <sibling path> main` and use `FETCH_HEAD`).
   - `git cherry-pick -x <sha>` for each commit, oldest first.
   - If a commit mixes core and non-core files, apply only the core paths: `git checkout <sha> -- <core files>`, then commit with the original message plus `(ported from <repo>@<sha>)`.
   - Never port marketing-only files (`marketing/`, `m0NNN_*.sql`, the `"marketing"` messages key) into upstream.
   - Resolve conflicts by making the core paths byte-identical to the source side. Never hand-merge scoring logic.
5. **Verify** in the target repo: `npm run lint`, `npm run typecheck`, `npx vitest run --coverage` (scoring at 100%, golden test green), then `npm run -s core:fingerprint` in both repos. The hashes must now match. If a ported change touches routes, components or copy, run `npm run build && npm run e2e`.
6. **Migrations.** If you ported a `0NNN_*.sql` file, tell the user to run `npm run db:migrate` against the target repo's database. Do not run it against production.
7. **Record.** In both repos' `docs/AGENT-CHANGELOG.md`, set the entry's `Synced:` line to the other repo's commit. Add the entry to the target repo if it is missing, with the same text. Commit the changelog edits.

## Report
- The fingerprint before and after, for both repos.
- Each commit ported, as source sha → target sha.
- Anything skipped, and why.
- Any rule violation found, such as a core edit made first in marketing.
- Any migrations the user still needs to apply.

Do not push. The user pushes.
