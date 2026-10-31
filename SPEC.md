# pvNXT Help: project spec (help.pvnxt.com)

> Product-specific spec. For new projects, start from **MASTER_WEBSITE_GUIDE.md** and use this as a worked example.

> **How to use this file:** give this whole file to any AI (Claude, ChatGPT, Gemini, Cursor, v0, Lovable…) as the first message. Attach the official Studio, Go and Connect user-guide PDFs and the terranxt-site repo link. The AI should read everything, reply with the plan in §15, and then build in the gated order in §12.
>
> Everything here was decided, tested and approved in an earlier design round. Treat the **approved** designs as decided; don't redesign them unless asked. Treat **open** pages as "propose options first".
>
> Version: 31 Oct 2026

---

## 1. Your role

You are a **senior product designer with 20 years' experience in help centres and SaaS support**, and a careful **front-end engineer**. You care more about the stressed user on a phone than about looking impressive. You:
- design calm, familiar, fast pages (Google Help / Microsoft Support level of clarity),
- never invent facts, numbers, reviews or features,
- show options and wait for approval before building a page,
- test everything you build, on mobile first.

---

## 2. Mission

Build **pvNXT Help**, **one** help, guide, support and demo-video site for **every** Terranxt pvNXT portal. A user who is stuck should find the right steps in under a minute, or reach a person in one tap.

**Success** means:
1. The user finds a guide through search or a portal page, follows numbered steps with real screenshots, and finishes the task.
2. If they can't, they reach support with their context (portal, topic, search words) already filled in.
3. It works just as well on a 390 px phone on a rooftop as on a desktop.

---

## 3. Product and users (facts; don't change them)

**Company:** Terranxt. **Platform:** pvNXT (rooftop solar). **Main site:** terranxt.com.

| id | Portal | Who | What they do | Address | Stage |
|---|---|---|---|---|---|
| `studio` | Studio | Solar EPC companies, designers, sales teams | Leads, roof design, BOQ, proposals, installer assignment | epc.pvnxt.com | Beta |
| `go` | Go | Installers and ground teams (company or freelance) | Bid on jobs, site checklists, handover | installer.pvnxt.com | Beta |
| `connect` | Connect | Homeowners and business owners going solar | Find roof, estimate, approve, pay, track | consumer.pvnxt.com | Beta |
| `scada` | SCADA | O&M teams, plant owners, EPC managers, technicians | Plant monitoring; every alert has an owner | scada.pvnxt.com | Beta |
| `atlas` | Atlas | Anyone starting a project | 3D roof models from satellite imagery | Inside Studio and Connect | — |
| `artha` | Artha | Investors | Back real solar projects; read the risks first | artha.pvnxt.com | Early access |
| `apps` | Mobile apps | Everyone on the move | One app per portal, Android and iOS | — | Free during beta |
| `account` | Account & security | Everyone | Sign-up, passwords, access, data safety | — | — |

**Support facts**
- Email: support@terranxt.com
- WhatsApp: wa.me/918447444157
- Hours: Mon–Fri, 9 am–5 pm IST
- Promise: "We reply within one working day."
- Live demo: terranxt.com/demo.html

**The user's state of mind:** already stuck, often stressed, often on a phone. Everything follows from this.

---

## 4. Non-negotiable rules

### 4.1 Truth
1. **Never invent anything:** no stats, user counts, ratings, testimonials, uptime %, response times, dates, prices or features. If you need a fact you don't have, write a visible placeholder (`[PLACEHOLDER: SCADA screenshot]`, `[DATE]`) and add it to the open-items list.
2. Guide steps come **only** from the official user guides (Studio, Go, Connect PDFs, Oct 2026). Guides for Atlas, SCADA, Artha, Apps and Account drafted from terranxt.com must be flagged **"needs owner review"**.
3. If something isn't ready, say so plainly ("Video coming soon. The written guide has the same steps.").

### 4.2 Images
4. **Only real portal screenshots**, with **personal data blurred** (names, emails, phones, addresses, card or bank details). No stock photos, no AI images, no illustrations of people. Every image has a caption and opens in a lightbox.
5. A portal without screenshots shows a short facts panel, not a fake image.

### 4.3 Look and feel: calm, not "AI slop"
6. **Avoid:** gradients, glows, glassmorphism, bento grids, floating 3D blobs, dark "console" themes, animated counters, big hero illustrations, emoji, "Supercharge your…" copy, floating chat bubbles, logo "flashlight" hover effects, a different card style in every section.
7. **Do:** white space, one accent (teal), dark ink text, borders instead of shadows, pill search and chips, one clear job per screen, familiar patterns (search → list → accordion → steps).
8. Quiet hover (border or underline change). Visible focus rings. Respect reduced motion.

### 4.4 UX
9. **Mobile first.** Test at 390 px with no sideways scroll. Tap targets at least 44 px. Chips scroll sideways. Sticky bars stay at 56–64 px.
10. **Every page ends with a way to a person.** Carry the context into Contact (`contact.html?portal=go&topic=…`).
11. **Context everywhere:** breadcrumbs, "3 of 15", "Next guide", the current item highlighted.
12. **Help is never behind a login.** Signing in only adds saved guides, requests and progress.
13. **No sign-up on the help site.** Accounts are created only in the portals. **One email belongs to exactly one portal** (Studio, Go, Connect or SCADA), so never ask users to pick or multi-select portals; detect the portal from the account.

---

## 5. Brand and design tokens

Inherit from **terranxt.com**: repo `github.com/rmcool26/terranxt-site`, branch `081026-v2`. Copy its `css/styles.css` **unchanged**, and put every help style in `css/help.css` with **prefixed class names** (see §14 traps).

```css
:root{
  --ink:#0b2a30; --ink-2:#3c5459; --muted:#5b7176;
  --teal:#069fb1; --teal-d:#047f8e; --teal-dd:#065f6b;
  --tint:#eaf3f4; --paper:#f5f9fa;
  --line-1:#eef3f4; --line-2:#e3ecee; --line-3:#dbe6e8; --line-input:#c9dadd;
  --amber:#e8a13a; --mark:#fdf0d9;               /* search-term highlight */
  --ok:#1f8a5b; --warn:#b7791f; --err:#c2410c;   /* status, validation */
  --f-head:'Manrope',sans-serif;                 /* 700–800 */
  --f-body:'Public Sans',sans-serif;             /* 400–600 */
  --f-mono:'IBM Plex Mono',monospace;
}
```
**Radii**
- 99 px: search, chips, buttons
- 12 px: inputs, images
- 14–18 px: cards and panels

**Widths**
- 760 px: reading pages (portal, guide, search, status)
- 1040 px: contact
- 1200 px: videos and header

**Gutters:** 16 px on mobile, 24 px on desktop.

**Type scale**
- H1: clamp(28px, 4vw, 36px), Manrope 700
- Section heading: 17–18 px
- Body: 16–17 px
- Meta: 13.5–14.5 px

**Icons:** Lucide outline (about 1.8 stroke), in a tint circle.

**Header (sticky):** logo mark + "pvNXT Help" · compact search (inner pages) · Sign in.

**Footer (one line):** © Terranxt · Contact · Status · Videos · Privacy · Terms · terranxt.com.

---

## 6. UX writing guide
- **Voice:** a calm colleague who knows the product. Short sentences. Plain words. Indian English spelling is fine (e.g. "organisation").
- **Guide titles are tasks:** "Review or add keepout zones", not "Keepout Zones Overview".
- **Steps:** start with a verb. Use the UI's exact words and **bold** button names: "Click **Confirm Selection**."
- **One idea per sentence. One task per guide.** Split a guide if it passes about 5 sections.
- **Buttons say what happens:** "Send request", "Read the guide", "Ask support about 'roof'". Never "Submit" or "Click here".
- **Empty or error states** say what happened, then what to do next.
- **Don't write:** "seamless", "effortless", "unlock", "supercharge", "revolutionise", "world-class", "cutting-edge", "Oops!", exclamation marks, or questions you then answer yourself.

---

## 7. Architecture
- **Static site, no build step, deployed on Vercel** (framework "Other", output `.`). Domain: help.pvnxt.com.
- Each page is a thin HTML shell:
  `<body data-page="search">` + `#site-header` + `<main id="main">` + `#site-footer`, loading `js/data.js` then `js/help.js`.
- `help.js` has shared helpers and a router `R[page]()` that renders from `data.js`.
- **Saved state** in `localStorage`: `pvh_user`, `pvh_saved`, `pvh_read`, `pvh_recent`, `pvh_requests`, `pvh_feedback`. Always wrap reads and writes in try/catch.
- **Contact** sends through the visitor's email app (mailto) for now. It's built so a helpdesk API (Freshdesk or Zoho Desk) can replace it later.
- **Sign-in** is a demo for now. Replace it with the pvNXT account system: look up the email → its single portal → password or OTP, plus Google, Microsoft and Apple sign-in. No sign-up here.

### Files
```
index.html portal.html article.html search.html contact.html videos.html
status.html signin.html my.html 404.html
css/styles.css (terranxt, unchanged)   css/help.css (prefixed)
js/data.js (all content)                js/help.js (helpers + router)
assets/logos/  assets/guides/{studio,go,connect}/*.jpg (blurred)
README.md vercel.json robots.txt sitemap.xml
```

### Content model: `window.HELP` in `js/data.js`
```js
support:  {email, whatsapp, hours, reply, demo, site}
portals:  [{id, name, icon, tag, line, who, host, url, shot, topics:[{id,name}]}]
articles: [{id, p, t, title, sum, body:[ ['p',txt] | ['h',heading] | ['steps',[..]]
           | ['list',[..]] | ['tip'|'note'|'warn',txt] | ['img','studio/x.jpg','caption'] ]}]
sources:  {studio:{doc,updated}, go:{…}, connect:{…}}
popular:  [articleId…]
videos:   [{id, p, title, article /*fallback guide*/, yt /*YouTube id, '' until recorded*/}]
paths:    [{id, title, p, steps:[articleId…]}]
status:   {updated, items:{studio:'ok'|'issue'|'soon', …}}
```
**Topics**
- Studio: Getting started · Leads & bids · Roof analysis & design · BOQ & proposals · Approval & installers
- Go: Getting started · Bids & projects · On site · Handover
- Connect: Your roof details · Estimate & options · Approval & payment · Installation tracking

### Search
Score each guide by matches in title (×6), summary (×3), portal name (×2) and body (×1). Return results ranked by that score. Highlight search words from **word starts only**.

---

## 8. Sitemap
```
/                         Home
/portal.html?p=<id>#<topic>
/article.html?a=<id>
/search.html?q=&p=
/contact.html?portal=&topic=
/videos.html#<videoId|portalId>
/status.html
/signin.html
/my.html#requests|saved|learning
/404.html
```

---

## 9. Approved page designs (build these as written)

### 9.1 Home ✅
- **Hero:** "What do you need help with?" and one large pill search (no button; Enter searches). The placeholder rotates through real example questions, and stays still if reduced motion is on.
- **Live suggestions** as you type:
  - "N guides match" count
  - up to 6 guides
  - arrow keys and Enter
  - Escape closes the list and keeps focus in the input
  - "Ask support about '…'" when nothing matches
- **Portal grid** (order: Studio, Go, Connect, SCADA, Atlas, Artha, Mobile apps, Account): icon, name, one line on who it's for.
- **Common questions:**
  - underline tabs per portal (role=tab, arrow keys, URL hash)
  - each tab has `<details>` rows: question → one-line answer → "Read the steps"
  - then "All N Studio guides"
- **Three link columns:** Your account · Learn · Talk to a person.
- *Rejected:* busy hubs, role journeys, bento, editorial timeline, dark console.

### 9.2 Portal page ✅ (topic accordion)
- Breadcrumb → icon + "Studio help" + who it's for → search scoped to this portal.
- "Browse help topics": one bordered accordion, a row per topic with a guide count. The first topic (or the one in the hash) is open, and its rows list guide links.
- Update the hash **only on click**, never on load.
- Then "Still stuck? Contact support" and "Open Studio ↗".

### 9.3 Guide page ✅ (focused column, guide list, sticky sections)
- **Desktop:**
  - Left sidebar: "← Studio help", then every guide in the portal grouped by topic, current one highlighted.
  - Main column: breadcrumb, H1, one-line summary, actions (Copy link · Save · Updated <date>).
- **Sticky bar** under the header:
  - numbered "In this guide" chips (scroll-spy, trigger line about 190 px from the top)
  - a thin reading-progress line
- **Body:** auto-numbered section headings, steps, captioned screenshots (lightbox with focus trap and Escape), tips and warnings.
- **End of guide:**
  - "Was this helpful?"
  - source line ("From the pvNXT Studio user guide · Oct 2026")
  - "Still stuck? Contact support"
  - dark **Next guide · 4 of 15** button (on the last guide it goes back to the portal), plus a Previous link
- **Mobile:**
  - The sticky bar holds a "Studio guides · 3 of 15" dropdown (closes on outside tap or Escape) and sideways-scrolling section chips that keep the current one in view.
- No tick boxes for now (a do-along checklist is parked as a future idea).

### 9.4 Search results ✅ (one list, portal chips)
- Breadcrumb · search box with the query.
- **Portal chips with counts** (All 24 · Studio 9 · Connect 6 …):
  - sorted by count
  - shown only when results span more than one portal
  - filter instantly, `aria-pressed`, update the URL `?q=&p=`
- Live count: "24 guides for 'roof' (in Connect)".
- **Rows:**
  - **Portal · Topic** (small teal label)
  - **title** (link, 18 px)
  - one-line **summary**, with search words highlighted
- First 10, then "Show N more", which moves focus to the first new result.
- **No results:** "No guides match '…'", a simpler-words tip and popular guides. **Empty query:** popular guides.
- **Always last:** "Didn't find it? **Ask support about '…'**" → Contact with the topic filled in.

### 9.5 Contact ✅ (form with direct channels)
- "Contact support" · "Tell us what happened. We reply within one working day."
- **Form fields:**
  - Name · Work email
  - Portal (select) · Topic. Both pre-fill from the URL, and signed-in users get name and email filled in.
  - **"These guides might answer it"**: up to 3 live matches as they type or pick a portal.
  - What happened? (prompt: what you did, expected, saw; project or plant name)
- **Send request:**
  1. Inline validation (highlighted fields plus one message).
  2. Builds a request ID and opens email to support@terranxt.com with subject `[pvNXT Help] Studio: BOQ not updating (R1A2B3C)`.
  3. A success panel shows "Open the email again" and "Raise another".
  4. Signed-in users' requests are saved to My help.
- **"Or reach us directly"** (right side): WhatsApp (hours) · Email · Portal status · Book a live demo.
- **Mobile:** WhatsApp and Email sit above the form. Status and Demo are hidden there because the footer links to them. The button is full width.

### 9.6 Videos ✅ (player and playlist), with audit fixes applied
- Breadcrumb · "Videos" · portal chips with counts (filter the playlist, update the hash).
- **Desktop:**
  - Large 16:9 player on the left.
  - Sticky playlist on the right: "All videos · 3 of 10", numbered, current one highlighted, each row shows the portal and "Coming soon" when there's no recording yet.
- **Player:**
  - **With a YouTube id:** poster plus a play button. Clicking loads a `youtube-nocookie` iframe, so nothing loads before the user asks.
  - **No recording yet:** poster from the guide's first screenshot plus a panel "Video coming soon. The written guide has the same steps, with screenshots." and **Read the guide**.
- **Below the player:**
  - title
  - "Studio · 3 of 10 · Read the guide"
  - "In this video" / "What it will cover" (the guide's section headings)
  - **Next video: …**
- **Deep links:** `videos.html#v-studio` opens that video; `videos.html#go` filters to Go.
- **Mobile:**
  - The playlist becomes a sticky collapsible "All videos · 3 of 10" above the player (closes after picking and on Escape).
  - Picking a video scrolls to the player and moves focus there.
- Order: the overview ("pvNXT in 2 minutes") comes first.

---

## 10. Pages still open: propose options and get approval

| Page | Recommended direction (show 2–3 options anyway) |
|---|---|
| ~~Status~~ ✅ **Approved: A.** a summary banner ("All portals are working · Updated <date>") over one list, each row with portal + address · status dot **with words** · Open · Report a problem (opens Contact with the topic "Can't reach Studio"). B: a card per portal. C: status plus "quick fixes to try" (those fixes need support-team sign-off before going live). Note: Atlas shares Studio/Connect status. |
| ~~Sign in~~ ✅ | **Approved: A, email first, then we find your portal.** Step 1: Continue with Google / Microsoft / Apple, or **Email** (not "work email") → Continue. "New to pvNXT? Accounts are created in your portal. Which portal is mine?" No sign-up. Step 2: "Welcome back", email + "Studio account" (detected from the email) + Change; Password, or "Email me a code instead" (6-digit code); "Forgot password?" goes to that portal; "Guides are open to everyone. Continue as a guest". Methods match the live portals: email + password or OTP, plus Google, Microsoft and Apple. Use each provider's official button. Until the pvNXT account API is connected, the demo labels itself and, for unknown emails, asks "Demo only: which portal is this account on?" (single choice). |
| ~~My help~~ ✅ | **Approved: B, tabs.** Header: "My help", email + "Studio account" pill + Open Studio ↗. Underline tabs with counts: **My requests 2 · Saved guides 2 · Reading progress** (role=tablist, arrow/Home/End keys, hash #requests/#saved/#progress; old #learning maps to progress; opens on Requests, or Saved if no requests). Requests: topic, ID, sent date, status pill, "New request", "Replies arrive by email", Clear list. Saved: title link + topic + Remove. Progress: the portal's path with a bar, "3 of 11 guides read · Next: …", Continue, numbered list with "Read" marks. Each empty state has one action. Footer: Account & security help · Sign out. |
| ~~404~~ ✅ | **Approved: A.** "Error 404 · We can't find that page", search, 5 popular guides (search-result style), "Followed a link from a pvNXT portal? Report a broken link" (Contact pre-filled with the bad URL). Works at any depth (`<base href="/">` on http). |
| **My help** | Tabs: My requests (ID, portal, topic, date, status) · Saved guides · Learning progress (paths with "3 of 11 read"). Each empty state has one action ("Search help"). |
| **404** | "We can't find that page." Search box, popular guides, link home. No jokes. |

---

## 11. Interaction, accessibility and performance checklist (definition of done)
- [ ] One `<h1>` per page. Landmarks: header, nav (breadcrumb), main, footer.
- [ ] All inputs have labels. Errors use `role=alert`; counts use `role=status`.
- [ ] Chips use `aria-pressed`. Tabs use `role=tab` with arrow keys. Accordions use native `<details>`.
- [ ] Keyboard: "/" focuses search; Escape closes suggestions, dropdowns, the lightbox and the mobile playlist; focus is trapped in the lightbox; focus rings are visible.
- [ ] `prefers-reduced-motion` turns off smooth scroll, the rotating placeholder and transitions.
- [ ] Colour is never the only signal (status dots carry words). Text contrast is at least 4.5:1.
- [ ] 390 px: no sideways scroll, tap targets at least 44 px, sticky bars don't cover headings (`scroll-margin-top`).
- [ ] Images: `loading="lazy"`, fixed aspect ratio (no layout shift), alt text or a caption.
- [ ] No JS errors on any page. Every guide renders. Every image loads.
- [ ] Every page has a route to Contact, carrying context.
- [ ] No invented facts. Placeholders are listed in README "open items".

**Testing:** after each page, run Playwright scripts that:
- load every page at 1440 and 390 px and record page errors and `scrollWidth`
- render all guides and check that images loaded
- run search, filters, "show more", contact validation and submit, the lightbox, the video playlist and deep links, and sign-in → My help
- take screenshots for review

---

## 12. Gated workflow (follow exactly)
1. **Read:** the terranxt-site repo (styles, tone), the attached PDFs, and this file. Summarise the inputs in 10 lines.
2. **Ask only blocking questions** (at most 4, multiple choice if you can).
3. **Set up:** the shells, `styles.css`, an empty `help.css`, the `data.js` schema, the `help.js` helpers. Header and footer.
4. **Content:**
   - Convert the PDFs into guides.
   - Export the screenshots, **blur personal data**, and check the blurs visually.
   - Flag drafted guides.
5. **Pages, in this order:** Home → Portal → Guide → Search → Contact → Videos → Status → Sign in → My help → 404.
   - For approved pages (§9), build as written, then show screenshots.
   - For open pages (§10), make **2–3 genuinely different options** (different structure, not colour). Use real content, show desktop and mobile, recommend one with a one-line reason, and **stop and wait for approval**. Then merge the chosen option, including any parts the user liked from the others.
6. **After every page:** run the §11 tests, fix what fails, and deliver a Vercel-ready zip and a live preview.
7. **Final audit,** with the eye of a senior brand designer:
   - copy against §6
   - visuals against §4.3
   - facts against the sources
   - hover and focus on every interactive element
   - mobile on every page
8. **Hand-off:** a README covering how to edit content, swap in SSO and a helpdesk, add YouTube ids, update status, and the open items.

---

## 13. Decisions log (so you don't reopen them)
| Topic | Decision | Reason |
|---|---|---|
| One site vs per-portal | One site, scoped per portal | Users span portals; one search, one contact, one brand (as Google, Microsoft and the Income Tax portal do) |
| Visual direction | Calm, minimal | Loud 2026 trends were rejected: "too much info and too loud; the user is already stressed" |
| Images | Real blurred screenshots only | Stock and AI images looked fake and taught nothing; hotlinking was unreliable |
| Home | Minimal search + portals + common-questions tabs | Fastest route to an answer |
| Portal | Topic accordion | Short, scannable, deep-linkable |
| Guide | Focused column + guide list + sticky sections | Reading focus without losing your place; works on mobile |
| Search | One list + portal chips | People already know this pattern |
| Contact | Form + direct channels beside it | No extra step; WhatsApp is visible straight away |
| Videos | Player + playlist | A learning flow; honest about recordings that aren't made yet |
| Status | Banner + one list | Calm, scannable, every row has Report a problem |
| My help | Tabs | Neat and simple; one portal per account |
| Sign in | Email first, portal detected | Users already have one account in one portal; no sign-up or portal picking here |
| Floating WhatsApp button | Removed | Noise; contact lives in the page flow |
| Tick boxes on guides | Parked | Keep the first version simple |

---

## 14. Known traps (fixed before; don't repeat them)
- **Base CSS collisions** with terranxt `styles.css`. Prefix help classes (`.mh- .mp- .mq- .ptl- .gb- .sr- .ct- .vp-`). Known clashes:
  - `form{flex-direction:column}` (breaks inline search)
  - class names `.sun .pp .ph .sr .ok`
  - `details p{padding}`
  - `summary::after` +/− markers (override with `content:none!important`)
  - `.page-hero::after` logo hover
- **Mobile overflow:** grid columns `minmax(0,1fr)` and `min-width:0` on flex children.
- **Accordion hash:** don't `replaceState` on the `toggle` event, or the page scrolls on load.
- **Scroll-spy:** use a trigger line (about 190 px), not the element top. For sideways chips, scroll by `chip.offsetLeft - row.offsetLeft`.
- **Suggestion Escape:** focus the input *then* hide the list, or it reopens.
- **Highlighting:** match from word boundaries ("roof" must not light up inside "proof").
- **Base `ol`/`ul` reset:** lists that need numbers must set `list-style:decimal` again.
- **Lucide/Google Fonts** may not load in sandboxes, so screenshots can show empty icons or fallback fonts. Check live before "fixing".
- **Approval:** never build an open page before the user picks an option.

---

## 15. Your first reply must contain
1. A 10-line summary of the inputs you read.
2. Up to 4 blocking questions.
3. The build plan as a checklist following §12, with what you'll deliver at each gate.
4. The open-items list (start from §16).

Then wait for answers before building.

---

## 16. Open items (carry forward; never fill with invented content)
- [ ] Real SCADA and Artha screenshots
- [ ] Record the demo videos; add YouTube ids to `videos[].yt`
- [ ] Studio screenshots for user-guide sections 5.1–6.4
- [ ] Confirm how Go behaves offline on site
- [ ] Portal owners to review the Atlas, SCADA, Artha, Apps and Account guides
- [ ] Replace the demo sign-in with pvNXT SSO
- [ ] Replace mailto with a helpdesk API; show real request status in My help
- [ ] Pre-render guide pages for SEO (title, meta description, canonical, one H1, sitemap entries)
- [ ] Privacy and Terms pages
- [ ] Support team to approve any "quick fixes" copy (Status option C)
- [ ] Analytics plan (privacy-friendly): searches with no results, guide "helpful" votes, Contact opens per page. Use it to decide which guides to write next; don't publish numbers.

---

## 17. Ideas for later (don't build without approval)
- A do-along checklist on guides (tick steps, progress saved)
- "Was this helpful? No" → a short reason → a pre-filled Contact form
- Content freshness: show "Updated <date>" on each guide and flag guides older than a set review period to their owner
- Hindi version of the Connect guides (homeowners)
- Status history and planned maintenance, once the team has real incidents to report

### All guides ✅ (Approved: A, portal list + one portal at a time)
- `guides.html#studio` (default Studio). Breadcrumb, "All guides · 52 step-by-step guides. Pick a portal.", search.
- Desktop: sticky left list of portals with counts (Studio, Go, Connect, SCADA, Atlas, Artha, Mobile apps, Account & security), current one highlighted.
- Right: portal header (icon, name, who it's for, "Open Studio help →"), then topics in order, each guide as title + one-line summary.
- Mobile: the left list becomes sticky portal chips under the header; picking one scrolls back to the list.
- Ends with "Can't find your guide? Contact support" (pre-filled with the portal). Back/forward and shared links keep the portal.

### Header, assistant, language, motion ✅
- Header: Portals ▾ · Guides · Videos · Status · Contact · search (inner pages) · language (EN/हिन्दी/العربية via Google Translate, Arabic right-to-left) · Sign in. Mobile: menu button with pages, portals and languages.
- "Ask us" assistant: answers only from the guides (`api/chat.js` + `ANTHROPIC_API_KEY` on Vercel), falls back to the best guide; always offers WhatsApp, email, request. Hidden on Contact and Sign in; on phones it steps aside while scrolling down.
- Motion option C: quiet feedback plus slow dot-grid behind the home search, cursor glow on home portal tiles, self-drawing success tick. Off when reduced motion is set. Light theme only.
