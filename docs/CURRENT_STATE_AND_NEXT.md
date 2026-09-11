# Bloom Juniors: Current State and Next

Last updated: 2026-09-11

This is the canonical handoff for the next Bloom Juniors work session. Read this
before planning or changing the product.

## School UI/UX redesign - 2026-09-11

Founder disliked the previous school page. Rebuilt the public /schools layout
with a consistent cream/green palette and Nunito typography matching the family
homepage, lighter hero with Bumi and a real shadow activity link, simplified
navigation, and visible mobile sign-in. Asked optional direction preference;
none received before proceeding with warm/professional homepage consistency.

Replaced the long activity cards/always-open notes and invitation with a compact
selector and native details disclosures for teaching notes and family sharing.
Kept sample links, copy/fallback behavior, explicit browser-only sample scope,
free classroom terms and whole-school enquiry. Simplified pricing and FAQs.
Added linked enquiry labels with useId and restored the native role-select arrow;
no submission/backend behavior changed. This is not a teacher dashboard redesign.

Production build passes. Updated browser check passes locally and on production:
notes expand/collapse, three plans and their links, clipboard success/failure,
mobile sign-in, linked name field, widths 320/390/768/1280, no runtime errors.
Desktop/mobile screenshots reviewed. No enquiry submitted or live DB verification.
Published https://cf31c218.bloom-juniors.pages.dev to production main.
Custom domain main-BGCIPBUW.js and guest/service-worker assets match 4/4;
fixtures excluded. Rollback: https://4ad6cdd3.bloom-juniors.pages.dev.

## School discovery kit and email draft - 2026-09-11

Founder requested an email instead of calls and refreshed school content.
Updated /schools with a discovery-led hero and real activity preview, replacing
the fictional dashboard and unattributed pilot quote. Added SchoolDiscoveryKit:
three selectable plans (shadows, float/sink, fair sharing), prediction and
explanation guidance, supervised offline extensions, matching public sample
links and copyable parent invitations with clipboard-denied fallback.
Suggested audience is ages 4-6 with an adult. Explicitly states open samples
save in the browser and do not assign lessons or report to a classroom dashboard.
This refresh is the public school page/resources, not a teacher dashboard rebuild.
Existing classroom setup, enquiry form and free/whole-school terms retained.
Removed overbroad external-link/privacy wording and unverified response-time
promise from the school page. Existing enquiry form remains unchanged.

Prepared marketing/nursery-follow-up.md: concise email with real kit link,
one reply request, optional follow-up, and next step after interest. Nothing sent;
no responses, pilots, sales or learning outcomes claimed. No backend changes.

Production build and local/live verify-school-kit.mjs pass: three activity plans,
matching links/invitations, clipboard success/failure, mobile/desktop overflow,
and no runtime errors. Mobile screenshot reviewed. No enquiry was submitted.
Deployed https://4ad6cdd3.bloom-juniors.pages.dev to production main.
bloomjuniors.com main-CV32r1sM.js: main/guest/service-worker assets match 4/4,
test fixtures excluded. Rollback: https://e3739afa.bloom-juniors.pages.dev.
Authenticated cross-device and live school enquiry persistence remain unverified.

## Sample-to-account conversion - 2026-09-11

Founder asked to implement work toward selling Bloom. Asked whether to focus on
parents, nurseries, or both; no answer yet. Working assumption for the prepared
test is parents of 4–6-year-olds, consistent with the prior growth focus.

Added GuestParentNext after all three public sample completions. It explains
age-specific activities, child profiles and the parent area, with a direct account
CTA. Explicitly says sample progress stays browser-local and is not imported.
Removed the duplicate older picnic account pitch. Corrected the homepage picnic
card to describe sharing snacks, matching the actual guest activity.

useSampleFunnel emits existing GA4 sample_view/start/complete and the parent CTA
emits sample_account_click. Homepage cards emit sample_cta_click. Direct sample
entry captures campaign attribution. View/start/complete deduplicate per sample
per browser session; an already-completed sample does not emit a new completion.
No child names, emails, predictions or answers added to event payloads. Existing
sign_up still means actual account creation; clicks are not registrations/sales.

Prepared marketing/parent-sales-test.md: one invitation, one tagged shadow sample,
anonymous manual observation sheet and a seven-day funnel review. Not sent;
no ad spend, payment collection, pricing change or revenue/traction claim.
Paid positioning and outreach recipients still need founder direction; preserve
existing free-access promises. Real authenticated cross-device check is still
unverified as described below. No new database or duplicate analytics dashboard.

395/395 unit tests and production build pass. verify-sample-conversion passes
the interactive shadow funnel, campaign attribution, deduplication on reload,
all three completed-sample CTAs and registration entry without submission.
Mobile screenshot reviewed. Analytics network blocked during local testing:
event emission is verified, GA4 receipt and conversion uplift are not.
Deployed https://e3739afa.bloom-juniors.pages.dev to bloom-juniors/main.
Live main-DbkaHVg2.js, main/guest/service-worker assets match 4/4; fixtures excluded.
QA-tagged live shadow completion, reload, account CTA and registration entry pass
without runtime errors. No account was created. Rollback:
https://090387a5.bloom-juniors.pages.dev.

## Continue your discovery - 2026-09-11

User approved checking sign-in, saved progress and the return journey and asked
whether more is being added. Found a concrete return gap: Little Stars home
only chose from the picnic path, ignoring unfinished water/shadow experiments.
SimpleChildHome now selects the most recently updated unfinished activity among
picnic, basket, sharing, water and shadow. The main card says Continue your
discovery and shows the saved experiment number for science. It resumes existing
state without new storage or schema, excludes completed activities, and supports
intentional replay. Tiny and Junior already have resume actions for their main
missions. Guest samples remain browser-local and are not imported into accounts.

395/395 unit tests pass. New verify-resume-discovery browser check passes exact
water/shadow round resume, latest activity, reload, completion removal, fallback
to another unfinished activity, 200% text layout and single completion record.
Connected-adventures regression passes. verify-progress-sync-browser now enables
its test-only cloud branch explicitly rather than depending on a local .env;
passes actual hook outbox persistence, profile switching, offline reload,
reconnection and a fresh browser context against an isolated synthetic backend.
Production build passes with existing bundle-size/Browserslist warnings.
Deployed https://090387a5.bloom-juniors.pages.dev to bloom-juniors/main.
Live bloomjuniors.com main-DwyA82C_.js and main/guest/service-worker assets match
4/4; local fixtures excluded. Public shadow completes all three experiments,
reloads with one local record and has no runtime errors (voice muted).
Rollback: https://ecdd0324.bloom-juniors.pages.dev. No auth/backend changes.

Real account sign-in/cross-device cloud save is NOT verified this session.
Supabase connector twice returned an authorization-accepted/retry message but
did not expose projects. The user said they logged in, but CUA twice returned
zero connected browsers/tabs. This laptop has no .env.local or saved test-account
credentials. Do not confuse user login with agent access, claim synthetic checks
are live Supabase verification, or copy a real child's progress into test data.
Next verification needs a connected signed-in browser or dedicated test account.
Family-pilot observation remains outstanding; no outreach messages were sent.

## Site-wide design follow-through deployed - 2026-09-11

User reported the old appearance on the public homepage and then clarified
"all the places". The earlier release had changed Explore and lesson controls,
not the public homepage; this was a scope gap, not a stale custom-domain cache.

Production now uses PublicLanding: "Little discoveries. Growing minds.", Bumi
on a calm illustrated surface, three direct real sample links (/play,
/play/float, /play/shadow), age-group explanations and parent/account entry.
The previous WorldLanding remains available to its existing preview routes.
No new marketing claims, account requirements or lesson completion rules.

Shared bloom-design.css refreshes all three family home surfaces, library
cards/navigation, account setup/sign-in, age/profile selectors and ParentZone.
Parent text is larger and clearer, tabs wrap, and tab transitions fade without
horizontal overflow. Tiny/Junior ScreenEnter now fades. Little Stars home uses
a solid layout with Bumi and speech in normal flow, including enlarged text.
Focused controls are visible; shared navigation uses 48px targets. Age-specific
colours, game geometry and gameplay remain. This is a shared design-foundation
pass across the app, not a bespoke redesign or accessibility audit of every
legacy activity, founder/admin page or static blog article.

Verification: 391/391 unit tests; production build; verify-site-design (public
mobile/desktop, 320px at 200% root text, signup/sign-in entry, all three homes,
libraries and parent PIN navigation); design-polish; tiny-picnic;
market-mission; connected-adventures. Screenshots visually reviewed. Existing
bundle-size and Browserslist warnings remain. Tests use synthetic local
profiles; no real family-account authentication/cloud-save or physical-device
audio testing performed.

Published https://ecdd0324.bloom-juniors.pages.dev to bloom-juniors/main.
Live bloomjuniors.com main-xhe2ENG1.js; main/guest/service-worker hashes match
4/4 and local review fixtures are excluded. Live Chrome homepage, sign-in and
registration entry plus mobile/desktop/enlarged layout checks pass. Live guest
shadow also passes all three experiments, completion, reload and one locally
saved session with voice muted and no runtime errors. Rollback:
https://cbecaad0.bloom-juniors.pages.dev. No backend configuration changes.
Source remains on feature/design-principles-20260911. GitHub push has not been
retried: an earlier automatic approval review rejected source export, and the
subsequent user authorization was specifically for production deployment.

## Design principles pass deployed - 2026-09-11

User requested implementation after reviewing the Emil Kowalski and Dickwu
apple-design guides against Apple/WCAG guidance. Applied the selected principles
to Bloom's existing visual identity; no third-party skill installation or native
Apple compliance claim. Future rules are in docs/DESIGN_PRINCIPLES.md.

Little Stars Explore now has ten subject-specific vector illustrations instead
of reused scenery, aligned card artwork and larger/darker descriptions. Shared
LessonHeader gives plate picnic, basket/sharing, water and shadow the same Back,
Hear again and voice control order with 48px targets and keyboard focus. Screen
transitions use short fades instead of full-screen spring zoom. Drag previews
retain the original art size and grab offset; pointer hit testing, cancel, tap
and keyboard alternatives remain. Added pressed feedback, reduced-transparency/
increased-contrast treatments, and mobile water layout that grows with text.

391/391 unit tests pass. verify-design-polish passed 320px, 390px and desktop,
200% root text sizing in tested views, card-description contrast >=4.5:1,
keyboard focus, header sizes and off-centre drag/cancel. Browser regressions
passed: connected-adventures, activity-voice, play-drag, guest-drag,
float-discovery and shadow-discovery. Mobile/desktop and enlarged-text screenshots
visually reviewed. Production build passes with existing bundle/Browserslist
warnings. These are synthetic browser checks, not a whole-app accessibility audit
or physical-device sound/touch/cloud-save verification.

Deployed https://cbecaad0.bloom-juniors.pages.dev to bloom-juniors/main.
Live bloomjuniors.com main-DY674YTn.js and main/guest/service-worker hashes match
4/4; local review HTML excluded. Live guest shadow flow completed all three
experiments and reload with one saved record, no runtime errors (voice muted).
Rollback: https://d33f5626.bloom-juniors.pages.dev. Cloudflare OAuth refreshed via
Wrangler automatically. Source branch: feature/design-principles-20260911.
Private configuration remains ignored. Local preview running at 127.0.0.1:5173.

## Shadow discovery shipped - 2026-09-10

Founder authorized continuing to build and publish while asleep. Built one
complete next lesson: How can we change a shadow? Little Stars > Explore >
Change a shadow, plus public /play/shadow and the optional continuation from
the floating/sinking recap. Three narrated prediction/experiment/observation
rounds: move a torch closer, farther, then switch it off. Touch buttons and a
keyboard-accessible range input control a geometric side-view model; the card
and wall remain fixed. Includes Bumi, shared voice controls, optional free
exploration after completion, an offscreen family prompt, replay and finish.
Scientific model and primary educational references: docs/SHADOW_DISCOVERY.md.

Profile progress is normalized and merged through existing storage; one first
completion is preserved across replay and cloud merge. Guest data stays in its
own local key. Parent Learning at a glance includes original shadow predictions
and model outcomes without scores or mastery claims. Module is lazy loaded.

391/391 unit tests pass. Shadow browser test passed prediction gates, keyboard
range movement, touch button alternatives, geometry change, narration calls,
three rounds, guest reload/replay, profile Explore/finish/PIN parent recap/reload,
mobile fit and reduced motion. Existing float and parent snapshot checks pass;
float regression now verifies its continuation to shadow and return. Mobile and
desktop screenshots visually reviewed. Tests use synthetic records; no physical
device audio or real account cloud-save verification. Production build passes
with existing bundle/Browserslist warnings.

Published https://e7741a2d.bloom-juniors.pages.dev, then polished the water-to-shadow
button label in https://d33f5626.bloom-juniors.pages.dev (bloom-juniors/main).
Final main asset main-EP1W4Yv8.js. Final custom-domain main/guest/service-worker
hashes matched 4/4; the final live guest walkthrough passed again. Local review
HTML fixtures excluded. Rollback https://6519e4e5.bloom-juniors.pages.dev.
Live Chrome guest walkthrough completed all three experiments and verified
reload plus one saved local session without runtime errors. Voice was muted in
the live check. Source publication branch: feature/shadow-discovery-20260910;
includes the earlier parent recap and reviewed Node 24/local setup fixes so the
published source captures this laptop's tested state. No private migration files.
This is a completed bounded release, not an ongoing scheduled overnight job.

## Parent science overview deployed - 2026-09-10

User explicitly requested production publication. Cloudflare OAuth restored on
the new laptop after correcting the terminal working directory. Retrieved the
existing Pages production public frontend configuration and rebuilt successfully;
no backend secrets or production settings changed. Deployment to the existing
bloom-juniors/main project completed at https://6519e4e5.bloom-juniors.pages.dev.
https://bloomjuniors.com and the immutable release each matched 4/4 main/guest/
service-worker asset hashes; local review HTML fixtures excluded. Main bundle
main-DNRA8jIG.js. Rollback: https://53a18dce.bloom-juniors.pages.dev.

Live Chrome mobile home rendered without runtime errors; served bundle contains
the expected production Supabase public configuration and new parent science
recap. No real account sign-in or cloud-save test performed. Earlier feature
verification remains 387/387 unit tests and successful mobile/desktop parent
flow checks. Existing bundle-size/Browserslist warnings remain. Production is
updated; source changes are still uncommitted locally, including earlier laptop
setup fixes. OAuth configuration and recovered build settings remain only in
ignored .migration paths. No credentials belong in this handoff or Git.

To review: sign in at bloomjuniors.com, select Little Stars, try Explore > Will
it float?, then open Parents > Learning at a glance with the actual parent PIN.
The review-fixture PIN is not a production account password. The proposed next
child activity is the shadow discovery; it is not implemented or running as a
background task.

## Discover with Bumi parent overview built locally - 2026-09-10

Production publication was subsequently explicitly requested. Preflight found no
Wrangler authentication and no local frontend environment configuration. Started
interactive Cloudflare OAuth login with configuration/logs under ignored
.migration paths; user sign-in is required. No deployment attempted: the current
local build lacks production Supabase configuration and must not replace the live
authenticated app. After login, retrieve existing Pages production settings,
rebuild with the correct public frontend configuration, deploy to the existing
bloom-juniors project, and verify live asset hashes and fixture exclusion.

Founder requested implementation of the proposed next feature. Little Stars'
PIN-gated Learning at a glance now includes Will it float? alongside picnic
adventures, selecting the most recently updated supported activity. Shows partial
experiment count, recorded predictions and scripted observed outcomes without
scoring guesses, and a grown-up clay-boat conversation/experiment prompt.
Unfinished discovery gives its Explore location for continuing. First completed
session evidence survives replay/reload, including when only the session remains.
Other age groups retain their own summaries. Uses existing progress/session data;
no storage schema or cloud configuration changes.

Verification: 387/387 unit tests pass; production build passes with existing
bundle-size/Browserslist warnings. Extended verify-parent-snapshot.mjs passed
PIN access, existing picnic regression, partial science progress, completed recap
after replay/reload, four prediction records, mobile fit and return navigation.
Mobile/desktop screenshots visually inspected at tmp/parent-science-mobile.png
and tmp/parent-science-desktop.png. Used installed Chrome through the existing
migration helper because agent-browser CLI is unavailable. Browser fixtures use
synthetic local records and block external requests; real cloud saving and
physical-device checks remain outstanding. Local preview running on port 5173.
No commit, push or production deployment this turn. Earlier laptop setup edits
remain intact. Next: review this feature locally, then publish when requested;
next child-content candidate remains the proposed shadow discovery, not built.

## New laptop local development restored - 2026-09-08

Restored C:\Sanju_Projects\EduApp from current bloom-juniors main f5899a4,
which is newer than the private morning migration archive and includes narrated
floating/sinking and the activity voice guidance. Git history and GitHub access
are available. Local setup branch: setup/new-laptop-20260908; fixes are uncommitted.
No push, deployment or production data changes were performed.

Downloaded the private EduApp-20260908.zip release and verified its expected
SHA256 and every one of the 1,545 manifest file hashes. The archive also contains
two restore metadata files. Full immutable source is preserved in .migration/
snapshot; ZIP, remote handoff, manifest and verification evidence remain under
.migration/. Copied 863 missing assets/review/source-support files to their
original locations without overwriting current source. Git-local exclusions
protect the private migration files from accidental public commits. Do not
replace the newer canonical handoff with the archive's earlier state.

Node 24.19.0/npm 11.17.0 installed; npm ci completed. Fixed Node 24 test discovery
and the webhook test's read-only global crypto assignment. Fixed an actual blank
page without environment files by guarding the Node process.env fallback in the
browser. Excluded backup directories from Vite watching after Windows EBUSY
interrupted the server during extraction. All 384 unit tests pass; production
build passes with existing bundle-size/Browserslist warnings. npm audit records
22 vulnerabilities (2 low, 5 moderate, 15 high); no forced dependency updates.

Installed Google Chrome verified the home page without runtime errors and passed
float-discovery, connected-adventures, parent-snapshot, adventure-finish,
guest-drag, activity-voice and PIN keyboard checks. PIN recovery passed on mobile
and desktop using the recovered isolated review server on port 5174, required
for its test-only account configuration transform. All these are synthetic local
checks, with external calls blocked or speech replaced. Browser package downloads
repeatedly disconnected; use .migration/browser-use-chrome.mjs with installed
Chrome for now. Physical-device sound/touch and real cloud saving remain untested.

Local frontend left running at http://127.0.0.1:5173; startup/log details and daily
commands are in docs/LOCAL_DEVELOPMENT.md. Environment files, private keys, account
sessions, database/storage backups and browser-only progress were omitted from
the archive and remain outstanding. Asked whether the old .env.local is available;
no configuration transfer confirmed yet. Next concrete step: securely restore
local frontend/backend configuration and verify real account sign-in and persisted
cloud progress. Then resume product work from the Discover with Bumi state below.

## Discover with Bumi implemented - 2026-09-08

User authorized building the narrated floating/sinking experience and pushing
changes to Git. Added FloatDiscovery, four original illustrated experiments
(cork, pebble, clay ball, same clay shaped as a hollow boat), spoken prediction /
drop / observation / explanation, touch drag with tap/keyboard alternative,
reduced-motion support, recap and adult-supervised offscreen prompt. Model is
scripted, not a physics simulator. Background source in docs/FLOAT_DISCOVERY.md.
Entry Little Stars > Explore > Will it float? Guest /play/float; picnic guest
recap also links there. Profile draft normalization/merge uses existing storage;
one first-visit session is recorded, repeated predictions are not scored and
replay does not duplicate the first record. Guest data stays separate/local.

Verification so far: 384/384 unit tests; new browser test verifies real touch
cancel/drop, prediction gate, narration calls, four experiments, reload/resume,
recap/replay, reduced motion, mobile width and authenticated-app fixture entry.
External APIs blocked in browser test, no physical child-device test. Build passed;
isolated staged-source checkout build also passed after adding the required
world-preview.css landing dependency. Shared voice regression passed.
Production updated to https://53a18dce.bloom-juniors.pages.dev; live domain
https://bloomjuniors.com matches main-Dej7Phjo.js and existing guest assets (4/4
release hashes, test fixtures excluded). Rollback d3467af6.bloom-juniors.pages.dev.
Git publication branch: feature/discover-with-bumi-20260908. This commit includes
previously deployed but uncommitted runtime dependencies, not only the new lesson.
Git HTTPS cannot reach github.com:443; authenticated GitHub API is reachable.
Existing app repo is public; publish only reviewed code/runtime assets/tests/docs,
including earlier deployed dependencies needed for a runnable checkout. No local
credentials, private migration archive, or marketing/audit screenshots included.

## Proposed next build and growth focus - 2026-09-08

Founder asks what to build next, how to scale/fundraise, and reports repeated
Instagram videos have not worked. Recommendation (not a new implemented feature):
focus acquisition on ages 4-6, spoken interactive everyday learning. First audit
existing founder metrics and guest /play instrumentation end-to-end; do not build
a duplicate analytics dashboard. Distinguish views, visits, starts, completions,
eligible repeat households, and actual paid demand; exclude QA/founder accounts.
July 31 Instagram baseline in this handoff is historical, not current analytics.
Test three concrete real-interface demos with one no-account sample destination,
and recruit through relevant community organisers/tutors with a tiny observation
request rather than a school-wide pilot. No messages sent or spending authorized
by this recommendation. A ten-family goal is an experiment target, not traction.
Next child-content candidate after first-use evidence: one short Bumi narrated
prediction/interactive science story (e.g. floating and sinking), developed within
the existing learning format; avoid a new library or all-age expansion now.
Scale in evidence-led steps: returning families, paid demand, measured delivery
costs, then infrastructure load/permissions audit and channel expansion. Prepare
funding evidence and costs now; no invented traction, ask, valuation or funding
promise. Hub71 official programme pages checked; eligibility/application terms
must be checked before submission. No application made.

## Spoken activity guidance deployed - 2026-09-08

User reports daughter cannot read picnic/apple instructions. Added shared
useActivityNarration and ActivityVoiceControls to PicnicAdventure and
CollectionAdventure (basket/snacks, including guest /play). Voice defaults on,
speaks round instructions and check/help/completion cues, avoids narration on
every drag/placement, offers Hear again and persistent automatic-voice mute.
Direct visits wait for first pointer/key gesture to satisfy browser audio rules;
previously activated visits speak after entry. Unmount stops speech. Production
uses existing Azure speech controller/cache. No new speech provider or child data.

Build passed; 381/381 tests passed. New verify-activity-voice.mjs passed browser
checks for gesture start, no placement interruption, spoken correction, mute,
manual replay, persisted preference, plate picnic guidance and mobile width.
Existing guest touch-drag end-to-end passed. Real Azure endpoint returned 200,
23040-byte audio, decoded non-silent 2.88 seconds and completed browser playback.
No physical-device/human acoustic test performed.

Production https://bloomjuniors.com now matches immutable release
https://d3467af6.bloom-juniors.pages.dev. Main main-ClmVIWF_.js; guest
PlayPicnic-CV3B99dt.js; live release verification 4/4 hashes matched, fixtures
excluded. Rollback afba8b50.bloom-juniors.pages.dev. Existing bundle-size warning.
IMPORTANT: immutable laptop migration ZIP eduapp-20260908 predates these voice
changes. Refresh migration backup before returning laptop; do not claim this
new source is already present in that archive. Source workspace remains dirty.

## New-laptop Codex prompt saved - 2026-09-08

Saved docs/NEW_LAPTOP_CODEX_PROMPT.md locally and published the identical file to
private laptop-migration/projects/EduApp/NEW_LAPTOP_CODEX_PROMPT.md. Remote content
verified byte-for-byte and linked from the repository README. Covers authenticated
release download, exact ZIP checksum, manifest checks, no overwrite, newer handoff,
secure missing configuration, restore/build/browser checks, original Git history
and product context. This supplementary prompt is outside the immutable ZIP; no
archive was replaced. Copy its prompt into Codex on the new laptop. No credentials.

## Private EduApp migration archive verified - 2026-09-08

User explicitly requested a laptop-migration GitHub repository for zipped projects.
Created and verified PRIVATE sanjuveed-debug/laptop-migration. EduApp snapshot ZIP
contains1545files,596382973bytes; all src/functions files included, plus eligible
original artwork/video/project documents. Release tag eduapp-20260908. SHA256:
150cd0b9a661ffe8d30569a2057f682a91f707e6dff16e4bfd42980df4da8db6.
Uploaded archive and checksum, downloaded both back through authenticated GitHub,
verified archive hash, exact entry list and all1545individual file hashes.
Remote transfer integrity PASSED. New-laptop install/build/access test not done.

This is NOT the raw whole folder or a complete-laptop backup. Manifest records177
excluded path entries and5additional flagged files. Environment credentials,
browser sessions, signing/private keys, logs/credential-bearing audit screenshots,
nested ZIPs, dependencies/build caches, local tool caches and .git excluded. Two
older audit scripts had literal passwords; three generated tmp bundles were
withheld. Scanner prints paths/reasons only; no credential values copied into docs.
Every src/functions file passed inclusion check. Secure transfer of omitted
configuration, cloud/database backup/access and browser-only data still outstanding.
Other project paths requested asynchronously; none supplied/included yet.

Git HTTPS push timed out twice; authenticated GitHub REST API worked. Backup index,
restore instructions and manifest were committed through the standard Contents API.
Local .laptop-migration/repository/.git has an unpushed initial index commit; do NOT
force-push it. Original bloom-juniors repository/history unchanged by this backup.
Private release archive is separate from GitHub's automatic Source code.zip; cloning
the backup index does not download the ZIP. Use release Assets or gh release download.
Current verification/restore status belongs to backup repository docs; handoff in
the immutable ZIP naturally predates this post-upload status entry. Local archive,
downloaded proof and helpers are in ignored .laptop-migration/. The reusable scan
script is scripts/prepare-laptop-archive.py. Keep old laptop until secure restore
and access checks complete.

## Laptop migration inspection - 2026-09-08 (historical)

Founder will return this laptop; USB unavailable. Inspected EduApp workspace only.
Current local branch handoff/laptop-migration-20260902; HEAD208133d datedSept2;
hundreds of modified/untracked entries since then. Recent Pages releases do not
mean those source changes are committed/pushed. Metadata-only inventory excluding
dependencies/build/deployment caches found about0.91GiB, including ignored original
videos and assets. docs/LAPTOP_MIGRATION_CHECKLIST.md records Git + private assets/
secure secrets + second-laptop restore verification. No push, cloud upload, remote
commit verification, database backup or complete-laptop backup performed in this
inspection. Do not mark migration complete or advise returning the laptop yet.

## Connected adventure completion and direct return - 2026-09-08

Added shared AdventureFinishChoices to plate picnic, basket/sharing, Tiny Shapes
and junior Market completion scenes. Brief reduced-motion-aware arrival, accessible
focus, explicit next destination, Finish for now, and smaller replay action.
Existing Bumi acknowledgements/offscreen prompts remain; plate picnic now also
shows Bumi on completion. No forced countdown or autoplay into another game.
Basket continues to sharing; sharing now opens Sound Pop rather than a button
labelled Next silently returning home. Tiny/Market offer their existing libraries.
Guest sharing continues to its parent recap or finishes to the public landing.
Finish returns home without reset; replay is explicit. Existing navigation stops
speech; speech owner cleanup remains unchanged.

Found and fixed a real return friction: Little Stars' splash routed children with
a first completed mission to a mandatory mood screen on later visits. Splash now
goes to home directly. Existing other mood entry/features are unchanged. A seeded
browser test initially lost unrelated profile settings, then exposed this mood
detour after its fixture was corrected. Final verification uses a complete local
synthetic profile and validates completed-report preservation over finish/reload.

All381 Node tests passed. Browser checks passed: connected-adventures, tiny-picnic,
market-mission, picnic-profile (updated old resume/finish button expectations),
guest-touch and adventure-finish (both choices/report preservation/direct home/
Sound Pop destination). Tiny/market existing Explore paths passed; their new
completion-to-library callbacks use those same routes. Mobile completion choices
inspected at tmp/adventure-finish-mobile.png. Browser progress tests are synthetic
local-only with external/API requests blocked, not a new authenticated cloud-save
or physical-phone test. One non-personal live speech request returned200,
23040bytes,2.88sec, non-silent audio and successful browser playback. No human
acoustic assessment or new voice service. Build exit0; existing bundle warning.

Published https://afba8b50.bloom-juniors.pages.dev (bloom-juniors/main).
Custom domain https://bloomjuniors.com main/guest JS/CSS/SW hashes matched4/4;
review fixtures excluded. main-cSSY2Dg9.js969.23kB/280.21gzip;
PWA61 entries2464.45KiB. Rollback2946d4ab. Local development server stopped.

## Parent learning overview - 2026-09-08

Founder approved the parent experience pass. ParentZone now leads with a
PIN-gated Learning at a glance section for family profiles, before rewards/stats.
It uses existing normalized picnic records for the selected age: tiny shapes,
Little Stars plate/basket/sharing adventures, or junior mini-market. Shows the
most recently updated supported adventure, its learning activity, completion or
partial progress, recorded demonstration/working-hint use, one offscreen prompt
and an age-appropriate suggested activity. Return button takes the parent back
to the existing child's home, rather than launching a game without context.

Completion evidence remains the first completed visit on replay; no mastery or
independent-work claim. Empty state explicitly has no saved adventure progress.
The scope note says this overview covers picnic adventures, not all app learning.
Classroom ParentZone is unchanged. No new schema, AI calls, scoring or persistence.
Older Daily Journey and weekly insights are in expandable More weekly insights
to avoid competing primary recommendations. Existing detailed adventure recaps
remain visible in Weekly Story.

Five parent-learning-snapshot tests passed: age-specific empty state, unfinished
help evidence, completed/replay evidence, cross-age filtering and partial market
stage/hint. verify-parent-snapshot.mjs passed actual PIN-gated empty/partial
overview, recommendation, mobile fit and return to saved child activity. Existing
connected-adventures walkthrough passed completed reports, help, replay and parent
PIN/recaps. Browser fixtures are synthetic local-only, with external/API traffic
blocked; no new live authenticated cloud-save verification or outreach this turn.

Published https://2946d4ab.bloom-juniors.pages.dev (bloom-juniors/main).
Custom domain https://bloomjuniors.com main/guest JS/CSS/SW hashes matched4/4;
review fixtures excluded. Build exit0; main-B5SFKdiv.js968.56kB/279.94gzip;
PWA61 entries2462.62KiB. Existing main bundle and Browserslist warnings remain.
Rollback: https://bb23575c.bloom-juniors.pages.dev. Final compact overview screenshot
inspected at tmp/parent-at-a-glance-mobile.png. Local development server stopped.

## Parent PIN keyboard and pending-request polish - 2026-09-07

Founder authorized a bounded additional improvement before sleeping. GuardianLogin
now has a labelled, masked numeric PIN input with digit filtering, four-digit
limit, Backspace/editing, visible focus and Enter submission. Existing keypad
updates the same input. A synchronous ref guards concurrent login callbacks;
email/password/PIN, keypad and mode-change controls disable during login. Guard
releases in finally so rejection/network failure can be retried. No auth backend,
PIN reset, account data or credential-storage changes.

verify-pin-keyboard.mjs passed typed/mixed keypad input, filtering, Backspace,
masking, Enter, slow rejected callback, repeated Enter blocked, controls disabled
and successful retry. verify-pin-recovery.mjs passed mobile390 and desktop1440
expired-session transition/prefill/focus/PIN preservation/credential retry. Two
login-error tests passed. Tests used synthetic callbacks and blocked external/API
traffic; no real account credentials submitted. Mobile recovery screenshot checked.

Published https://bb23575c.bloom-juniors.pages.dev (bloom-juniors/main); custom
domain https://bloomjuniors.com main/guest JS/CSS/SW hashes matched4/4 and review
fixtures excluded. Build exit0; main-CWrIWs-H.js963.47kB/278.39gzip, PWA61 entries
2457.32KiB. Existing bundle/Browserslist warnings remain. Rollback5de36b3c.
Local development server stopped. This bounded pass is complete; no background
work or new outreach is scheduled by this turn.

## Focused Little Stars home and contextual Bumi - 2026-09-07

Founder confirmed login worked after signing in again. Account access is restored
according to the founder; the earlier synthetic verification limitation remains
historically accurate for that release.

This slice puts Little Stars' suggested activity before the three optional picnic
path choices, compacts its mobile scene and uses Continue adventure for resumed
work. Explore filters, discoveries, parent access and profile switching remain.
Home Bumi idles until greeted and names the suggested activity in the bubble.

Collection and plate adventures give Bumi an explicit screen-space drag target,
so gaze follows the held object even beyond the usual nearby-pointer radius.
Dragging gets release guidance and a pointing reaction. Fruit placement gets a
short nod and factual count/check prompt, returning to idle after2.6seconds;
correctness celebration remains tied to submitted answers. Reduced-motion visits
keep gaze centred. No schema, scoring, authentication or voice changes.

Verification: verify-home-companion.mjs passed mobile primary-action position,
Explore/filter/launch, drag gaze/release message, placement count/nod/reset and a
fresh reduced-motion visit. Mobile screenshot inspected. Connected-adventures and
guest-touch regressions passed; nine companion motion tests passed. Browser tests
use isolated synthetic progress with external/API traffic blocked. No new live
authenticated save or physical-device test. Runtime switching of the OS motion
preference was not confirmed; the fresh reduced-motion visit passed.

Production deployment: https://5de36b3c.bloom-juniors.pages.dev, bloom-juniors/main.
Custom domain https://bloomjuniors.com hash verification passed4/4 for main,
guest JS/CSS and SW; review fixtures excluded. Build exit0; main-BFI-1i-A.js
963.00kB/278.15gzip; PWA61 entries2456.77KiB. Existing bundle/Browserslist warnings
remain. Rollback: https://03c5cdd3.bloom-juniors.pages.dev. Production guest touch
walkthrough passed both rounds, cancellation/outside drops, reload and recap with
isolated local progress and API traffic blocked. Local development server stopped.

## Expired PIN sign-in recovery released - 2026-09-07

Founder reported inability to unlock with PIN; screenshot showed existing
"Your saved sign-in has expired" error. GuardianLogin previously left the user
on the keypad with the email-login toggle below the fold. It now automatically
opens full login for that explicit callback result, prefills the known email,
preserves the entered PIN, clears the password, focuses its field and scrolls
the recovery explanation into view. A visible email/password option also appears
above the keypad in normal quick-unlock mode. Recovery cannot toggle back to the
known-expired quick unlock. No PIN reset, progress deletion, session bypass or
authentication backend change. User still needs their account password (and
valid PIN); their real account sign-in has NOT been confirmed this turn.

verify-pin-recovery.mjs passed isolated synthetic callback tests at390/1440px:
expired response, visible recovery, prefilled email, focused password, retained
four-digit PIN and full credential retry. External/API requests blocked. Mobile
screenshot inspected. Both guardian-login-errors regression tests passed. Vite
and PWA build completed; PowerShell redirected stderr reported exit1 alongside
Browserslist/bundle warnings, but log confirms completed build and generated SW.
Production uploaded successfully: https://03c5cdd3.bloom-juniors.pages.dev.
Custom-domain hash verification passed4/4 for main/guest JS/CSS/SW; review fixtures
excluded. main-BEOAx9hx.js962.09kB/277.86gzip, PWA61 entries2455.02KiB.
Rollback: https://5bebdd3a.bloom-juniors.pages.dev. Local server stopped.

## Touch picnic and public guest sample released - 2026-09-07

Founder approved implementation and recruitment with full authority. The proposal
below is now implemented for the picnic activities; it is retained as history.
Live sample: https://bloomjuniors.com/play. Production release:
https://5bebdd3a.bloom-juniors.pages.dev (bloom-juniors/main). Custom domain verified.
Rollback: https://ba1dabd6.bloom-juniors.pages.dev.

Shared usePlayDrag hook replaces native/duplicated drag paths in PicnicAdventure
and CollectionAdventure. Mouse, touch and pen use pointer capture, a visible
ghost, forgiving whole-station targets, highlight and edge autoscroll. Cancellation,
outside drops and post-drag click suppression prevent accidental double placement.
Tap and keyboard placement/removal remain. Collection scenes have richer coloured
plates, fruit landing animation and contextual Bumi reactions; reduced motion is
preserved. Existing approved artwork is reused; no new 3D engine or voice service.

New PlayPicnic route plays both Share the Snacks rounds for ages4-6 without an
account. Guest progress uses only bloom_guest_snacks_v1 in the browser, with storage
failure messaging; it does not import into account progress. Completion presents
a parent recap, optional parent-account link and explicit email feedback link.
Public landing primary CTA now links to /play. Guest mobile layout is compact and
retains tap-to-remove on plates. No schema, billing or account-save changes.

Verification: 376/376 Node tests passed. verify-guest-drag.mjs passed locally and
on production with actual Chromium CDP touch events: cancellation, outside drop,
single placement, tapping, reload, both rounds, recap and account-storage isolation.
verify-play-drag.mjs passed mouse plate relocation, wrong-fruit rejection and
keyboard selection/place/remove. Guest landing entry, existing picnic-profile and
connected-adventures browser regressions passed. Mobile screenshots inspected;
no horizontal overflow/runtime errors. Tests used isolated synthetic progress and
blocked external/API traffic; no physical-device or new authenticated cloud-save
verification claimed. Historical R01 database authorization audit remains open.

Build succeeded; existing main bundle warning remains. main-CqCjli2a.js
961.22kB/277.59gzip; PlayPicnic-BAPiecDx.js 2288bytes; PlayPicnic-CnLmyPH6.css
2663bytes; PWA61 entries/2454.17KiB. verify-guest-release.mjs verified custom-domain
main, guest JS/CSS and SW hashes4/4 and excluded three review fixtures. Functions
compiled/uploaded. Local development server stopped.

Recruitment moved beyond preparation: one personalised organiser enquiry was sent
through the founder's connected Gmail to the published Homeschooling Hub contact.
Gmail confirmed SENT (message/thread 1a07d05f3aa278eb). See
marketing/guest-picnic-outreach/README.md and organiser-enquiry.txt for source and
exact message. No replies, families, partnerships or conversions confirmed; no
social posts, membership submissions or scheduled follow-up. Zero cash spent.

Actual synthetic touch gameplay demo exported to
marketing/guest-picnic-demo/drag-picnic.mp4: 18.8sec,1080x1920,H.264,silent,
footer captions, no child footage. Opening/loading trimmed and frames inspected.
Not posted. README records the source recording and suggested post copy.

Next: gather opt-in parent observations through suitable public/community routes;
evaluate actual confusion and replay evidence before expanding the game catalogue.
Keep the founder's personal network out of the critical path. The remaining DB
audit and physical-device checks are separate outstanding verification work.

## Founder observation and next interaction proposal - 2026-09-07 (historical)

Founder reports their children engage more with colour, animation and drag/drop,
and reiterates that no personal network of willing test families exists. Treat this
as useful founder observation, not demonstrated learning/retention across users.
Do not make warm-network recruitment a dependency for continued product work.

Proposed next slice (not implemented or deployed): upgrade the existing picnic
activities with real phone/tablet dragging, forgiving drop targets, visible
object placement, contextual Bumi responses and richer purposeful colour. Preserve
tap/keyboard alternatives and reduced-motion support. Prioritize one polished
interaction over adding a catalogue of new games. Consider a short guest sample
with no signup before asking a parent to save progress; inspect/reuse the existing
public preview rather than claim this new sample is already connected.

Recruitment proposal: lower the first ask to a short game plus one observation;
use parent-community organisers and relevant small creators to reach opted-in
adults. A 15-minute session becomes an optional follow-up, not the initial hurdle.
Do not assume volunteers live in UAE; keep cohort/country evidence separate.
Official https://duneha.org/ describes a Dubai/northern-emirates homeschool family
association; a possible organiser route, not a confirmed partnership or posting
permission. https://dreamplacedubai.com/ explicitly describes a gadget-free venue,
so excluded from an on-site app-demo recommendation. No outreach sent. Zero cash
recruitment remains the constraint; no response or conversion guarantees.

## Super Kids mini-market released - 2026-09-07

Founder said go ahead with the Super Kids mission and recruitment materials.
Published https://ba1dabd6.bloom-juniors.pages.dev (bloom-juniors/main);
custom domain https://bloomjuniors.com verified. Rollback 5ebff3df.
main-DZJb6gKV.js958.05kB/276.56gzip; KS2App-o5IhLMLB.js167.54kB/48.36gzip;
KS2App-CiuAfY0O.css; PWA59 entries2442.69KiB. Existing main-bundle warning remains.

Family junior profiles now open MarketHome, a Super Kids mission desk with one
start/resume action, a market illustration, Explore all subjects and My discoveries.
Mandatory home mood interstitial is bypassed. Classroom dashboard and existing
subjects/premium gating remain; legacy Explore includes a return-home button.
No change to public landing page, accounts, billing or database permissions.

MarketMission (The picnic budget) asks for exactly four fruits and four drinks
with 12 pretend market coins. Apples2, bananas1, water1, juice3; quantities0-4.
There are nine affordable baskets. Children choose a basket, calculate total,
calculate coins left, then select a reason that fits their basket. Over-budget
correct totals explicitly trigger revision. Prices are pretend; no real purchases.
Hints show group multiplication or counting up to12; selected preferences are not
scored. Offscreen prompt changes the context to two people and six counters.
Original SVG item/stall art; scoped responsive CSS; existing Bumi rig and optional
Read to me speech. Large quantity buttons, numeric keyboard, keyboard submission,
reduced-motion styling. No generated images, new voice service or 3D engine.

Versioned marketMission progress has pure reducer/normalizer/report/merge logic.
Every quantity, answer, attempt and help state uses existing useProgress saving.
One market-first piggybank session on first completion, zero stars/coins; replay
preserves first report and stale incomplete cloud snapshots cannot erase it.
Parent Weekly Story shows spending/leftover, basket/cost/change checks, help use
and chosen reason with explicit limits on mastery/offscreen-help interpretation.
Unchanged repeated answers count once. No arbitrary child free text collected.

Verification: full376/376 tests passed, five new market tests covering all nine
valid baskets, over-budget revision, empty/duplicate checks, input bounds,
reload/corruption, help evidence, replay/stale merge and session dedup.
verify-market-mission.mjs passed actual KS2App/useProgress in synthetic local
profile: quantity errors, typed-answer reload, over-budget revision, cost/change,
hints, explanation, discovery, parent PIN/recap, replay and legacy Explore.
Mobile390x844 home/shop screenshots and desktop1280x900 explanation inspected;
no horizontal overflow or runtime errors. Existing Tiny and connected Little
Stars browser scripts also passed. Browser traffic outside local fixture blocked;
no new live authenticated save or physical-device audio/touch test performed.
Build succeeded; verify-market-release.mjs checked custom-domain main, KS2 JS/CSS
and SW against local hashes4/4 and excluded all three review fixtures from dist.
Local server stopped. Historical R01 authorization audit remains open.

Recruitment materials: marketing/mini-market-pilot/README.md includes the ages7-9
parent invitation, opt-in reply, 15-minute observation guide, follow-up and demo
outline. Two synthetic product screenshots copied beside it; sessions.csv is a
blank anonymous tracking template. No messages/posts sent, families recruited,
new video recorded, investor contacts or funding applications made. Earlier Tiny
Stars clip is still the actual completed video for3-4, not a market demonstration.

Next: observe three volunteer families in one age cohort, fix the largest observed
obstacle, measure actual eligible return use, and complete physical-phone checks.
All three age bands now have an initial focused experience; this is not full
curriculum parity, proven learning outcomes, validated retention, or capacity
certification for1,000 users. Do not continue adding missions solely to imply demand.

## Tiny Stars released - 2026-09-07

Implemented the authorized Tiny Stars 3-4 cycle and published to
https://5ebff3df.bloom-juniors.pages.dev; custom domain https://bloomjuniors.com.
Rollback: https://f96a15b2.bloom-juniors.pages.dev. Main main-Bz2PhLuG.js
951.43kB/274.64gzip; ToddlerApp-BQ6z50zy.js45.38kB/15.28gzip;
ToddlerApp-DZw7ErnE.css; PWA58 entries2414.88KiB. Existing bundle warning remains.

Family toddler profiles now open TinyHome directly, with one start/resume action,
Bumi, pictured picnic objects, Explore and My discoveries. The mandatory home mood
interstitial is bypassed; the existing classroom dashboard and library activities
remain. Explore includes a return-home button. Parent Zone retains the PIN gate.

TinyPicnic has four explicit turns: match plate, match napkin, sort a differently
coloured plate onto the round mat, then sort a napkin onto the square mat. Two large
native button choices support touch/keyboard; picture targets and automatic short
speech prompts avoid requiring reading. Voice can be muted/repeated. Incorrect
choices get specific edge/corner feedback; optional highlighted demonstration
records help and disables answers until My turn. Bumi uses the existing rig with
think/point/celebrate reactions. Original authored SVG objects, scoped responsive
CSS and reduced-motion support; no new generated imagery or real-time 3D.

The shared collection reducer now supports configurable round counts and atomic
CHOOSE actions. Tiny state uses collectionAdventures.tiny; completion writes one
shapes session with activityId tiny-first and zero stars/coins. Shared hydration,
cloud merging and first-session dedup include Tiny. Replay and stale incomplete
saves preserve the first report. Existing parent summary renders all four rounds
and the offscreen plate/napkin prompt. Tiny is filtered out of Little Stars Explore.
No database schema, auth or permission changes.

Verification: full371/371 tests passed, including three Tiny state/evidence/merge
cases. scripts/verify-tiny-picnic.mjs passed actual ToddlerApp and useProgress in an
isolated synthetic local profile: incorrect answers, demonstration, reload/resume,
four turns, completion, discovery, PIN/parent recap, replay and legacy Explore.
Mobile390x844 screenshots and desktop1280x900 sort inspected; no horizontal overflow
or runtime errors. Existing verify-connected-adventures.mjs passed again.
Production build succeeded. scripts/verify-tiny-release.mjs verified custom-domain
HTML/main, toddler JS/CSS and SW SHA256 against local (4/4); test fixtures absent.
Browser tests block external requests. No new live authenticated save or physical
phone audio/touch test performed; existing speech service integrated, not a new
acoustic-quality claim. Historical R01 authorization audit remains open.

Marketing: marketing/tiny-stars-demo contains a real-interface silent screen-recording
and a verified 33.2-second 1080x1920 H.264 captioned MP4 (2.36MB), synthetic local profile, plus draft invitation/optional
founder intro. No child footage, posts, messages or applications sent. Keep this
3-4 recruitment invitation separate from the earlier 4-6 plan. Funding readiness
brief remains a draft; no new customer traction or funding outcomes established.
Final demo contact sheet inspected; local development server stopped.
Next: Super Kids 7-9 mini-market planning mission, alongside age-specific observed
family sessions and physical-phone checks. Do not claim all age redesigns shipped.

## Connected adventures released; age/growth plans prepared - 2026-09-07

Founder said build the feature plan and asked about the other ages, marketing and
funding. Implemented and deployed the connected Little Stars slice:
https://f96a15b2.bloom-juniors.pages.dev (bloom-juniors/main)
Production https://bloomjuniors.com; main-DVDwV2y_.js950.13kB/274.23gzip;
PWA57 entries2400.52KiB. Previous rollback c554c7a6. Existing bundle warning remains.

Home now has a three-stop path: Picnic, Pack the Basket, Share the Snacks. It finds
an unfinished chapter, otherwise the next uncompleted chapter. All are also
available through Explore; existing activities remain. Picnic completion offers
Basket, Basket offers Snacks, Snacks returns Home. Journal lists each completed
adventure without falsely labelling its maths session as Number World completion.

New collectionAdventure.js provides a shared versioned reducer, restore validation,
evidence/report builder and merge strategy for both new activities. Basket matches
three apples/two pears then one apple/three pears to a pictured list. Snacks gives
three friends one of four apples, then four friends one of five, leaving one.
Children can add/remove items, correct specific missing/extra feedback and request
a dotted demonstration that does not alter their answer. Tap/keyboard controls and
desktop HTML drag/drop are implemented; drag itself was not browser-verified.
Fruit is original CSS illustration; friends and Bumi reuse existing approved art.

State lives in profile.collectionAdventures. Completed first recaps survive stale
unfinished saves and replay; one activityId-first maths session per chapter, no
stars/coins awarded. Global cloud merge deduplicates those first sessions. Parent
Weekly Story includes each chapter's attempts/demonstration evidence and offscreen
prompt, with limits on mastery/adult-help inferences. New Bumi contextual lines and
think/point/celebrate reactions are connected to feedback; existing Picnic now uses
think on correction feedback. No real-time 3D or phoneme lip sync added.

Verification: full368/368 tests passed. Initially seven route-harness tests lacked
the newly imported ADVENTURE_PATH constant; supplied the actual dependency without
weakening assertions. Ten new state/evidence/merge tests passed. New isolated browser
script scripts/verify-connected-adventures.mjs verified both chapters, wrong/empty
answers, targeted hints, demonstration, reload, replay, journal, parent PIN/recaps,
mobile fit and no runtime errors. Original verify-picnic-profile.mjs also passed.
Mobile Basket and desktop Snacks screenshots inspected. Reduced motion was enabled
in the new browser test. External requests blocked; these new chapter saves were
not independently tested against live accounts. Earlier Picnic live API verification
still applies to the existing cloud-save mechanism, not a new per-chapter live test.
No new real API mutations or outreach executed. Test fixtures absent from dist.
Production HTML references final main and four release assets hash-match local.
Local server stopped. Physical-phone audio/touch and remaining R01 audit are open.

Age roadmap and ready-to-review marketing materials:
marketing/08-age-roadmap-and-growth.md. Tiny Stars3–4 picture/spoken matching and
sorting is the next proposed cycle; Super Kids7–9 practical planning mission follows,
with prototype overlap if capacity permits. Those homes were not replaced here.
Draft parent invitation, founder demo recording script and seven-day zero-cash
recruitment experiment prepared. Target three observed families then work toward ten;
no guaranteed recruitment, existing warm UAE network or school replies assumed.
No video recorded and no posts/messages published by this work.

Funding: marketing/09-funding-readiness-brief.md has a draft one-page story,
evidence/cost worksheet and source-backed programme shortlist. Hub71 Access is a
candidate to assess; ECA Anjal Z x Hub71 is currently closed per official page;
Sheraa S3 describes market readiness/early traction/revenue requirements. Eligibility,
relocation and current terms must be checked before applying. No deck, funding ask,
application, investor outreach, invented traction or funding guarantee produced.

## Next-week feature plan - 2026-09-07

Founder requested a one-week plan, then clarified "feature building". Proposed
8–14 September scope is in docs/FEATURE_WEEK_2026-09-08.md: connected adventure
home, contextual Bumi reactions, Pack the Picnic Basket, Share the Snacks,
discovery journal/parent evidence, targeted help and an end-to-end release.
This is a proposed plan, not completed implementation or a scheduled background
task. Prioritize one polished new adventure if capacity does not support both.

## Save-reliability follow-up - 2026-09-07

Founder said move next, then noted the DB connection should be in the code.
Confirmed the app connection in src/lib/supabase.js and ignored .env.local; it
contains the normal public app configuration, not a database-admin connection.
Supabase connector still returns zero projects. No deployed RLS/grant inspection
was possible. scripts/audit-account-permissions.sql is a prepared read-only metadata
query for an authorized project admin; it has not been run.

Fixed useProgress cloud-write lifecycle with createProgressSyncQueue:
- Persist the latest pending snapshot before the upload debounce.
- Serialize this profile's writes and acknowledge only the snapshot actually saved.
- An older success/failure cannot erase or replace a newer pending retry record.
- Profile unmount flushes best effort, backed by the durable outbox.
- Online/pagehide events flush pending data. Offline hydration retains local/outbox
  data in the queue so reconnect does not require another child action.
- Local storage failures have visible warnings. Stale acknowledgements do not clear
  newer work's sync status. This does not establish atomic multi-device server writes.

Verification: full suite 358/358 passed; five queue tests also passed after the final
acknowledgement adjustment. Actual useProgress browser test passed against a synthetic
backend: quick profile switch, immediate outbox, offline reload, online recovery,
profile isolation and a fresh independent browser context. All real API traffic was
blocked in that browser test. Fixtures excluded from production inputs.
Final build exited 0: main-BNvu4kvh.js 937.01 kB /270.50 gzip, PWA57 entries2380.86KiB.
Production deployment: https://c554c7a6.bloom-juniors.pages.dev
Custom domain https://bloomjuniors.com serves final main; four release files hash-match.
Previous rollback: https://fc1b5127.bloom-juniors.pages.dev. Local server stopped.

Real API check PASSED after the founder explicitly replied "yes" to the precise
stored-login and temporary create/update/delete test. The earlier automatic approval
rejection was resolved by that approval. scripts/verify-live-picnic-sync.mjs exited 0:
two independent authenticated clients verified a saved partial Picnic, completed
two-round recap, exactly one first-visit session, and preservation of completion
after a stale unfinished snapshot was saved. The temporary QA profile was removed
and its absence verified. Existing child profiles/progress were untouched. Only
the two newly created test auth sessions were signed out (local scope).
This is real API cross-session evidence, not two physical-device UI testing,
simultaneous-write atomicity, cross-account authorization or RLS/grant sign-off.
No application code changed and no additional deployment was needed for this test.
Never log credentials or add them to source control/handoff.

## Simple Little Stars home and Picnic production release - 2026-09-07

Founder said "push it" after the proposed simpler home, integrated Picnic, parent
recap, update notice and phone verification. Implemented and deployed the journey.
Production: https://bloomjuniors.com
Immutable release: https://fc1b5127.bloom-juniors.pages.dev
Main: main-DqE_5FxZ.js, 936.14 kB / 270.10 kB gzip.
PWA: 57 precache entries, 2380.01 KiB. Direct build exited 0. Existing size warning.
Cloudflare Pages bloom-juniors/main, dist plus existing Functions uploaded.
Previous rollback reference: https://b2a1295c.bloom-juniors.pages.dev.

Early-years family profiles now use SimpleChildHome with Home, Explore and My
discoveries. The main action starts/resumes Picnic, then suggests an unvisited
existing core activity. Explore retains access to the full existing Dashboard via
All Bloom activities. Profile switching and the PIN-protected Parent Zone remain.
Classroom Dashboard and toddler/junior homes are not replaced. The public marketing
page stays the same apart from its optional update notice.

ProfilePicnic uses the existing production speech hook and useProgress updater.
Every placement/attempt/help/round is stored inside that child's progress.picnic;
anonymous preview storage is never imported into an account. The pure action updater
atomically records the first recap and one maths session (activityId picnic-first),
without awarding stars/coins. Replays preserve the first recap and cannot duplicate
that session. Hydration validates stored state. Cloud merging preserves completed
evidence against an unfinished snapshot, retains the earlier first recap, and
deduplicates first-visit sessions. The Parent Zone weekly story includes observed
attempts/help and a dinner-table prompt, with explicit limits on mastery/adult-help
inferences. A Picnic session does not falsely mark Number World as explored.

saveCloudProgress now throws for a missing profile or expired/missing auth/class
session instead of returning null and letting the hook report successful syncing.
Uses existing child_progress storage, auth and outbox; no database migration or
permission/billing policy change. Historical R01 authorization audit remains open;
this release is not a security sign-off or a multi-device live sync certification.

An optional update notice appears on the public landing and after the parent PIN.
Later dismisses it; Update now explicitly activates the waiting service worker.
There is no automatic mid-game reload. Existing versions need their old tabs closed
once before they can receive this new notice implementation. The timer pill is hidden
on the simple home, Picnic and parent screen so it cannot cover controls; the timer
continues running and the parent-set session limit/lock remains enforced.

Verification: final 353/353 Node tests passed, including seven Picnic persistence,
merge/replay/evidence/auth-failure cases. scripts/verify-picnic-profile.mjs ran the
actual AppWithProfile router and useProgress in an isolated local-only fixture at
390x844: home, wrong/empty answers, reload/resume, two arrangements, demonstration,
completion, discoveries, wrong/correct parent PIN and persisted recap all passed
with no runtime errors. External requests were blocked in this UI test; it did not
create accounts, send email, or test live authenticated cloud writes. Desktop home
and mobile home/completion screenshots inspected. The test fixture is excluded from
the production rollup inputs and absent from dist. Existing sign-in/signup navigation
was verified in the preceding release; no fresh live signup was performed here.

scripts/verify-picnic-audio.mjs made one short real narration request: HTTP200,
23040-byte MP3, decoded 2.88 seconds, non-silent samples, browser playback reached
ended. This verifies synthesis/playback, not human acoustic quality or lip sync.
scripts/verify-picnic-release.mjs confirmed custom-domain HTML references the final
main bundle, and main/SW/Picnic artwork/avatar match local SHA256 (4/4).

Next: observe real child comprehension and voluntary return using the existing
zero-spend Picnic playtest plan. Verify authenticated cross-device resume with a
dedicated test family and complete the outstanding authorization audit. No claim
of validated retention, learning efficacy or readiness for 1,000 concurrent users.

## Bumi production release - 2026-09-07

Founder explicitly requested production deployment. The full existing app now uses
Bumi through LearningCompanionContext in main.jsx. Yaagvi remains the founder's
daughter and story explorer; the legacy assistant key is retained for saved-profile
compatibility. Guide labels and assistant portraits now identify Bumi. The rig fits
different production containers using ResizeObserver, and the compatibility wrapper
forwards both speaking/talking props. The older intro video was replaced by MeetBumi.
The landing companion can be tapped to greet the visitor.

Production: https://bloomjuniors.com
Immutable release: https://b2a1295c.bloom-juniors.pages.dev
Main bundle: main-DTTQAKhc.js (908.76 kB / 260.64 kB gzip).
Deployed dist plus existing Functions to Cloudflare Pages bloom-juniors, main branch.
Supersedes intermediate production 70734a7f and pre-Bumi production fa9a05cc.

Verification: all 346 regression tests passed before the final intro markup change;
the final production build passed with 58 PWA precache entries (2334.46 KiB).
Local browser checked landing, counting wrong/correct feedback, sign-in and signup
navigation, mobile fit, and the actual age landing's new interactive introduction.
No account was created and no learning/account migration was performed.
Custom-domain HTML serves the final bundle; main script, service worker, avatar and
nine rig parts all returned HTTP 200 and matched local hashes (12/12). No noindex.
POST /api/tts with empty JSON returned expected 400 Invalid text length; this only
verifies route validation, not Azure synthesis or audio quality.
Published immutable release opened in Chrome and Bumi rendered correctly. Existing
Chrome and Edge sessions on the custom domain still showed their older cached app;
close all old Bloom tabs and reopen, or use a private window, to load the release.
No forced reload was added for active child sessions. Local review server stopped.

This release integrates Bumi into the full production app. The standalone child-home
layout and Picnic remain separate previews; they were not substituted for the app.
Authenticated feature coverage is not exhaustive. Motion is articulated 2D artwork
with a 3D appearance, and speech movement is not phoneme lip sync.

## Bumi continuous articulated motion - 2026-09-07

Founder said Bumi still did not feel alive. Replaced whole-character pose swaps
with a nine-part articulated 2D rig using newly generated, matching 3D-style art.
Latest previews (supersede URLs below):
- Home: https://283a8578.bloom-juniors.pages.dev
- Picnic: https://0f4b271d.bloom-juniors.pages.dev
At this preview milestone production remained main-BgHdyn2o.js; superseded above.

New parts in public/bumi/rig-v2 total375600 bytes: body, leaves, arms, eye, pupil,
smile, open mouth, brows. Built-in generation only, approved concept reference,
transparent alpha visually inspected. Returned sheet1254 square; extracted actual
inspected part regions and encoded losslessly. Full prompt/provenance and extraction
bounds are in art/bumi/README.md and rig-v2-parts.json. Old atlas retained historically.

BumiCharacter now uses independently moving raster layers. CSS animates subtle
breathing, leaf sway and uneven blink intervals. Web Animations interpolates arm,
body, brow and mouth reaction tracks; this avoids per-frame React renders. An
initial requestAnimationFrame approach showed throttling in browser review and was
replaced before publishing. Near-pointer/touch position drives bounded, eased pupil
and face offsets, without camera/mic access or tracking analytics. Offscreen/hidden
animation pauses; reduced-motion mode retains static meaningful expressions.
Home taps change greeting and retrigger a wave without remounting/reloading artwork.
Meet Bumi demo likewise reuses the rig. Existing speech-active flags on home/Picnic
drive gentle mouth movement, not phoneme lip sync. Actual audio timing not verified.

Verification: five new motion tests plus six Picnic evidence tests passed (11).
Browser sampled smoothly changing arm matrices and continuous body movement; checked
assembled character, live tap reply, nearby gaze offset, and articulated celebration
after a correct four-place Picnic answer. Phone client/content375/375 at390 viewport;
rig and bubble within scene. Viewport reset. Reduced-motion semantics unit tested;
physical device frame rate, independent blink timing, hidden-tab resume and audio
acoustics not independently verified. No exhaustive existing-game regression rerun.

Both isolated builds passed: home child-home-preview-YyzciiUq.js179.62kB/59.15gzip;
Picnic picnic-preview-BsLvQW8d.js165.96kB/54.29gzip. Each published script and all9
parts hash-match local,10/10 checks per preview. noindex/connect-src none retained.
Published home opened, all parts loaded/visible and breathing animation present,
marked deliverable. Local review server stopped. Next: observe whether the improved
motion feels attentive and appealing during actual child use; no claim of validated
engagement, efficacy or equivalence to a fully rigged real-time 3D character.

## Bumi companion implementation - 2026-09-07

Founder approved Bumi sprout concept and implementation: Bumi is the main learning
companion; Yaagvi remains the explorer in the stories and family inspiration.
Published updated previews:
- Child home: https://73a017ef.bloom-juniors.pages.dev
- Picnic: https://ff547411.bloom-juniors.pages.dev
Older immutable screenshot links still show old characters. Child-home-preview
and picnic-preview branch aliases now follow these updates. Main production was
not deployed; existing account/save gates still apply to authenticated integration.

BumiCharacter uses a newly generated transparent 3x2 pose atlas: neutral, blink,
two wave poses, thinking and celebration. Finite reactions, periodic quiet blink,
short celebration hop, reduced-motion static expressions; timers stop when hidden,
offscreen or unmounted. It is rendered sprite animation, not a real-time 3D rig.
public/bumi/reactions-v1.webp is lossless, 671822 bytes. Approved concept and full
built-in generation prompt/provenance saved in art/bumi/README.md and sibling PNG.
Alpha visually checked against a contrasting background; no opaque portrait panel.

LearningCompanionContext opts both previews into Bumi across shared guide components.
Default production context retains existing Yaagvi behavior. Sound Pop uses Bumi's
name and matching narration in this context. Home has a tap-to-wave control and
Hear Bumi. Parents can try Wave/Think/Celebrate and read the family introduction.
Picnic is labelled Yaagvi's Adventures, uses Bumi as guide, and links to the current
home alias. Existing Yaagvi story titles, stories and illustrations are retained.

Verification: four new animation tests plus six Picnic state tests passed (10).
Both isolated builds passed. Browser observed wave frames 2/3/0, thought frame4,
celebration frame5 plus hop then neutral, and Bumi celebrating a correct Sound Pop
answer. Home and Picnic desktop screens inspected. Phone client/content375/375
at390 viewport, no horizontal overflow; Bumi and bubble within scene. Viewport
reset. Blink timing/reduced-motion behavior unit tested, not independently verified
on a physical device; audio acoustics and exhaustive game regressions not retested.

Final home bundle child-home-preview-CBbuMGyR.js176.02kB/57.82gzip; Picnic
picnic-preview-kcV1f9Mw.js162.40kB/53.01gzip. Published scripts and Bumi atlas
SHA256 match local for both. noindex/connect-src none verified. Main remains
main-BgHdyn2o.js. Device voice and preview-only saving limitations still apply.
Local review server stopped after verification. Next: family observation of the
new companion and existing Picnic pilot; do not claim adoption or learning gains.

## The Picnic playable preview - 2026-09-07

Founder said go ahead with the flagship slice. Built and published an isolated
playable preview: https://e606663d.bloom-juniors.pages.dev (picnic-preview branch).
This supersedes the brief-only status in the section below. Main production and
the child-home preview are unchanged; this is not yet an authenticated app module.

New PicnicAdventure component and scoped CSS provide two one-to-one matching
arrangements: four guests, then three in different places. Six possible places
include unoccupied places so extra plates can be noticed and corrected. Tap and
keyboard alternatives accompany pointer dragging. Ready checks actual placements;
empty Ready gives guidance without recording an attempt. Missing/extra places get
specific feedback. Optional demonstration highlights each friend and a translucent
example plate without changing the child's answer. Successful guests settle toward
their plates; completion offers an offscreen dinner activity and a grown-up recap.

Pure picnicAdventure reducer reuses buildNumberWorldCompletion's session-data
contract, with richer per-round retry/help evidence. No stars or production rewards
are awarded. Repeated unchanged Ready does not inflate attempts; solved rounds lock.
Anonymous versioned localStorage resumes attempts, help use, placements and round.
Invalid/inconsistent saves reset safely. Scores are recomputed when restoring.
Replay preserves the original completed recap. Local save failure has visible text.
Recap describes observed attempts, explicitly avoids mastery claims, and acknowledges
that adult help outside the app cannot be observed.

Art: public/picnic-friends-v1.webp, generated 3x2 illustrated atlas, 143602 bytes.
Four woodland characters, plate and basket. Provenance in art/picnic/README.md.
Yaagvi uses the existing transparent atlas. These are raster illustrations and
finite sprite/CSS motion; no new real-time 3D model or rig was built.

Verification: six new state/evidence tests plus five existing reward-integrity tests
passed (11 total). Browser exercised empty and incorrect submission, plate placement
and removal, reload/resume, corrected success, second arrangement, demonstration,
keyboard Space activation, completion and accurate recap. Native modal Escape and
focus restoration verified after a fix. Phone viewport 390x844: client/content
375/375, no horizontal overflow; plate controls 78x48. Desktop screenshot reviewed.
Pointer drag is implemented and reducer move behavior tested; end-to-end touch drag,
audio acoustics, screen-reader narration and long-running device use remain unverified.

Isolated build scripts/build-picnic-preview.mjs emits dist-picnic-preview only.
Final JS picnic-preview-B5PKSuIR.js 159.65kB / 52.19kB gzip; CSS 11.28kB.
No environment loading, production API imports, analytics, Functions or PWA in output.
Published script and both character assets SHA256 match local; HTTP200, noindex,
connect-src 'none' verified. Main still serves main-BgHdyn2o.js. Published preview
opened and marked deliverable. Device speech only; Azure is not called by this slice.
Local review server stopped after publishing.

Next: follow docs/PICNIC_FIRST_PLAYTEST.md with three willing families at zero
recruitment spend. Observe child comprehension, interaction friction, transfer and
actual voluntary return. Invitation is a draft only; no outreach sent. Use fresh
browser profiles/private windows for separate families because replay intentionally
keeps the initial recap. Resolve the existing account/save release gates before
integrating with authenticated production progress. This preview does not establish
product-market fit, educational efficacy, retention or readiness for 1,000 users.

## Product perspective and flagship brief - 2026-09-07

Founder expects original product leadership and a niche app competitive with
Khan/Duolingo/leading academies. Read docs/BLOOM_PRODUCT_DIRECTION.md alongside the
commercial plan. Official competitor pages checked: Khan Kids free ages2-8 broad
library/personalised path; Duolingo ABC free reading; Duolingo story Adventures.
Do not claim a mascot, games, stories or3D alone are unique.

Proposed focused hypothesis: everyday applied early maths for ages4-6, with
short playable stories and honest parent evidence of independent versus helped
attempts. First bounded flagship slice "The Picnic": four guests, child sets four
places, purposeful consequence animation, one transfer task and offscreen prompt.
Reuse NumberWorld foundations after contract review; no new broad content library,
currency or real-time generated child content. This is a documented brief, not a
built/deployed activity, validated niche or guarantee of competing at global scale.

Next concrete engineering work: inspect existing counting/save/report contracts,
then build one complete playable local/staging slice while respecting unresolved
database release gates. Prepare zero-spend recruitment demonstration; three first
observed testers are an intermediate step, not ten retained families. No outreach
sent or fees authorized. Preview/production URLs below remain unchanged.

## Transparent Yaagvi backdrop correction - 2026-09-07

Founder explicitly approved local background-removal script. Completed targeted
fix to circled character in child-home preview; existing scene/layout retained.
Published: https://5930cf32.bloom-juniors.pages.dev (child-home-preview branch).

scripts/matte-yaagvi.py uses local OpenCV GrabCut and a protected torso region.
An initial edge-connected colour-only mask damaged white fabric; inspected and
discarded that method before publishing. Final contact sheet visually reviewed
all24 poses against dark green: white shirt, face and limbs intact. Original
1536x1024 / 6x4 frame placement unchanged. Final lossless WebP788844bytes includes
true alpha and softened light edge pixels. Script asserts exact decoded RGB
equality for visible original pixels and exact decoded alpha equality.
Versioned asset public/yaagvi/reactions-atlas-transparent-v2.webp is selected only
for the child-home scene through optional YaagviCharacter atlasSrc. Default
production atlas is unchanged. Removed overlapping scene caption; scoped shadow
and border correction included. No new rig, frames or animation choreography.

Final isolated build passed: child-home-preview-gx8zkrnh.js173.20kB/56.96kB gzip.
Browser: desktop and mobile screenshot inspected;375/375 client/content at390
viewport. Transparent scene visible, no cream rectangle, bubble clear of face.
Viewport reset. Hear control clicked but speaking/frame transition not observed
in sampled state; device speech acoustic/animation timing not verified this pass.
All poses inspected as a contact sheet; earlier reaction tests remain passing
evidence, no full suite rerun for this isolated asset revision.

Preview deployment succeeded; live transparent atlas SHA256 matches local asset.
Published scene opened/visually verified and marked deliverable. Main production
still serves main-BgHdyn2o.js, unchanged. Preview remains device voice/session-only,
with no production identity/data/API changes. Local review server stopped.
This resolves the screenshot-specific backdrop issue; await design feedback
before integrating the child-home layout into the authenticated production app.

## Screenshot clarification: Yaagvi backdrop - 2026-09-06

Founder rejected preview presentation, then supplied screenshot circling the
large cream rectangle behind Yaagvi. Targeted fix is transparent compositing of
the approved character in the existing scene, not a wholesale layout/scene swap.
An initially generated floating-island exploration is saved only in art/child-home
and is not published. Existing preview f88c61d1 and production remain unchanged.

Image-gen asset-only agent attempted background removal twice on original
public/yaagvi/reactions-atlas-v1.webp (1536x1024,6x4 grid,RGB). Both generated PNGs
contain painted checkerboards with no alpha. They are unsuitable and not copied
into source/public. Latest diagnostic original is under generated_images:
C:/Users/SKVeed/.codex/generated_images/01a07809-cdc7-79b0-ab00-acfc0d0e955c/exec-b02a6489-f5e4-4afe-828b-62dc192e9e93.png.

Local preparation only: YaagviCharacter supports optional atlasSrc (default
unchanged); pending transparent asset will avoid an opaque fallback flash.
Scoped preview ground shadow and unclipped character borders prepared; overlapping
scene caption removed. No missing-asset URL is referenced. Existing four reaction
tests passed. No new build/deployment, no image-matting script executed.
Next: ask explicit permission for local background-removal script because the
image tool requires explicit user direction to use another editing method.
If approved, matte original background without redrawing the face/clothes or
changing6x4 cell alignment; preserve white shirt, inspect alpha across all poses,
encode versioned WebP, wire optional atlasSrc in preview, verify desktop/mobile
and animation, then republish same preview branch. Do not claim new 3D rig/motion.

## Simpler child-home working preview - 2026-09-06

Founder said "ok" to a working child-home preview before production integration.
Built reusable SimpleChildHome.jsx + scoped simple-child-home.css, isolated
child-home-preview.html/entry and scripts/build-child-home-preview.mjs.
Published review: https://f88c61d1.bloom-juniors.pages.dev
Branch: child-home-preview in existing bloom-juniors Cloudflare Pages project.

Home has one prominent Start/Continue action, approved Yaagvi and existing world
art. Explore has Sounds/Numbers/Stories/Discovery filters and five existing lazy
loaded modules: SoundPop, NumberWorld, StoryRoom, ShapeWorld, DirectionalPuzzle.
My discoveries shows only completed module types and take-home prompts. Existing
starterPath selection guides next activity. Completion callback deduplicates per
launch, adds session to React state and shows completion prompt. No new game or
reward economy added. Parent dialog is explicitly a preview summary, not the
authenticated Parent Zone. Avatar customisation/full catalog integration remains
for the production design pass; this preview focuses on the initial journey.

Isolation: no environment files, Supabase identity, production app entry, PWA or
Functions deployed. Build replaces analytics with no-ops and useSpeech with a
preview-only browser speech hook (production hook unchanged). No microphone,
external API requests or persistent account saves; progress resets on reload.
Device speech does not reproduce Azure SSML/phoneme output; pronunciation/audio
quality is not verified. noindex header and CSP connect-src/form-action blocking
verified on published URL. Assets are existing public Bloom artwork.

Browser verification in Edge: desktop home; actual guided SoundPop five-question
completion -> take-home prompt -> NumberWorld selected next; filled discoveries;
Explore/filter Discovery; ShapeWorld entry; return Home; parent dialog and Escape.
Phone390: client/content390/390, no broken loaded images, clear bottom navigation.
Corrected speech bubble overlap; inspected final mobile image; viewport reset.
Other linked modules compile but were not completed end-to-end this pass. No
full regression suite rerun for this isolated preview; existing app not edited.
Final preview build passed: child-home-preview-DOKRl38T.js173.22kB/56.97kB gzip,
shared theme/motion chunk115.34kB/38.30kB; CSS188.53kB/31.13kB includes existing
app/game styles. Final live JS SHA256 equals local build. Main custom domain
still serves main-BgHdyn2o.js, unchanged. Published preview visually verified.

Initial upload auto-review rejected destination authorization/ownership. Read-only
wrangler project/deployment lists confirmed bloomjuniors.com ownership and exact
existing authorized production/preview URLs. Retry with that evidence accepted;
static preview deployed, no production change. Await founder review of this
concrete design before integrating it into authenticated age-band dashboards.

## Founder direction: zero spend and simpler in-app layout - 2026-09-06

Founder explicitly confirmed ZERO spending for recruitment. Do not assume paid
research recruitment, ads or creator fees. Personal contacts are not using Bloom;
the plan must work without a warm network. No outreach authorized or sent here.

Founder finds the current authenticated layout confusing/unimpressive and asks
whether it should change or more games should be built. Source review confirms
the existing guided starter CTA, surrounding stars/streak/avatar controls, and
additional daily/story/endless/skyship navigation behind exploration. These are
code observations, not a new live child usability test or proven cause of churn.
Recommendation: simplify the ages4-6 entry first; one prominent Start/Continue,
plain labelled illustrated navigation, separate activity library and collected
items, and consistent Home/back controls. Reuse existing saved progress and
activities. Improve existing game interaction/feedback before adding games.
This is proposed design scope, not an implemented or deployed redesign.

## Connected world production release - 2026-09-06

Founder explicitly requested "push it to prod" after approving the connected
world preview. This supersedes the preview-only / await-feedback restrictions
below. Integrated the approved experience into the FULL production app using
shared src/pages/WorldLanding.jsx; LandingPage retains existing signup/signin
callbacks and landing analytics. Standalone world-preview.jsx uses the shared
component with preview mode. Production includes Pip/Wren choice and hints,
daylight/starlight, three discoveries, session-only journal/download and Wonder
House reveal. Added clear parent signup and school entry points. No changes to
account storage, authenticated learning flows or database migrations.

All world stylesheet selectors are scoped to .wonder-page to protect existing
app screens; verified zero unscoped selectors. Native activity/journal dialogs
ignore stale queued close events during React StrictMode cleanup/reopen.
Journal export footer now says Bloom Juniors free adventure.

Verification: 331/331 regression tests passed. Final full build/PWA passed:
main-BgHdyn2o.js 907.90kB / 260.35kB gzip; 58 precache entries / 2324.03KiB.
Existing large-chunk/Browserslist warnings remain. Local actual LandingPage
fixture uses app CSS and StrictMode: signup/signin callbacks, counting activity,
journal open/close verified. Phone390 viewport: page375/375, header fits; reset
viewport. Prior preview checks covered all3 discoveries and journal downloads.

Published FULL dist with Functions to Cloudflare Pages bloom-juniors main:
https://fa9a05cc.bloom-juniors.pages.dev
Custom domain https://bloomjuniors.com serves main-BgHdyn2o.js; live and local
SHA256 match DABBEFF2E9E657E4E81C7043E9CE6A7B591C1006D96104CBBB51F3C330D29D91.
Production HTML has no noindex. Deployed homepage visually inspected; Sign in
opens Welcome back form and Start free opens Parent Setup with age groups.
No forms submitted, accounts created or consent accepted during verification.

Existing Edge main-domain tabs still showed an older offline app after a hard
refresh. Waiting service-worker updates intentionally activate after all old
Bloom tabs close; use a private window to see the new release immediately.
Do not force-reload in-progress child activities. Broader security/database
audit limitations and outstanding roadmap items below remain unresolved.

## Connected world preview - 2026-09-06

Founder liked the immersive preview and requested more innovation/appeal.
Expanded SAME standalone preview; main homepage must still await integration
feedback. Added generated Pip fox/Wren songbird sidekick choice, contextual
sidekick hint toggle, illustrated daylight/starlight switch, session-only field
journal and plain-text keepsake download. After three unique correct discoveries,
scene reveals existing Wonder House artwork; valley/house can then be switched.
Main guide remains approved Yaagvi. Animal assets are static 3D-style raster art,
not animated rigs. Journal records discoveries, not an assessment or durable
account progress. No names/input collected, no network APIs or analytics added.

Browser verification: sidekick selection and guide text, starlight toggle, hints,
counting wrong/correct feedback, all3 completions. Two discoveries keep valley;
third reveals house and journal count3. Empty/filled journal checked. Mobile page
375/375 and journal337/337; heading breaks restored; viewport reset. Download
notification API timed out, but actual full and partial text files in Downloads
verified. Partial export contains only completed counting discovery and Pip;
full export contains all3 take-home prompts and Wren. Existing audio not retested.
Final build: world-preview-CmjGjxzn.js165.09kB/53.33kB gzip; CSS28.68kB/6.96kB.
Build intentionally copies public sidekick asset after bundling (runtime asset
warning); asset present in output. No full regression suite rerun for preview.

Initial publishing auto-review rejected based on possible sensitive assets and
unclear authorization. Read-only inventory and SHA256 comparisons proved all
founder/app art matches existing publicly served assets. Retry with this evidence
and existing user-approved preview scope accepted. Deployed static preview to
https://fc29b439.bloom-juniors.pages.dev on world-design-preview branch. Live
JS and sidekick WebP hashes match build; preview content opened/verified in Edge
and left open as deliverable. Production main-BYTPmkrr.js remains unchanged.

## Immersive world preview - 2026-09-06

Founder still dissatisfied with previous homepage and requested the combination
of magical 3D-world feel, premium learning brand and lively game. Agreed to judge
a complete preview BEFORE replacing production homepage. Do not replace the main
homepage without feedback on this direction.

New standalone world-preview.html + src/world-preview.jsx/css: immersive existing
storybook landscape with subtle pointer-responsive depth (not a real 3D model),
three map locations, native accessible activity dialogs, approved animated Yaagvi.
Counting4 stars, animal listening clue, fictional seed-story comprehension.
Retry/success, offscreen prompts, session-only discovered places. No account/API,
tracking or stored child data. Premium parent explanation, actual app screenshot,
founder note. Existing main LandingPage and production build config untouched.
Build via node scripts/build-world-preview.mjs to dist-world-preview. Copies only
five needed public assets; no main app, Functions or PWA. Noindex metadata/header.

Local Edge verified: desktop hero, all3 activity completion, counting retry and
tap marking, Escape close, all3 discovered map states. Phone390: page375/375,
story dialog352/352, completed story and map screenshot inspected. Mobile heading
spacing corrected and read back; viewport reset. Optional browser voice playback
not acoustically verified. No full-suite rerun for isolated visual preview.
Final standalone build passed: world-preview-Aof4wfEl.js,159.42kB/51.66kB gzip;
CSS19.08kB/4.98kB gzip. Published STATIC ONLY from dist-world-preview to
branch world-design-preview: https://69dc2e20.bloom-juniors.pages.dev.
Live JS hash matches build; noindex header verified; live preview opened in Edge
and content verified, left open as deliverable. Production still serves
main-BYTPmkrr.js, unchanged. Await founder design feedback before integration.

## Homepage visual direction correction - 2026-09-06

Founder saw the prior release in private browsing but judged it too basic and
unimpressive. Reworked the homepage towards colourful illustrated learning worlds:
bold rounded headings, navy/orange palette, larger approved Yaagvi, working
Sounds/Imagination/Discovery preview selector using existing product artwork.
Relocated intact counting demo into a prominent peach section; kept founder story,
FAQs, signup/signin callbacks and direct no-account adventure. No new generated
art or fabricated proof. Preview illustrations are labelled as artwork/previews.

Local browser verified desktop hero, Imagination and Discovery switching, mobile
390 width (375 client/content), and relocated demo wrong/correct feedback.
Temporary viewport reset. Final build/PWA passed: main-BYTPmkrr.js,900.94kB
(257.92kB gzip),58 precache entries (2300.05KiB). Deployed to
https://3539b3be.bloom-juniors.pages.dev; custom-domain main JS SHA-256 matches
tested dist. Published deployment opened in Edge and new page content verified;
left open as deliverable. Full regression suite not rerun for this visual pass.
This supersedes the restrained learning-journal direction below. Broader database
and game-integrity audit items remain open.

## Homepage credibility redesign - 2026-09-06

Founder reports visitors perceive the site as AI generated; explicitly requested
review and improvement. Existing production deployment authorization persists.
Rebuilt LandingPage with scoped landing-page.css: parent-facing editorial type,
forest/terracotta palette aligned with logo, immediate interactive counting table
using approved Yaagvi, existing real product screenshot, expanded founder note
based on the founder context, existing photo/video, accessible native FAQs.
Removed automatic welcome overlay and synthetic background video from homepage.
No new testimonials, partner logos, user counts or learning-outcome claims.
Retained signup/signin callbacks and schools route. Demo has no saved progress;
answer analytics contain only correctness, no child input. Existing /blog demo
remains linked. Search/share descriptions aligned; viewport now allows zoom.

Local isolated browser: desktop screenshot inspected; mobile390 content/client
375/375, no broken loaded images. Wrong answer feedback, correct answer lock,
replay reset, signup and signin callbacks, FAQ expansion verified. Founder video
expands, controls present, no autoplay; actual playback not tested. Temporary
viewport reset. Test fixture test-landing-review.html does not build to production.
First build passed (main-DYIa0hZr.js,898.45kB/257.22kB gzip;58 PWA entries).
Final build/PWA passed after an approval-timeout retry (58 entries,2290.73KiB).
Deployed https://3b124c10.bloom-juniors.pages.dev. Custom domain serves
/assets/main-DYIa0hZr.js with SHA-256 matching tested dist. Live description
and zoom-enabled viewport verified. Opening deployment URL in CUA timed out;
visual verification above is local, with production verified via asset hash.
Existing open PWA tabs may retain older release until closed/reopened.
Broader codebase/DB issues in prior handoff remain open. No conversion uplift
claimed: design improved, parent/user feedback and analytics still needed.

## Approved Yaagvi rollout and integrity fixes - 2026-09-06

Founder explicitly approved the newly rendered Yaagvi: "it looks good go and
implement everything". Preserve this approved look; expand its use. Production
deployment authorization persists. Full commercial mandate remains ongoing.

Changes in this pass:
- Animated shared Yaagvi now replaces older static/bobbing mascots in
  AgeGroupLanding, ProfileSelector, ClassLogin, StoryRoom and the unopened
  HighFiveDelivery. Toddler home now uses the same character instead of looping
  the old video and shows her on mobile. Collectible/avatar artwork is unchanged.
- R17: full-workout reward requires all distinct exercise indexes to complete.
  Skipped exercises cannot become8/8 through completing the last exercise. Single
  exercise reward preserved. Cancel stale transition callbacks when starting or
  skipping an exercise; disable skip during completed-exercise feedback; do not
  count repetitions while document.hidden. This measures in-app timer completion,
  not a child's actual physical movement. Partial full workouts earn no full bonus.
- R24: options deduplicate visible answer labels, supplementing from the full
  country pool if a region lacks distinct currencies. Correctness compares the
  displayed answer key, not country identity. Actual generator tested across
  regions and Flags/Capitals/Currencies; four distinct options and one answer.
- R13 partial: default Vite /api responds503 instead of proxying production.
  Optional BLOOM_DEV_API_TARGET only accepts a localhost/loopback origin, without
  userinfo/path/query. Set it in the shell when using a local Pages Functions
  backend, e.g. PowerShell $env:BLOOM_DEV_API_TARGET='http://127.0.0.1:8788'.
  This isolates /api only; VITE_SUPABASE_* remains independently configured.

Verification:331-test full suite passed before the visual expansion; final build
and PWA passed after expansion (main-DHeaThVY.js,905.02kB/258.23kB gzip,57 entries).
Local isolated screen fixture verified age selection, profiles and class entry.
Age/class mobile client and content widths375/375 at390 override; age screenshot
inspected. Viewport reset. Full toddler/story/high-five and real workout browser
runs not performed this pass. Fixture test-yaagvi-rollout.html has no production
account writes and is not a production build entry.

Supabase project list checked again: still empty. R01/R05/R06 database authority
and concurrency work not resolved; existing connection request remains pending.
No emails sent, no profile data changed, no DB migration.
Production deployment completed: https://b4414578.bloom-juniors.pages.dev.
Custom domain https://bloomjuniors.com/ serves /assets/main-DHeaThVY.js;
downloaded live JavaScript SHA-256 matches the tested local dist asset.
Remaining next fixes inspected but not implemented: junior GamesModule same-game
replay completion guard and Other Games navigation (R14); companion repeated
hidden-answer spending (R19); treasure power clicks awarding XP (R20); invalid
inline quiz gradients (R15). Full commercial mandate is not complete.

## Production release verified - 2026-09-06

User explicitly authorized implementation and pushing to live production. This
is an incremental release, not completion of the whole commercial mandate.

New work in this pass:
- Newly generated 3D-style rendered reaction frames replace the reused wave clip.
  Wave, thought, applause, celebration; point/read reuse thought, dance uses
  celebration. Raster sprites, not a rigged 3D model or lip sync. Cream background;
  source/limitations/prompt in art/yaagvi/README.md. Atlas 171886 bytes. Motion
  stops after each reaction and respects visibility/reduced motion.
- Public meet-yaagvi.html mini adventure, linked from landing hero, no account,
  no saved progress, three counting discoveries and real-world parent prompt.
- R04 shared visibility timer callbacks pause/resume rather than being discarded
  on hide. Covers ShapeWorld, BodyParts, PlanetWorld, FunExercise tracked delays;
  does not repair every separate game timer implementation. Four scheduler tests.
- R26 actual login/recovery handlers recover from thrown callbacks (two tests).
- R09 Stripe webhook responds503 on failed/missing-row writes so Stripe retries;
  sixteen mocked tests cover four event types and DB/network failures. Event
  ordering/idempotency and live Stripe verification remain outstanding.
- R13 partial: removed forced controllerchange reload and changed PWA to waiting
  updates. No dependency upgrade or production dev-proxy remediation in this pass.
- Weekly recap sentence repaired. Prior score/routing/date/billing auth fixes
  remain included in the release build.

Verification: 323-test full suite passed; two subsequently added login/recovery
handler tests also passed (325 total across runs). Final build/PWA passes: main
assets/main-DskFeHh4.js 905.50kB /258.40kB gzip,56 precache entries. Existing bundle
size warning remains. Compiled demo completed all3 questions in Edge, wrong answer
and tap-to-count verified in dev. Mobile390 viewport content/client widths375/375,
finished layout screenshot inspected. New gesture frame changes observed through
rendered DOM styles and applause visible in browser screenshot. Full animation
smoothness/physical-device/reduced-motion browser emulation not signed off.

Cloudflare project/access and production secret NAMES verified, no secret values
printed. Final deployment: https://54afe73b.bloom-juniors.pages.dev (production main).
Live main bundle: assets/main-ms3l_vsh.js,905.50kB/258.39kB gzip;57 precache entries.
Custom-domain main bundle SHA256 matches local build. New atlas SHA256 also matches.
Live portal and checkout unauthenticated requests return401; no billing sessions
created. Previous production: e23daa7f-059a-43fa-a9f2-477d7b7a37bd. Intermediate release
a647b842 superseded by54afe73b to add direct demo delivery.

Public demo: https://bloomjuniors.com/blog/meet-yaagvi/ . The root /meet-yaagvi alias
can be intercepted by an older installed service worker and show the old home.
The /blog/ path is deliberately excluded from the old navigation fallback, and
was verified in that same affected browser. Landing hero links to the direct path.
Full three-question production demo completed in Edge tab1492024330; one browser
command timed out on question3, then a fresh state read and retry completed it.
The live tab is marked deliverable. Older active app tabs retain old code until
closed/reopened because forced mid-session reloads were removed. This is deliberate.

No database migrations or actual billing sessions performed. Supabase connector
lists zero projects; user asked asynchronously to connect the owning account. R01
remains unresolved/unverified, not a security sign-off. Full audit and remaining
P1 curriculum/save/authorization issues remain open. True rigged3D animation and
lip sync remain unimplemented; this release is generated raster gestures.

## Latest implementation and verification ? 2026-09-06

Local changes only; nothing deployed in this pass. Full review and commercial
readiness remain incomplete.

- R03: eight Junior modules now accumulate first-attempt scores between questions.
  24 tests execute the actual handlers with retry and duplicate-tap cases. These
  are handler contract tests, not React DOM tests. Browser Science Plants run
  completed 3/3 (Chrome tab1966118847, local test-ks2-modules fixture).
- R27: first-mission, starter-path and weekly-chapter destinations survive both
  daily curriculum gates; session and premium locks remain enforced. 13 tests
  connect the actual routing handlers. Full authenticated browser routing retest
  is still outstanding.
- R02: portal and checkout verify Bearer tokens against Supabase auth/v1/user;
  account ID and checkout email come from the verified account. Cross-account
  body IDs are rejected. Client sends its session token. Auth outages fail closed;
  billing responses use no-store. All 14 mocked endpoint tests failed before the
  fix and pass afterward. No live Stripe or deployed auth verification performed.
  Checkout now also requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY at runtime.
  R01 privileged guardian field permissions remain an independent release blocker;
  do not call billing fully secure until those permissions are verified/fixed.
- Rejected SVG is no longer rendered by YaagviCharacter. Original 3D-style image
  restored; existing eight-second wave clip plays once for the wave state, with
  static fallback, offscreen pause and reduced-motion handling. Other poses remain
  static. This is an interim identity restoration, not a completed animated 3D rig.
  The video has a grey rendered background; no editable 3D model was found.
  Updated preview: http://127.0.0.1:5174/test-living-mascot.html. Attempt to inspect
  the revised preview timed out and reset CUA; new video rendering remains unverified.
  Historical SVG preview verification below does not apply to this replacement.

Validation: 303/303 Node tests pass; production build and PWA pass. Main entry
907.09 kB minified /259.18 kB gzip; existing >800 kB warning remains. Diff whitespace
check passed. Next: R01 database privilege protection, remaining P1 reliability and
curriculum issues, complete browser coverage, matching 3D animation assets, then
reviewable release. Acquisition and funding outcomes require real parent validation.

## Commercial execution mandate — 2026-09-06

### First animated character implementation — local

**Rejected by founder:** the new SVG does not resemble Yaagvi sufficiently and
must be3D. Do not deploy or treat this2D direction as accepted. Preserve the
original3D character identity, face/pigtails/outfit/proportions. Sep6 asset check
found `public/yaagvi-3d-wave.webm`: eight seconds,640x360 VP9, alpha_mode metadata1.
Extracted frames show actual waving/pose changes matching the existing3D poster.
Standard ffmpeg decode shows grey background and a corner sparkle; browser alpha
rendering/quality still needs checking before integration. No .glb/.gltf/.fbx/
.blend/.obj authored model found in repository search. Existing asset is a rendered
clip, not an editable3D rig; do not promise free pose control or lip-sync from it.
The rejected SVG was replaced in the latest pass above; the following records its historical implementation.

Founder explicitly requested real character animation, authorized removal of weak
games, and asked to start building. Shared YaagviCharacter now renders an original
articulated SVG character via YaagviRig rather than swapping/bouncing PNG poses.
Independent head/arms/eyes/pigtails, blink/breathing, finite wave/clap/celebrate/dance
gestures, thinking/point/read poses, optional speaking mouth motion. Home speech
state is wired; this is not phoneme lip-sync or3D. Offscreen/document-hidden motion
pauses; CSS respects reduced motion. Home mascot no longer hidden on mobile.
Existing game reaction integration retained; shared number-only greeting corrected.
Other direct img usages (e.g. collectible companions/story assets) are unchanged.

Removed Magic Memory and Fruit Slice from ARCADE_GAMES child selection/rotation:
review showed unplayed-board credit and zero-input reward respectively. Their
internal components and saved arcadeLevels remain for repair/history; no records
deleted. Other games still have known review findings; this is not a quality
sign-off for the full catalogue.

Preview: `http://127.0.0.1:5174/test-living-mascot.html`, Chrome tab1966118843.
The isolated server remains running. Browser checked initial wave, think/talking,
and connected Answer found -> clap with visible feedback; computed DOM styles
confirmed yr-talk and yr-clap-left. At390 viewport client/scroll widths375/375,
no horizontal overflow. Corrected hidden raised hand by arm layering/angle changes.
252 tests passed. Production build passed with existing >800kB entry warning;
final cleanup build and PWA packaging also passed (main entry912.55kB minified).
Viewport override reset and preview tab marked for handoff. Physical-device audio, reduced-motion emulation and
all activity/browser combinations are not yet verified. No deployment.

The founder now explicitly wants commercialization, thousands of users and a
funding case, with Codex covering architecture, development, product and marketing.
This supersedes the audit-only sequence below: fix confirmed defects while
continuing targeted verification. The whole review is still incomplete.
Canonical operating plan: `docs/COMMERCIAL_EXECUTION_PLAN.md`.
Proposed first target:1,000 monthly active families, paying families/schools
reported separately. Founder then clarified few UAE contacts, no reported interest
from kids-group sharing and no replies to school/nursery pilot emails. Acquisition
must not depend on a warm UAE network. First seek five remote parent conversations
around ages4–6 English-language learning; UAE-only recruitment is no longer assumed.
Nursery outreach secondary; do not expand unanswered batches. See
`marketing/07-acquisition-reset.md`. Market, budget and founder time questions
pending. Assume no paid spend. Preserve existing free-access promises.
Prepare recipient-specific outreach for approval; no new messages sent.

First bounded patch: R28 completion dates now use formatLocalDate, matching
foundation assignment/gate dates. New `tests/wonder-local-day.test.js` launches
isolated timezone checks; before fix Dubai/Los Angeles/London failed, UTC passed.
Full Node test suite passed252/252, including all four timezone regressions.
Scoped diff whitespace check passed. No deployment, data migration or retrospective
date repair. Existing incorrectly dated history remains unchanged.
Next engineering priority is authorization/billing boundary remediation (R01/R02),
with deployed-state checks and isolated cross-account tests; then scoring/save/
routing fixes and trusted metrics. Release gates and family-pilot milestones are
defined in the commercial plan; growth/funding are not achieved or guaranteed.

## Live Admin/Feature Review - In Progress, 2026-09-05

**Current execution state:** local Chrome review tab 1966118839 is at
`http://127.0.0.1:5174/test-account-review.html`.
New live tab1966118840 restored HookUAT on Sep6 (Dubai); now back at child home.
Sleepy mood selected. Chapter2 Number Gate launched Star Catch twice, through
Start then Continue; actual word rounds confirmed but unanswered. R27 traces
Dashboard's daily gate silently substituting destinations. Sunset day2 completed
live, saved2/28 discoveries (7%), Sprout unlock dismissed, saved lesson reopened.
Immediately enabled day3 bridge prediction; left unanswered. R28: UTC completion
date conflicts with local-day assignment/gate overnight (clock Sep5 21:22:57 UTC,
Sep6 Dubai). Home now2 active learning days,8 Bloom Coins,chapter1/7,Learn0/2.
Settled home76 stars (correct +3),8 Bloom Coins; tab marked for handoff.
Timer4:35 on final check; do not assume still unlocked.
Browser input remains slow; inspect state before retrying timed-out actions.
The isolated review server restarted (exec session 66409, port 5174). Its test-only
query transform exports five otherwise internal arcade components without product
source edits. New classroom and arcade review fixtures are untracked review files.
Times Tables completed timed 2-times at 6/10 with timeout support and untimed
11-times matching at 6/6; matching retry incorrectly starts timed mode. Shop payment
and change passed locally, but coin bonuses did not update saved progress. Art
fill/save and duplicate-reward prevention worked; background selection erased
colouring, duplicate saves filled gallery slots, and a blank replacement canvas
received a carried-over reward. Workout skipped five middle exercises but still
reported all eight complete and awarded 8/8 with five stars. Details are in the
live review ledger. Science sky inquiry saved and unlocked the next lesson;
anatomy and planet quizzes each correctly reported 7/8 after a wrong/retry answer.
Ganesha story and quiz completed at 2/3, two stars; saved completion precedes
reward callback. Tricky Words completed 12 rounds but gave 12/12 after one retry.
Sound Buttons completed all six words, reported 6/6 despite a picture retry.
Remaining maths modes had individual model/answer/transition checks. Flash Count
feedback tested; preview too brief for controlled counting over this connection.
Shop two-bonus cap verified. Shape Quiz completed all 18 at 16/18 with six stars;
2D emojis used for 3D solids and stacking wording need revision. Wonder World
garden harvest/plant/play/firefly quest/equipment/room treasure tested with local
reload persistence. Ordinary Dream Build locked correctly after two stages;
separate synthetic 180-star fixture completed six stages and all six skyship trips.
Full souvenir set unlocked memory game; wrong/retry tested, successful timed run
still unverified. Egg hatched and dragon equipped. Toddler treehouse and junior
headquarters each completed six stages and their first trip. Mobile world/modal
layout checked at 390x844; material labels clipped. Viewport override now reset.
Completed project illustrations omit saved choice inputs (source-established).
Companion frame checked help charges, XP, equipment, replay and map callback.
R19: repeated help spends charges on the same faded answer. R20: helper taps earn
uncapped XP without learning. Event fixture completed ordered four-module telescope
quest, rejected out-of-order advance, awarded compass/12 dust and opened route 2.
These are local fixtures, not live-cloud integration. Public schools/pilot/curriculum/
privacy inspected; signed-in school setup CTA returned child home (R22). Classroom
fixture tested Today/Week/Insights/termly content, lesson editor, import parser,
navigation callbacks and downloaded CSV. Completed status incorrectly counts any
two sessions despite unfinished assigned lesson (R21). Teacher test-account question
pending. All five rotating arcade components now have local mechanical checks:
Shadow Match completed 10/11, Balloon Burst 12/13; Rocket Count reports perfect
5/5 despite a failed launch. Magic Memory skipped its middle board and credited
unplayed pairs (R23). Fruit Slice idle run awarded three stars for zero input;
controlled slicing remains unverified. Early Piggy Bank completed 5/5 after a
retry and retained stale feedback between questions. Capitals completed 7/8 with
one wrong/retry and three stars, but repeated countries (only four unique).
Flags first answer advanced; matching pictures/answer-bearing alt text reduce
assessment value. Europe currency quiz question 3 rejected Euro for Germany while
accepting an identical second Euro button (R24: country-identity comparison plus
duplicate currency values). Reproduced for Ireland/Malta/Netherlands too. Final
UI/callback 4/8 and two stars despite eight correct displayed initial answers.
Previous History run ended at question 2 (Magna Carta), score 1. Quiz silently
expands to global pool when region has fewer than four events; full run pending.
New local run completed all seven Home to World discoveries, 7 updates/7 awards,
16 stars. Draft lost on day 3 back/reopen;
completed review hides selected prediction/reflection and the final artifact is
seven generic saved captions despite timeline choice (R25). Four journey source
files received full-file reading; cloud/reload/audio/mobile not verified here.
Continued into junior fractions played=5 mixed twelve-question run. All twelve
answers correct, diagrams visually checked, callback still 1/12 (R03). Grammar
twelve correct also 1/12; Enter on highlighted word fails while pointer works.
Word Problems one wrong/retry plus seven independent successes reported 1/8;
hint works, worked solution disappears automatically after 2.2s. Junior geography
twelve correct also 1/12; current tab at its callback result. All four module
source files fully read. New account fixture password-enabled via test-only transform;
local callbacks only and scoped synthetic invite/roster responses. Registration
validation/failure/success, full-login rejection, quick PIN, account toggle and PIN
reset failure/success tested. Injected login/recovery exceptions leave loading
buttons permanently disabled, including after PIN reset return (R26). No real
accounts/messages/credentials changed. Current fixture returning-parent mode has
toggled to full login; subsequent teacher creation validation/reject/retry/success
passed locally. Valid synthetic invitation prefilled locked email and submitted
schoolId/toddler class; API503 instead said Invite not valid with no Retry.
Class empty/short normalization/failure recovery/Enter lookup/pupil selection/change
code checked with two synthetic pupils. Parent/teacher mobile390x844 no horizontal
overflow; teacher PIN fields unnamed, faint copy and clipped example. Viewport
reset and tab1966118839 marked for handoff; current valid-invite form. Fraction diagrams
unnamed in accessibility tree; blank character speech box after reaction expires.
Source currency entries
Bulgaria/Zimbabwe outdated; primary-source
evidence recorded in audit. Full review open.
Do not replace missing UI verification with source
claims. No product fixes/deployment; age/restoration approval questions still pending.

Historical review instruction required hands-on authenticated review before fixes.
See `docs/LIVE_FEATURE_REVIEW_2026-09-05.md` for coverage and observations; most
features remain pending. The Sep6 commercial mandate above now permits remediation
alongside the remaining review.

- Connected Chrome restored a founder/admin session; `/founder` successfully
  displayed real aggregate reports. 41 login accounts, 34 saved families, 43
  child profiles, 13 activated families / 16 activated profiles; displayed D1
  2/16, D3/D7 0/16. Counts have historical coverage limitations. This review's
  session opens may affect today's activity.
- Founder filters, refresh, exit, campaign review/cancel tested. No emails sent.
  90d selection showed a 90-day label with only 30 displayed dates.
- Existing HookUAT profile used for one live counting completion; Yaagvi's real
  achievements were not used for learning tests. HookUAT now has one completed
  maths session (9/10), 14 total stars, one coin, starter 1/7. Reminder declined.
- Live defect reproduced twice: Start Sound Pop opens Number World. Completing
  maths advances the nominal Sound Pop starter step; next card offers maths again.
  Next-destination copy differs between completion and reminder setup.
- User confirmed this is a test account and provided the parent credential; PIN
  unlock succeeded. No credential is stored here. Six Parent Zone tabs inspected;
  Phonics challenge saved, star sticker awarded, high-five delivered and claimed.
  Foundation preview-all and a QA note were saved; verify enforcement/persistence
  then restore original preview setting and empty notes (see live review ledger).
- HookUAT bought and equipped Sunny Cap with its earned coin; balance now zero.
  Reload retained stars/starter progress, restarted the session timer and changed
  displayed streak from one to two. Parent shows a different coin total. These
  discrepancies and unnamed settings toggles are recorded for investigation.
- Active Chrome tab is the learning review. Admin access does not establish a
  school-admin session. Full activity, age-group and teacher coverage remains open.
- Continued live tests: One More 10/10, Home to World day 1, six shape teaching
  cards and tower wrong/retry/success. HookUAT reached 28 stars, two coins, starter
  4/7; Match Up in progress. Sound Pop step 3 incorrectly opened Home to World.
  Country library filtering/expansion checked; remains mounted after navigation.
- Foundation test preference/note and challenge persisted. Automatic approval
  review blocked restoring original settings and temporarily changing HookUAT's
  age; explicit async questions for both are pending. No bypass or age change.
  Details and content-design issues are in the live review ledger.
- Latest live progress: HookUAT completed all seven starter steps, one Lost Sound
  chapter, personalized five-page story, Puzzle Quest level 1, Match Up 6/6 after
  timer interruption lost its first board, Inventor Blocks and Big Bloom Quiz 6/7.
  Daily dolly treasure claimed/equipped; 70 total stars and six coins. Two ambiguous
  Sound Pop answers rejected then retried; phonics says 10/10 with sixteen stars.
  Parent reports 100% phonics accuracy despite recording the two wrong attempts;
  the Phonics challenge is correctly marked completed. Leaf inquiry completed and
  saved to Wonder Book (1/28); timer interruption previously lost its prediction.
  Full review remains open.
- Isolated browser component review now runs at 127.0.0.1:5174 using
  `scripts/live-review-server.mjs`: env files disabled, no production API proxy,
  external connections blocked. Toddler colours wrong/retry scored 3/4; animals,
  fruits, body parts and numbers scored 4/4 each in visible callback panels.
  Shapes and alphabet also completed 4/4. Toddler quiz displayed and emitted 4/5
  after one deliberate error; its intro has a severe contrast problem from invalid
  inline gradient syntax. All eight toddler activities have local completed runs.
  These are local component results, not live account/cloud verification. Wider
  age/activity coverage continues using extended local fixtures. Animal/fruit/
  body-part answer cards are text-only, a concern for non-reading 3–4-year-olds.
- Stale activity/completion screens confirmed visibly stacked during navigation;
  clean reload clears them and preserves completed progress. Today's arcade rotation
  locks five games; no rotation/date bypass. Pending age/restoration approvals remain.
- Continue from the feature checklist and actual browser state. Do not call the
  full live review complete, and do not substitute source checks for gameplay.
- Junior reading local run confirmed R03: all four Clever Fox answers correct,
  but UI and completion callback report 1/4. Passage review preserves position;
  retry/navigation work. Broader junior coverage continues in the extended
  `src/test-ks2-modules.jsx` fixture. No product remediation or deployment yet.
- Junior spelling typed run also confirmed R03: nine first-attempt successes and
  one supported correction produce 1/10 UI/callback. Word Match correctly produces
  4/5 after one wrong pairing. All four reading passages read; volcano explanation
  needs wording correction supported by USGS links in the live review ledger.
- Junior Science Plants emitted 1/3 for two first-attempt successes plus one retry;
  World Faiths Islam emitted 1/4 for four correct answers. All five science topics
  sampled, all five faith introductions and four Hindu stories read. Story review
  found Ravana/Maricha error and insufficient sacred-narrative/science distinction.
  Evidence and sources recorded. Game Zone and remaining junior/early/shared/public
  coverage remain open. Keep pending production age/restoration approvals pending.
- Junior arena Word Builder completed 95/100 after one mistake; Sky Tower115/120
  after one mistake. Both apply penalties only at end and label points as correct.
  Other Games restarts Sky Tower; perfect replay reaches120 but never completes or
  emits a new result. Source completion guard only resets on changed game. Continue
  arena's remaining four games and the broader checklist; full review still open.
- Memory Vault completed140/200 in12moves. Quest Dash first end25/150; replay100
  failed to submit, confirming guard failure. Maze controls/gems/damage and loss20/340
  verified; fullwin and controlled Quest Dash gameplay remain unverified. Championship
  firstanswer interrupted by browser disconnect. Code audit now includes R14 replay,
  R15 invalidgradients and R16 curriculum corrections with source references.
- Championship recovered and completed7/7 (France capital repeated); Golden Chest
  showsfive stars, arena callbackscore7/total7. All six arena games exercised with
  documentedlimits. Next: remainingjunior maths/money and broader early/shared/public
  coverage; fullreview remainsopen. No fixes or production deployment yet.
- Junior Piggy Bank completed 4/5 with a corrected coin deposit and one skipped
  wrong choice. Replay reset and coin removal verified. Feedback/skip button remain
  stale across rounds because nextRound does not clear feedback. Times-table modes
  and broader early/shared/public coverage are next; full review remains open.

## Repository-Wide Review - 2026-09-05

Review completed for the current local tree; findings are not yet fixed or
deployed. Read `docs/WHOLE_CODEBASE_REVIEW_2026-09-05.md` before the earlier
retention release plan below. This review supersedes its immediate next steps.

- Coverage: 465 text files inventoried; 368 code files structurally parsed and
  checked; 58 files received focused tracing of selected critical paths. The
  exact file/depth/hash ledger is `docs/CODE_REVIEW_COVERAGE_2026-09-05.csv`.
  This is not a claim of a manual line-by-line audit of every file.
- Immediate security blockers: guardian owner-write RLS permits assigning school
  authority and billing fields under the checked-in policy model; billing portal
  trusts a caller-provided account UUID without authenticating its owner.
  Production grants, policies, and deployed handler exposure remain unverified.
- Browser-confirmed learning defects: perfect junior quizzes score 1/12 in
  fractions, grammar, world map and 1/8 in word problems; the missing accumulation
  pattern also exists in reading, spelling, science and spirituality quiz paths.
  Shapes can remain locked after hide/resume during feedback (simulated lifecycle).
- Mocked reproductions confirm arbitrary-recipient email sending, webhook success
  after a failed DB write, offline award undercounting, truncated original session
  history, and reminder jobs overwriting a concurrent child award.
- Further findings cover shared class credentials, parent reset, retention cohort
  drift and stale definition text, missing toddler/junior durations, and delivery
  safeguards. The report includes fixes and verification requirements.
- Current verification: 248 existing tests and production build pass; four
  complete-quiz browser reproductions and one interruption reproduction run.
  Passing the existing tests does not establish launch readiness. Main entry still
  approximately 912 kB minified. Dependency audit: 22 affected package entries;
  production-only audit retains one high transitive `ws` advisory, with runtime
  reachability unverified. No dependencies were changed.
- Evidence tools: `scripts/review-reproductions.mjs`,
  `scripts/review-browser-reproductions.mjs`, `scripts/review-inventory.mjs`.
  Reproduction assertions intentionally confirm present defects; convert to
  desired-behavior regression tests when fixing them. Browser requests to APIs
  and external hosts were blocked. No real billing/email actions were taken.

Next: repair server authority and expense-abuse boundaries, scoring and quiz
recovery, then atomic progress writes and durable measurement. Inspect live
configuration to establish exposure before any containment action. Do not treat
the prior passing retention UAT as clearance to release the combined tree.

## Local Retention Audit and Improvements - 2026-09-05

Status: implemented and verified locally; not deployed. The Production section
below continues to describe the last recorded live release. Full assessment,
official competitor sources, P0-P3 roadmap and limitations:
`docs/RETENTION_AUDIT_2026-09-05.md`.

- Early starter phonics/maths now bypass the secondary chooser and use five
  questions. Phonics starts with an introductory sound set; later starter maths
  advances from counting to one-more. Regular free-choice entry stays available.
- Parent summary now matches the child's seven-step starter assignment, shows
  its learning purpose, and suggests a relevant offline conversation.
- Sound Pop no longer constructs duplicate correct words from overlapping banks;
  distractors conservatively exclude target/equivalent sound spellings.
- Maths shows round progress and guided Back returns to the journey.
- Activation activity-start moved from dashboard tap to rendered activity frame.
- Browser events use exact D1/3/7/14/30. Founder includes D14/D30, and its cohort
  origin is earliest recorded open/completion rather than first completion only.
  Open-only children are now eligible. Same-day activation remains tied to actual
  completion. This definition change must be disclosed in comparisons with the
  August readout. Bounded historical event storage still limits original-date
  certainty.
- All 248 unit tests pass. Guided starter browser UAT passes at 390 and 1440px,
  with five-question completion once, unchanged regular choosers and activation
  start deduplication. Three-age journey/mobile UAT passes with parent alignment.
  Founder desktop/mobile privacy/feedback UAT and the production build pass.
- Main built entry remains approximately 912 kB minified / 260 kB gzip; additional
  code splitting remains worthwhile. No retention uplift or speed gain is proven.

Next: obtain an authenticated current founder readout, release the verified
changes through the existing Cloudflare flow when authorized, and observe new
eligible cohorts. Exact per-question interruption recovery needs versioned
checkpoints and atomic completion deduplication before a resume promise can be
made. Durable attempt/session reporting and progressive parent setup are the
next implementation priorities. Do not add more currencies or content destinations
before addressing those frictions. No fresh live retention data was available
because the browser was not signed into the founder account.

## Product Direction

Bloom Juniors is for children ages 3-9. Its purpose is not only to provide games,
but to build strong foundations that help children understand language, maths,
science, people, history, culture, values, systems, and the world around them.

The current product priority is retention. More content is not the immediate
answer. Children need one understandable reason to return, continuity from the
previous visit, meaningful rewards, and visible parent value.

Product principles:

- Give the child one clear next action.
- Continue from where the child stopped.
- Do not punish missed days or create anxiety around streaks.
- Connect learning into stories, investigations, projects, and conversations.
- Make learning feel physically alive: use depth, character reactions, and
  meaningful animation to show cause and effect, not as decoration or an answer
  giveaway.
- Show parents useful evidence near the top of the Parent Zone.
- Measure whether changes improve real Day 1, Day 3, and Day 7 return.

## Production

- Custom domain: https://bloomjuniors.com/
- Cloudflare Pages project: `bloom-juniors`
- Latest deployment: https://54afe73b.bloom-juniors.pages.dev/
- Latest verified main bundle: `assets/main-ms3l_vsh.js`
- Previous pre-release toddler bundle: `assets/ToddlerApp-mX2cnPiu.js`
- Previous pre-release Number World bundle: `assets/NumberWorld-DMy_zx10.js`
- Previous pre-release junior bundle: `assets/KS2App-BIfuYxvw.js`
- Previous pre-release Sound Pop bundle: `assets/SoundPop-DdNpiH7U.js`
- Previous pre-release founder bundle: `assets/FounderDashboard-3VeS1NGn.js`
- Cloudflare deployment command:
  `npx wrangler pages deploy dist --project-name bloom-juniors --branch main --commit-dirty=true`
- Business email routing and sending verified on 2026-08-11:
  - Cloudflare Email Routing forwards `sanju@bloomjuniors.com` to
    `sanjuveed@gmail.com`
  - Gmail can send as `Sanju | Bloom Juniors <sanju@bloomjuniors.com>` through
    authenticated Gmail SMTP
  - `sanjuveed@gmail.com` remains the default sender for new personal messages
  - replies use the address that originally received the message, so replies to
    Bloom mail come from `sanju@bloomjuniors.com`
  - the dedicated app password remains only in Google/Gmail and is not stored in
    the repository or this handoff

Never store Cloudflare, Supabase, Azure, email, or push credentials in this file
or in source control. Authentication must come from the configured environment.

## Latest Retention Readout

Founder Dashboard review on 2026-08-11 at 10:55 Asia/Dubai:

- 38 real login accounts, 31 saved parent setups, and 31 profile families
- 12 real families completed a first mission: 39% of saved profile families,
  up from 11 of 30 in the previous review
- exact Day 1 return is 2 of 15 eligible profiles (13%); Day 3 and Day 7 remain
  0 of 13
- the tracked first-session cohort since 2026-08-06 has 3 profile creations,
  3 activity starts, and 2 activity completions
- the largest current loss remains 19 families between profile creation and
  first-mission completion
- 2026-08-10 recorded 5 active profiles and 12 completed activities; 2026-08-11
  currently has 1 active profile and no completion
- the first durable ChatGPT acquisition record completed a first mission and
  returned on Day 1, but one account is not enough to judge source quality
- reminders are not yet proving a return loop: 3 profiles enabled reminders,
  3 received one, and 0 opened from it
- the new content-specific depth release is too recent and the cohort too small
  to attribute a retention change. Hold major feature work and re-read the same
  metrics after at least 72 hours; investigate the incomplete first activity as
  the next product problem if the 67% tracked completion rate persists.

## What Is Live

### Public Website

- Compact redesigned landing page
- Current five-petal Bloom flower favicon and PWA icon set, published under
  versioned `bloom-v3-*` filenames to bypass stale browser and service-worker
  icon caches
- Improved first-load presentation and animation treatment
- Founder story strip and founder story entry point
- Updated Schools page using the new visual system
- Corrected hero and founder-section clipping/alignment issues

### Child Experience

- Mobile dashboard and profile navigation:
  - toddler, early-years, and junior dashboards keep a visible `Switch child`
    action in the header instead of hiding it at phone widths
  - the selected child can always return to profile selection without entering
    the Parent Zone
  - toddler and junior headers reserve the iOS PWA safe area and suppress
    duplicate reward counters on narrow phones
  - the junior full-map briefing is compact on phones, its four modes use a
    stable two-column selector, and inactive destinations become icon-only so
    fourteen labels no longer collide
- Shared interactive depth across wrapped learning modules:
  - every toddler, early-years, and junior game using `AdventureModuleFrame`
    receives a short perspective stage entrance
  - marked answer controls have physical elevation, downward press travel,
    correct-answer lift, and supportive retry recoil
  - the shared treatment preserves each module's existing logic and does not
    reveal answers
  - reduced-motion preferences disable the stage and feedback animations
  - Sound Pop retains its richer content-specific 3D blend and map scene
- Content-specific interactive depth for the next three age-band lessons:
  - toddler Number Play turns each countable picture into a tactile object;
    children tap objects one by one and receive visible count-order markers
    before choosing the number
  - early-years Number World lets children physically join addition groups and
    move subtraction objects away without revealing the answer
  - junior Grammar Grove presents sentence words as blocks; the highlighted
    word can be tapped or dragged before the child identifies its grammatical
    job
  - each model keeps the original question, scoring, and adaptive flow intact,
    and all answer decisions remain with the child
- Age-specific experiences for toddler, early years, and junior children
- Sound Pop phonics and blend flow with spoken instructions and replay controls
- Sound Pop 3D learning pilot:
  - `map` is the first guided Sound Buttons word, followed by the existing
    varied word pool
  - sound tiles have stable tactile depth, pressed states, and a physical joined
    blend state while preserving pure phoneme audio
  - the automatic `Which picture is "map"?` question remains the decision point;
    the 3D map cannot appear before the correct picture is selected
  - the correct answer opens an interactive-looking 3D map scene with the
    segmented and whole word visible
  - touch targets remain geometrically stable while separate glow rings animate
  - repeating motion respects the operating-system reduced-motion preference
- Universal completion celebration:
  - Yaagvi remains visible on phones and celebrates beside a polished treasure
    reveal
  - the real score, saved reward, world change, and next existing activity are
    staged in one short, skippable sequence
  - toddler, early, and junior copy remains age-specific
  - session timer and guide overlays are suppressed during the full-screen reveal
  - no background speech or music starts automatically
- Number World supportive retry flow:
  - a wrong choice receives a brief amber `Try again` state instead of a large
    red failure state
  - the same question unlocks again after 850 ms
  - a worked visual hint appears after two consecutive wrong attempts
  - first-try success remains the source of stars, accuracy, and adaptive
    difficulty
  - sessions separately retain `firstTryCorrect`, `supportedCorrect`, and
    `completedCorrect`, and Parent Zone identifies answers completed after
    support
- Personalized balanced daily learning recommendations
- Seven-day Bloom Adventure with persistent chapter continuity
- One Daily Learning Journey on the main dashboard:
  - seven-day chapter
  - two learning stops
  - optional Wonder
  - earned treasure
  - one primary next-action button
  - seven-day activity rhythm
  - no missed-day penalty
- Foundation Season with 28 connected discoveries
- Foundation Season Map and permanent completion artifact
- Science Investigation Path:
  - four connected trails
  - sixteen investigations
  - Predict, Model, Evidence, Explain, Connect flow
  - trail badges
  - Science Field Journal
- From Home to the World:
  - seven connected discoveries spanning maps, neighbourhood systems, UAE city
    water, perspectives on place, family roots, historical sources, and change
  - age-specific toddler, early-years, and junior depth
  - prediction or claim, evidence inspection, explanation, and offline field task
  - sequential unlocks without a calendar gate or missed-day penalty
  - permanent My Place Story artifact after all seven discoveries
  - existing flags, capitals, countries, and timeline quizzes retained as a
    secondary Country Library
- Existing science Question Library retained with corrected explanations
- Wonder World, daily treasures, companions, projects, and ongoing rewards
- Avatar Workshop retention loop:
  - the first successful completion of each different activity per local day
    awards one Bloom Coin
  - replaying the same activity that day does not award another coin
  - Bloom Coins are spendable and remain separate from learning stars, XP, and
    daily-journey treasures
  - seven cosmetic items can be unlocked and equipped in persistent head, face,
    back, badge, and effect slots
  - every age-band dashboard has a visible coin balance and workshop entry
  - the award and purchase ledgers merge across devices
  - there are no real-money purchases, random rewards, expiring items, or
    missed-day penalties
- Web push notifications and test notifications are working after permission is
  granted by the browser
- Registration now continues directly into the child's first learning
  adventure. The app establishes the authenticated local session during signup,
  waits for the child profile to persist to Supabase with bounded retries, and
  then selects that child without requiring a second login.
- First Mission Return Loop:
  - reminder setup no longer interrupts a child before learning
  - the first completed mission previews a specific reason to return tomorrow
  - after continuing home, a grown-up can unlock reminder setup with the family
    PIN
  - email reminders work without installing the PWA or granting browser
    notification permission
  - phone push remains an optional second channel
  - reminder preferences and dismissal state persist locally and in cloud
    progress, so the prompt is not repeatedly shown
  - reminder email and push actions deep-link into the personalized next safe
    learning module rather than the general dashboard
- Seven-completion starter path:
  - a child with no completed learning skips the optional mood check-in
  - the first seven completed learning activities use one focused,
    age-appropriate action instead of the full dashboard, with a single large
    start action and spoken replay control
  - every starter action opens an existing activity directly without the extra
    module-arrival confirmation screen
  - a visible seven-step path persists by completed sessions, not calendar days,
    so missing a day never removes progress
  - the age-specific sequence uses only existing free learning modules; it does
    not add curriculum, games, or currencies
  - each completion shows progress and previews the exact next existing activity
  - after the seventh completion, the normal Daily Learning Journey returns
    unchanged
- Treasure Room mobile presentation:
  - full-screen room content respects the iOS top and bottom safe areas
  - the global session timer and learning guide are hidden while the room is
    open, preventing them from covering Back, game, and collection controls
  - all five collection filters fit the phone width without clipping
  - living treasure cards use their stable poster image instead of layering a
    WebM over it, avoiding the black video rectangle seen in iPhone Safari

### Parent Experience

- Important progress information is surfaced near the top of the Parent Zone
- Today's Journey summary includes:
  - today's completion status
  - assigned learning stops
  - Wonder status
  - seven-day chapter progress
  - seven-day activity rhythm
  - a suggested parent conversation
- Weekly learning story
- Foundation Season summary
- Science Field Journal and recent investigation evidence
- My Place Story progress, next connection, offline task, and parent conversation
- Foundation coverage and parent preference controls
- Notification controls and test notification action

### Data and Analytics

- Progress persists locally and merges with cloud progress
- Science investigations, Home to the World, weekly story, Foundation Season,
  rewards, and other persistent systems have cloud merge support
- Durable retention telemetry records profile opens, journey actions, and one
  idempotent journey completion per local calendar day
- First-touch acquisition tracking is durable for new guardian and teacher
  accounts created from 2026-08-10 onward. It stores a normalized source,
  medium, campaign, landing path, referrer host, visitor timezone, and language
  in Supabase Auth metadata. Full referrer URLs, query strings, names, emails,
  and IP addresses are not returned by founder reporting.
- `/founder` includes an aggregate Acquisition Quality section connecting each
  source to login accounts, parent setup, families with profiles, first-mission
  activation, and exact Day 1/3/7 retention. It also aggregates landing paths
  and visitor timezones. Accounts created before durable tracking remain in an
  explicit `Pre-tracking / unknown` bucket and are not retroactively inferred.
- Daily Journey events:
  - `daily_journey_view`
  - `daily_journey_primary_tap`
  - `daily_journey_step_start`
  - `daily_journey_story_choice`
  - `daily_journey_complete`
- Durable first-session activation events:
  - `activation_dashboard_view`
  - `activation_primary_tap`
  - `activation_activity_started`
  - `activation_first_mission_completed`
- `/founder` includes a sequential first-session funnel for child profiles
  created from 2026-08-06 onward: profile created, first dashboard shown, first
  activity tapped, activity started, and activity completed. Each profile is
  counted once per step, and historical profiles are excluded from this detailed
  funnel so they cannot distort the new baseline.
- `/founder` includes a seven-step starter-path funnel for profiles created from
  2026-08-06 onward. It reports the number completing each successive starter
  activity and the conversion from the previous step, using aggregate saved
  session counts without identifiers.
- A private Founder Retention Dashboard is available at `/founder` for approved
  founder accounts. It reports aggregate data only and includes:
  - new and active children
  - onboarding and first-mission activation
  - exact Day 1, Day 3, and Day 7 eligible-cohort retention
  - journey stop points
  - notification delivery, open, and learning-return performance
  - a sequential First Mission Return Loop funnel from mission completion through
    reminder opt-in, delivery, open, and resumed learning
  - a founder-confirmed one-time reactivation campaign with a preview count
  - retention by age group and module engagement
  - aggregated Day 3 and Day 7 parent feedback
- The founder API authenticates the current Supabase user on the server, checks
  the approved founder email allowlist, excludes school/classroom profiles, and
  never returns names, email addresses, or raw profile identifiers.
- The one-time reactivation campaign targets only non-school families that
  explicitly enabled email reminders, completed learning, and have been inactive
  for at least three days. It sends at most one email per family, excludes test
  accounts, records successful delivery in cloud progress, and uses a stable
  email idempotency key so retries do not duplicate delivery. Sending requires a
  second confirmation in `/founder`; deployment does not send automatically.
- Compact Day 3 and Day 7 feedback prompts appear in the Parent Zone. Answers
  and dismissals persist and merge with cloud progress.
- Avatar Workshop pilot measurement starts with the 2026-07-30 release:
  - `bloom_coin_earned`
  - `avatar_workshop_opened`
  - `avatar_item_unlocked`
  - `avatar_item_equipped`
- Workshop actions are sent to the existing non-identifying GA event bridge and
  also stored as durable, cloud-mergeable profile telemetry. Stable event IDs
  deduplicate repeat opens and equips.
- First Mission Return Loop measurement events:
  - `first_mission_return_prompt_view`
  - `first_mission_return_parent_unlocked`
  - `first_mission_return_email_enabled`
  - `first_mission_return_push_enabled`
  - `first_mission_return_prompt_dismiss`
- `/founder` includes an aggregate range-aware workshop funnel showing unique
  profiles that earned a coin, opened the workshop, unlocked an item, and
  equipped an item. It never returns profile identifiers or child names.
- `/founder` now separates registered family accounts from child profiles. The
  summary shows registrations today, total saved family accounts, child-profile
  totals, and daily registration bars without returning guardian identifiers.
- Before the 2026-08-04 release, the owner registration email was triggered
  before Supabase signup and guardian-profile persistence. Those messages were
  registration attempts, not reliable evidence of saved accounts. Notifications
  and the single welcome email now run only after signup and the guardian save
  complete successfully.
- The 2026-08-04 Auth diagnostic found that the inbox reports did correspond to
  real Supabase login creation even though the guardian table did not increase:
  one Auth account was created on 2026-08-03 and three on 2026-08-04, while no
  matching recent guardian profiles or child profiles were stored. Treat this
  as a registration-completion defect. `/founder` now reports aggregate Auth
  creation and unlinked-account counts without returning emails or user IDs.
- The registration-completion defect was traced to a concrete database contract
  mismatch: `guardian_profiles.parent_pin` is required, but the client guardian
  upsert omitted `parent_pin` even when called with `includePin: true`. Supabase
  therefore created the Auth account and rejected the guardian row. The
  2026-08-04 production fix now includes and validates the four-digit PIN for
  initial guardian inserts, rejects setup when there is no active Auth session,
  and repairs affected unlinked accounts when the parent signs in with the
  original email/password and a four-digit PIN. Routine profile edits still do
  not overwrite the stored PIN.
- The founder activation funnel is now family-level instead of child-level. Its
  stages are login account created, parent setup saved, child profile created,
  and first mission completed. A family with multiple children is counted once.
- Founder aggregation excludes obvious internal accounts using the same rules as
  the verified Supabase query: `sanju.veed+*`, addresses containing `uat`, and
  addresses ending in `@test.com`. Email addresses are used only server-side for
  classification and are never returned by the founder API.
- The 2026-08-05 database baseline contained 61 Auth users, of which 24 matched
  the explicit test/UAT rules and 37 did not. A separate join across
  `child_profiles`, `child_progress`, and `auth.users` found 14 distinct non-test
  child profiles with at least one saved learning session. This proves 14 child
  profiles used learning; it does not prove 14 distinct families.

## Latest Daily Journey Implementation

Primary files:

- `src/components/BloomAdventureHome.jsx`
- `src/components/DailyJourneyParentSummary.jsx`
- `src/utils/dailyJourney.js`
- `src/components/Dashboard.jsx`
- `src/toddler/ToddlerApp.jsx`
- `src/ks2/KS2App.jsx`
- `src/components/ParentZone.jsx`

Behavioral priority:

1. Immediately offer an earned treasure when both learning stops are complete.
2. Otherwise start or resume today's seven-day story chapter.
3. Continue the next unfinished learning stop.
4. Offer the optional Wonder after required learning and reward.
5. Open additional activities when the core journey is complete.

The treasure priority is intentional: a child who completed both activities
outside the story must not have an earned reward delayed by an unstarted chapter.

## Verification Status

At the latest verified build:

- `242` automated tests pass.
- Production build passes.
- Existing warning: the main JavaScript chunk is over the configured 800 kB
  warning threshold. It does not block production but should be addressed through
  future code splitting.
- Daily Journey browser UAT passes for toddler, early, and junior.
- Daily Journey action phases pass: chapter, learning, treasure, and Wonder.
- Mobile width and primary tap target checks pass at 390 x 844.
- Number World supportive-retry browser UAT passes `24/24` checks on desktop
  and 390 x 844 mobile, covering the amber retry state, no answer reveal,
  850 ms unlock, same-question continuity, second-mistake worked hint, and
  enabled choices after support.
- Home to World browser UAT passes the full first discovery, reward evidence,
  next-lesson unlock, toddler/junior age variants, desktop layout, and mobile
  overflow checks.
- Integrated Wonder dashboard UAT passes.
- Parent Zone entry UAT passes for all three age bands on mobile.
- Avatar Workshop browser UAT passes for toddler, early, and junior dashboards
  at 390 x 844 and 1440 x 1000. It verifies the visible balance, modal opening,
  no horizontal overflow, purchasing, equipping, balance reduction, and the
  three direct workshop interaction events.
- Founder Retention Dashboard desktop and 390 x 844 mobile UAT passes, including
  the family-level activation funnel, test/UAT exclusion disclosure, Avatar
  Workshop funnel, First Mission Return Loop funnel, reactivation confirmation,
  aggregate privacy, and parent feedback persistence.
- First-session browser UAT passes for toddler, early, and junior. It verifies
  one primary activity action, direct `first-mission` navigation, no competing
  Daily Journey action on the first screen, 390 x 844 fit, and a tap target over
  50 px high. The normal post-completion Daily Journey still passes all phases.
- Seven-step starter-path browser UAT passes for toddler, early, and junior. It
  verifies deterministic existing-module selection, direct `starter-path`
  navigation, seven stable progress markers, no competing Daily Journey action,
  and mobile width/tap-target fit at 390 x 844. The founder desktop/mobile UAT
  verifies that the aggregate seven-step funnel renders without exposing raw
  profile data.
- Sound Pop 3D browser UAT passes `15/15` checks at the iPhone 16 Plus width. It
  covers opening instruction speech, pure `/m/ /a/ /p/` requests, replay,
  physical blending, automatic picture speech, no early answer reveal, the
  correct 3D map reveal, Word 2 auto-instruction, mobile overflow, and reduced
  motion.
- The toddler counting, Number World join/split, and Grammar Grove word-block
  scenes were interaction-checked and visually inspected at phone and desktop
  widths. The focused harness is `tests/three-dimensional-learning-uat.mjs`;
  its screenshots are `tests/uat_3d_*_mobile.png` and
  `tests/uat_3d_*_desktop.png`. The full automated suite passes `242/242` tests.
- Deployment `https://e23daa7f.bloom-juniors.pages.dev/` contains those three
  content-specific depth models. The preview and custom domain serve the same
  `assets/index-CrXgzRH7.js` bytes and SHA-256 hash; the toddler, Number World,
  junior, and founder chunks return HTTP 200, and unauthenticated founder API
  access remains HTTP 401.
- Universal game-feel UAT passes `27/27` checks across toddler, early, and junior
  at 390 x 844, covering honest scores, tangible rewards, no background speech,
  mobile fit, replay, and continuation.
- Cross-module animation regression UAT passes `38/38` checks on desktop and
  mobile across Sound Pop, Shape World, Story Room, World Explorer, My Body,
  and Planet World. The suite accounts for duplicate accessible body-part labels
  such as left and right hands without weakening the interaction check.
- Founder Retention Dashboard desktop/mobile UAT passes with the Acquisition
  Quality source funnel, landing-page and timezone summaries, aggregate-only
  privacy assertion, and no horizontal overflow at 390 x 844.
- The Sound Pop map and universal treasure chest are transparent optimized WebP
  assets of approximately 123 KB and 133 KB respectively.
- Deployment `https://fdb5a1e2.bloom-juniors.pages.dev/` contains the verified
  Sound Pop 3D `map` pilot and universal completion celebration. The custom
  domain serves byte-for-byte matches of `assets/index-BOlFqjVA.js`,
  `assets/SoundPop-CJOBQv82.js`, and
  `assets/FounderDashboard-Bx4Ab04w.js`; both new WebP assets return HTTP 200
  with the expected sizes, and the unauthenticated founder API returns `401`.
- Deployment `https://dc50a01e.bloom-juniors.pages.dev/` contains durable
  first-touch acquisition tracking and the private Acquisition Quality report.
  The custom domain serves byte-identical `assets/index-B-DM4O8m.js` and
  `assets/FounderDashboard-hcGF7MKb.js`; unauthenticated founder API access
  returns `401`.
- Living Treasure Room browser UAT passes `40/40` checks across toddler, early,
  and junior at 390 x 844. It covers overlay suppression, safe mobile width,
  all five filters fitting, Safari-safe dolly artwork, room placement and drag
  persistence, treasure reactions, and secret-game completion persistence.
- Deployment `https://967f983e.bloom-juniors.pages.dev/` contains the verified
  iPhone Treasure Room presentation fix. The preview and custom domain serve
  byte-for-byte matches of `assets/index-DBcLje6i.js` and
  `assets/FounderDashboard-CxX9hSQp.js`; the unauthenticated founder API returns
  `401`.
- Deployment `https://1984a348.bloom-juniors.pages.dev/` contains the verified
  seven-completion starter path and founder drop-off funnel. The preview and
  custom domain serve byte-for-byte matches of `assets/index-BUzLq5G1.js` and
  `assets/FounderDashboard-BPoOkPGI.js`; the unauthenticated founder API returns
  `401`.
- Deployment `https://f03e1cb1.bloom-juniors.pages.dev/` contains the focused
  first-session path and date-bounded founder activation funnel. The custom
  domain serves byte-for-byte matches of the verified local main and founder
  bundles: `assets/index-kb3a2wtd.js` and
  `assets/FounderDashboard-ClSN5j6m.js`.
- The production founder dashboard chunk matches the locally built artifact, and
  the unauthenticated production API boundary returns `401`.
- Real early-years completed-path check confirms the main CTA is
  `Open today's treasure`.
- The Cloudflare preview and custom domain serve the same production bundle.
- Registration persistence regression coverage verifies that initial guardian
  rows contain the required parent PIN, reject an invalid PIN, and leave the PIN
  untouched during routine guardian updates. Both the Cloudflare preview and
  custom domain were checked for the deployed registration-recovery code.
- First Mission Return browser UAT passes on 390 x 844 mobile and 1440 x 1000
  desktop. It covers no pre-mission interruption, the family PIN gate, wrong-PIN
  handling, localized reminder time, email opt-in persistence, classroom
  exclusion, age-specific completion previews, and horizontal overflow.
- The Cloudflare preview and custom domain both serve
  `assets/index-Cr9R1Jjm.js` and `assets/FounderDashboard-GcUgmb1t.js` with the
  First Mission Return Loop funnel and one-time reactivation control. The
  production reactivation API rejects unauthorized requests with `401`.

Relevant UAT files and screenshots:

- `tests/adventure-home-uat.mjs`
- `tests/wonder-dashboard-uat.mjs`
- `tests/parent-zone-entry-uat.mjs`
- `tests/founder-retention-uat.mjs`
- `tests/avatar-workshop-uat.mjs`
- `tests/number-world-animation-uat.mjs`
- `tests/uat_number_world_retry_mobile.png`
- `tests/uat_number_world_hint_mobile.png`
- `test-results/avatar-workshop/early-mobile.png`
- `test-results/avatar-workshop/toddler-mobile.png`
- `test-results/avatar-workshop/junior-mobile.png`
- `tests/daily-journey-desktop.png`
- `tests/daily-journey-mobile.png`
- `tests/founder-retention-desktop.png`
- `tests/founder-retention-mobile.png`
- `tests/first-mission-return-mobile.png`
- `tests/first-mission-return-desktop.png`
- `tests/first-mission-complete-mobile.png`
- `tests/science-investigation-map-mobile.png`
- `tests/science-investigation-journal-mobile.png`
- `tests/science-investigation-map-desktop.png`
- `tests/home-to-world-uat.mjs`
- `tests/home-to-world-map-mobile.png`
- `tests/home-to-world-discovery-mobile.png`
- `tests/home-to-world-map-desktop.png`

Common verification commands:

```powershell
npm test
npm run build
npm run dev -- --host 127.0.0.1 --port 5173
$env:BASE_URL='http://127.0.0.1:5173'; node tests\adventure-home-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\wonder-dashboard-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\parent-zone-entry-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\founder-retention-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\retention-setup-uat.mjs
$env:UAT_BASE_URL='http://127.0.0.1:5173'; node tests\home-to-world-uat.mjs
node tests\number-world-animation-uat.mjs
```

If port 5173 is already occupied, use the port printed by Vite and update the
environment variable.

## Next Build

Run the real seven-day retention pilot. Do not add another major child feature
until the dashboard has enough real family data to identify the highest-volume
exit point.

The First Mission Return Loop went live on 2026-08-05. Treat earlier reminder
and retention behavior as a separate baseline. Review prompt views, parent
unlocks, email/push opt-ins, reminder opens, reminder-attributed learning
returns, and Day 1 return for newly activated real families. The first useful
72-hour checkpoint is 2026-08-08; the first complete Day 7 checkpoint is
2026-08-12.

Use `/founder` with an approved founder account to review the pilot. Historic
learning sessions can populate cohort and module metrics. Fine-grained journey
telemetry and Day 3/Day 7 feedback are already accumulating. Avatar Workshop
funnel telemetry begins with the 2026-07-30 release, so do not interpret earlier
workshop opens as zero engagement.

## Seven-Day Pilot

Do not add another major child feature before reviewing pilot data.

Pilot checklist:

1. Recruit a small group of real families across the supported age bands.
2. Record the date each child first completes a mission.
3. Observe whether the main dashboard requires adult explanation.
4. Review Day 1, Day 3, and Day 7 return.
5. Collect the short parent feedback prompts.
6. Identify the highest-volume exit point.
7. Improve that specific point before expanding the curriculum again.

Key questions:

- Did the child know what to tap without help?
- Did they understand why they should return tomorrow?
- Did the continuing story or Wonder create curiosity?
- Did the reward feel earned and worth returning for?
- Did the parent understand what the child learned?
- What stopped the family from returning?

## Instagram Growth Experiment

Instagram publishing uses Playwright browser automation against Instagram's web
UI. It does not use the Instagram API. The image/carousel and Reel flows are
separate in `post-instagram.js` and `post-instagram-reel.js`; credentials and the
saved browser session remain in gitignored local files.

On 2026-07-28 the profile had 15 posts, 0 followers, and followed 0 accounts.
This means distribution and account signals are a larger immediate constraint
than post volume alone.

A founder-led 16.4-second Reel was created around the hook "Why does the Sun look
red?" It uses the real founder portrait, real Wonder experiences, narrated audio,
and a parent question:

- video: `marketing/viral-reel/bloom-founder-question-reel.mp4`
- 4:5 cover: `marketing/viral-reel/cover-4x5.png`
- caption and release plan: `marketing/viral-reel/POSTING-NOTES.md`
- repeatable generator: `marketing/create-founder-question-reel.mjs`

The Reel was published successfully on 2026-07-28 through the Playwright Reel
flow. A separate profile check confirmed the profile increased from 15 to 16
posts and the new Reel appeared as the first grid item.

At the 2026-07-29 check, roughly 14 hours after publication, the latest Reel's
public metadata showed 0 likes and 0 comments. The profile also showed 0
followers and 0 following. At that time the account was still personal, so
views, reach, watch time, shares, saves, profile activity, and follows were
unknown rather than zero. This result indicated a distribution problem first:
the account had no initial audience or community activity to seed discovery.

The next content phase will use one parent-facing vertical-video engine across
Instagram Reels, TikTok, and YouTube Shorts rather than three independent
calendars. Produce one clean 9:16 master without platform watermarks, then adapt
the opening text, caption, cover, audio, and call to action per platform. Start
with three strong videos per week and one Instagram carousel, not an unsupported
high-volume target. TikTok content must be addressed to parents because standard
TikTok accounts are for people aged 13 or older. Set each YouTube video's
audience accurately: content actually directed to children must be marked "made
for kids," which restricts comments and other engagement features; founder and
parent-advice content should remain clearly adult-directed.

Two additional cross-platform masters were created on 2026-07-29 using the free
local Sharp/FFmpeg pipeline and Bloom's TTS endpoint; no Google Flow credits were
used:

- `marketing/cross-platform-shorts/reading-starts-before-words.mp4`
- `marketing/cross-platform-shorts/the-screen-time-question.mp4`

Both are 1080x1920 H.264/AAC videos with platform-safe 4:5 covers. The first is
18.4 seconds and the second is 16.1 seconds. Representative hook, middle, and
outro frames were visually checked, the screen-time source was trimmed to remove
an installation modal, and audio peaks at -1.5 dB. Captions, YouTube titles, and
publishing rules are in `marketing/cross-platform-shorts/POSTING-NOTES.md`. The
repeatable generator is `marketing/create-parent-short-series.mjs`. Together
with the existing Sun question Reel, these form the initial three-video launch
set for Instagram, TikTok, and YouTube Shorts.

Windows Media Player classified the MP4 masters as audio-only on the local
machine even though their H.264 video streams decode correctly. Windows-native
`*-windows-preview.wmv` viewing copies were therefore added and verified with
WMV2 video and stereo WMA audio. These are preview-only; publish the MP4 masters.

The Instagram bio was updated and verified after a fresh reload:

- Free learning for ages 3-9
- Phonics, maths and wonder
- Built by a Dubai dad. No ads.
- Try it free

Meta Verified shows `Verification pending`; payment for the free month was
accepted and Meta says review can take up to 48 hours. Do not change the display
name while this identity review is pending. The reusable bio updater is
`marketing/update-instagram-profile.mjs`.

The account was converted to a professional account after the 2026-07-29
personal-account check. On 2026-07-31 all 20 posts and Reels exposed a
`View insights` action, confirming that professional Insights are active. Meta
documents views, total and average watch time, accounts reached, follows, likes,
comments, saves, and shares for Reels. Do not describe `viewed versus swiped
away` as a standard Instagram metric; that wording belongs to YouTube Shorts.
The browser collector now waits for Instagram's separate Insights route and
parses its current desktop layout. The 2026-07-31 baseline across 20 posts was:

- 310 views
- 263 accounts reached
- 2 interactions: 1 like and 1 save
- 0 comments, shares, follows, or profile activity

The leading Reel was the concrete adaptive-maths demonstration with 183 views
and 158 accounts reached. The Yaagvi mascot Reel was second with 69 views and
61 reached. The direct useful-screen-time comparison was third with 29 views
and 16 reached. The newer abstract founder/learning hooks received little or no
distribution. Instagram's desktop Insights route did not expose total or average
watch time in this collection; check those figures in the mobile app.

The next three-video test should therefore use:

1. Adaptive maths proof: a child struggles twice and the activity responds
   without displaying a harsh wrong state.
2. Yaagvi and Avatar Workshop: a child earns a coin, chooses an item, and sees
   the mascot remember it.
3. Ten useful minutes: a concrete Sound Pop sequence ending with the parent
   learning summary.

Publish no more than one test per day. Posting volume is not the primary
constraint: the account still has no follows or profile activity. Seed each Reel
with real parent testers and useful participation in relevant parent communities,
then compare reach, saves, shares, profile activity, and follows after 24 and
72 hours.

The first evidence-led follow-up was produced and published on 2026-07-31:

- public Reel: `https://www.instagram.com/bloom_juniors/reel/Dbcv5uEsfxe/`
- publishing master:
  `marketing/adaptive-maths-short/good-try-maths-reel.mp4`
- cover: `marketing/adaptive-maths-short/good-try-maths-cover-4x5.png`
- platform copy: `marketing/adaptive-maths-short/POSTING-NOTES.md`
- repeatable recorder: `marketing/record-adaptive-maths-proof.mjs`
- repeatable renderer: `marketing/create-adaptive-maths-short.mjs`

This Reel records the real Number World behavior: after a wrong answer, Yaagvi
says "Good try. Let's look once more," the same problem remains available, and
the child can solve it on the retry. A product follow-up shipped on 2026-07-31:
the incorrect choice now uses an amber `Try again` state, unlocks after 850 ms,
and opens a worked hint after two mistakes. The app does not automatically lower
difficulty after a single mistake. The 17.4-second master is
1080x1920 H.264/AAC; representative frames and audio levels were checked before
publication. The profile audit independently confirmed it as post 21.

Because there is no existing personal distribution network or Facebook account,
the current audience-building plan uses Reddit and public UAE nursery/school
Instagram communities. The researched threads, transparent replies, verified
community links, comment templates, and seven-day routine are in
`marketing/06-zero-network-outreach.md`. The rule is to contribute useful answers
before mentioning Bloom and to disclose the founder relationship whenever Bloom
is relevant.

The Reddit account `u/SanjuBuildsForKids` has been created. A reusable browser
commenter now exists at `marketing/post-reddit-comment.mjs`, with its local
`reddit-session.json` excluded from source control. Google rejected automated
sign-in, so the first reply was submitted manually on 2026-07-29 in the r/UAE
"App recommendations for kids" discussion. AutoModerator then removed it because
the account was less than three days old. Do not repost it before the age
restriction expires; use the waiting period to complete the profile, join
relevant communities, and read their rules. Future replies must remain useful
and non-promotional before Bloom is mentioned.

Before publishing, confirm recommendation eligibility in Instagram Account
Status. Test the Reel with non-followers, distribute it through Sanju's personal
parent network, and measure watch time, shares, saves, profile visits, and follows
after 24 and 72 hours. Do not judge the experiment by likes alone.

On 2026-07-30 a fourth, stronger cross-platform experiment was created around
the hook "One correct tap can hide zero understanding." It shows the real
sunset investigation and gives parents a specific Predict, Watch, Explain test:

- master: `marketing/tap-test-short/one-correct-tap.mp4`
- cover: `marketing/tap-test-short/tap-test-cover-4x5.png`
- captions and measurement sheet:
  `marketing/tap-test-short/POSTING-NOTES.md`
- repeatable generator: `marketing/create-tap-test-short.mjs`

The 17.5-second master is 1080x1920 H.264/AAC. Representative frames across the
hook, lesson steps, evidence screen, result, and final question were visually
checked. Audio averages -16.9 dB and peaks at -1.5 dB. A WMV review copy is
included for the local Windows installation that does not display the MP4 video
codec.

The Reel was published to Instagram and independently confirmed as profile post
17 at `https://www.instagram.com/bloom_juniors/reel/DbaH1vfw7_V/`. Capture its
professional Insights after 24 and 72 hours: views, total and average watch time,
accounts reached, follows, likes, comments, saves, and shares. Public likes and
comments alone are not enough to evaluate the creative.

No authenticated YouTube or TikTok browser session exists in the workspace, and
no `youtube.txt` file was found. The same watermark-free MP4 and platform copy
are ready, but do not claim those uploads are live until each account is signed
in and the public post URL is independently checked. Do not store social account
passwords in the repository.

On 2026-07-30 the stale purple browser/PWA icon was replaced by the current
five-petal Bloom mark. The page, blog generator, Vite PWA manifest, browser icon,
Apple touch icon, and maskable icons now reference the versioned `bloom-v3`
asset family. Production deployment `https://8277cc8d.bloom-juniors.pages.dev`
was verified through the custom domain: `/founder` returns the new icon links and
`/favicon-bloom-v3.svg?v=20260730` returns the flower asset with HTTP 200. Build
passed and all 215 tests passed. Browser favicon caches are persistent, so an
already-open tab may need to be closed and reopened once.

A founder-led cross-platform experiment was also created and published on
2026-07-30 around the hook "My own daughter stopped opening the learning app I
built." The 17.6-second clean master is 1080x1920 H.264/AAC with a Windows WMV
preview and 4:5 cover:

- master: `marketing/cross-platform-shorts/my-daughter-stopped-coming-back.mp4`
- preview: `marketing/cross-platform-shorts/my-daughter-stopped-coming-back-windows-preview.wmv`
- cover: `marketing/cross-platform-shorts/my-daughter-stopped-coming-back-cover-4x5.png`
- platform copy: `marketing/cross-platform-shorts/POSTING-NOTES.md`

The Reel was independently confirmed as profile post 18 at
`https://www.instagram.com/bloom_juniors/reel/DbaJB1mhPtA/`. The pre-publish
baseline was 17 posts with zero visible interactions on the newest public Reels.
Record the new Reel after 24 and 72 hours; do not publish another near-identical
founder Reel before those checkpoints. YouTube and TikTok remain unposted because
no authenticated session or upload setup exists in the workspace.

The first founder-retention Reel was rejected on visual quality immediately
after publication. Its static navy panels obscured the product, repeated shots
for too long, used small app footage, and delivered only about 1.2 Mbps video.
Do not reuse that template. A substantially rebuilt preview now exists at
`marketing/founder-retention-v2/my-daughter-stopped-coming-back-v2.mp4`, with a
Windows viewing copy beside it. V2 is 1080x1920, 16 seconds, approximately
4.4 Mbps, and uses seven full-bleed beats with dynamically sized captions.
Representative frames were visually checked for clipping and overlap.

V2 is **not published**. Its founder and child lifestyle scenes are AI-assisted
editorial recreations and its voice is synthetic. The preferred final replaces
the founder opening and narration with Sanju's real vertical phone recording.
See `marketing/founder-retention-v2/POSTING-NOTES.md`. The already-published V1
Reel remains live until Sanju explicitly authorizes deletion.

On 2026-07-30 the stronger Claude Design source
`Video/Bloom Juniors Reel (1).mp4` was prepared and published. The repeatable
finishing script is `marketing/prepare-claude-reel.mjs`; it upscales the clean
720x1280 silent source to 1080x1920 with Lanczos scaling, adds timed British
synthetic narration, normalizes speech, and exports:

- Instagram master: `Video/Bloom Juniors Reel (1)-Instagram.mp4`
- Windows preview: `Video/Bloom Juniors Reel (1)-Instagram-preview.wmv`

The 17-second master is 1080x1920, 30 fps H.264/AAC, yuv420p, with mean audio
at -17.2 dB and a -1.5 dB peak. Representative frames and the final CTA were
visually checked. Instagram confirmed the share, and a separate public-profile
check found 19 posts with the new Reel first in the grid:
`https://www.instagram.com/bloom_juniors/reel/DbafyIlhCw5/`.

The `bloom_juniors` Instagram account is now verified, as confirmed by Sanju on
2026-07-30. Treat verification as a trust and identity signal, not as evidence
that Instagram will automatically increase distribution.

Treat this as the new visual-quality floor for short-form marketing. Record its
24-hour and 72-hour results before drawing conclusions, and use the same concise
problem, contrast, product proof, parent proof, CTA structure in future Claude
Design prompts. YouTube Shorts and TikTok remain unposted until authenticated
upload sessions exist and each public URL can be independently verified.

An attempt to reshare this Reel as an Instagram Story with the poll "Useful
screen time?" was safely stopped before publication. Instagram's authenticated
mobile web interface exposed external sharing destinations but did not expose
Add to Story or interactive sticker controls. The guarded diagnostic is
`marketing/share-instagram-story-poll.mjs`. A second attempt through the
mobile-web Story creator returned only "Use the app"; this Windows machine has
no Instagram app, ADB device, or Android emulator available. The poll must be
added in the native Instagram mobile app; do not claim the Story is live until
it is visible from the profile. Sanju manually published the Story poll from
the Instagram app on 2026-07-30 with the question "Useful screen time?" and
options "Yes" and "Show me more."
## Nursery Outreach - 2026-08-11

The nursery campaign was corrected and narrowed to a three-contact validation test
before wider outreach. Start with Yellow Kite, Rainbow Valley and Alphabet Street,
send individually from `Sanju | Bloom Juniors <sanju@bloomjuniors.com>`, and record
reply, objection, meeting and outcome in `marketing/04-nursery-pipeline.md`.

The reviewed offer is a supported 30-day pilot, not temporary free access. Bloom
provides the parent invitation, setup support, an anonymised aggregate engagement
summary and a 15-minute results review. Families retain free access afterwards.

Do not claim Bloom stores no child data, uses no tracking of any kind, is KHDA
approved or provides official inspection evidence. Accurate wording: children do
not need email accounts; there are no advertisements, in-app purchases, data sales
or advertising trackers; child profiles and learning progress are stored securely.

Canonical assets:

- `marketing/nursery-emails-batch1.md`
- `marketing/05-nursery-outreach-kit.md`
- `marketing/nursery-pitch-video-script.md`
- `marketing/pilot-offer.html`
- `marketing/pilot-offer.pdf`

The PDF was regenerated from the HTML, visually checked and verified as one A4 page.

## Known Follow-Ups

- Measure whether the four content-specific depth models improve completion and
  return before expanding further. Do not apply identical cartoon treatment
  across all age bands; future models must explain a learning concept through
  child-controlled cause and effect.
- Reduce the main production bundle through additional route/component splitting.
- Review real analytics before changing streaks, rewards, or notification timing.
- Keep old standalone journey widgets only where they still support an explicit
  secondary view; do not allow them to compete with the main next action.
- Re-run iPhone Safari UAT for speech and notification behavior when those flows
  change because browser automation cannot fully validate physical-device audio
  or operating-system notifications.
