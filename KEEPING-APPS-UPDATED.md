# Keeping the apps on the newest Frame Kit

Every app that uses Frame Kit moves to a new release on its own. You publish
Frame Kit as usual; nothing else is done by hand.

## What happens after a release

1. You bump the version, commit and push Frame Kit, then `npm publish`.
2. **Tell the apps** (`.github/workflows/notify-apps.yml`) sees the version
   bump land on `main`, waits until that version is on npm, and sends each app
   a `framekit-released` message.
3. Each app's **Frame Kit updates** workflow (`.github/workflows/framekit.yml`
   in the app) installs the new version and runs the app's checks. The steps
   live once, here, in `.github/workflows/update-app.yml`.
4. What happens next depends on the app's mode:

| Mode | Apps | Checks pass | Checks fail |
|---|---|---|---|
| `commit` | Web apps | Committed to `main`; the host redeploys | A pull request with the update (or an issue), and `main` is untouched |
| `check` | Desktop apps worked on locally | Nothing pushed | An issue |

5. On your Mac, `npm run dev` (and `npm run electron:dev`) runs
   `scripts/framekit-sync.mjs` first:
   - **`check`-mode apps:** installs the new version, keeping it only if the app
     still typechecks. Otherwise the old version and `package.json` go back
     exactly as they were, and that version isn't tried again.
   - **`commit`-mode apps (`--notify`):** say a new version is out, and to pull from GitHub,
     where the workflow has already committed it.

If the release message never arrives, each app checks for itself once a day.
A version that failed in an app is left until you run the app's workflow by
hand (Actions → Frame Kit updates → Run workflow).

Desktop apps are in `check` mode because work there sits uncommitted for a
long time: a commit landing on `main` would block `git pull` over
`package.json`. Their local copy updates itself instead, and that copy is
what `npm run release` builds. Change `mode: check` to `mode: commit` in an
app's `framekit.yml` to switch.

## One-time setup

In this repo on GitHub, under Settings → Secrets and variables → Actions:

1. **Secret `FRAMEKIT_APPS_TOKEN`:** github.com → Settings → Developer
   settings → Personal access tokens → Fine-grained tokens → Generate new
   token. Give it access to only the app repos, with the permission
   **Contents: Read and write**, and an expiry of a year (set a reminder).
2. **Variable `FRAMEKIT_APPS`:** the app repos, space-separated, as
   `owner/repo owner/repo`.
   It's a variable rather than a file so the private repo names stay out of
   this public repo.

Optional, in each `commit`-mode app (Settings → Actions → General): tick
**Allow GitHub Actions to create and approve pull requests**. Without it, a
failed update opens an issue instead of a pull request; the update is still
on a `framekit-X.Y.Z` branch.

## Adding an app

1. Copy `templates/app/framekit.yml` to the app's
   `.github/workflows/framekit.yml`. Set `mode`, and set `checks` to the
   commands that prove the app works (typecheck, build, tests).
2. Copy `templates/app/framekit-sync.mjs` to the app's `scripts/`, and add
   `"predev": "node scripts/framekit-sync.mjs"` to its `package.json`. For a
   `commit`-mode app, add `--notify` to the command.
3. Add the repo to the `FRAMEKIT_APPS` variable, and give the token access to
   it.

`FRAMEKIT_SYNC=off npm run dev` skips the local check once.
