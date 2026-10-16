# Agent Note: Reproducible npm plugin distribution

Status: implemented

## Problem

The working directory has built exports, but generated output is ignored by Git. A fresh clone must produce the same installable DSH bundle instead of publishing a package with missing exports. Host React currently arrives through SDK peers; that incidental dependency is not a stable runtime contract. The original Host build also includes development tools and its notices omit transitive bundled packages.

## Decision

Keep `@local/dsh-intelligent-ui` version 0.1.0 to preserve the installed plugin identity. Add repository metadata, explicit runtime React, and a `prepack` check/build hook. Derive the Client module-loader identity from the manifest, use production defines for all bundles, and collect licenses from dependencies that contribute bytes in esbuild's metafile. The Host output falls from roughly 2.3 MB to 444 KB, while the browser continues borrowing DSH's React instance.

`verify:pack` installs the generated tarball in a new temporary directory outside the source tree with production dependencies only and scripts disabled. It loads the Host, executes its guide/render tools, validates presentation metadata, evaluates the Client module wrapper with a loader stub, and checks exact native slots and exported resources. It leaves the consumer directory for inspection rather than deleting a computed path. GitHub Actions builds, runs the same tests and smoke test, and uploads the npm tarball; it has read-only repository permissions and does not publish to npm.

## Alternatives considered

- Commit generated bundles: simple for Git URL installs, but source and checked-in output can drift and the repository becomes larger. Build artifacts belong in CI and npm tarballs.
- Add an install-time `prepare` hook: supports direct Git dependencies but executes build tooling in consumers. The documented path is a prebuilt tarball or explicit source build.
- Rename to `dsh-open-intelligent-ui`: a public npm name avoids needing the `@local` scope, but renaming the live bundle is unnecessary for building a distributable package. Public publication remains a separate user-authorized task requiring an available name and npm credentials.

## Consequences

Source consumers need development dependencies to build; tarball consumers do not need esbuild. A public npm publication under the existing scope requires ownership of that scope. Package smoke tests prove distribution contracts, not real browser clicks; the original user-confirmed GUI rendering remains separate evidence. All 14 tests pass under the production build and a clean production tarball installation succeeds. No credentials, dependencies, caches or generated output are committed.
