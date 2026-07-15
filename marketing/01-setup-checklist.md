# Setup Weekend Checklist — do these in order

Total time: ~4 hours. Each task says exactly what to do and what "done" looks like.

## ☐ 1. Professional email (30 min) — DO THIS FIRST
1. Go to dash.cloudflare.com → bloomjuniors.com → **Email** → **Email Routing**
2. Enable it, create address `sanju@bloomjuniors.com` → forward to `sanjuveed@gmail.com`
3. Cloudflare will add the MX/TXT records itself — accept
4. In Gmail: ⚙ Settings → **Accounts and Import** → "Send mail as" → Add `sanju@bloomjuniors.com`
   - SMTP: use Gmail's own (smtp.gmail.com) with an App Password, or choose "Send through Gmail"
5. Send yourself a test email from the new address

**Done when:** you receive and can reply as sanju@bloomjuniors.com

## ☐ 2. Instagram account (45 min)
1. Create account, handle: **@bloomjuniors** (fallbacks: @bloomjuniors.app, @bloomjuniorsuae)
2. Profile photo: the warm orange sunflower icon (`public/bj-512.png`)
3. Bio (paste exactly):
   > Free, ad-free British curriculum learning for ages 3–9 🌱
   > Built by a Dubai dad for his daughter.
   > No ads. No tracking. Ever. ⬇️
4. Link: https://bloomjuniors.com
5. Switch to **Business account** (Settings → Account type) — needed for analytics + the posting API
6. Publish Posts 1, 2, 3 from `02-instagram-first-12-posts.md` (one now, the others over the next 2 days)

**Done when:** profile is live with post 1 published

## ☐ 3. Google Search Console (30 min)
1. search.google.com/search-console → **Add property** → Domain → `bloomjuniors.com`
2. It gives you a TXT record → add it in Cloudflare DNS (or tell Claude — I can add it via API)
3. Once verified: **Sitemaps** → submit `sitemap.xml`
4. **URL Inspection** → paste each of the 4 pages → "Request indexing":
   - https://bloomjuniors.com/
   - https://bloomjuniors.com/schools
   - https://bloomjuniors.com/curriculum-map
   - https://bloomjuniors.com/privacy

**Done when:** "Sitemap read successfully" appears

## ☐ 4. Bing Webmaster Tools (10 min)
1. bing.com/webmasters → sign in → **Import from Google Search Console** (one click)

**Done when:** site appears in Bing dashboard

## ☐ 5. Google Business Profile (30 min)
1. business.google.com → Add business → "Bloom Juniors"
2. Category: **Educational institution / E-learning service**, online-only (no address shown)
3. Website: bloomjuniors.com, description: reuse the Instagram bio + one sentence on EYFS/KS1

**Done when:** submitted (verification may take days — fine)

## ☐ 6. Directory submissions (45 min)
1. **educationalappstore.com** → scroll to footer → "App developers / Submit your app"
   - It's a web app (PWA) — link the site directly
   - Short description: "Free, completely ad-free British curriculum (EYFS/KS1/KS2) learning app. Systematic Synthetic Phonics, early maths, stories. Ages 3–9. No downloads, no accounts for kids, no data collection."
2. **commonsensemedia.org** → "Suggest a title" (search their help for the form)

**Done when:** both confirmation emails received

## ☐ 7. LinkedIn (20 min)
1. Create company page "Bloom Juniors" — logo, bio, link
2. Update personal headline: "Founder, Bloom Juniors — free ad-free learning for ages 3–9"
3. Share your Medium article as the page's first post

**Done when:** page is live

## ☐ 8. The googleability test (5 min — do 3 days after the above)
Google "Bloom Juniors" in incognito.
**Pass:** Instagram, LinkedIn, or Medium appears on page 1. (The site itself takes 1–3 weeks.)

---

### Hand back to Claude after this weekend:
- Instagram Graph API token → into `.env` as documented in `post-instagram.js` (never paste it in chat)
- Confirmation GSC is verified (or ask me to add the TXT record via Cloudflare API)
- Then I start: scheduled posting, the /blog build, weekly metrics reports
