# JEANS·INK — Session Handoff / Project State

> **For a new Claude session:** read this top-to-bottom and you are fully briefed to continue work on the JEANS·INK website. There is also a local skill named **`jeans-ink-web`** (in `~/.claude/skills/`) with the same operational details — it auto-loads when working on this site. This file is the human-readable, link-shareable version.

---

## 1. What this is
**JEANS·INK** — Mongolian premium jeans-patch brand (Ulaanbaatar). Customers put a patch (наалт) on their jeans. The website lets them browse patterns, **Try On** (upload an image → AI removes background → place on a front+back jeans mock-up), get an **order code**, and **track** the order. A free Google Apps Script backend records orders, alerts the owner on Telegram, and powers Track. Slogan: **YOUR JEANS. NEVER THE SAME.**

## 2. Locations, hosting, deploy
- **Repo / working dir:** `D:\@NKHA\JEANS-INK\JEANS-INK-WEB`
- **Git remote:** `github.com/morphues0505-cpu/jeans-ink`, branch **`master`**
- **Git author:** name `morphues0505-cpu`, email `254476816+morphues0505-cpu@users.noreply.github.com`
- **Live (primary, clean):** https://jeans-ink-mn.netlify.app/
- **Live (mirror):** https://morphues0505-cpu.github.io/jeans-ink/
- **DEPLOY = just `git push` to master.** Netlify **and** GitHub Pages both auto-deploy in ~1–2 min. No build step (static site).
- **Marketing files (NOT in repo):** `D:\@NKHA\JEANS-INK\MARKETING\` — `JEANS-INK-Content-Calendar.xlsx`, `JEANS-INK-Design-Guide.xlsx`, `build_*.py`.
- **Source assets (gitignored):** `assets/_src/` holds large originals (e.g. 17MB `hero.png`).

## 3. ⚠️ CRITICAL: cache-busting
Browsers cache CSS/JS hard. **After editing `css/style.css` or `js/*.js`, bump its `?v=N` query in every page that links it.** Current versions (keep incrementing):
- `css/style.css` → **v16** (linked by all 7 pages)
- `js/main.js` → **v5** (linked by index, catalog, mockup, how-it-works, order, track — NOT admin)
- `js/mockup.js` → **v18** · `js/config.js` → **v2**
- HTML files are served fresh — inline `<style>`/`<script>` changes need **no** bump.
- Tell the user to **hard-refresh** (Ctrl+Shift+R / clear mobile cache) after CSS/JS changes.

## 4. Pages & key files
- `index.html` — home (animated hero, stats, collection, **FAQ**, "BE DIFFERENT." block)
- `catalog.html` — pattern picker (max 4 select → Try On). Reads `js/patterns.js`.
- `mockup.html` + `js/mockup.js` — **Try On studio** (the most complex page)
- `how-it-works.html`, `order.html`, `track.html`, `admin.html`
- `css/style.css` — shared styles + design tokens
- `js/main.js` — nav, social links, **favicon + floating Messenger button + neon cursor + page-wipe transition + scroll-reveal** (all injected here, site-wide)
- `js/config.js` — `JI_API` (backend URL) + `FB_URL`
- `js/patterns.js` — `window.PATTERN_GROUPS` (3 groups: Tribal Geometry p1–10, Urban Glitch p11–20, Ghost Knot p21–30)
- `backend/Code.gs` + `backend/SETUP.md` — Apps Script backend (running copy lives in the user's Google account)

## 5. Design system
- Palette: `--accent #C5F230` (neon green), `--ink #0D0D0D` (black), `--white #FEF9F5`, olive active-nav `#7B7457`. Dark theme (`body.theme-dark`).
- Fonts: **Montserrat** (body + Mongolian Cyrillic), **Anton** (English display headings; Cyrillic falls back to Montserrat).
- Pill buttons (radius 999px). Pricing: **A4 29,000₮ / A3 49,000₮**, **20,000₮ advance** (transfer OR in person when dropping off jeans), remainder after the patch is applied.
- Address: Баянгол дүүрэг, 13-р хороо, Өргөө 1 кино театрын ард, 4-р байр. Hours 09:00–19:00. Material: denim/jeans only, heat-press.

## 6. Backend (Phase B) — Google Apps Script + Sheet
- `JI_API` in `config.js` = the deployed `/exec` web-app URL (already wired & working).
- Sheet tab is named **`Orders`** — **never rename the tab** (`getSheetByName('Orders')`). The spreadsheet FILE can be renamed freely.
- **Order flow / statuses:** new order → `🕐 Хүлээгдэж буй` (+ Telegram alert) → owner sets `Захиалга авсаан` when customer brings jeans (→ email fires) → `Хийж байноо BRO` → `Дуусаад chatlyaa OK`. An **hourly time-trigger auto-cancels** pending orders older than 24h → `❌ Цуцлагдсан` (row kept, not deleted).
- `findOrder_` returns a `state` (`pending` / `active` / `cancelled`); `track.html` renders each differently.
- Script Properties (in Apps Script): `TELEGRAM_TOKEN`, `TELEGRAM_CHAT_ID` (=`5604048508`), `NOTIFY_EMAIL` (=`morphues0505@gmail.com`).
- CORS: GET works cross-origin; the site POSTs as `text/plain` (no preflight).
- **Editing `Code.gs` requires the USER to redeploy** (I cannot): paste new code → Run `setup()` (authorize) → Deploy → Manage deployments → Edit → **New version** → Deploy. The URL stays the same. Always give the user step-by-step instructions for this.

## 7. Try-On mockup (`js/mockup.js`)
- **fabric.js** (CDN) — two canvases, front + back shown together.
- **`@imgly/background-removal`** (CDN ESM) — in-browser AI bg removal on upload.
- Canvas opts: `allowTouchScrolling:true, selection:false` (mobile page-scroll over canvas + no marquee).
- Ready-sticker **tray** sits directly under the jeans; tapping adds to the **active side** (Урд/Хойд selector). Catalog picks arrive via localStorage `ji_patterns` → auto-placed on front + added to tray.
- Per-side **🔍 zoom button** (bottom-right of each stage) opens a lightbox via `composeSide()`.
- Confirm modal → POSTs `action:create` to backend → shows server-generated 5-digit code (offline fallback = local random). Mentions 20k advance + 24h rule.

## 8. Images — WebP optimized (sharp-cli + ffmpeg installed)
- Patterns `assets/patterns/p1..p30.webp` (was 6.7MB PNG → ~1MB WebP). Hero `assets/hero.webp` (desktop) + `assets/hero-mobile.webp` (portrait crop). `assets/og.jpg` (social share card), `assets/favicon.png` (neon X).
- **References use `.webp`** in catalog, mockup defaults, admin. Admin "WEBP татах" re-encodes uploads to webp via canvas. PNG/JPG sources removed (kept in `_src/`).
- ffmpeg note: Git Bash mangles `C:` paths in filters → prefix `MSYS_NO_PATHCONV=1`, copy Windows fonts to a local `_fonts/` dir. Recipes (og card, favicon, crop) are in the `jeans-ink-web` skill.

## 9. Animations / polish (all CSS/JS, free, reduced-motion safe)
- Home **hero**: ken-burns zoom + neon glow; portrait crop on mobile.
- Hero **"Never the same."**: intense RGB-split **glitch** + a **blue→purple scan band** (`.hg-scan`, background-clip:text + moving mask). (A per-letter "shatter" was tried and reverted — too cartoonish; don't reintroduce.)
- Site-wide (via main.js): **neon cursor + meteor trail** (desktop only), **page-wipe transition** (black panel + neon edge + X logo sweeps up on navigate; new page fades in), **button shine sweep**, **scroll reveals** (`.reveal` + `.reveal-delay-N`, IntersectionObserver), **floating Messenger button**, **favicon**.
- FAQ accordion = pop-bounce. Nav active link = subtle olive `#7B7457` pill (Order Now stays bright neon).

## 10. Social / chatbot (USER-managed in Meta, not in code)
- FB Page "Jns·ink", Messenger **`m.me/1158158530715843`** (all FB links + floating button point here). Page ID `1158158530715843`.
- Meta Business Suite → Inbox → Automations: **Auto reply** (greeting) + **FAQ** (Үнэ/Материал/Хаяг/Захиалах) are set up. Limitation: tap-based; Meta's free-text intent matching is weak for Mongolian. Upgrade path if they want a real button-menu + catch-all bot = **ManyChat** (free, not yet set up).

## 11. Tools available in the environment
node v24 + npm, python 3.12, **ffmpeg**, **sharp-cli** (`sharp -i in -o out -f webp -q 82`), git, gh. No ImageMagick. Preview server isn't configured for this repo → the **user verifies live on their phone/desktop** after each push (reading generated images back with the Read tool is fine).

## 12. Admin
`admin.html` — client-side password gate `ADMIN_PASS = 'jeansink2026'` (soft lock, visible in source — real protection = the user's GitHub/Google accounts + 2FA). Add/remove patterns → AI bg-removal → download `.webp` → put in `assets/patterns/` → Export `patterns.js` → **commit both**. Changes only go live after commit.

## 13. ✅ Done in the big session
Phase A full site; brand/palette/font system; Try-On with AI bg removal + front/back + tray + zoom; pattern catalog (WebP); admin; Phase B backend (orders→Telegram→Sheet→Track, email on confirm, 24h auto-cancel, 20k advance copy); clean Netlify domain; OG share preview; favicon; floating Messenger; neon cursor; page-wipe transition; hero animation + glitch + scan; many mobile fixes (modal, upload zone, tray position, canvas scroll, track form, nav active); WebP optimization; marketing xlsx files; `jeans-ink-web` skill + sharp-cli install; "BE DIFFERENT." home copy.

## 14. ⏳ Pending / next ideas
- Real product **photo gallery** / before-after slider / testimonials (need the user's photos).
- **Hero video** (user generates an image-to-video loop → I embed as `<video>` bg).
- **Google Maps** embed on order/contact (waiting on a confirmed office address).
- Chatbot "Үнэ" answer → update to mention **20k advance** (user edits in Meta).
- Clean up **test orders** in the Sheet; remove any **unwanted patterns** (user names the IDs → I edit `patterns.js` + delete `.webp`).
- Optional: custom domain **`jeans-ink.mn`** (paid; user buys, I connect DNS to Netlify); spam-protection on the order endpoint (low priority).

## 15. How to continue (for the new session)
1. Read this file + load the `jeans-ink-web` skill.
2. Work in `D:\@NKHA\JEANS-INK\JEANS-INK-WEB`. Make edits, **bump `?v=` on any CSS/JS touched**, `git commit` + `git push` (commit msgs end with the Co-Authored-By line; user wants direct pushes to master).
3. Tell the user to hard-refresh; they verify live. For backend code changes, give redeploy steps (§6).
