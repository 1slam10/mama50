/*
 * Personal link-preview cards for WhatsApp / Telegram (1200×630 JPG)
 *   img/og.jpg          – generic card (root page)
 *   img/og/<slug>.jpg   – one per family from guests.json
 *
 * Optional. Needs Node + Playwright once:
 *   npm i -D playwright && npx playwright install chromium
 *   node og-cards.js && python3 build_guests.py
 * Without it, every page simply uses img/og.jpg.
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "guests.json"), "utf8"));
const cfg = fs.readFileSync(path.join(ROOT, "js/config.js"), "utf8");
const mom = (cfg.match(/mom:\s*\{[^}]*?name:\s*"([^"]*)"/s) || [])[1] || "";
const age = +((cfg.match(/age:\s*(\d+)/) || [])[1] || 50);
const start = (cfg.match(/start:\s*"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/) || []);

const MONTHS = ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"];
const DAYS = ["жексенбі", "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"];
const when = start.length
  ? `${+start[3]} ${MONTHS[+start[2] - 1]} · ${DAYS[new Date(Date.UTC(+start[1], +start[2] - 1, +start[3])).getUTCDay()]} · ${start[4]}:${start[5]}`
  : "";

function conjAfter(word) {
  let w = word.toLowerCase().replace(/[^a-zа-яёәғқңөұүһі]/g, "").replace(/[ьъ]+$/, "");
  const last = w.slice(-1);
  if (!last || /[a-z]/.test(last)) return "және";
  if ("аәеёиоөұүыіэюяулрймнң".includes(last)) return "мен";
  if ("жз".includes(last)) return "бен";
  return "пен";
}
function joinKz(a) {
  if (a.length < 2) return a[0] || "";
  if (a.length === 2) return `${a[0]} ${conjAfter(a[0])} ${a[1]}`;
  return a.slice(0, -1).join(", ") + " және " + a[a.length - 1];
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// self-contained fonts (data URLs) so the card renders the same everywhere
const fontsCss = fs.readFileSync(path.join(ROOT, "css/fonts.css"), "utf8")
  .split("@font-face")
  .filter((b) => /font-weight: (300|400|500)/.test(b) && !/latin-ext/.test(b))
  .map((b) => "@font-face" + b.replace(/url\(\.\.\/fonts\/([^)]+)\)/, (_, f) =>
    `url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, "fonts", f)).toString("base64")})`))
  .join("\n");

const CORNER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 90"><g fill="none" stroke="#C4A46B" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 86 V4 H86"/><path d="M10 86 V10 H86" stroke-width=".7"/><g transform="translate(36 36) rotate(-45) scale(.6)"><path d="M0 -9 V-22 C0 -35 8 -44 18 -44 C28 -44 32 -34 27 -28 C23 -23 15 -25 16 -32 C17 -37 23 -37 23 -32"/><path d="M0 -9 V-22 C0 -35 8 -44 18 -44 C28 -44 32 -34 27 -28 C23 -23 15 -25 16 -32 C17 -37 23 -37 23 -32" transform="scale(-1 1)"/><path d="M0 -9 V2"/><path d="M0 2 C0 9 -6 13 -11 12 C-15 11 -15 6 -11 6.5 M0 2 C0 9 6 13 11 12 C15 11 15 6 11 6.5"/></g></g></svg>`;
const HORN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><g fill="none" stroke="#C4A46B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M60 50 C60 34 66 22 78 18 C92 14 104 22 102 34 C100 44 88 46 85 39 C82 32 90 28 93 33"/><path d="M60 50 C60 34 66 22 78 18 C92 14 104 22 102 34 C100 44 88 46 85 39 C82 32 90 28 93 33" transform="translate(120 0) scale(-1 1)"/><path d="M60 50 V56"/><path d="M60 6 L63.5 12 L60 18 L56.5 12 Z"/><circle cx="38" cy="50" r="1.4" fill="#C4A46B" stroke="none"/><circle cx="82" cy="50" r="1.4" fill="#C4A46B" stroke="none"/></g></svg>`;
const BAND = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 28" width="64" height="28"><g fill="none" stroke="#C4A46B" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M0 14 H4 C12 14 14 5 21 5 C27 5 29 11 25.5 13 C22.5 14.5 19.5 12 21.5 9.5"/><path d="M64 14 H60 C52 14 50 5 43 5 C37 5 35 11 38.5 13 C41.5 14.5 44.5 12 42.5 9.5"/><path d="M4 14 H60" stroke-width=".6"/><path d="M32 14 C32 20 27 24 23 23 C20 22 20 18 23 18.5 M32 14 C32 20 37 24 41 23 C44 22 44 18 41 18.5"/><path d="M32 6 L34.5 10 L32 14 L29.5 10Z"/></g></svg>`;
const bandUrl = "data:image/svg+xml;base64," + Buffer.from(BAND).toString("base64");

function cardHtml(g) {
  const lead = g ? joinKz(g.names) : "";
  const kids = g && g.kids && g.kids.length ? joinKz(g.kids) : "";
  const plural = !g || g.plural || g.names.length + (g.kids || []).length !== 1;
  const middle = g
    ? `<p class="dear">Қымбатты</p><p class="names" id="names">${esc(lead)}${kids ? "" : "!"}</p>${kids ? `<p class="kids">${esc(kids)}!</p>` : ""}`
    : `<p class="await">${plural ? "Сіздерді" : "Сізді"} асыға күтемін!</p>`;
  return `<!doctype html><html lang="kk"><head><meta charset="utf-8"><style>
${fontsCss}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:#FBF8F4;font-family:"Cormorant Garamond",serif;color:#33465D;-webkit-font-smoothing:antialiased;font-variant-numeric:lining-nums}
.card{position:relative;width:1200px;height:630px;display:grid;place-items:center;
 background:radial-gradient(520px 380px at 0% 0%,rgba(232,191,187,.62),rgba(232,191,187,0)),
  radial-gradient(520px 400px at 100% 100%,rgba(175,194,215,.6),rgba(175,194,215,0)),
  radial-gradient(360px 260px at 100% 0%,rgba(246,225,222,.85),rgba(246,225,222,0)),
  radial-gradient(360px 260px at 0% 100%,rgba(223,232,242,.8),rgba(223,232,242,0)),#FBF8F4}
.f1{position:absolute;inset:24px;border:1.5px solid #C4A46B;border-radius:6px}
.f2{position:absolute;inset:32px;border:1px solid #DCC79F;border-radius:4px}
.c{position:absolute;width:96px;height:96px}
.c svg{width:100%;height:100%;display:block}
.col{position:relative;width:740px;text-align:center;display:flex;flex-direction:column;align-items:center}
.horn{width:96px;height:48px}
.eyebrow{margin-top:10px;font-family:Montserrat,sans-serif;font-weight:500;font-size:19px;letter-spacing:.34em;text-transform:uppercase;color:#846536}
.hero{display:flex;align-items:center;justify-content:center;gap:22px;margin-top:6px;line-height:1}
.nm{font-style:italic;font-weight:500;font-size:88px;color:#465F7C}
.dot{width:10px;height:10px;transform:rotate(45deg);background:#C4A46B;margin-top:10px}
.age{font-weight:300;font-size:104px;color:#A3824A}
.dear{margin-top:12px;font-style:italic;font-size:30px;color:#55667B}
.names{margin-top:2px;font-style:italic;font-weight:500;font-size:var(--fs,58px);line-height:1.1;color:#465F7C;text-wrap:balance;max-width:700px}
.kids{margin-top:6px;font-style:italic;font-size:calc(var(--fs,58px)*.6);line-height:1.2;color:#55667B;text-wrap:balance;max-width:600px}
.await{margin-top:16px;font-style:italic;font-weight:500;font-size:54px;color:#465F7C}
.when{margin-top:18px;font-family:Montserrat,sans-serif;font-weight:500;font-size:19px;letter-spacing:.24em;text-transform:uppercase;color:#55667B}
.band{margin-top:16px;width:420px;height:28px;background:url("${bandUrl}") center/64px 28px repeat-x;
 -webkit-mask-image:linear-gradient(90deg,transparent,#000 20%,#000 80%,transparent)}
</style></head><body><div class="card">
<div class="f1"></div><div class="f2"></div>
<div class="c" style="top:38px;left:38px">${CORNER}</div>
<div class="c" style="top:38px;right:38px;transform:scaleX(-1)">${CORNER}</div>
<div class="c" style="bottom:38px;left:38px;transform:scaleY(-1)">${CORNER}</div>
<div class="c" style="bottom:38px;right:38px;transform:scale(-1,-1)">${CORNER}</div>
<div class="col" id="col">
 <div class="horn">${HORN}</div>
 <p class="eyebrow">Туған күнге шақыру</p>
 <div class="hero">${mom ? `<span class="nm">${esc(mom)}</span><span class="dot"></span>` : ""}<span class="age">${age}</span></div>
 ${middle}
 ${when ? `<p class="when">${esc(when)}</p>` : ""}
 <div class="band"></div>
</div></div></body></html>`;
}

(async () => {
  fs.mkdirSync(path.join(ROOT, "img/og"), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  const jobs = [{ out: "img/og.jpg", g: null }].concat(
    data.guests.map((g) => ({ out: `img/og/${g.slug}.jpg`, g })));
  for (const { out, g } of jobs) {
    await page.setContent(cardHtml(g), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    // shrink the names until the whole column fits inside the frame
    await page.evaluate(() => {
      const col = document.getElementById("col"), el = document.getElementById("names");
      if (!el) return;
      let fs = 58;
      while (fs > 30 && (col.offsetHeight > 548 || el.scrollWidth > 700)) {
        fs -= 2; col.style.setProperty("--fs", fs + "px");
      }
    });
    await page.screenshot({ path: path.join(ROOT, out), type: "jpeg", quality: 86 });
    console.log("card:", out);
  }
  await browser.close();
})();
