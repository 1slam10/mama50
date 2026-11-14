# Туған күнге шақыру · Мира, 50

A one-page birthday invitation in plain HTML + CSS + JS, hosted on GitHub Pages. There's no backend and no build step for the site itself.

```
index.html                 the invitation (template + generic page for anyone)
<slug>.html  ×15           personal pages, generated → https://toi.islamadilkhan.me/<slug>
make-link.html             ad-hoc personal links (noindex)
guests.json                ← guest families: names, kids, slug
js/config.js               ← event details, photos, music, WhatsApp number
build_guests.py            builds <slug>.html + guest-links.md
og-cards.js                (optional) personal WhatsApp preview images
css/ js/ img/ fonts/ audio/
```

## Everyday workflow
1. Edit `guests.json` (families) or `js/config.js` (date, place, photos…).
2. Optional, only when names change: `node og-cards.js` makes the personal preview images in `img/og/`. It needs `npm i -D playwright && npx playwright install chromium` once. Without it, a page falls back to the generic `img/og.jpg`.
3. `python3 build_guests.py` writes the 15 `<slug>.html` pages and `guest-links.md` (every link plus a one-tap WhatsApp text).
4. `git add . && git commit -m "update" && git push`. Pages redeploys in about a minute.

Don't edit the generated `<slug>.html` files by hand: they are rebuilt from `index.html`. Removing a family from `guests.json` deletes its page on the next build.

## Photos & music
- `img/mom.jpg`: the cover photo (portrait).
- `img/photos/01.jpg … 06.jpg`: the timeline. Add or remove entries in `config.js`.
- `audio/music.mp3`: optional. The button hides itself if the file is missing.
- iPhone HEIC → JPG and resize: `sips -s format jpeg in.HEIC --out img/mom.jpg && sips -Z 1600 img/mom.jpg`

## Grammar & wording
- The page speaks in Mira's own voice: «шақырамын», «асыға күтемін».
- One person gets *Сізді / Келемін*; a couple or family gets *Сіздерді / Келеміз*.
- Two names are joined with *мен / пен / бен* depending on the last letter; three or more use commas + *және*.
- `kids` show smaller under a gold line. WhatsApp replies and page titles use the lead names.
- RSVP buttons open WhatsApp to `rsvp.whatsapp` with a short thank-you message. Honorifics (тәте, апа…) are dropped there, because people don't call themselves that.

## Link preview (WhatsApp / Telegram / iMessage)
Each page carries full Open Graph tags (title «Қымбатты …!», description with date and place, a 1200×630 card, alt text, site name, locale) plus Twitter-card tags and an apple-touch-icon. WhatsApp caches previews per URL: if you fix something after sending, add `?v=2` to the link.

## Deploy on the subdomain
1. Repo → *Settings → Pages → Deploy from a branch → `main` / root*. `CNAME` sets `toi.islamadilkhan.me`.
2. Cloudflare DNS: `CNAME  toi → <your-username>.github.io`, **DNS only** (grey cloud).
3. When the DNS check passes, tick *Enforce HTTPS*.
4. Different subdomain? Change `CNAME` and `siteUrl` in `guests.json`, then rebuild.

Fonts are self-hosted (Cormorant Garamond + Montserrat, OFL) and checked to contain every Kazakh letter (Ә Ғ Қ Ң Ө Ұ Ү Һ І). `?open` skips the opening animation while you edit.
