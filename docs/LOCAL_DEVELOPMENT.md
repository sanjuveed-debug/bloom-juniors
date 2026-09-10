# Development on the new laptop

Verified on 2026-09-08 in `C:\Sanju_Projects\EduApp` with Node 24.19.0,
npm 11.17.0, Git, GitHub CLI and installed Google Chrome.

September 10 update: Cloudflare OAuth access is restored using
`.migration/cloudflare-config` as `XDG_CONFIG_HOME`, with logs under
`.migration/wrangler-logs`. Existing production public build settings were
retrieved into ignored `.migration/production-build-env.json` and used only in
the build process environment. Local `.env.local` and real local account/backend
verification remain outstanding. Parent recap and shadow discovery are deployed;
see CURRENT_STATE_AND_NEXT.md for the latest release and verification.

## Daily commands

Open this folder in VS Code or Codex. In PowerShell:

```powershell
cd C:\Sanju_Projects\EduApp
npm.cmd run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173 or the no-account sample at
http://127.0.0.1:5173/play/float. Use `.cmd` commands because this laptop's
PowerShell execution policy currently blocks npm's `.ps1` wrapper.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run build
git status
```

The restore session left Vite running in a hidden background process. Its PID
and logs are in `.migration/dev-server.pid`, `.migration/dev-server.log` and
`.migration/dev-server-error.log`. Check that the recorded PID still belongs
to this project's Vite process before stopping it. Do not start a second server
on port 5173 while that process is running.

## Source and backup

Source: https://github.com/sanjuveed-debug/bloom-juniors. Restored `main` at
`f5899a4`, including the September 8 narrated Bumi floating/sinking feature.
Local setup fixes are uncommitted on `setup/new-laptop-20260908`.
GitHub authentication and a repository-local Git identity/credential helper
are configured. No push or production deployment was performed.

The older private release is retained at `.migration/EduApp-20260908.zip` and
fully extracted at `.migration/snapshot/`. Its archive checksum and all 1,545
project file checksums passed; two additional archive metadata files were also
extracted. Evidence is `.migration/NEW_LAPTOP_VERIFICATION.json`.

863 files absent from the current checkout were copied into their original
locations without overwriting existing files. The list is
`.migration/RESTORED_ADDITIONAL_FILES.json`. These include original videos,
artwork, marketing materials and local review fixtures. Repository-local
`.git/info/exclude` entries keep them out of accidental public commits. Review
individual files before deliberately adding any to this public repository.
The entire older snapshot remains available for comparison; it does not
replace the newer canonical source or handoff.

## Configuration still needed

No real environment files, keys or account sessions were included in the backup.
Do not paste credentials into chat or commit them. Securely copy the old
`.env.local` to this folder, or retrieve the required values through your
provider accounts and save them locally. `.env.example` is an incomplete
historical checklist, not working configuration.

Frontend account access needs `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` (the public client key, never a service-role key).
Set `VITE_APP_ORIGIN` appropriately for local development. Restart Vite after
changing environment files. Without these values the frontend and local
fixtures run, but real account sign-in/cloud progress are not verified.

The `/api` routes require a separately configured local backend. Vite returns
503 for them unless `BLOOM_DEV_API_TARGET` points to a loopback backend such as
`http://127.0.0.1:8788`. Backend database, Azure speech, email, billing and push
secrets must stay server-side. Cloudflare/Azure access, database and storage
backups, authenticated progress saving, browser-only progress, private signing
keys and physical-device audio/touch remain outside the verified local restore.

## Verification and known issues

All 384 unit tests pass. Production build passes with the existing main-bundle
size and stale Browserslist-data warnings. npm audit reports 22 vulnerabilities:
2 low, 5 moderate and 15 high. Details are `.migration/npm-audit.json`.
Plan dependency updates and regression testing separately; no forced upgrades
were applied during restoration.

The browser regression scripts use synthetic local data and block external
requests or substitute speech calls; they do not establish real cloud saving
or audible Azure speech. Installed Chrome was used because browser binary
downloads repeatedly disconnected. On this laptop, run a check with:

```powershell
node --import ./.migration/browser-use-chrome.mjs scripts/verify-float-discovery.mjs
```

Other verified checks: `verify-connected-adventures`, `verify-parent-snapshot`,
`verify-adventure-finish`, `verify-guest-drag`, `verify-activity-voice` and
`verify-pin-keyboard`. PIN recovery passed at mobile and desktop sizes using
`node scripts/live-review-server.mjs` on port 5174 and the port-adjusted copy
`.migration/verify-pin-recovery.mjs`. This isolated server supplies the fixture's
test-only configured-account transform; plain Vite lacks that transform.
The restored archive supplies additional review fixtures needed by some scripts.
For the default bundled browser, retry `npx.cmd playwright install chromium`
when downloads are reliable.

Next: restore private local configuration securely, then verify a real account's
sign-in and saved progress before treating the cloud development environment as
ready. Keep the old laptop's omitted data until its transfer is separately checked.
