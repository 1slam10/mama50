/* ==========================================================
   Туған күнге шақыру · Мира 50 — behaviour
   No dependencies. All data comes from js/config.js
   ========================================================== */
(function () {
  "use strict";

  var C = window.INVITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var params = new URLSearchParams(location.search);

  /* ----------------------------------------------------------
     Kazakh language helpers
     ---------------------------------------------------------- */
  var KZ = {
    months: ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"],
    monthsDat: ["қаңтарға", "ақпанға", "наурызға", "сәуірге", "мамырға", "маусымға", "шілдеге", "тамызға", "қыркүйекке", "қазанға", "қарашаға", "желтоқсанға"],
    weekdays: ["жексенбі", "дүйсенбі", "сейсенбі", "сәрсенбі", "бейсенбі", "жұма", "сенбі"]
  };

  // "мен / бен / пен" after a word, by its last sound; "және" for non-Cyrillic names
  function conjAfter(word) {
    var w = String(word).toLowerCase().replace(/[^a-zа-яёәғқңөұүһі]/g, "");
    w = w.replace(/[ьъ]+$/, "");
    var last = w.slice(-1);
    if (!last || /[a-z]/.test(last)) return "және";
    if ("аәеёиоөұүыіэюяулрймнң".indexOf(last) > -1) return "мен";
    if ("жз".indexOf(last) > -1) return "бен";
    return "пен";
  }

  /* ----------------------------------------------------------
     Guests from the link
       ?g=code           → INVITE.guests[code]
       ?i=<token>        → made by make-link.html (base64url)
       ?to=Name1,Name2   → plain names
     ---------------------------------------------------------- */
  function clean(name) {
    return String(name || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 48);
  }
  function b64urlDecode(t) {
    try {
      t = t.replace(/-/g, "+").replace(/_/g, "/");
      while (t.length % 4) t += "=";
      var bin = atob(t), bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch (e) { return ""; }
  }
  function readGuest() {
    var names = [], kids = [], plural = false;
    var g = params.get("g"), i = params.get("i"), to = params.get("to");
    var list = C.guests || {};
    var entry = window.GUEST || (g && list[g.toLowerCase()]);   // window.GUEST is baked into /<slug>/ pages
    if (entry) {
      names = entry.names || [];
      kids = entry.kids || [];
      plural = !!entry.plural;
    } else if (i) {
      var raw = b64urlDecode(i);
      if (raw.charAt(0) === "*") { plural = true; raw = raw.slice(1); }
      names = raw.split("|");
    } else if (to) {
      names = to.split(/[,|;]/);
      plural = params.get("p") === "1";
    }
    names = names.map(clean).filter(Boolean).slice(0, 5);
    kids = kids.map(clean).filter(Boolean).slice(0, 8);
    if (names.some(function (n) { return /(отбасы|әулеті|жанұясы|семья)/i.test(n); })) plural = true;
    return { names: names, kids: kids, plural: plural || names.length + kids.length !== 1 };
  }

  var guest = readGuest();
  var P = guest.plural;             // true → Сіздер forms
  var n = guest.names.length;

  // "A", "A мен B", "A, B және C"
  function joinKz(a) {
    if (a.length === 0) return "";
    if (a.length === 1) return a[0];
    if (a.length === 2) return a[0] + " " + conjAfter(a[0]) + " " + a[1];
    return a.slice(0, -1).join(", ") + " және " + a[a.length - 1];
  }
  // lead names only (parents speak for the family in titles and WhatsApp)
  function namesPlain() { return joinKz(guest.names); }

  function renderNames(el) {
    el.textContent = "";
    el.setAttribute("data-count", String(n));
    var line = function (text, cls) {
      var s = document.createElement("span");
      s.className = cls || "names__line";
      s.textContent = text;
      el.appendChild(s);
    };
    if (n === 0) { line("туыстарымыз бен достарымыз"); return; }
    if (n === 1) { line(guest.names[0]); return; }
    if (n === 2) {
      line(guest.names[0]);
      line(conjAfter(guest.names[0]), "names__and");
      line(guest.names[1]);
      return;
    }
    guest.names.forEach(function (name, idx) {
      if (idx < n - 2) line(name + ",");
      else if (idx === n - 2) { line(name); line("және", "names__and"); }
      else line(name);
    });
  }
  function renderFamily(el) {
    renderNames(el);
    if (n && guest.kids.length) {
      var k = document.createElement("span");
      k.className = "names__kids";
      k.textContent = joinKz(guest.kids);
      el.appendChild(k);
    }
  }

  // shrink a names block until its longest line fits; if that would get too small,
  // let long names wrap at the space and only make sure the longest single word fits
  var measurer;
  function textWidth(text, el) {
    measurer = measurer || document.createElement("canvas").getContext("2d");
    var cs = getComputedStyle(el);
    measurer.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;
    return measurer.measureText(text).width;
  }
  function fitNames(el) {
    el.style.removeProperty("font-size");
    var lines = $$(".names__line", el);
    lines.forEach(function (l) { l.style.whiteSpace = ""; });
    if (!lines.length) return;
    var avail = el.clientWidth;
    var widest = Math.max.apply(null, lines.map(function (l) { return l.scrollWidth; }));
    if (widest <= avail) return;
    var size = parseFloat(getComputedStyle(el).fontSize);
    var scale = avail / widest * 0.98;
    if (scale >= 0.72) { el.style.fontSize = Math.floor(size * scale) + "px"; return; }
    // wrap mode
    lines.forEach(function (l) { l.style.whiteSpace = "normal"; l.style.textWrap = "balance"; });
    var words = [];
    lines.forEach(function (l) { words = words.concat(l.textContent.split(" ")); });
    var widestWord = Math.max.apply(null, words.map(function (w) { return textWidth(w, el); }));
    var wordScale = Math.min(1, avail / widestWord * 0.96);
    el.style.fontSize = Math.max(20, Math.floor(size * wordScale)) + "px";
  }

  /* ----------------------------------------------------------
     Date & texts
     ---------------------------------------------------------- */
  var ev = C.event || {};
  var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(ev.start || "");
  var D = m ? { y: +m[1], mo: +m[2], d: +m[3], hh: m[4], mm: m[5] } : null;
  var startMs = Date.parse(ev.start || "");

  var dl = /^(\d{4})-(\d{2})-(\d{2})/.exec((C.rsvp && C.rsvp.deadline) || "");
  var deadlineDat = dl ? (+dl[3]) + " " + KZ.monthsDat[+dl[2] - 1] : "";

  var age = (C.mom && C.mom.age) || 50;

  // Ilik septik (genitive): Мира → Мираның, Әсел → Әселдің, Мақсат → Мақсаттың
  function genitive(w) {
    var low = w.toLowerCase(), last = low.slice(-1);
    var vs = low.replace(/[^аәеёиоөұүыіэюяу]/g, ""), front = /[әеөүіэи]/.test(vs.slice(-1));
    var suf = /[аәеёоөұүыіэюямнң]/.test(last) ? (front ? "нің" : "ның")
            : /[лрйузжи]/.test(last) ? (front ? "дің" : "дың") : (front ? "тің" : "тың");
    return w + suf;
  }
  var momName = (C.mom && C.mom.name) || "";
  var momGen = momName ? genitive(momName) : "";

  // The hosts (той иелері: Мира мен Ислам) speak together as «біз»: "шақырамыз", "күтеміз"
  var T = {
    invite: (P ? "Сіздерді" : "Сізді") + " " + (momGen ? momGen + " " : "") + age + " жасқа толу мерекесіне шақырамыз!",
    soft: (momGen ? momGen + " жарты ғасырлық белесін" : "Жарты ғасырлық белесті") +
          " ең жақын, ең қымбат адамдарымызбен бірге атап өткіміз келеді. " +
          (P ? "Келіңіздер" : "Келіңіз") + ", бірге күліп, би билеп, есте қаларлық кеш өткізейік!",
    gift: "Біз үшін ең қымбат сыйлық — " + (P ? "Сіздердің қасымызда болуларыңыз." : "Сіздің қасымызда болуыңыз."),
    shashu: "Қазақ салты бойынша қуанышты сәтте шашу шашылады. " +
            (P ? "Ақ тілектеріңізбен бірге шашу шашыңыздар!" : "Ақ тілегіңізбен бірге шашу шашыңыз!"),
    rsvpTitle: P ? "Келетіндеріңізді растаңыздар" : "Келетініңізді растаңыз",
    rsvpText: (P ? "Жауаптарыңызды " : "Жауабыңызды ") + (deadlineDat ? deadlineDat + " дейін күтеміз." : "WhatsApp арқылы күтеміз."),
    yes: P ? "Келеміз" : "Келемін",
    no: P ? "Келе алмаймыз" : "Келе алмаймын",
    await: (P ? "Сіздерді" : "Сізді") + " асыға күтеміз!"
  };

  var B = {
    "mom.name": (C.mom && C.mom.name) || "",
    "mom.age": String(age),
    "date.weekday": D ? KZ.weekdays[new Date(Date.UTC(D.y, D.mo - 1, D.d)).getUTCDay()] : "",
    "date.day": D ? String(D.d) : "",
    "date.month": D ? KZ.months[D.mo - 1] : "",
    "date.year": D ? String(D.y) : "",
    "date.time": D ? D.hh + ":" + D.mm : "",
    "date.full": D ? D.d + " " + KZ.months[D.mo - 1] + " " + D.y + " жыл, " + KZ.weekdays[new Date(Date.UTC(D.y, D.mo - 1, D.d)).getUTCDay()] : "",
    "event.gatherLine": ev.gatherTime ? "Қонақтарды қарсы алу — " + ev.gatherTime : "",
    "event.venueLine": (ev.venue ? "«" + ev.venue + "» " + (ev.venueType || "мейрамханасы") : "") + (ev.hall ? ", " + ev.hall : ""),
    "event.address": ev.address || "",
    "event.dressCode": ev.dressCode || "",
    "hosts": C.hosts || ""
  };

  function applyText() {
    $$("[data-bind]").forEach(function (el) {
      var k = el.getAttribute("data-bind");
      if (k in B) el.textContent = B[k];
    });
    $$("[data-if]").forEach(function (el) { el.hidden = !B[el.getAttribute("data-if")]; });
    $$("[data-t]").forEach(function (el) {
      var k = el.getAttribute("data-t");
      if (k in T) el.textContent = T[k];
    });
    $$("[data-names]").forEach(renderFamily);

    var hName = $(".hero__name");
    if (hName) hName.hidden = !B["mom.name"];

    var map = $("#mapBtn");
    if (map && ev.map2gis) map.href = ev.map2gis;

    if (n) document.title = namesPlain() + " · Туған күнге шақыру";
  }

  /* ----------------------------------------------------------
     WhatsApp RSVP
     ---------------------------------------------------------- */
  function waLinks() {
    var phone = String((C.rsvp && C.rsvp.whatsapp) || "").replace(/\D/g, "");
    // people don't call themselves "тәте"/"апа", so honorifics are dropped in their own reply
    var who = joinKz(guest.names.map(function (x) {
      return x.replace(/\s+(тәте|апа|апай|аға|ағай|әже|ата|құдаша|құда|жеңге|көке|әпке)$/i, "");
    }));
    var sg = !P || n === 0;
    var mom = (C.mom && C.mom.name) || "";
    var hello = "Сәлем" + (mom ? ", " + mom : "") + "! " + (who ? "Бұл — " + who + ". " : "");
    // neutral wording (no сен/сіз) so it fits sisters, friends and elders alike
    var msg = {
      yes: hello + "Шақыруға көп рахмет! Міндетті түрде " + (sg ? "келемін" : "келеміз") + ".",
      no: hello + "Шақыруға көп рахмет! Өкінішке орай, келе " + (sg ? "алмаймын" : "алмаймыз") + ". Мерейлі 50 жас құтты болсын!",
      wish: hello + "Мерейлі 50 жас құтты болсын! " + (sg ? "Тілегім" : "Тілегіміз") + ": "
    };
    $$("[data-wa]").forEach(function (a) {
      var text = msg[a.getAttribute("data-wa")];
      a.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
    });
  }

  /* ----------------------------------------------------------
     Photos (placeholder until the file exists)
     ---------------------------------------------------------- */
  function setPhoto(img, src) {
    var frame = img.parentNode;
    if (!src) { frame.classList.add("is-missing"); return; }
    img.addEventListener("error", function () { frame.classList.add("is-missing"); });
    img.addEventListener("load", function () { frame.classList.remove("is-missing"); });
    img.src = src;
  }

  /* ----------------------------------------------------------
     Timeline slider
     ---------------------------------------------------------- */
  function buildSlider() {
    var track = $("#sliderTrack"), dots = $("#sliderDots");
    var items = C.timeline || [];
    var section = $(".timeline");
    if (!items.length) { section.hidden = true; return; }

    items.forEach(function (it, i) {
      var fig = document.createElement("figure");
      fig.className = "slide";
      fig.setAttribute("aria-roledescription", "slide");
      fig.setAttribute("aria-label", (i + 1) + " / " + items.length);

      var frame = document.createElement("div");
      frame.className = "slide__frame";
      var img = document.createElement("img");
      img.alt = [it.year, it.caption].filter(Boolean).join(" — ");
      img.loading = "lazy"; img.decoding = "async";
      var ph = $(".ph").cloneNode(true);
      ph.lastElementChild.textContent = "Сурет " + (i + 1);
      frame.appendChild(img); frame.appendChild(ph);
      fig.appendChild(frame);

      var cap = document.createElement("figcaption");
      if (it.year) { var y = document.createElement("span"); y.className = "slide__year"; y.textContent = it.year; cap.appendChild(y); }
      if (it.caption) { var c = document.createElement("span"); c.className = "slide__cap"; c.textContent = it.caption; cap.appendChild(c); }
      fig.appendChild(cap);
      track.appendChild(fig);
      setPhoto(img, it.photo);

      var dot = document.createElement("button");
      dot.type = "button"; dot.className = "slider__dot";
      dot.setAttribute("aria-label", (i + 1) + "-сурет");
      dot.addEventListener("click", function () { go(i); });
      dots.appendChild(dot);
    });

    var slides = $$(".slide", track), dotEls = $$(".slider__dot", dots);
    var prev = $("#prevBtn"), next = $("#nextBtn"), current = -1;

    function go(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
    }
    function update() {
      var mid = track.scrollLeft + track.clientWidth / 2, best = 0, bestD = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      if (best === current) return;
      current = best;
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === best); });
      dotEls.forEach(function (d, i) { d.setAttribute("aria-current", i === best ? "true" : "false"); });
      prev.disabled = best === 0;
      next.disabled = best === slides.length - 1;
    }
    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    prev.addEventListener("click", function () { go(current - 1); });
    next.addEventListener("click", function () { go(current + 1); });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
    });
    window.addEventListener("resize", function () { current = -1; update(); });
    update();
  }

  /* ----------------------------------------------------------
     Countdown
     ---------------------------------------------------------- */
  function countdown() {
    var grid = $("#countdown"), done = $("#cdDone");
    if (isNaN(startMs)) { $(".countdown").hidden = true; return; }
    var els = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
    var pad = function (v) { return (v < 10 ? "0" : "") + v; };
    function tick() {
      var diff = startMs - Date.now();
      if (diff <= 0) { grid.hidden = true; done.hidden = false; return; }
      var s = Math.floor(diff / 1000);
      els.d.textContent = Math.floor(s / 86400);
      els.h.textContent = pad(Math.floor(s / 3600) % 24);
      els.m.textContent = pad(Math.floor(s / 60) % 60);
      els.s.textContent = pad(s % 60);
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
  }

  /* ----------------------------------------------------------
     Music
     ---------------------------------------------------------- */
  var audio = $("#music"), musicBtn = $("#musicBtn"), musicReady = false;
  function setupMusic() {
    var src = C.music && C.music.src;
    if (!src) return;
    var show = function () { musicReady = true; musicBtn.hidden = false; };
    audio.src = src;
    // iOS won't preload audio before a tap, so check that the file exists with a HEAD request
    if (location.protocol.indexOf("http") === 0 && window.fetch) {
      fetch(src, { method: "HEAD" }).then(function (r) { if (r.ok) show(); }).catch(function () {});
    } else {
      audio.preload = "metadata";
      audio.addEventListener("loadedmetadata", show, { once: true });
    }
    musicBtn.addEventListener("click", function () { audio.paused ? playMusic() : pauseMusic(); });
    audio.addEventListener("play", syncMusic);
    audio.addEventListener("pause", syncMusic);
    var resume = false;
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { resume = !audio.paused; audio.pause(); }
      else if (resume) { playMusic(); }
    });
  }
  function syncMusic() {
    var on = !audio.paused;
    musicBtn.classList.toggle("is-playing", on);
    musicBtn.setAttribute("aria-pressed", on ? "true" : "false");
    musicBtn.setAttribute("aria-label", on ? "Музыканы өшіру" : "Музыканы қосу");
  }
  function playMusic() {
    audio.volume = 0;
    var p = audio.play();
    if (p && p.catch) p.catch(function () {});
    var v = 0, fade = setInterval(function () {
      v = Math.min(0.55, v + 0.05); audio.volume = v;
      if (v >= 0.55) clearInterval(fade);
    }, 160);
  }
  function pauseMusic() { audio.pause(); }

  /* ----------------------------------------------------------
     Шашу — gold coins, wrapped sweets and petals
     ---------------------------------------------------------- */
  var Shashu = (function () {
    var cv = $("#shashuCanvas"), ctx = cv.getContext("2d"), parts = [], running = false, dpr = 1;
    var colors = {
      gold: ["#D9BC82", "#C9A462", "#E6CF9C"],
      sweet: ["#E8BFBB", "#AFC2D7", "#F3DDB0", "#FFFFFF", "#D9A5A1"],
      petal: ["rgba(232,191,187,.95)", "rgba(175,194,215,.95)", "rgba(246,225,222,.95)"]
    };
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function pick(a) { return a[(Math.random() * a.length) | 0]; }
    function spawn(x, y, kind, burst) {
      var ang = burst ? (-Math.PI / 2 + (Math.random() - 0.5) * 1.9) : (Math.PI / 2 + (Math.random() - 0.5) * 0.6);
      var sp = burst ? 7 + Math.random() * 9 : 1 + Math.random() * 2;
      parts.push({
        kind: kind, x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
        r: kind === "coin" ? 7 + Math.random() * 4 : kind === "sweet" ? 6 + Math.random() * 3 : 5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.2,
        flip: Math.random() * Math.PI * 2, vf: 0.08 + Math.random() * 0.12,
        sway: Math.random() * Math.PI * 2,
        color: kind === "coin" ? pick(colors.gold) : kind === "sweet" ? pick(colors.sweet) : pick(colors.petal)
      });
    }
    function drawCoin(p) {
      var sx = Math.abs(Math.cos(p.flip)) * 0.85 + 0.15;
      ctx.scale(sx, 1);
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(132,101,54,.55)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, p.r * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,248,230,.85)"; ctx.stroke();
    }
    function drawSweet(p) {
      var w = p.r * 1.25, h = p.r * 0.85;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = "rgba(85,102,123,.35)"; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(s * w * 0.9, 0);
        ctx.lineTo(s * (w + h * 1.2), -h * 0.9);
        ctx.lineTo(s * (w + h * 1.2), h * 0.9);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      ctx.beginPath(); ctx.ellipse(-w * 0.25, -h * 0.3, w * 0.35, h * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fill();
    }
    function drawPetal(p) {
      var sx = Math.abs(Math.cos(p.flip)) * 0.7 + 0.3;
      ctx.scale(sx, 1);
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r, -p.r * 0.4, p.r * 0.7, p.r, 0, p.r * 1.1);
      ctx.bezierCurveTo(-p.r * 0.7, p.r, -p.r, -p.r * 0.4, 0, -p.r);
      ctx.fillStyle = p.color; ctx.fill();
    }
    function frame() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        p.vy += p.kind === "petal" ? 0.05 : 0.22;
        p.vx *= 0.985; p.vy *= p.kind === "petal" ? 0.97 : 0.985;
        p.sway += 0.05;
        p.x += p.vx + (p.kind === "petal" ? Math.sin(p.sway) * 0.8 : 0);
        p.y += p.vy;
        p.rot += p.vr; p.flip += p.vf;
        if (p.y > innerHeight + 40) { parts.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        if (p.kind === "coin") drawCoin(p); else if (p.kind === "sweet") drawSweet(p); else drawPetal(p);
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(frame);
      else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
    window.addEventListener("resize", size);
    size();
    return {
      burst: function (x, y) {
        var count = reduceMotion ? 24 : (innerWidth < 600 ? 80 : 120);
        for (var i = 0; i < count; i++) {
          var r = Math.random();
          spawn(x + (Math.random() - 0.5) * 30, y, r < 0.45 ? "coin" : r < 0.8 ? "sweet" : "petal", true);
        }
        start();
      },
      shower: function () {
        var count = reduceMotion ? 12 : 46;
        for (var i = 0; i < count; i++) {
          spawn(Math.random() * innerWidth, -20 - Math.random() * innerHeight * 0.6, Math.random() < 0.7 ? "petal" : "coin", false);
        }
        start();
      }
    };
  })();

  /* ----------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------- */
  function reveal() {
    var els = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ----------------------------------------------------------
     Intro
     ---------------------------------------------------------- */
  function intro() {
    var el = $("#intro"), btn = $("#openBtn");
    function finish() {
      el.classList.add("is-gone");
      document.body.classList.remove("is-locked");
      var h = $(".hero__name"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    if (params.has("open")) { el.classList.add("is-gone"); document.body.classList.remove("is-locked"); reveal(); return; }
    btn.addEventListener("click", function () {
      if (C.music && C.music.startOnOpen && musicReady) playMusic();
      el.classList.add("is-opening");
      setTimeout(reveal, 250);
      setTimeout(function () { Shashu.shower(); }, 450);
      setTimeout(finish, reduceMotion ? 50 : 1500);
    });
  }

  /* ----------------------------------------------------------
     Boot
     ---------------------------------------------------------- */
  applyText();
  waLinks();
  setPhoto($('[data-photo="mom"]'), C.mom && C.mom.photo);
  buildSlider();
  countdown();
  setupMusic();
  intro();

  var fitAll = function () { $$("[data-names]").forEach(fitNames); };
  fitAll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  window.addEventListener("resize", fitAll);

  var cue = $(".scroll-cue");
  if (cue) cue.addEventListener("click", function () {
    $("#greet").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  });

  $("#shashuBtn").addEventListener("click", function (e) {
    var r = e.currentTarget.getBoundingClientRect();
    Shashu.burst(r.left + r.width / 2, r.top);
  });
})();
