/* ============================================================
   ШАҚЫРУ — бәрін осы файлда өзгертесіз (edit everything here)
   ------------------------------------------------------------
   Values in [square brackets] are placeholders — replace them.
   ============================================================ */

window.INVITE = {
  /* --- Мерейтой иесі (the hero of the day) --- */
  mom: {
    name: "Мира",                      // shown big on the cover, used in titles ("Мираның …")
    photo: "img/mom.jpg",              // main photo (portrait, ~1200px tall is plenty)
    age: 50
  },

  /* --- Той (the party) --- */
  event: {
    // ISO date-time in Almaty time (+05:00). Used for the countdown and the date strip.
    start: "2026-11-27T20:00:00+05:00",   // Friday, 27 November 2026, 20:00
    gatherTime: "",                        // optional "Қонақтарды қарсы алу" time, e.g. "19:30". "" to hide
    venue: "Жеті тандыр",                  // shown as «Жеті тандыр» мейрамханасы
    venueType: "мейрамханасы",             // or "кафесі" (2GIS lists Жеті тандыр as a cafe)
    hall: "",                              // optional, shown after the venue, e.g. "2-қабат, «Ақ зал»"
    address: "Алматы қ., Наурызбай батыр көшесі, 122–124",
    map2gis: "https://2gis.kz/almaty/firm/70000001111769529?m=76.938672,43.247134/16",
    dressCode: ""                          // optional, e.g. "Ақ немесе пастель түстер". "" to hide
  },

  /* --- Той иелері (hosts, shown at the bottom) --- */
  hosts: "Мира мен Ислам",

  /* --- WhatsApp RSVP --- */
  rsvp: {
    whatsapp: "77012560912",   // RSVP goes here (mom's WhatsApp), digits only
    deadline: ""               // optional "reply until" date, e.g. "2026-11-24". "" to hide
  },

  /* --- Музыка (optional) --- */
  music: {
    src: "audio/music.mp3",    // put your mp3 here; if the file is missing, the button hides itself
    startOnOpen: true          // starts softly when the guest taps «Шақыруды ашу»
  },

  /* --- Естелік беттері: photo timeline (any number of slides; year is optional) --- */
  timeline: [
    { photo: "img/photos/photo-1.jpg", year: "", caption: "" },
    { photo: "img/photos/photo-2.jpg", year: "", caption: "" },
    { photo: "img/photos/photo-3.jpg", year: "", caption: "" },
    { photo: "img/photos/photo-4.jpg", year: "", caption: "" },
    { photo: "img/photos/photo-5.jpg", year: "", caption: "" },
    { photo: "img/photos/photo-6.jpg", year: "2026", caption: "" }
  ],

  /* --- Guests with short links:  https://<site>/?g=aigul ---
     Up to 5 names per invitation. Put the honorific right in the name
     ("Айгүл апай", "Бауыржан аға"). Grammar (Сізді/Сіздерді, мен/бен/пен,
     және) is handled automatically.
     plural: true  → force the plural form for one entry like "Асқар әулеті".
     Ad-hoc links without editing this file: open make-link.html            */
  guests: {
    // aigul:  { names: ["Айгүл апай"] },
    // bekovs: { names: ["Асқар аға", "Гүлнар апай"] },
    // kurdas: { names: ["Динара", "Ерлан", "Жанар", "Мақсат", "Әлия"] },
    // aulet:  { names: ["Сейітқали әулеті"], plural: true }
  }
};
