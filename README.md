# pvNXT Help

The help, guides and demo-videos portal for every pvNXT portal (help.pvnxt.com).
Built on the terranxt.com design system: `css/styles.css` is copied unchanged from the terranxt-site repo, and `css/help.css` adds the help components.

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | Search across all portals, portal tiles, guides by role, common questions, videos, contact |
| Portal | `portal.html?p=studio` | One portal's guides by topic, its demos, link to open the portal |
| Guide | `article.html?a=sign-up` | Step-by-step guide, side nav, save, copy link, feedback, prev/next |
| Videos | `videos.html` (`#studio` filters) | Demo videos by portal, learning paths |
| Search | `search.html?q=boq` | Results across guides and videos |
| Contact | `contact.html?portal=go&topic=...` | Request form with guide suggestions; sends via the visitor's email app |
| Status | `status.html` | Portal status, updated by hand in `js/data.js` |
| Sign in | `signin.html` | Demo sign-in (no password check) |
| My help | `my.html` (`#requests`, `#saved`, `#learning`) | Signed-in workspace: requests, saved guides, learning progress |
| 404 | `404.html` | Not found, with search |

Portal ids: `atlas`, `studio`, `go`, `connect`, `scada`, `artha`, `apps`, `account`.

## Edit content

Everything is in `js/data.js`:
- **Guides**: add an object to `articles` (`id`, portal `p`, topic `t`, `title`, `sum`, `body`). Body blocks: `['p', text]`, `['steps', [...]]`, `['list', [...]]`, `['tip'|'note'|'warn', text]`.
- **Videos**: when a recording is ready, paste its YouTube ID into `yt`. Until then the card opens the matching guide.
- **Status**: change `status.items` (`ok`, `issue`, `soon`) and `status.updated`.
- **Popular questions** on the home page: `popular`.

**Studio, Go and Connect guides** come from the official step-by-step user guides (Oct 2026), with their screenshots in `assets/guides/<portal>/`. Names, emails, phone numbers, addresses and card details in those screenshots are blurred, because this site is public. To redo a screenshot, replace the file with the same name. Add one to a guide with `['img', 'studio/file.jpg', 'Caption']`.

Atlas, SCADA, Artha, Apps and Account guides were drafted from terranxt.com. **Have those portal owners check the steps against the live UI before launch.**

## Images

The site uses only real screenshots from the portals (`assets/guides/`). There are no stock photos or AI images. A portal page shows its `shot` from `js/data.js`, and portals without one (SCADA, Artha, Apps, Account) show a facts panel instead. When you have real SCADA or Artha screenshots, add them under `assets/guides/` and set `shot`. Video cards use the first screenshot of their linked guide.

## Sign-in

`signin.html` is a demo. It stores the user, requests, saved guides and reading progress in the browser (`localStorage`). To go live, replace `R.signin` and `user()` in `js/help.js` with pvNXT single sign-on, and send contact requests to a helpdesk or API instead of `mailto:`.

## Deploy

Static files, no build step. On Vercel: import the folder (or repo), framework "Other", output directory `.`. Point `help.pvnxt.com` at it.

## Next steps

1. Pre-render guide pages at build time so search engines index each guide.
2. Connect a helpdesk (Freshdesk, Zoho Desk or similar) for requests and replies.
3. Replace demo sign-in with pvNXT SSO.
4. Record the demo videos and add their YouTube IDs.
