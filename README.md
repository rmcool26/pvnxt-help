# pvNXT Help

The help, guides and demo-videos portal for every pvNXT portal (help.pvnxt.com).
Built on the terranxt.com design system: `css/styles.css` is copied unchanged from the terranxt-site repo, and `css/help.css` adds the help components.

## Pages

| Page | File | What it does |
|---|---|---|
| All guides | `guides.html#go` | Portal list on the left (chips on mobile), one portal's guides by topic with summaries |
| Home | `index.html` | One search, portal tiles, common questions by portal |
| Portal | `portal.html?p=studio#design` | One portal's guides in a topic accordion |
| Guide | `article.html?a=studio-roof-analysis` | Steps with screenshots, guide list, sticky "In this guide", next guide |
| Search | `search.html?q=roof&p=studio` | One list with portal chips, "Show more", "Ask support about …" |
| Contact | `contact.html?portal=go&topic=...` | Form with guide suggestions + WhatsApp/email; sends via the visitor's email app |
| Videos | `videos.html#v-studio` or `#go` | Player + playlist; "Coming soon" opens the written guide until a YouTube id is added |
| Status | `status.html` | Summary banner + one row per portal, "Report a problem" |
| Sign in | `signin.html` | Existing accounts only: email first, portal detected, password or code, Google/Microsoft/Apple |
| My help | `my.html#requests`, `#saved`, `#progress` | Tabs: requests, saved guides, reading progress |
| 404 | `404.html` | Search, popular guides, "Report a broken link" |

Portal ids: `atlas`, `studio`, `go`, `connect`, `scada`, `artha`, `account` (Account & billing). There is no `apps` portal any more.

## Edit content

Everything is in `js/data.js`:
- **Guides**: add an object to `articles` (`id`, portal `p`, topic `t`, `title`, `sum`, `body`). Body blocks: `['p', text]`, `['steps', [...]]`, `['list', [...]]`, `['tip'|'note'|'warn', text]`.
- **Videos**: when a recording is ready, paste its YouTube ID into `yt`. Until then the card opens the matching guide.
- **Status**: change `status.items` (`ok`, `issue`, `soon`) and `status.updated`.
- **Popular questions** on the home page: `popular`.

**Studio, Go and Connect guides** come from the official step-by-step user guides (Oct 2026), with their screenshots in `assets/guides/<portal>/`. Names, emails, phone numbers, addresses and card details in those screenshots are blurred, because this site is public. To redo a screenshot, replace the file with the same name. Add one to a guide with `['img', 'studio/file.jpg', 'Caption']`.

Atlas, SCADA, Artha, Apps and Account guides were drafted from terranxt.com. **Have those portal owners check the steps against the live UI before launch.**

## Update 31 Oct 2026
- **Videos**: the 14 real videos from "Features of pvNXT Application" are in `videos` in `js/data.js` (field `url`). They are SharePoint links: share each as "Anyone with the link" or move them to YouTube (unlisted) so public visitors can watch without signing in.
- **No "Mobile apps" portal**: every portal has Android and iOS apps; portal pages say "Get the <portal> app"; one guide `get-the-app`.
- **Account & billing** (was Account & security) with payment questions. Please have finance/support confirm: `billing-problem`, `billing-invoice`, `account-details`, `account-close`.
- **Polish** (`js/polish.js`, `css/polish.css`): faint Unsplash photo behind portal titles (credited, hotlinked), "Get the app" link, dark footer (hours, phone, email, Contact us), Play/View cursor on desktop, photo on 404.

## Images

The site uses only real screenshots from the portals (`assets/guides/`). There are no stock photos or AI images. A portal page shows its `shot` from `js/data.js`, and portals without one (SCADA, Artha, Apps, Account) show a facts panel instead. When you have real SCADA or Artha screenshots, add them under `assets/guides/` and set `shot`. Video cards use the first screenshot of their linked guide.

## Sign-in

`signin.html` is a demo. Rules for the real version: **no sign-up on help** (accounts are created in the portals) and **one email belongs to one portal**.
Flow: email (or Google / Microsoft / Apple) → look up the account → show "Studio account" → password or one-time code → `my.html`.
Until the pvNXT account API is connected, four test emails are recognised (`studio@`, `go@`, `connect@`, `scada@demo.pvnxt.com`); any other email gets a labelled "Demo only" portal choice. Replace `R.signin` and `user()` in `js/help.js` with the real API, and send contact requests to a helpdesk instead of `mailto:`.

## “Ask us” assistant

The chat button (every page except Contact and Sign in) answers from the guides.
- **Live AI answers:** `api/chat.js` is a Vercel function. In Vercel → Settings → Environment Variables add `ANTHROPIC_API_KEY` (and optionally `CHAT_MODEL`, default `claude-haiku-5-5`). It finds the 4 closest guides in `js/data.js` and the model answers only from them, in the visitor's language, with links to the guides. Basic per-minute rate limit included; add a stronger one (e.g. Vercel KV) before heavy use.
- **Without a key** (or if the API fails) it falls back to a local answer: the best-matching guide's summary and first steps plus links.
- Every answer offers WhatsApp, email and “Raise a request” (pre-filled with the question).

## Language

The globe button (EN / हिन्दी / العربية) uses the Google Translate website widget: it sets the `googtrans` cookie and reloads. Arabic switches the page to right-to-left. Portal names and the logo are marked not to translate. Translation is machine quality; the menu says so. It does not run in local `file://` previews or inside the claude.ai preview (blocked there), only on the real site.

## Deploy

Static files, no build step. On Vercel: import the folder (or repo), framework "Other", output directory `.`. Point `help.pvnxt.com` at it.

## Next steps

1. Pre-render guide pages at build time so search engines index each guide.
2. Connect a helpdesk (Freshdesk, Zoho Desk or similar) for requests and replies.
3. Replace demo sign-in with pvNXT SSO.
4. Record the demo videos and add their YouTube IDs.

### Fixes 31 Oct 2026 (evening)
- Home search results now drop over the portal tiles (the hero no longer clips them) and scroll inside the box on short screens.
- Hero dot pattern is visible again: slow drift plus a soft teal glow behind the search. Stops when "reduce motion" is on.
- Back to top button is back: it stacks above "Ask us" on the same edge (web and mobile, flips for Arabic), drops into the corner on phones when "Ask us" steps away or on pages without it, and hides while the chat is open.
- Mobile footer: two columns per row instead of four squeezed ones.
