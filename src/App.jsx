import { useState, useEffect, useRef, useMemo } from "react";
import {
  Scissors, MapPin, Phone, Camera, Clock, Check, ChevronLeft,
  ChevronRight, MessageCircle, Calendar as CalendarIcon, User, Menu, X
} from "lucide-react";
import interiorImg from "./assets/img2.webp";
import hassanAboutImg from "./assets/img1.jpg";
import teamHassanImg from "./assets/team1.jpg";
import teamHusamImg from "./assets/team2.jpg";
import teamNabilImg from "./assets/team3.jpg";
import teamXhoiImg from "./assets/team4.jpg";
import teamStevenImg from "./assets/team5.jpg";

/* ============================================================
   CONFIG — edit these with the real shop details
   ============================================================ */
const SHOP = {
  name: "La Barberia Hassan",
  whatsapp: "393297057699",
  phoneDisplay: "+39 329 705 7699",
  instagram: "hassan_barber_istambul",
  tiktok: "barbershopditiktok",
  address: "Vicolo Volto S. Luca, 18, 37122 Verona VR, Italia",
  mapsQuery: "Vicolo Volto S. Luca 18 37122 Verona VR",
};

// 0=Sunday ... 6=Saturday (matches JS Date.getDay())
const HOURS = {
  0: { open: "10:00", close: "19:00" },
  1: { open: "09:00", close: "20:00" },
  2: { open: "09:00", close: "20:00" },
  3: { open: "09:00", close: "20:00" },
  4: { open: "09:00", close: "20:00" },
  5: { open: "09:00", close: "20:00" },
  6: { open: "09:00", close: "20:00" },
};
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday -> Sunday display order

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const T = {
  it: {
    dir: "ltr", code: "IT", label: "Italiano",
    nav: { home: "Home", services: "Servizi", booking: "Prenota", about: "Chi siamo", contact: "Contatti" },
    hero: {
      kicker: "Rasatura · Taglio · Tradizione",
      location: "VERONA · ITALIA",
      tagline: "Il tuo parrucchiere di fiducia nel cuore di Verona.",
      ctaBook: "Prenota il tuo turno",
      ctaServices: "Scopri i servizi",
    },
    about: {
      title: "L'esperienza che hai sempre desiderato",
      body: "Niente code infinite, niente tagli frettolosi. Il nostro team si prende il tempo necessario per capire il tuo stile e realizzarlo con precisione. Oltre 30 anni di esperienza al tuo servizio, nel cuore di Verona.",
      badge: "Mano esperta, ferri affilati",
    },
    team: { title: "Il Team", subtitle: "Esperienza, precisione, personalità" },
    reviews: { title: "Cosa dicono di noi" },
    services: {
      title: "Servizi", subtitle: "Prezzi e durate indicativi. Studenti e militari: taglio + lavaggio €10 (documento richiesto).",
      bookThis: "Prenota", minutes: "min",
    },
    booking: {
      title: "Prenota il tuo turno",
      subtitle: "Scegli servizio, data e orario: confermiamo su WhatsApp.",
      steps: ["Servizio", "Data", "Orario", "I tuoi dati"],
      selectServicePlaceholder: "Seleziona un servizio",
      dateLabel: "Data", closedNotice: "Siamo chiusi in questo giorno. Scegli un'altra data.",
      timeLabel: "Orario disponibile", noSlots: "Nessun orario libero in questa data, prova un altro giorno.",
      loadingSlots: "Verifico gli orari disponibili…",
      nameLabel: "Nome e cognome", phoneLabel: "Telefono",
      notesLabel: "Note (opzionale)", notesPlaceholder: "Es. richiesta particolare, prima volta, ecc.",
      summaryTitle: "Riepilogo prenotazione",
      confirmButton: "Conferma e invia su WhatsApp",
      backButton: "Indietro", nextButton: "Continua",
      successTitle: "Richiesta inviata!",
      successBody: "Apri WhatsApp per confermare con la barberia. Il tuo orario è riservato per qualche minuto.",
      requiredNotice: "Compila nome e telefono per continuare.",
      reserving: "Sto riservando il tuo orario…",
      newBooking: "Nuova prenotazione",
    },
    hours: {
      title: "Orari", closed: "Chiuso", note: "Dom 10:00–19:00 · Tutti gli altri giorni 09:00–20:00",
      days: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
    },
    location: { title: "Dove siamo", openInMaps: "Apri in Maps", nearby: "Arena / Piazza Bra 3 min · Castelvecchio 5 min · Piazza Erbe 8 min · Stazione 20 min" },
    contact: { title: "Contatti", call: "Chiama", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok" },
    waMessage: (d) =>
      `Ciao! Vorrei prenotare:\nServizio: ${d.serviceName}\nData: ${d.date}\nOrario: ${d.time}\nNome: ${d.name}\nTelefono: ${d.phone}${d.notes ? `\nNote: ${d.notes}` : ""}`,
  },
  en: {
    dir: "ltr", code: "EN", label: "English",
    nav: { home: "Home", services: "Services", booking: "Booking", about: "About", contact: "Contact" },
    hero: {
      kicker: "Shave · Cut · Tradition",
      location: "VERONA · ITALY",
      tagline: "Your trusted barber in the heart of Verona.",
      ctaBook: "Book your turn",
      ctaServices: "See services",
    },
    about: {
      title: "The experience you always wanted",
      body: "No endless queues, no rushed cuts. Our team takes the time to understand your style and execute it with precision. Over 30 years of experience at your service, in the heart of Verona.",
      badge: "Steady hand, sharp tools",
    },
    team: { title: "The Team", subtitle: "Experience, precision, personality" },
    reviews: { title: "What our clients say" },
    services: {
      title: "Services", subtitle: "Indicative prices and durations. Students & military: cut + wash €10 (ID required).",
      bookThis: "Book", minutes: "min",
    },
    booking: {
      title: "Book your turn",
      subtitle: "Pick a service, date and time — we'll confirm on WhatsApp.",
      steps: ["Service", "Date", "Time", "Your details"],
      selectServicePlaceholder: "Select a service",
      dateLabel: "Date", closedNotice: "We're closed this day. Pick another date.",
      timeLabel: "Available time", noSlots: "No free slots this day, try another one.",
      loadingSlots: "Checking available times…",
      nameLabel: "Full name", phoneLabel: "Phone",
      notesLabel: "Notes (optional)", notesPlaceholder: "E.g. special request, first visit, etc.",
      summaryTitle: "Booking summary",
      confirmButton: "Confirm and send on WhatsApp",
      backButton: "Back", nextButton: "Continue",
      successTitle: "Request sent!",
      successBody: "Open WhatsApp to confirm with the barbershop. Your slot is held for a few minutes.",
      requiredNotice: "Fill in name and phone to continue.",
      reserving: "Holding your slot…",
      newBooking: "New booking",
    },
    hours: {
      title: "Opening hours", closed: "Closed", note: "Sun 10:00–19:00 · All other days 09:00–20:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    location: { title: "Find us", openInMaps: "Open in Maps", nearby: "Arena / Piazza Bra 3 min · Castelvecchio 5 min · Piazza Erbe 8 min · Stazione 20 min" },
    contact: { title: "Contact", call: "Call", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok" },
    waMessage: (d) =>
      `Hi! I'd like to book:\nService: ${d.serviceName}\nDate: ${d.date}\nTime: ${d.time}\nName: ${d.name}\nPhone: ${d.phone}${d.notes ? `\nNotes: ${d.notes}` : ""}`,
  },
  fr: {
    dir: "ltr", code: "FR", label: "Français",
    nav: { home: "Accueil", services: "Services", booking: "Réserver", about: "À propos", contact: "Contact" },
    hero: {
      kicker: "Rasage · Coupe · Tradition",
      location: "VÉRONE · ITALIE",
      tagline: "Votre barbier de confiance au cœur de Vérone.",
      ctaBook: "Réserver votre tour",
      ctaServices: "Voir les services",
    },
    about: {
      title: "L'expérience que vous avez toujours voulue",
      body: "Pas de longues files d'attente, pas de coupes précipitées. Notre équipe prend le temps de comprendre votre style et de le réaliser avec précision. Plus de 30 ans d'expérience à votre service, au cœur de Vérone.",
      badge: "Main sûre, outils aiguisés",
    },
    team: { title: "L'Équipe", subtitle: "Expérience, précision, personnalité" },
    reviews: { title: "Ce que disent nos clients" },
    services: {
      title: "Services", subtitle: "Prix et durées indicatifs. Étudiants & militaires : coupe + lavage €10 (justificatif requis).",
      bookThis: "Réserver", minutes: "min",
    },
    booking: {
      title: "Réserver votre tour",
      subtitle: "Choisissez service, date et heure — nous confirmons sur WhatsApp.",
      steps: ["Service", "Date", "Heure", "Vos coordonnées"],
      selectServicePlaceholder: "Choisir un service",
      dateLabel: "Date", closedNotice: "Nous sommes fermés ce jour. Choisissez une autre date.",
      timeLabel: "Heure disponible", noSlots: "Aucun créneau libre ce jour, essayez un autre jour.",
      loadingSlots: "Vérification des horaires…",
      nameLabel: "Nom complet", phoneLabel: "Téléphone",
      notesLabel: "Notes (facultatif)", notesPlaceholder: "Ex. demande particulière, première visite, etc.",
      summaryTitle: "Récapitulatif de la réservation",
      confirmButton: "Confirmer et envoyer sur WhatsApp",
      backButton: "Retour", nextButton: "Continuer",
      successTitle: "Demande envoyée !",
      successBody: "Ouvrez WhatsApp pour confirmer avec le salon. Votre créneau est réservé quelques minutes.",
      requiredNotice: "Remplissez nom et téléphone pour continuer.",
      reserving: "Réservation du créneau…",
      newBooking: "Nouvelle réservation",
    },
    hours: {
      title: "Horaires", closed: "Fermé", note: "Dim 10h–19h · Tous les autres jours 09h–20h",
      days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    },
    location: { title: "Où nous trouver", openInMaps: "Ouvrir sur Maps", nearby: "Arena / Piazza Bra 3 min · Castelvecchio 5 min · Piazza Erbe 8 min · Stazione 20 min" },
    contact: { title: "Contact", call: "Appeler", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok" },
    waMessage: (d) =>
      `Bonjour ! Je souhaite réserver :\nService : ${d.serviceName}\nDate : ${d.date}\nHeure : ${d.time}\nNom : ${d.name}\nTéléphone : ${d.phone}${d.notes ? `\nNotes : ${d.notes}` : ""}`,
  },
  ar: {
    dir: "rtl", code: "AR", label: "العربية",
    nav: { home: "الرئيسية", services: "الخدمات", booking: "حجز موعد", about: "من نحن", contact: "تواصل" },
    hero: {
      kicker: "حلاقة · قص · تقاليد",
      location: "فيرونا · إيطاليا",
      tagline: "حلّاقك الموثوق في قلب فيرونا.",
      ctaBook: "احجز دورك",
      ctaServices: "اطّلع على الخدمات",
    },
    about: {
      title: "التجربة التي طالما أردتها",
      body: "لا انتظار طويل، لا قصات متسرعة. فريقنا يأخذ الوقت الكافي لفهم أسلوبك وتنفيذه بدقة. أكثر من 30 سنة من الخبرة في خدمتك، في قلب فيرونا.",
      badge: "يد ثابتة، أدوات حادة",
    },
    team: { title: "الفريق", subtitle: "خبرة، دقة، شخصية" },
    reviews: { title: "ماذا يقول عملاؤنا" },
    services: {
      title: "الخدمات", subtitle: "الأسعار والمدد تقريبية. الطلاب والعسكريون: قصة + غسيل €10 (بإبراز الوثيقة).",
      bookThis: "حجز", minutes: "دقيقة",
    },
    booking: {
      title: "احجز دورك",
      subtitle: "اختر الخدمة والتاريخ والوقت — نؤكد عبر واتساب.",
      steps: ["الخدمة", "التاريخ", "الوقت", "بياناتك"],
      selectServicePlaceholder: "اختر خدمة",
      dateLabel: "التاريخ", closedNotice: "نحن مغلقون في هذا اليوم. اختر تاريخًا آخر.",
      timeLabel: "الوقت المتاح", noSlots: "لا توجد مواعيد متاحة في هذا اليوم، جرّب يومًا آخر.",
      loadingSlots: "جارٍ التحقق من الأوقات المتاحة…",
      nameLabel: "الاسم الكامل", phoneLabel: "رقم الهاتف",
      notesLabel: "ملاحظات (اختياري)", notesPlaceholder: "مثال: طلب خاص، زيارة أولى، إلخ.",
      summaryTitle: "ملخص الحجز",
      confirmButton: "تأكيد والإرسال عبر واتساب",
      backButton: "رجوع", nextButton: "استمرار",
      successTitle: "تم إرسال الطلب!",
      successBody: "افتح واتساب لتأكيد الحجز مع الصالون. موعدك محجوز لبضع دقائق.",
      requiredNotice: "أدخل الاسم والهاتف للاستمرار.",
      reserving: "جارٍ حجز موعدك…",
      newBooking: "حجز جديد",
    },
    hours: {
      title: "ساعات العمل", closed: "مغلق", note: "الأحد ١٠:٠٠–١٩:٠٠ · سائر الأيام ٠٩:٠٠–٢٠:٠٠",
      days: ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
    },
    location: { title: "موقعنا", openInMaps: "فتح في الخرائط", nearby: "Arena / Piazza Bra 3 دقائق · Castelvecchio 5 دقائق · Piazza Erbe 8 دقائق" },
    contact: { title: "تواصل معنا", call: "اتصال", whatsapp: "واتساب", instagram: "إنستغرام", tiktok: "تيك توك" },
    waMessage: (d) =>
      `مرحباً! أرغب في حجز موعد:\nالخدمة: ${d.serviceName}\nالتاريخ: ${d.date}\nالوقت: ${d.time}\nالاسم: ${d.name}\nالهاتف: ${d.phone}${d.notes ? `\nملاحظات: ${d.notes}` : ""}`,
  },
};

const LANGS = ["it", "ar", "fr", "en"];

/* ============================================================
   TEAM
   ============================================================ */
const TEAM = [
  {
    name: "Hassan",
    photo: teamHassanImg,
    role: { it: "Titolare", en: "Owner", fr: "Propriétaire", ar: "المالك" },
    desc: {
      it: "30+ anni d'esperienza. Tradizione e precisione assoluta per tagli impeccabili e barbe scolpite su misura.",
      en: "30+ years of experience. Tradition and absolute precision for impeccable cuts and perfectly sculpted beards.",
      fr: "30+ ans d'expérience. Tradition et précision absolue pour des coupes impeccables et des barbes sculptées sur mesure.",
      ar: "أكثر من 30 سنة خبرة. تقليد ودقة مطلقة لقصات لا تشوبها شائبة ولحى منحوتة بالمقاس.",
    },
  },
  {
    name: "Husam",
    photo: teamHusamImg,
    role: { it: "Barbiere", en: "Barber", fr: "Barbier", ar: "حلاق" },
    desc: {
      it: "Tecnica e simmetria perfetta. Skin fade pulite e linee definite per un look ordinato e professionale.",
      en: "Perfect technique and symmetry. Clean skin fades and defined lines for a sharp, professional look.",
      fr: "Technique et symétrie parfaites. Skin fades propres et lignes définies pour un look soigné et professionnel.",
      ar: "تقنية وتناسق مثاليان. تدرج نظيف وخطوط محددة لمظهر أنيق واحترافي.",
    },
  },
  {
    name: "Nabil",
    photo: teamNabilImg,
    role: { it: "Barbiere", en: "Barber", fr: "Barbier", ar: "حلاق" },
    desc: {
      it: "Energia e tendenze moderne. Tagli freschi, dinamici e styling personalizzato per uno stile contemporaneo.",
      en: "Energy and modern trends. Fresh, dynamic cuts and personalised styling for a contemporary look.",
      fr: "Énergie et tendances modernes. Coupes fraîches, dynamiques et styling personnalisé pour un style contemporain.",
      ar: "طاقة وأناقة عصرية. قصات عصرية وتسريحات مخصصة لأسلوب معاصر.",
    },
  },
  {
    name: "Xhoi",
    photo: teamXhoiImg,
    role: { it: "Barbiere", en: "Barber", fr: "Barbier", ar: "حلاق" },
    desc: {
      it: "Fade morbide e contorni netti per un risultato sempre impeccabile.",
      en: "Smooth fades and sharp outlines for an always impeccable result.",
      fr: "Fades doux et contours nets pour un résultat toujours impeccable.",
      ar: "تدرج ناعم وحواف حادة لنتيجة لا تشوبها شائبة دائماً.",
    },
  },
  {
    name: "Steven",
    photo: teamStevenImg,
    role: { it: "Barbiere", en: "Barber", fr: "Barbier", ar: "حلاق" },
    desc: {
      it: "Creatività e attenzione al viso. Tagli personalizzati e barba curata per distinguerti con eleganza.",
      en: "Creativity and attention to detail. Personalised cuts and groomed beard to distinguish you with elegance.",
      fr: "Créativité et attention au détail. Coupes personnalisées et barbe soignée pour vous distinguer avec élégance.",
      ar: "إبداع وعناية بالتفاصيل. قصات مخصصة ولحية مرتبة لتتميز بأناقة.",
    },
  },
];

/* ============================================================
   REVIEWS
   ============================================================ */
const REVIEWS = [
  {
    name: "Adam", city: "Verona",
    text: "Sono rimasto davvero soddisfatto del servizio! Il personale è gentilissimo e professionale. Tornerò sicuramente.",
  },
  {
    name: "Marco", city: "Verona",
    text: "L'ambiente è curato e accogliente. Il taglio è stato fatto con grande attenzione ai dettagli. Consiglio vivamente.",
  },
  {
    name: "Marc", city: "USA",
    text: "I came to Verona for the Opera and needed a quick haircut. Even as a tourist I was welcomed like a regular. Great service!",
  },
];

/* ============================================================
   SERVICES
   ============================================================ */
const SERVICES = [
  {
    id: "classic", duration: 30, price: 20,
    name: { it: "Taglio", en: "Haircut", fr: "Coupe", ar: "قصة شعر" },
    desc: {
      it: "Taglio su misura con forbici e rifinitura a rasoio.",
      en: "Tailored cut with scissors and razor finish.",
      fr: "Coupe sur mesure aux ciseaux avec finition au rasoir.",
      ar: "قصة مخصصة بالمقص مع لمسة نهائية بالشفرة.",
    },
  },
  {
    id: "beard", duration: 20, price: 10,
    name: { it: "Barba", en: "Beard Trim", fr: "Barbe", ar: "لحية" },
    desc: {
      it: "Definizione e modellatura della barba con rasoio.",
      en: "Beard shaping and definition with razor.",
      fr: "Mise en forme et définition de la barbe au rasoir.",
      ar: "تشكيل اللحية وتحديدها بالشفرة.",
    },
  },
  {
    id: "beardCombo", duration: 45, price: 25,
    name: { it: "Taglio + Barba", en: "Cut + Beard", fr: "Coupe + Barbe", ar: "قص + لحية" },
    desc: {
      it: "Il rituale completo: capelli e barba in un unico turno.",
      en: "The full ritual: hair and beard in one sitting.",
      fr: "Le rituel complet : cheveux et barbe en une seule séance.",
      ar: "الطقس الكامل: الشعر واللحية في جلسة واحدة.",
    },
  },
  {
    id: "shave", duration: 25, price: 15,
    name: { it: "Rasatura a Mano Libera", en: "Freehand Shave", fr: "Rasage à Main Levée", ar: "حلاقة يدوية" },
    desc: {
      it: "Rasatura tradizionale con rasoio, schiuma calda e panno caldo.",
      en: "Traditional razor shave with hot foam and towel.",
      fr: "Rasage traditionnel au rasoir, mousse chaude et serviette.",
      ar: "حلاقة تقليدية بالشفرة مع رغوة ومنشفة ساخنة.",
    },
  },
  {
    id: "kids", duration: 20, price: 10,
    name: { it: "Taglio Bambino", en: "Kids Cut", fr: "Coupe Enfant", ar: "قصة أطفال" },
    desc: {
      it: "Per i più piccoli, fino a 12 anni.",
      en: "For little ones, up to 12 years old.",
      fr: "Pour les petits, jusqu'à 12 ans.",
      ar: "للصغار حتى 12 سنة.",
    },
  },
  {
    id: "color", duration: 60, price: 40,
    name: { it: "Taglio + Colorazione", en: "Cut + Color", fr: "Coupe + Couleur", ar: "قص + صبغة" },
    desc: {
      it: "Taglio e coloritura professionale, su consulenza.",
      en: "Haircut and professional coloring, by consultation.",
      fr: "Coupe et coloration professionnelle, sur consultation.",
      ar: "قصة وتلوين بإشراف مهني، بعد استشارة.",
    },
  },
];

/* ============================================================
   STYLE (fonts + design tokens)
   ============================================================ */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant:ital,wght@0,500;1,500&family=Work+Sans:wght@400;500;600;700&family=Amiri:wght@400;700&family=Cairo:wght@400;500;600;700&display=swap');

.lbh-root {
  --ink:#15110d; --panel:#221a14; --panel-2:#2c2118;
  --brass:#c79a45; --brass-light:#e6c787; --burgundy:#732734;
  --cream:#ede2cd; --cream-dim:#b6a587; --line:rgba(199,154,69,0.25);
  background:var(--ink); color:var(--cream);
  font-family:'Work Sans',sans-serif;
  scroll-behavior:smooth;
  position:relative; overflow-x:hidden;
}
.lbh-root[dir="rtl"] { font-family:'Cairo','Work Sans',sans-serif; }
.lbh-root[dir="rtl"] .f-display { font-family:'Amiri','Cinzel',serif; }
.f-display { font-family:'Cinzel',serif; letter-spacing:0.05em; }
.f-tagline { font-family:'Cormorant',serif; font-style:italic; }
.lbh-root[dir="rtl"] .f-tagline { font-family:'Amiri',serif; font-style:normal; }

.brass-text {
  background:linear-gradient(180deg,var(--brass-light),var(--brass) 60%,#9c7530);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.hairline { border-color:var(--line); }
.panel-bg { background:var(--panel); }
.panel2-bg { background:var(--panel-2); }

.stripe-band {
  height:10px;
  background-image:repeating-linear-gradient(-45deg,
    var(--burgundy) 0 14px, var(--cream) 14px 28px, #1f2a3a 28px 42px);
  background-size:200% 100%;
  animation: stripe-move 6s linear infinite;
}
@media (prefers-reduced-motion: reduce) { .stripe-band { animation:none; } }
@keyframes stripe-move { from { background-position:0 0; } to { background-position:-120px 0; } }

.ticket-card {
  background:var(--panel);
  border:1px solid var(--line);
  position:relative;
  border-radius:4px;
}
.ticket-card::before, .ticket-card::after {
  content:""; position:absolute; width:14px; height:14px; background:var(--ink);
  border-radius:50%; top:50%; transform:translateY(-50%);
}
.ticket-card::before { left:-8px; }
.ticket-card::after { right:-8px; }
.lbh-root[dir="rtl"] .ticket-card::before { left:auto; right:-8px; }
.lbh-root[dir="rtl"] .ticket-card::after { right:auto; left:-8px; }

.btn-brass {
  background:linear-gradient(180deg,var(--brass-light),var(--brass));
  color:#241a0e; font-weight:600;
}
.btn-brass:hover { filter:brightness(1.08); }
.btn-outline {
  border:1px solid var(--brass); color:var(--brass-light);
  background:transparent;
}
.btn-outline:hover { background:rgba(199,154,69,0.08); }

input, select, textarea {
  background:var(--panel-2); border:1px solid var(--line); color:var(--cream);
  border-radius:6px;
}
input:focus, select:focus, textarea:focus, button:focus-visible, a:focus-visible {
  outline:2px solid var(--brass-light); outline-offset:2px;
}
input::placeholder, textarea::placeholder { color:var(--cream-dim); }

.lang-btn { color:var(--cream-dim); border-bottom:2px solid transparent; }
.lang-btn[data-active="true"] { color:var(--brass-light); border-bottom-color:var(--brass); }

.step-dot { width:8px; height:8px; border-radius:50%; background:var(--line); }
.step-dot[data-active="true"] { background:var(--brass); }
.step-dot[data-done="true"] { background:var(--brass-light); }
`;

/* ============================================================
   HELPERS
   ============================================================ */
function todayStr() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function maxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
function timeToMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function minToTime(m) {
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const mm = (m % 60).toString().padStart(2, "0");
  return `${h}:${mm}`;
}
function getSlots(dateStr, durationMin, reserved) {
  if (!dateStr) return [];
  const dayNum = new Date(dateStr + "T00:00:00").getDay();
  const cfg = HOURS[dayNum];
  if (!cfg) return [];
  const step = 30;
  const openM = timeToMin(cfg.open);
  const closeM = timeToMin(cfg.close);
  const lunchStartM = cfg.lunchStart ? timeToMin(cfg.lunchStart) : null;
  const lunchEndM = cfg.lunchEnd ? timeToMin(cfg.lunchEnd) : null;
  const isToday = dateStr === todayStr();
  const now = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes() + 15;
  const slots = [];
  for (let t = openM; t + durationMin <= closeM; t += step) {
    if (lunchStartM != null && t < lunchEndM && t + durationMin > lunchStartM) continue;
    if (isToday && t <= nowM) continue;
    const overlaps = reserved.some((r) => t < r.start + r.duration && t + durationMin > r.start);
    if (overlaps) continue;
    slots.push(t);
  }
  return slots.map(minToTime);
}
/*
 * NOTE on storage: this demo blocks repeat-booked times using the browser's
 * localStorage, so it only prevents double-booking within the SAME browser.
 * It does NOT share availability between different customers' devices.
 * For real shared availability across all visitors you need a small backend
 * (e.g. Supabase, Firebase, or a Vercel serverless function + database).
 * The actual booking notification still works fully via WhatsApp regardless.
 */
async function fetchReserved(dateStr) {
  try {
    const raw = localStorage.getItem(`slots:${dateStr}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}
async function reserveSlot(dateStr, startMin, durationMin) {
  try {
    const key = `slots:${dateStr}`;
    const existing = await fetchReserved(dateStr);
    existing.push({ start: startMin, duration: durationMin });
    localStorage.setItem(key, JSON.stringify(existing));
    return true;
  } catch (e) { return false; }
}

/* ============================================================
   SMALL VISUAL PIECES
   ============================================================ */
function TikTokIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

function GrainOverlay() {
  return (
    <svg aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none", mixBlendMode: "overlay", zIndex: 1 }}>
      <filter id="lbhGrain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /></filter>
      <rect width="100%" height="100%" filter="url(#lbhGrain)" />
    </svg>
  );
}

function BadgeEmblem({ size = 200 }) {
  const r = 78, c = 100;
  const topPath = `M ${c - r},${c} A ${r},${r} 0 1 1 ${c + r},${c}`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label="La Barberia Hassan emblem">
      <circle cx="100" cy="100" r="96" fill="none" stroke="var(--brass)" strokeWidth="2" opacity="0.6" />
      <circle cx="100" cy="100" r="84" fill="none" stroke="var(--brass)" strokeWidth="1" opacity="0.4" />
      <path id="lbhArc" d={topPath} fill="none" />
      <text fontFamily="Cinzel, serif" fontSize="15" fontWeight="600" letterSpacing="3" fill="var(--brass-light)">
        <textPath href="#lbhArc" startOffset="50%" textAnchor="middle">LA BARBERIA</textPath>
      </text>
      <g transform="translate(100,108)">
        <rect x="-46" y="-9" width="12" height="34" rx="3" fill="none" stroke="var(--cream-dim)" strokeWidth="1.2" />
        <rect x="-46" y="-9" width="12" height="34" rx="3" fill="url(#poleStripe)" opacity="0.85" />
        <rect x="34" y="-9" width="12" height="34" rx="3" fill="none" stroke="var(--cream-dim)" strokeWidth="1.2" />
        <rect x="34" y="-9" width="12" height="34" rx="3" fill="url(#poleStripe)" opacity="0.85" />
        <g stroke="var(--cream)" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <circle cx="-12" cy="14" r="4" />
          <circle cx="-12" cy="-10" r="4" />
          <line x1="-9" y1="11" x2="16" y2="-14" />
          <line x1="-9" y1="-7" x2="16" y2="14" />
        </g>
        <defs>
          <pattern id="poleStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="4" fill="var(--burgundy)" />
            <rect y="4" width="8" height="4" fill="var(--cream)" />
          </pattern>
        </defs>
      </g>
      <text x="100" y="160" fontFamily="Cinzel, serif" fontSize="12" fontWeight="600" letterSpacing="2" fill="var(--cream-dim)" textAnchor="middle">
        HASSAN · VERONA
      </text>
    </svg>
  );
}

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [lang, setLang] = useState("it");
  const t = T[lang];
  const [menuOpen, setMenuOpen] = useState(false);

  const [booking, setBooking] = useState({ serviceId: null, date: "", time: "", name: "", phone: "", notes: "" });
  const [step, setStep] = useState(1);
  const [reserved, setReserved] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservedDone, setReservedDone] = useState(false);
  const bookingRef = useRef(null);
  const reserveGuard = useRef(false);

  const service = SERVICES.find((s) => s.id === booking.serviceId) || null;

  useEffect(() => {
    if (!booking.date) { setReserved([]); return; }
    setLoadingSlots(true);
    fetchReserved(booking.date).then((r) => { setReserved(r); setLoadingSlots(false); });
  }, [booking.date]);

  const slots = useMemo(
    () => (service && booking.date ? getSlots(booking.date, service.duration, reserved) : []),
    [service, booking.date, reserved]
  );

  const dayNum = booking.date ? new Date(booking.date + "T00:00:00").getDay() : null;
  const isClosedDay = booking.date ? !HOURS[dayNum] : false;

  function selectService(id) {
    setBooking((p) => ({ ...p, serviceId: id, time: "" }));
    setStep(2);
    setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }
  function goStep(n) { setStep(n); }
  function canNext() {
    if (step === 1) return !!booking.serviceId;
    if (step === 2) return !!booking.date && !isClosedDay;
    if (step === 3) return !!booking.time;
    if (step === 4) return booking.name.trim() && booking.phone.trim();
    return true;
  }

  useEffect(() => {
    if (step === 5 && !reserveGuard.current && service && booking.date && booking.time) {
      reserveGuard.current = true;
      setReserving(true);
      reserveSlot(booking.date, timeToMin(booking.time), service.duration).then(() => {
        setReserving(false);
        setReservedDone(true);
      });
    }
  }, [step]); // eslint-disable-line

  function resetBooking() {
    setBooking({ serviceId: null, date: "", time: "", name: "", phone: "", notes: "" });
    setStep(1); setReservedDone(false); reserveGuard.current = false;
  }

  const waLink = service && booking.date && booking.time
    ? `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(
        t.waMessage({ serviceName: service.name[lang], date: booking.date, time: booking.time, name: booking.name, phone: booking.phone, notes: booking.notes })
      )}`
    : "#";

  const navLinks = [
    { id: "hero", label: t.nav.home },
    { id: "services", label: t.nav.services },
    { id: "booking", label: t.nav.booking },
    { id: "about", label: t.nav.about },
    { id: "contact", label: t.nav.contact },
  ];

  return (
    <div className="lbh-root min-h-screen" dir={t.dir}>
      <style>{STYLE}</style>
      <GrainOverlay />

      {/* NAV */}
      <header className="sticky top-0 z-40 panel-bg border-b hairline">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 gap-3">
          <button className="md:hidden p-2 text-[var(--cream)]" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <a href="#hero" className="flex items-center gap-2 shrink-0">
            <Scissors size={18} className="text-[var(--brass)]" />
            <span className="f-display text-sm sm:text-base text-[var(--cream)]">LA BARBERIA <span className="text-[var(--brass-light)]">HASSAN</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} className="text-[var(--cream-dim)] hover:text-[var(--brass-light)] transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
            {LANGS.map((code) => (
              <button key={code} className="lang-btn pb-0.5 px-0.5" data-active={lang === code} onClick={() => setLang(code)} aria-label={T[code].label}>
                {T[code].code}
              </button>
            ))}
          </div>
        </div>
        {menuOpen && (
          <nav className="md:hidden flex flex-col px-4 pb-3 gap-2 text-sm border-t hairline">
            {navLinks.map((l) => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setMenuOpen(false)} className="py-1 text-[var(--cream-dim)]">{l.label}</a>
            ))}
          </nav>
        )}
      </header>
      <div className="stripe-band" />

      {/* HERO */}
      <section id="hero" className="relative px-4 py-16 sm:py-24 text-center overflow-hidden">
        <img src={interiorImg} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.18 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(21,17,13,0.6) 0%, rgba(21,17,13,0.85) 100%)" }} />
        <div className="relative max-w-2xl mx-auto flex flex-col items-center gap-6">
          <BadgeEmblem size={150} />
          <p className="f-display text-xs sm:text-sm tracking-[0.25em] text-[var(--cream-dim)]">{t.hero.kicker}</p>
          <h1 className="f-display brass-text text-4xl sm:text-6xl leading-tight">LA BARBERIA</h1>
          <h2 className="f-display text-2xl sm:text-4xl text-[var(--cream)]">HASSAN</h2>
          <p className="text-xs sm:text-sm tracking-[0.3em] text-[var(--cream-dim)]">{t.hero.location}</p>
          <p className="f-tagline text-lg sm:text-2xl text-[var(--cream)] max-w-md">{t.hero.tagline}</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <a href="#booking" className="btn-brass px-6 py-3 rounded text-sm font-semibold">{t.hero.ctaBook}</a>
            <a href="#services" className="btn-outline px-6 py-3 rounded text-sm font-semibold">{t.hero.ctaServices}</a>
          </div>
        </div>
      </section>
      <div className="stripe-band" />

      {/* ABOUT */}
      <section id="about" className="px-4 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="f-display text-xs tracking-[0.25em] text-[var(--brass)] mb-3">{t.about.badge}</p>
          <h2 className="f-display text-3xl text-[var(--cream)] mb-4">{t.about.title}</h2>
          <p className="text-[var(--cream-dim)] leading-relaxed">{t.about.body}</p>
        </div>
        <div className="flex justify-center">
          <img src={hassanAboutImg} alt="Hassan" style={{ width: "100%", maxWidth: 380, borderRadius: 4, border: "1px solid var(--line)", objectFit: "cover" }} />
        </div>
      </section>

      {/* TEAM */}
      <section id="team" className="px-4 py-16 panel-bg">
        <div className="max-w-5xl mx-auto">
          <h2 className="f-display text-3xl text-center text-[var(--cream)] mb-2">{t.team.title}</h2>
          <p className="text-center text-[var(--cream-dim)] mb-10 text-sm">{t.team.subtitle}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="flex flex-col rounded overflow-hidden">
                <img src={member.photo} alt={member.name} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top" }} />
                <div className="panel2-bg p-4 flex flex-col gap-2 flex-1 text-center border hairline border-t-0">
                  <h3 className="f-display text-base text-[var(--cream)]">{member.name}<span className="text-[var(--brass)] font-normal">, {member.role[lang]}</span></h3>
                  <p className="text-sm text-[var(--cream-dim)] leading-relaxed">{member.desc[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="px-4 py-16 panel-bg">
        <div className="max-w-5xl mx-auto">
          <h2 className="f-display text-3xl text-center text-[var(--cream)] mb-2">{t.services.title}</h2>
          <p className="text-center text-[var(--cream-dim)] mb-10 text-sm">{t.services.subtitle}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((s, i) => (
              <div key={s.id} className="ticket-card p-5 flex flex-col gap-2">
                <span className="f-display text-xs text-[var(--brass)]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="f-display text-lg text-[var(--cream)]">{s.name[lang]}</h3>
                <p className="text-sm text-[var(--cream-dim)] flex-1">{s.desc[lang]}</p>
                <div className="flex items-center justify-between pt-2 border-t hairline">
                  <span className="text-xs text-[var(--cream-dim)]">{s.duration} {t.services.minutes}</span>
                  <span className="f-display text-[var(--brass-light)]">€{s.price}</span>
                </div>
                <button onClick={() => selectService(s.id)} className="btn-outline mt-2 py-2 rounded text-sm font-semibold">
                  {t.services.bookThis}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="px-4 py-16 max-w-5xl mx-auto">
        <h2 className="f-display text-3xl text-center text-[var(--cream)] mb-10">{t.reviews.title}</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <div key={r.name} className="ticket-card p-5 flex flex-col gap-3">
              <p className="text-sm text-[var(--cream-dim)] leading-relaxed flex-1">"{r.text}"</p>
              <div className="border-t hairline pt-3">
                <p className="f-display text-sm text-[var(--cream)]">{r.name}</p>
                <p className="text-xs text-[var(--brass)]">{r.city}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="stripe-band" />

      {/* BOOKING */}
      <section id="booking" ref={bookingRef} className="px-4 py-16 max-w-2xl mx-auto">
        <h2 className="f-display text-3xl text-center text-[var(--cream)] mb-2">{t.booking.title}</h2>
        <p className="text-center text-[var(--cream-dim)] mb-8 text-sm">{t.booking.subtitle}</p>

        {step < 5 && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className="step-dot" data-active={step === n} data-done={step > n} />
            ))}
          </div>
        )}

        <div className="ticket-card p-6">
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[var(--cream-dim)]">{t.booking.selectServicePlaceholder}</label>
              <select value={booking.serviceId || ""} onChange={(e) => setBooking((p) => ({ ...p, serviceId: e.target.value, time: "" }))} className="px-3 py-2 text-sm">
                <option value="" disabled>{t.booking.selectServicePlaceholder}</option>
                {SERVICES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name[lang]} — €{s.price} ({s.duration} {t.services.minutes})</option>
                ))}
              </select>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[var(--cream-dim)] flex items-center gap-2"><CalendarIcon size={14} /> {t.booking.dateLabel}</label>
              <input type="date" min={todayStr()} max={maxDateStr()} value={booking.date}
                onChange={(e) => setBooking((p) => ({ ...p, date: e.target.value, time: "" }))}
                className="px-3 py-2 text-sm" />
              {isClosedDay && <p className="text-sm text-[var(--brass-light)]">{t.booking.closedNotice}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[var(--cream-dim)] flex items-center gap-2"><Clock size={14} /> {t.booking.timeLabel}</label>
              {loadingSlots ? (
                <p className="text-sm text-[var(--cream-dim)]">{t.booking.loadingSlots}</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-[var(--cream-dim)]">{t.booking.noSlots}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((tm) => (
                    <button key={tm} onClick={() => setBooking((p) => ({ ...p, time: tm }))}
                      className="py-2 rounded text-sm border hairline"
                      style={booking.time === tm ? { background: "var(--brass)", color: "#241a0e", fontWeight: 600 } : { color: "var(--cream-dim)" }}>
                      {tm}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-3">
              <label className="text-sm text-[var(--cream-dim)] flex items-center gap-2"><User size={14} /> {t.booking.nameLabel}</label>
              <input type="text" value={booking.name} onChange={(e) => setBooking((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 text-sm" />
              <label className="text-sm text-[var(--cream-dim)] flex items-center gap-2"><Phone size={14} /> {t.booking.phoneLabel}</label>
              <input type="tel" value={booking.phone} onChange={(e) => setBooking((p) => ({ ...p, phone: e.target.value }))} className="px-3 py-2 text-sm" />
              <label className="text-sm text-[var(--cream-dim)]">{t.booking.notesLabel}</label>
              <textarea rows={2} placeholder={t.booking.notesPlaceholder} value={booking.notes} onChange={(e) => setBooking((p) => ({ ...p, notes: e.target.value }))} className="px-3 py-2 text-sm" />
              {!canNext() && (booking.name || booking.phone) && (
                <p className="text-xs text-[var(--brass-light)]">{t.booking.requiredNotice}</p>
              )}
            </div>
          )}

          {step === 5 && service && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-2 text-[var(--brass-light)]"><Check size={20} /><span className="f-display">{t.booking.successTitle}</span></div>
              <div className="w-full text-left rtl:text-right border hairline rounded p-4 text-sm flex flex-col gap-1">
                <p><strong className="text-[var(--cream)]">{t.booking.summaryTitle}</strong></p>
                <p className="text-[var(--cream-dim)]">{service.name[lang]} — €{service.price}</p>
                <p className="text-[var(--cream-dim)]">{booking.date} · {booking.time}</p>
                <p className="text-[var(--cream-dim)]">{booking.name} · {booking.phone}</p>
                {booking.notes && <p className="text-[var(--cream-dim)]">{booking.notes}</p>}
              </div>
              <p className="text-sm text-[var(--cream-dim)]">{reserving ? t.booking.reserving : t.booking.successBody}</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-brass w-full py-3 rounded text-sm font-semibold flex items-center justify-center gap-2">
                <MessageCircle size={16} /> {t.booking.confirmButton}
              </a>
              <button onClick={resetBooking} className="btn-outline w-full py-2 rounded text-sm">{t.booking.newBooking}</button>
            </div>
          )}

          {step < 5 && (
            <div className="flex items-center justify-between pt-6 mt-2 border-t hairline">
              <button onClick={() => goStep(Math.max(1, step - 1))} disabled={step === 1}
                className="btn-outline px-4 py-2 rounded text-sm flex items-center gap-1 disabled:opacity-30">
                <ChevronLeft size={14} /> {t.booking.backButton}
              </button>
              <button onClick={() => goStep(step + 1)} disabled={!canNext()}
                className="btn-brass px-5 py-2 rounded text-sm flex items-center gap-1 disabled:opacity-40">
                {t.booking.nextButton} <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="stripe-band" />

      {/* HOURS + LOCATION */}
      <section id="hours-location" className="px-4 py-16 max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="f-display text-2xl text-[var(--cream)] mb-4 flex items-center gap-2"><Clock size={18} className="text-[var(--brass)]" /> {t.hours.title}</h2>
          <ul className="text-sm divide-y hairline">
            {DAY_ORDER.map((dayNumIdx, i) => {
              const cfg = HOURS[dayNumIdx];
              return (
                <li key={i} className="flex justify-between py-2">
                  <span className="text-[var(--cream-dim)]">{t.hours.days[i]}</span>
                  <span className="text-[var(--cream)]">{cfg ? `${cfg.open} – ${cfg.close}` : t.hours.closed}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-[var(--cream-dim)] mt-3">{t.hours.note}</p>
        </div>
        <div>
          <h2 className="f-display text-2xl text-[var(--cream)] mb-4 flex items-center gap-2"><MapPin size={18} className="text-[var(--brass)]" /> {t.location.title}</h2>
          <p className="text-sm text-[var(--cream-dim)] mb-2">{SHOP.address}</p>
          <p className="text-xs text-[var(--brass)] mb-4">{t.location.nearby}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapsQuery)}`} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2 px-4 py-2 rounded text-sm">
            <MapPin size={14} /> {t.location.openInMaps}
          </a>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-4 py-16 panel-bg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="f-display text-2xl text-[var(--cream)] mb-6">{t.contact.title}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`tel:${SHOP.phoneDisplay.replace(/\s/g, "")}`} className="btn-outline px-5 py-2.5 rounded text-sm flex items-center gap-2"><Phone size={15} /> {t.contact.call}</a>
            <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-5 py-2.5 rounded text-sm flex items-center gap-2"><MessageCircle size={15} /> {t.contact.whatsapp}</a>
            <a href={`https://instagram.com/${SHOP.instagram}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-5 py-2.5 rounded text-sm flex items-center gap-2"><Camera size={15} /> {t.contact.instagram}</a>
            <a href={`https://www.tiktok.com/@${SHOP.tiktok}`} target="_blank" rel="noopener noreferrer" className="btn-outline px-5 py-2.5 rounded text-sm flex items-center gap-2"><TikTokIcon size={15} /> {t.contact.tiktok}</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 py-8 text-center text-xs text-[var(--cream-dim)] border-t hairline pb-24 md:pb-8">
        © {new Date().getFullYear()} {SHOP.name} — Verona
      </footer>

      {/* MOBILE QUICK BAR */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 panel-bg border-t hairline flex">
        <a href="#booking" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[var(--brass-light)]">
          <CalendarIcon size={18} /><span className="text-[11px]">{t.nav.booking}</span>
        </a>
        <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[var(--cream-dim)]">
          <MessageCircle size={18} /><span className="text-[11px]">{t.contact.whatsapp}</span>
        </a>
      </div>
    </div>
  );
}
