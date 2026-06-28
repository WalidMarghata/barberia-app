import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { supabase } from './supabase.js';

// Captura o evento de instalação PWA antes do React montar (evita race condition)
let _pwaInstallEvent = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _pwaInstallEvent = e;
  });
}
import {
  Scissors, MapPin, Phone, Camera, Clock, Check, ChevronLeft,
  ChevronRight, MessageCircle, Calendar as CalendarIcon, User, Menu, X,
  Home, Info
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import interiorImg from "./assets/img2.webp";
import heroVideo from "./assets/hero.mp4";
import gallery1 from "./assets/gallery1.mp4";
import gallery2 from "./assets/gallery2.mp4";
import gallery3 from "./assets/gallery3.mp4";
import gallery4 from "./assets/gallery4.mp4";
import gallery5 from "./assets/gallery5.mp4";
import hassanAboutImg from "./assets/img1.jpg";
import teamHassanImg from "./assets/team1.jpg";
import teamHusamImg from "./assets/team2.jpg";
import teamNabilImg from "./assets/team3.jpg";
import teamXhoiImg from "./assets/team4.jpg";
import teamStevenImg from "./assets/team5.jpg";
import studentImg from "./assets/img3.jpeg";
import militaryImg from "./assets/img4.jpg";

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
    promos: {
      student: { badge: "OFFERTA STUDENTI", title: "Taglio e lavaggio a soli", price: "€10!", note: "Presenta il tesserino scolastico per usufruire della promozione." },
      military: { badge: "OFFERTA MILITARI", title: "Taglio e lavaggio a soli", price: "€10!", note: "Presenta il documento militare per usufruire della promozione." },
    },
    chat: { tagline: "Risponderemo il prima possibile", placeholder: "Scrivi il tuo messaggio…", send: "Invia su WhatsApp", defaultMsg: "Ciao! Vorrei avere informazioni sulla barberia." },
    tw: ["Stile", "Precisione", "Tradizione", "Passione"],
    stats: { clients: "Clienti soddisfatti", years: "Anni di esperienza", pros: "Professionisti", rating: "Valutazione media" },
    gallery: { title: "La Nostra Arte", subtitle: "Ogni taglio racconta una storia", tiktokCta: "Altro contenuto disponibile sul nostro TikTok" },
    services: {
      title: "Servizi", subtitle: "Prezzi e durate indicativi. Studenti e militari: taglio + lavaggio €10 (documento richiesto).",
      bookThis: "Prenota", minutes: "min",
    },
    booking: {
      title: "Prenota il tuo turno",
      subtitle: "Scegli barbiere, servizio, data e orario: confermiamo su WhatsApp.",
      steps: ["Barbiere", "Servizio", "Data", "Orario", "I tuoi dati"],
      barberLabel: "Scegli il barbiere",
      selectServicePlaceholder: "Seleziona un servizio",
      dateLabel: "Data", closedNotice: "Siamo chiusi in questo giorno. Scegli un'altra data.",
      timeLabel: "Orario disponibile", noSlots: "Nessun orario libero in questa data, prova un altro giorno.",
      loadingSlots: "Verifico gli orari disponibili…",
      nameLabel: "Nome e cognome", phoneLabel: "Telefono",
      notesLabel: "Note (opzionale)", notesPlaceholder: "Es. richiesta particolare, prima volta, ecc.",
      summaryTitle: "Riepilogo prenotazione",
      confirmButton: "Conferma e invia su WhatsApp",
      backButton: "Indietro", nextButton: "Continua",
      successTitle: "Prenotazione salvata!",
      successBody: "Apri WhatsApp per confermare con la barberia.",
      requiredNotice: "Compila nome e telefono per continuare.",
      reserving: "Sto salvando la prenotazione…",
      newBooking: "Nuova prenotazione",
    },
    hours: {
      title: "Orari", closed: "Chiuso", note: "Dom 10:00–19:00 · Tutti gli altri giorni 09:00–20:00",
      days: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
    },
    location: { title: "Dove siamo", openInMaps: "Apri in Maps", nearby: "Arena / Piazza Bra 3 min · Castelvecchio 5 min · Piazza Erbe 8 min · Stazione 20 min" },
    contact: { title: "Contatti", call: "Chiama", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok" },
    waMessage: (d) =>
      `Ciao! Vorrei prenotare:\nBarbiere: ${d.barberName}\nServizio: ${d.serviceName}\nData: ${d.date}\nOrario: ${d.time}\nNome: ${d.name}\nTelefono: ${d.phone}${d.notes ? `\nNote: ${d.notes}` : ""}`,
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
    promos: {
      student: { badge: "STUDENT OFFER", title: "Cut + wash for only", price: "€10!", note: "Show your student ID to take advantage of this offer." },
      military: { badge: "MILITARY OFFER", title: "Cut + wash for only", price: "€10!", note: "Show your military ID to take advantage of this offer." },
    },
    chat: { tagline: "We'll respond as soon as possible", placeholder: "Write your message…", send: "Send on WhatsApp", defaultMsg: "Hi! I'd like some information about the barbershop." },
    tw: ["Style", "Precision", "Tradition", "Passion"],
    stats: { clients: "Happy clients", years: "Years of experience", pros: "Professionals", rating: "Average rating" },
    gallery: { title: "Our Craft", subtitle: "Every cut tells a story", tiktokCta: "More content available on our TikTok" },
    services: {
      title: "Services", subtitle: "Indicative prices and durations. Students & military: cut + wash €10 (ID required).",
      bookThis: "Book", minutes: "min",
    },
    booking: {
      title: "Book your turn",
      subtitle: "Pick a barber, service, date and time — we'll confirm on WhatsApp.",
      steps: ["Barber", "Service", "Date", "Time", "Your details"],
      barberLabel: "Choose your barber",
      selectServicePlaceholder: "Select a service",
      dateLabel: "Date", closedNotice: "We're closed this day. Pick another date.",
      timeLabel: "Available time", noSlots: "No free slots this day, try another one.",
      loadingSlots: "Checking available times…",
      nameLabel: "Full name", phoneLabel: "Phone",
      notesLabel: "Notes (optional)", notesPlaceholder: "E.g. special request, first visit, etc.",
      summaryTitle: "Booking summary",
      confirmButton: "Confirm and send on WhatsApp",
      backButton: "Back", nextButton: "Continue",
      successTitle: "Booking saved!",
      successBody: "Open WhatsApp to confirm with the barbershop.",
      requiredNotice: "Fill in name and phone to continue.",
      reserving: "Saving your booking…",
      newBooking: "New booking",
    },
    hours: {
      title: "Opening hours", closed: "Closed", note: "Sun 10:00–19:00 · All other days 09:00–20:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    location: { title: "Find us", openInMaps: "Open in Maps", nearby: "Arena / Piazza Bra 3 min · Castelvecchio 5 min · Piazza Erbe 8 min · Stazione 20 min" },
    contact: { title: "Contact", call: "Call", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok" },
    waMessage: (d) =>
      `Hi! I'd like to book:\nBarber: ${d.barberName}\nService: ${d.serviceName}\nDate: ${d.date}\nTime: ${d.time}\nName: ${d.name}\nPhone: ${d.phone}${d.notes ? `\nNotes: ${d.notes}` : ""}`,
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
    promos: {
      student: { badge: "OFFRE ÉTUDIANTS", title: "Coupe + lavage à seulement", price: "€10 !", note: "Présentez votre carte étudiante pour bénéficier de l'offre." },
      military: { badge: "OFFRE MILITAIRES", title: "Coupe + lavage à seulement", price: "€10 !", note: "Présentez votre document militaire pour bénéficier de l'offre." },
    },
    chat: { tagline: "Nous répondrons dès que possible", placeholder: "Écrivez votre message…", send: "Envoyer sur WhatsApp", defaultMsg: "Bonjour ! Je voudrais des informations sur la barberie." },
    tw: ["Style", "Précision", "Tradition", "Passion"],
    stats: { clients: "Clients satisfaits", years: "Ans d'expérience", pros: "Professionnels", rating: "Note moyenne" },
    gallery: { title: "Notre Art", subtitle: "Chaque coupe raconte une histoire", tiktokCta: "Plus de contenu disponible sur notre TikTok" },
    services: {
      title: "Services", subtitle: "Prix et durées indicatifs. Étudiants & militaires : coupe + lavage €10 (justificatif requis).",
      bookThis: "Réserver", minutes: "min",
    },
    booking: {
      title: "Réserver votre tour",
      subtitle: "Choisissez barbier, service, date et heure — nous confirmons sur WhatsApp.",
      steps: ["Barbier", "Service", "Date", "Heure", "Vos coordonnées"],
      barberLabel: "Choisir le barbier",
      selectServicePlaceholder: "Choisir un service",
      dateLabel: "Date", closedNotice: "Nous sommes fermés ce jour. Choisissez une autre date.",
      timeLabel: "Heure disponible", noSlots: "Aucun créneau libre ce jour, essayez un autre jour.",
      loadingSlots: "Vérification des horaires…",
      nameLabel: "Nom complet", phoneLabel: "Téléphone",
      notesLabel: "Notes (facultatif)", notesPlaceholder: "Ex. demande particulière, première visite, etc.",
      summaryTitle: "Récapitulatif de la réservation",
      confirmButton: "Confirmer et envoyer sur WhatsApp",
      backButton: "Retour", nextButton: "Continuer",
      successTitle: "Réservation enregistrée !",
      successBody: "Ouvrez WhatsApp pour confirmer avec le salon.",
      requiredNotice: "Remplissez nom et téléphone pour continuer.",
      reserving: "Enregistrement de la réservation…",
      newBooking: "Nouvelle réservation",
    },
    hours: {
      title: "Horaires", closed: "Fermé", note: "Dim 10h–19h · Tous les autres jours 09h–20h",
      days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
    },
    location: { title: "Où nous trouver", openInMaps: "Ouvrir sur Maps", nearby: "Arena / Piazza Bra 3 min · Castelvecchio 5 min · Piazza Erbe 8 min · Stazione 20 min" },
    contact: { title: "Contact", call: "Appeler", whatsapp: "WhatsApp", instagram: "Instagram", tiktok: "TikTok" },
    waMessage: (d) =>
      `Bonjour ! Je souhaite réserver :\nBarbier : ${d.barberName}\nService : ${d.serviceName}\nDate : ${d.date}\nHeure : ${d.time}\nNom : ${d.name}\nTéléphone : ${d.phone}${d.notes ? `\nNotes : ${d.notes}` : ""}`,
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
    promos: {
      student: { badge: "عرض الطلاب", title: "قصة + غسيل بـ", price: "€10 فقط!", note: "أبرز بطاقة الطالب للاستفادة من العرض." },
      military: { badge: "عرض العسكريين", title: "قصة + غسيل بـ", price: "€10 فقط!", note: "أبرز الوثيقة العسكرية للاستفادة من العرض." },
    },
    chat: { tagline: "سنرد في أقرب وقت ممكن", placeholder: "اكتب رسالتك…", send: "إرسال عبر واتساب", defaultMsg: "مرحباً! أريد الاستفسار عن الصالون." },
    tw: ["أناقة", "دقة", "تراث", "شغف"],
    stats: { clients: "عميل سعيد", years: "سنوات خبرة", pros: "محترفون", rating: "تقييم متوسط" },
    gallery: { title: "فنّنا", subtitle: "كل قصّة تحكي حكاية", tiktokCta: "محتوى أكثر متاح على تيك توك" },
    services: {
      title: "الخدمات", subtitle: "الأسعار والمدد تقريبية. الطلاب والعسكريون: قصة + غسيل €10 (بإبراز الوثيقة).",
      bookThis: "حجز", minutes: "دقيقة",
    },
    booking: {
      title: "احجز دورك",
      subtitle: "اختر الحلاق والخدمة والتاريخ والوقت — نؤكد عبر واتساب.",
      steps: ["الحلاق", "الخدمة", "التاريخ", "الوقت", "بياناتك"],
      barberLabel: "اختر الحلاق",
      selectServicePlaceholder: "اختر خدمة",
      dateLabel: "التاريخ", closedNotice: "نحن مغلقون في هذا اليوم. اختر تاريخًا آخر.",
      timeLabel: "الوقت المتاح", noSlots: "لا توجد مواعيد متاحة في هذا اليوم، جرّب يومًا آخر.",
      loadingSlots: "جارٍ التحقق من الأوقات المتاحة…",
      nameLabel: "الاسم الكامل", phoneLabel: "رقم الهاتف",
      notesLabel: "ملاحظات (اختياري)", notesPlaceholder: "مثال: طلب خاص، زيارة أولى، إلخ.",
      summaryTitle: "ملخص الحجز",
      confirmButton: "تأكيد والإرسال عبر واتساب",
      backButton: "رجوع", nextButton: "استمرار",
      successTitle: "تم حفظ الحجز!",
      successBody: "افتح واتساب لتأكيد الحجز مع الصالون.",
      requiredNotice: "أدخل الاسم والهاتف للاستمرار.",
      reserving: "جارٍ حفظ الحجز…",
      newBooking: "حجز جديد",
    },
    hours: {
      title: "ساعات العمل", closed: "مغلق", note: "الأحد ١٠:٠٠–١٩:٠٠ · سائر الأيام ٠٩:٠٠–٢٠:٠٠",
      days: ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"],
    },
    location: { title: "موقعنا", openInMaps: "فتح في الخرائط", nearby: "Arena / Piazza Bra 3 دقائق · Castelvecchio 5 دقائق · Piazza Erbe 8 دقائق" },
    contact: { title: "تواصل معنا", call: "اتصال", whatsapp: "واتساب", instagram: "إنستغرام", tiktok: "تيك توك" },
    waMessage: (d) =>
      `مرحباً! أرغب في حجز موعد:\nالحلاق: ${d.barberName}\nالخدمة: ${d.serviceName}\nالتاريخ: ${d.date}\nالوقت: ${d.time}\nالاسم: ${d.name}\nالهاتف: ${d.phone}${d.notes ? `\nملاحظات: ${d.notes}` : ""}`,
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
  { name: "Alberto C.", city: "Verona", stars: 5, text: "Ottima barberia nel centro di Verona! Il salone è moderno, pulito e ben organizzato, con un'atmosfera accogliente che ti mette subito a tuo agio. Il team è simpatico e professionale, lavora con grande attenzione ai dettagli." },
  { name: "Adam Z.", city: "Verona", stars: 5, text: "Sono rimasto molto soddisfatto del servizio! Il team è estremamente gentile e ti mette subito a tuo agio. Il taglio è stato fatto con molta attenzione ai dettagli e il risultato finale era esattamente quello che volevo. Ottimo rapporto qualità-prezzo. Consiglio vivamente! 😊" },
  { name: "Riky M.", city: "Verona", stars: 5, text: "Cinque stelle non bastano... Posto bellissimo e team esperto. I barbieri sono eccellenti, ti mettono subito a tuo agio. Non andrò mai da nessun altro." },
  { name: "Fabio C.", city: "Verona", stars: 5, text: "A pochi passi dalla Piazza Bra, ho trovato una barberia dove sono stato accolto calorosamente. La simpatia e la gentilezza dimostrate, unite alla professionalità, mi hanno fatto scegliere questo posto ora e in futuro. A presto!" },
  { name: "Bernadette B.", city: "Francia", stars: 5, text: "Molto attento, molto professionale e molto cortese... non esitate a cercare Hassan! Ho ritrovato mio marito, ringiovanito di almeno 10 anni 😉" },
  { name: "Tony L.", city: "Verona", stars: 5, text: "Professionista e simpatico. Molto bravo con i tagli per i giovani. Ottimo rapporto qualità-prezzo. Altamente raccomandato." },
  { name: "Romeu N.", city: "Verona", stars: 5, text: "Ottimo servizio, personale impeccabile! Un servizio d'eccellenza con prezzi che superano le aspettative. Adorato!" },
  { name: "Miguel F.", city: "Verona", stars: 5, text: "Eccellente 👏" },
  { name: "Taha H.", city: "Verona", stars: 5, text: "Sono uno studente di Verona e vengo qui di tanto in tanto. Il posto è facilmente raggiungibile, organizzato, pulito e soprattutto i tagli sono veloci e precisi. In più c'è l'offerta imperdibile per studenti a partire da €10. Consiglio vivamente! 👍" },
  { name: "Vlad K.", city: "Verona", stars: 5, text: "Even about to close, they let me in when I said I was a tourist! Great people and incredible professionals!" },
  { name: "Florin V.", city: "Verona", stars: 5, text: "Questa barberia ha personale molto simpatico e accogliente, estremamente disponibile e attento ai clienti. Direi che non troverai questo da nessun'altra parte a Verona." },
  { name: "Vincent B.", city: "Olanda", stars: 5, text: "Ho scelto questo barbiere durante le mie vacanze e non me ne pento! È stata la prima volta che mi sono tagliato i capelli così bene da un barbiere." },
  { name: "Cristian B.", city: "Verona", stars: 5, text: "Vado lì a tagliarmi i capelli quando sono a Verona. Sono molto soddisfatto del servizio — veloce, simpatico e a prezzo accessibile. Ed è proprio vicino al centro." },
  { name: "Luigi T.", city: "Verona", stars: 5, text: "Questi ragazzi sono molto bravi e veloci, sanno fare bene il loro lavoro. L'ambiente è ampio e ben ventilato. Meritano un'ottima valutazione." },
  { name: "Matteo A.", city: "Verona", stars: 5, text: "Vado lì da alcuni mesi e sono soddisfatto. Sono molto simpatici, hanno prezzi accessibili e soprattutto fanno esattamente quello che chiedi, a differenza di altre barberie." },
  { name: "Tony D.", city: "UK", stars: 5, text: "Friendly and efficient staff — very affordable place." },
  { name: "Tangram", city: "Verona", stars: 5, text: "Team attento ed esperto. Tagli maschili veloci, precisi ed eleganti. Prezzi molto competitivi." },
  { name: "Michael S.", city: "Verona", stars: 5, text: "I ragazzi sono veloci e ben preparati. Non devi aspettare un'eternità come in altri saloni... i prezzi sono assolutamente eccellenti! Bravi ragazzi." },
  { name: "Lorenzo", city: "Verona", stars: 5, text: "Il migliore per me. Ho sempre difficoltà a trovare qualcuno che mi soddisfi, ma qui sono abili e sanno quello che fanno." },
  { name: "Oscar M.", city: "Spagna", stars: 5, text: "Servicio muy agradable. Corte de pelo estupendo y precio muy razonable. ¡Gracias!" },
  { name: "Hafida B.", city: "Verona", stars: 5, text: "Taglio perfetto, niente da dire, semplicemente perfetto." },
  { name: "Giulietta H.", city: "Verona", stars: 5, text: "Perfetto in tutti i sensi: barba, capelli... servizio impeccabile." },
  { name: "Pasquale N.", city: "Verona", stars: 5, text: "Servizio cortese e con vasta esperienza, oltre a prezzi accessibili. Consiglio a tutti." },
  { name: "Giuseppe G.", city: "Verona", stars: 5, text: "Sempre il migliore. Servizio impeccabile, gentilezza, cortesia e precisione ❤️" },
  { name: "Femke C.", city: "Olanda", stars: 5, text: "Servizio rapido all'arrivo e molto simpatici." },
  { name: "Luigi D.", city: "Verona", stars: 5, text: "Molto bravo a tagliare i capelli, super gentile!!" },
  { name: "Francesco B.", city: "Verona", stars: 5, text: "Sanno quello che fanno. Professionali e molto simpatici." },
  { name: "Diocla66", city: "Verona", stars: 5, text: "Cortesia e simpatia sono caratteristiche marcanti qui. La gentilezza e la competenza del team compensano qualsiasi piccola mancanza." },
  { name: "Florin V.", city: "Verona", stars: 5, text: "Personale molto simpatico e accogliente, estremamente disponibile. Non troverai questo da nessun'altra parte a Verona." },
  { name: "Angelo A.", city: "Verona", stars: 5, text: "Ottimo servizio, sempre un posto dove trovare bravi barbieri." },
  { name: "Asya A.", city: "Verona", stars: 5, text: "Grazie mille per la vostra immensa gentilezza!" },
];

/* ============================================================
   SERVICES
   ============================================================ */
const SERVICES = [
  {
    id: "classic", duration: 30, price: 15,
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
  background:rgba(34,26,20,0.55);
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid rgba(199,154,69,0.2);
  position:relative; border-radius:8px;
  transition:transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s ease, border-color 0.35s ease;
}
.ticket-card:hover {
  transform:translateY(-6px);
  box-shadow:0 20px 60px rgba(199,154,69,0.18);
  border-color:rgba(199,154,69,0.5);
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
  background:linear-gradient(135deg,var(--brass-light),var(--brass) 60%,#9c7530);
  color:#241a0e; font-weight:600;
  box-shadow:0 4px 20px rgba(199,154,69,0.3);
  transition:filter 0.25s, box-shadow 0.25s, transform 0.2s;
}
.btn-brass:hover { filter:brightness(1.12); box-shadow:0 8px 32px rgba(199,154,69,0.55); transform:translateY(-2px); }
.btn-brass:active { transform:translateY(0); }
.btn-outline {
  border:1px solid var(--brass); color:var(--brass-light);
  background:transparent;
  transition:background 0.25s, box-shadow 0.25s, transform 0.2s, border-color 0.25s;
}
.btn-outline:hover { background:rgba(199,154,69,0.1); box-shadow:0 0 20px rgba(199,154,69,0.2); transform:translateY(-2px); border-color:var(--brass-light); }

/* ── WhatsApp chat widget ── */
@keyframes lbh-pulse { 0%,100%{box-shadow:0 4px 20px rgba(37,211,102,0.5)} 50%{box-shadow:0 4px 32px rgba(37,211,102,0.9),0 0 0 10px rgba(37,211,102,0.1)} }
.wa-btn { animation:lbh-pulse 2.5s ease infinite; }
@keyframes lbh-slideup { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:none} }
.wa-popup { animation:lbh-slideup 0.28s cubic-bezier(.4,0,.2,1); transform-origin:bottom right; }

/* ── Scroll reveal ── */
.reveal { opacity:0; transform:translateY(36px); transition:opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1); }
.reveal-left { opacity:0; transform:translateX(-48px); transition:opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1); }
.reveal-right { opacity:0; transform:translateX(48px); transition:opacity 0.75s cubic-bezier(.4,0,.2,1), transform 0.75s cubic-bezier(.4,0,.2,1); }
.reveal.is-visible, .reveal-left.is-visible, .reveal-right.is-visible { opacity:1; transform:none; }
@media (prefers-reduced-motion:reduce) { .reveal,.reveal-left,.reveal-right { opacity:1; transform:none; transition:none; } }

/* ── Hero sequence ── */
@keyframes lbh-fadeup { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
.hero-seq > * { opacity:0; animation:lbh-fadeup 1s cubic-bezier(.4,0,.2,1) forwards; }
.hero-seq > *:nth-child(1){animation-delay:.05s}
.hero-seq > *:nth-child(2){animation-delay:.22s}
.hero-seq > *:nth-child(3){animation-delay:.38s}
.hero-seq > *:nth-child(4){animation-delay:.54s}
.hero-seq > *:nth-child(5){animation-delay:.70s}
.hero-seq > *:nth-child(6){animation-delay:.86s}
.hero-seq > *:nth-child(7){animation-delay:1.02s}
@media(prefers-reduced-motion:reduce){ .hero-seq > * { opacity:1; animation:none; } }

/* ── Team cards ── */
.team-card { transition:transform 0.4s cubic-bezier(.4,0,.2,1), box-shadow 0.4s ease; }
.team-card:hover { transform:translateY(-10px) scale(1.02); box-shadow:0 24px 64px rgba(199,154,69,0.25); }
.team-card .tc-img { overflow:hidden; }
.team-card .tc-img img { transition:transform 0.6s cubic-bezier(.4,0,.2,1); }
.team-card:hover .tc-img img { transform:scale(1.08); }

/* ── Glass panel ── */
.glass-panel {
  background:rgba(34,26,20,0.6);
  backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
  border:1px solid rgba(199,154,69,0.22);
  border-radius:8px;
}

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

/* ── Loading screen ── */
@keyframes lbh-scissors { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(18deg)} }
@keyframes lbh-logoin { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes lbh-loadout { to{opacity:0;pointer-events:none} }
@keyframes lbh-linegrow { from{width:0} to{width:52px} }
.ls-wrap { position:fixed;inset:0;z-index:9999;background:#080808;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px; }
.ls-exit { animation:lbh-loadout 0.5s ease forwards; }
.ls-scissor { color:var(--brass-light);animation:lbh-scissors 0.75s ease-in-out infinite; }
.ls-logo { animation:lbh-logoin 0.9s 0.2s cubic-bezier(.4,0,.2,1) both;text-align:center; }
.ls-line { height:1px;background:linear-gradient(90deg,transparent,var(--brass),transparent);animation:lbh-linegrow 0.9s 0.5s ease both;width:0; }
.ls-sub { font-size:0.62rem;letter-spacing:0.3em;color:var(--cream-dim);animation:lbh-logoin 0.8s 0.7s both; }

/* ── Typewriter cursor ── */
@keyframes lbh-blink { 0%,100%{opacity:1} 50%{opacity:0} }
.tw-cursor { display:inline-block;width:2px;height:0.85em;background:var(--brass);margin-left:3px;vertical-align:middle;animation:lbh-blink 1s step-end infinite;border-radius:1px; }

/* ── Stats band ── */
.stats-band { background:linear-gradient(135deg,rgba(34,22,10,0.85),rgba(21,17,13,0.9));border-top:1px solid rgba(199,154,69,0.12);border-bottom:1px solid rgba(199,154,69,0.12); }
.stat-num { font-family:var(--ff-display);font-size:2.75rem;line-height:1;color:var(--brass-light);display:block; }
@media(max-width:480px){ .stat-num{font-size:2.1rem} }
.stat-label { font-size:0.62rem;text-transform:uppercase;letter-spacing:0.16em;color:var(--cream-dim);margin-top:6px;display:block; }

/* ── Gallery ── */
/* ── Review cards ── */
.review-card { background:rgba(28,22,14,0.75);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(199,154,69,0.15);border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:14px;width:300px;flex-shrink:0;transition:border-color 0.3s; }
.review-card:hover { border-color:rgba(199,154,69,0.4); }
.review-quote { font-size:64px;line-height:0.8;color:var(--brass);opacity:0.22;font-family:Georgia,serif;margin-bottom:-6px;user-select:none; }
.review-stars { display:flex;gap:2px; }
.review-avatar { width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--brass) 0%,var(--brass-light) 100%);display:flex;align-items:center;justify-content:center;font-family:var(--ff-display);color:#1a1105;font-weight:700;font-size:0.95rem;flex-shrink:0; }
.review-google { display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:3px 9px;font-size:0.6rem;color:rgba(255,255,255,0.45);letter-spacing:0.06em; }
.reviews-header-rating { display:inline-flex;align-items:center;gap:10px;background:rgba(199,154,69,0.08);border:1px solid rgba(199,154,69,0.2);border-radius:100px;padding:8px 20px; }
/* Marquee */
.reviews-marquee-wrap { overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,black 8%,black 92%,transparent 100%); }
.reviews-marquee-wrap:hover .reviews-track { animation-play-state:paused; }
.reviews-track { display:flex;gap:16px;width:max-content;animation:reviews-scroll 55s linear infinite;padding:10px 0; }
.reviews-track-r { animation-direction:reverse; }
@keyframes reviews-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ── TikTok CTA button ── */
@keyframes lbh-shimmer { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(250%) skewX(-15deg)} }
/* ── PWA install side tab ── */
.pwa-side-tab { position:fixed;right:0;top:50%;transform:translateY(-50%);z-index:49;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(180deg,#c79a45,#9a6b1a);color:#1a1105;border-radius:12px 0 0 12px;padding:14px 10px;cursor:pointer;border:none;box-shadow:-4px 0 24px rgba(0,0,0,0.45);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1),box-shadow 0.3s;writing-mode:initial; }
.pwa-side-tab:hover { transform:translateY(-50%) translateX(-4px);box-shadow:-8px 0 32px rgba(199,154,69,0.35); }
.pwa-side-tab:active { transform:translateY(-50%) translateX(-1px); }
.pwa-side-tab-text { writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);font-size:0.62rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;font-family:'Work Sans',sans-serif;line-height:1;white-space:nowrap; }
.pwa-side-tab-icon { width:28px;height:28px;background:rgba(26,17,5,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
@media(max-width:480px){ .pwa-side-tab{top:55%;padding:12px 9px;} }

@keyframes lbh-tiktok-glow { 0%,100%{box-shadow:0 0 20px rgba(105,201,208,0.3),0 0 40px rgba(238,29,82,0.15)} 50%{box-shadow:0 0 32px rgba(105,201,208,0.5),0 0 60px rgba(238,29,82,0.25)} }
.tiktok-btn {
  position:relative;overflow:hidden;
  background:linear-gradient(135deg,#0d0d0d 0%,#1a1a2e 50%,#0d0d0d 100%);
  border:1px solid rgba(105,201,208,0.4);
  color:#fff;font-weight:600;letter-spacing:0.04em;
  padding:14px 24px;border-radius:100px;
  display:inline-flex;align-items:center;gap:12px;
  animation:lbh-tiktok-glow 3s ease infinite;
  transition:transform 0.3s,border-color 0.3s;
  text-decoration:none;font-size:0.875rem;
  max-width:92vw;
}
.tiktok-btn::before {
  content:"";position:absolute;top:0;left:0;width:40%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
  animation:lbh-shimmer 2.5s ease infinite;
}
.tiktok-btn:hover { transform:translateY(-3px) scale(1.03);border-color:rgba(105,201,208,0.8); }
.tiktok-btn .tiktok-icon-wrap { display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#69C9D0,#EE1D52);flex-shrink:0;transition:transform 0.3s; }
.tiktok-btn:hover .tiktok-icon-wrap { transform:rotate(15deg) scale(1.1); }
.tiktok-btn-text { display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0; }
.tiktok-btn-sub { font-size:0.65rem;color:rgba(255,255,255,0.5);font-weight:400;letter-spacing:0.08em;text-transform:uppercase; }
.tiktok-btn-main { font-size:0.85rem;color:#fff;font-weight:700;line-height:1.3;word-break:break-word; }
@media(max-width:480px){ .tiktok-btn{padding:12px 18px;gap:10px} .tiktok-btn-main{font-size:0.78rem} .tiktok-btn .tiktok-icon-wrap{width:30px;height:30px} }

/* ── Gallery carousel ── */
.gallery-track { display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 4px 20px;cursor:grab;user-select:none; }
.gallery-track::-webkit-scrollbar { display:none; }
.gallery-track.is-dragging { cursor:grabbing; }
.gallery-track-item { flex:0 0 auto;width:clamp(170px,36vw,240px);scroll-snap-align:center;border-radius:12px;overflow:hidden;border:1px solid rgba(199,154,69,0.2);position:relative;background:#0a0a0a;aspect-ratio:9/16;cursor:pointer;transition:transform 0.3s,box-shadow 0.3s; }
@media(hover:hover){ .gallery-track-item:hover { transform:scale(1.03);box-shadow:0 12px 40px rgba(199,154,69,0.2); } }
.gallery-track-item video { width:100%;height:100%;object-fit:cover;display:block; }
.gallery-play { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3);transition:background 0.25s; }
.gallery-track-item:hover .gallery-play { background:rgba(0,0,0,0.1); }
.gallery-play-circle { width:54px;height:54px;border-radius:50%;background:rgba(199,154,69,0.88);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 24px rgba(0,0,0,0.5);transition:transform 0.2s; }
.gallery-track-item:hover .gallery-play-circle { transform:scale(1.1); }
.gallery-arrow { position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:46px;height:46px;border-radius:50%;background:rgba(15,12,8,0.85);border:1px solid rgba(199,154,69,0.4);color:var(--brass-light);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.2s,border-color 0.2s;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px); }
@media(hover:hover){ .gallery-arrow:hover { background:rgba(199,154,69,0.2);border-color:var(--brass); } }
.gallery-arrow-left { left:-18px; } .gallery-arrow-right { right:-18px; }
@media(max-width:640px){ .gallery-arrow { display:none; } }
.lb-video { max-height:90vh;max-width:90vw;border-radius:8px;outline:none; }
.lb-overlay { position:fixed;inset:0;z-index:300;background:rgba(4,3,2,0.97);display:flex;align-items:center;justify-content:center; }
.lb-img { max-height:90vh;max-width:90vw;object-fit:contain;border-radius:6px;user-select:none; }
.lb-btn { position:absolute;top:50%;transform:translateY(-50%);width:52px;height:52px;border-radius:50%;background:rgba(199,154,69,0.15);border:1px solid rgba(199,154,69,0.3);color:var(--brass-light);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.2s;-webkit-tap-highlight-color:transparent; }
@media(hover:hover){ .lb-btn:hover{background:rgba(199,154,69,0.3)} }
.lb-prev{left:10px} .lb-next{right:10px}
.lb-close { position:absolute;top:12px;right:12px;width:42px;height:42px;border-radius:50%;background:rgba(199,154,69,0.15);border:1px solid rgba(199,154,69,0.3);color:var(--cream);display:flex;align-items:center;justify-content:center;cursor:pointer;-webkit-tap-highlight-color:transparent; }

/* ── Leaflet dark overrides ── */
.lbh-map { border:1px solid var(--line); border-radius:4px; overflow:hidden; }
.leaflet-container { background:#15110d; }
.leaflet-tile-pane { filter: brightness(1.9) contrast(1.05); }
.leaflet-control-attribution { background:rgba(21,17,13,0.85) !important; color:var(--cream-dim) !important; font-size:10px; }
.leaflet-control-attribution a { color:var(--brass) !important; }
.leaflet-control-zoom a { background:var(--panel) !important; color:var(--brass-light) !important; border-color:var(--line) !important; }
.leaflet-control-zoom a:hover { background:var(--panel-2) !important; color:var(--brass) !important; }
.leaflet-popup-content-wrapper { background:var(--panel) !important; border:1px solid var(--line) !important; border-radius:4px !important; box-shadow:0 4px 20px rgba(0,0,0,0.6) !important; }
.leaflet-popup-tip { background:var(--panel) !important; }
.leaflet-popup-content { color:var(--cream) !important; margin:12px 16px !important; }

/* ── Premium App Mode ── */
.app-shell{position:fixed;inset:0;display:flex;flex-direction:column;background:var(--ink);}
.app-pages-wrap{flex:1;position:relative;overflow:hidden;}
.app-page{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;opacity:0;pointer-events:none;transform:translateY(20px);transition:opacity 0.35s cubic-bezier(0.4,0,0.2,1),transform 0.35s cubic-bezier(0.4,0,0.2,1);}
.app-page.active{opacity:1;pointer-events:auto;transform:none;}
/* Bottom nav */
.bottom-nav{flex-shrink:0;display:flex;align-items:flex-start;padding-top:10px;padding-bottom:env(safe-area-inset-bottom,10px);height:calc(66px + env(safe-area-inset-bottom,0px));background:rgba(4,3,1,0.98);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border-top:1px solid rgba(199,154,69,0.1);}
.bnav-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;background:none;border:none;padding:0;color:rgba(182,165,135,0.28);font-size:0.52rem;letter-spacing:0.1em;font-family:'Work Sans',sans-serif;text-transform:uppercase;transition:color 0.22s;position:relative;-webkit-tap-highlight-color:transparent;}
.bnav-tab[data-active="true"]{color:var(--brass-light);}
.bnav-tab[data-active="true"]::after{content:'';position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:20px;height:2px;background:linear-gradient(90deg,var(--brass-light),var(--brass));border-radius:2px;}
.bnav-fab-wrap{flex:1.2;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:0;cursor:pointer;background:none;border:none;gap:3px;-webkit-tap-highlight-color:transparent;}
.bnav-fab{width:52px;height:52px;background:linear-gradient(135deg,var(--brass-light) 0%,var(--brass) 55%,#9c7530 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#1a1105;margin-top:-20px;box-shadow:0 0 0 6px rgba(199,154,69,0.1),0 8px 28px rgba(0,0,0,0.5);transition:transform 0.18s,box-shadow 0.18s;animation:fab-pulse 3s ease-in-out infinite;}
@keyframes fab-pulse{0%,100%{box-shadow:0 0 0 6px rgba(199,154,69,0.1),0 8px 28px rgba(0,0,0,0.5)}50%{box-shadow:0 0 0 10px rgba(199,154,69,0.18),0 8px 32px rgba(199,154,69,0.25)}}
.bnav-fab-wrap:active .bnav-fab{transform:scale(0.88);animation:none;box-shadow:0 0 0 4px rgba(199,154,69,0.08),0 4px 12px rgba(0,0,0,0.4);}
.bnav-fab-wrap[data-active="true"] .bnav-fab{animation:none;box-shadow:0 0 0 8px rgba(199,154,69,0.15),0 8px 32px rgba(199,154,69,0.4);}
.bnav-fab-label{font-size:0.52rem;color:var(--brass);letter-spacing:0.1em;text-transform:uppercase;font-family:'Work Sans';}
/* Page header */
.page-header-app{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 14px;background:rgba(4,3,1,0.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);position:sticky;top:0;z-index:20;border-bottom:1px solid rgba(199,154,69,0.09);}
/* Home quick cards */
.home-qcard{background:rgba(20,15,8,0.92);backdrop-filter:blur(16px);border:1px solid rgba(199,154,69,0.13);border-radius:20px;padding:20px 16px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;cursor:pointer;transition:transform 0.18s,border-color 0.18s;-webkit-tap-highlight-color:transparent;position:relative;overflow:hidden;}
.home-qcard::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(199,154,69,0.04),transparent 60%);pointer-events:none;}
.home-qcard:active{transform:scale(0.95);}
.home-qcard-gold{border-color:rgba(199,154,69,0.32);background:linear-gradient(135deg,rgba(232,200,122,0.1),rgba(154,107,26,0.06));}
.home-qcard-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(199,154,69,0.09);color:var(--brass);}
.home-qcard-gold .home-qcard-icon{background:linear-gradient(135deg,var(--brass-light),var(--brass));color:#1a1105;box-shadow:0 4px 16px rgba(199,154,69,0.3);}
/* Service cards */
.svc-card-app{background:rgba(18,13,6,0.9);backdrop-filter:blur(16px);border:1px solid rgba(199,154,69,0.11);border-radius:18px;padding:0;overflow:hidden;transition:border-color 0.2s;position:relative;}
.svc-card-app::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(199,154,69,0.25),transparent);}
.svc-card-body{padding:18px 18px 14px;}
.svc-card-footer{padding:0 18px 16px;}
/* Booking */
.book-bar{height:2px;background:rgba(199,154,69,0.1);margin-bottom:28px;border-radius:2px;overflow:hidden;}
.book-bar-fill{height:100%;background:linear-gradient(90deg,var(--brass-light),var(--brass));border-radius:2px;transition:width 0.4s cubic-bezier(0.4,0,0.2,1);}
.time-slot-btn{padding:11px 4px;border-radius:12px;border:1px solid rgba(199,154,69,0.14);background:rgba(18,13,6,0.8);color:var(--cream-dim);font-size:0.82rem;cursor:pointer;transition:all 0.18s;text-align:center;-webkit-tap-highlight-color:transparent;}
.time-slot-btn.sel{background:var(--brass);color:#1a1105;font-weight:700;border-color:var(--brass);box-shadow:0 4px 16px rgba(199,154,69,0.3);}
/* Hours badges */
.badge-open{display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,0.09);border:1px solid rgba(34,197,94,0.22);border-radius:100px;padding:3px 10px;font-size:0.65rem;color:#4ade80;letter-spacing:0.05em;}
.badge-closed{background:rgba(248,113,113,0.09);border-color:rgba(248,113,113,0.22);color:#f87171;}
.status-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0;}
/* Info sections */
.info-section{padding:24px 20px;border-bottom:1px solid rgba(199,154,69,0.08);}
.info-section:last-child{border-bottom:none;}
.contact-pill{display:flex;align-items:center;gap:8px;background:rgba(20,15,8,0.8);border:1px solid rgba(199,154,69,0.15);border-radius:100px;padding:12px 18px;color:var(--cream-dim);font-size:0.82rem;cursor:pointer;text-decoration:none;transition:border-color 0.2s,color 0.2s;-webkit-tap-highlight-color:transparent;}
.contact-pill:active{border-color:rgba(199,154,69,0.4);color:var(--cream);}
`;

/* ============================================================
   MAP
   ============================================================ */
const SHOP_COORDS = [45.43735, 10.99066];

const shopIcon = L.divIcon({
  html: `<div style="width:22px;height:22px;background:linear-gradient(180deg,#e6c787,#c79a45);border-radius:50%;border:3px solid #15110d;box-shadow:0 0 0 2px #c79a45,0 4px 12px rgba(0,0,0,0.6)"></div>`,
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

function ShopMap({ address, shopName, mapsQuery }) {
  return (
    <MapContainer center={SHOP_COORDS} zoom={16} scrollWheelZoom={false} className="lbh-map" style={{ height: 380 }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      <Marker position={SHOP_COORDS} icon={shopIcon}>
        <Popup>
          <p className="f-display" style={{ fontSize: 13, color: "var(--brass-light)", marginBottom: 4 }}>{shopName}</p>
          <p style={{ fontSize: 12, color: "var(--cream-dim)", margin: 0 }}>{address}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 12, color: "var(--brass)", display: "block", marginTop: 6 }}>
            Apri in Google Maps →
          </a>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */
function useScrollReveal(ready) {
  useEffect(() => {
    if (!ready) return;
    const els = document.querySelectorAll(".reveal,.reveal-left,.reveal-right");
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ready]);
}

function useParallax(ref, factor = 0.25) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = () => { el.style.transform = `translateY(${window.scrollY * factor}px)`; };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, [ref, factor]);
}

/* ── Typewriter ── */
function useTypewriter(words, speed = 82, pause = 1900) {
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const [erasing, setErasing] = useState(false);
  useEffect(() => {
    if (!words || words.length === 0) return;
    const word = words[idx];
    let timer;
    if (!erasing) {
      if (chars < word.length) {
        timer = setTimeout(() => setChars((c) => c + 1), speed);
      } else {
        timer = setTimeout(() => setErasing(true), pause);
      }
    } else {
      if (chars > 0) {
        timer = setTimeout(() => setChars((c) => c - 1), Math.max(28, speed / 2));
      } else {
        setErasing(false);
        setIdx((i) => (i + 1) % words.length);
      }
    }
    return () => clearTimeout(timer);
  }, [idx, chars, erasing, words, speed, pause]);
  return words && words[idx] ? words[idx].slice(0, chars) : "";
}

/* ── Stats counters ── */
const STATS_DATA = [
  { value: 500, suffix: "+", key: "clients" },
  { value: 30,  suffix: "+", key: "years" },
  { value: 5,   suffix: "",  key: "pros" },
  { value: 4.9, suffix: "★", key: "rating", decimal: true },
];

function useCountUp(target, started, decimal, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const steps = 50;
    const inc = target / steps;
    const interval = duration / steps;
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setVal(decimal ? Math.round(cur * 10) / 10 : Math.floor(cur));
      if (cur >= target) clearInterval(iv);
    }, interval);
    return () => clearInterval(iv);
  }, [target, started, decimal, duration]);
  return val;
}

function StatItem({ value, suffix, label, decimal }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const count = useCountUp(value, started, decimal);
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "24px 12px" }}>
      <span className="stat-num">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function StatsBand({ t }) {
  return (
    <section className="stats-band px-4 py-2">
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4" style={{ borderLeft: "1px solid rgba(199,154,69,0.12)" }}>
        {STATS_DATA.map((s) => (
          <div key={s.key} style={{ borderRight: "1px solid rgba(199,154,69,0.12)" }}>
            <StatItem value={s.value} suffix={s.suffix} label={t.stats[s.key]} decimal={s.decimal} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Gallery ── */
const GALLERY_VIDEOS = [gallery1, gallery2, gallery3, gallery4, gallery5];

function Gallery({ t }) {
  const [active, setActive] = useState(null);
  const trackRef = useRef(null);
  const lightboxVideoRef = useRef(null);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const total = GALLERY_VIDEOS.length;
  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);
  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);

  /* keyboard nav on lightbox */
  useEffect(() => {
    if (active === null) return;
    const h = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, close, prev, next]);

  /* restart video on clip change */
  useEffect(() => {
    if (active !== null && lightboxVideoRef.current) {
      lightboxVideoRef.current.load();
      lightboxVideoRef.current.play().catch(() => {});
    }
  }, [active]);

  /* arrow scroll */
  const scrollTrack = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  /* desktop drag-to-scroll */
  const onMouseDown = (e) => {
    isDragging.current = true;
    dragMoved.current = false;
    dragStartX.current = e.pageX - trackRef.current.offsetLeft;
    dragScrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.classList.add("is-dragging");
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = x - dragStartX.current;
    if (Math.abs(walk) > 5) dragMoved.current = true;
    trackRef.current.scrollLeft = dragScrollLeft.current - walk * 1.2;
  };
  const onMouseUp = () => {
    isDragging.current = false;
    trackRef.current?.classList.remove("is-dragging");
  };

  /* lightbox touch swipe */
  const lbTouchX = useRef(null);
  const onLbTouchStart = (e) => { lbTouchX.current = e.touches[0].clientX; };
  const onLbTouchEnd = (e) => {
    if (lbTouchX.current === null) return;
    const diff = e.changedTouches[0].clientX - lbTouchX.current;
    if (Math.abs(diff) > 50) { diff < 0 ? next() : prev(); }
    lbTouchX.current = null;
  };

  return (
    <section id="gallery" className="py-20 panel-bg">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="f-display text-3xl sm:text-4xl text-center text-[var(--cream)] mb-2 reveal">{t.gallery.title}</h2>
        <p className="text-center text-[var(--cream-dim)] mb-10 text-sm reveal">{t.gallery.subtitle}</p>
      </div>

      {/* Carousel */}
      <div className="relative max-w-5xl mx-auto px-6 sm:px-12">
        <button className="gallery-arrow gallery-arrow-left" onClick={() => scrollTrack(-1)} aria-label="Precedente">
          <ChevronLeft size={22} />
        </button>

        <div
          ref={trackRef}
          className="gallery-track"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {GALLERY_VIDEOS.map((src, i) => (
            <div key={i} className="gallery-track-item"
              onClick={() => { if (!dragMoved.current) setActive(i); }}
              role="button" aria-label={`Video ${i + 1}`} tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActive(i)}>
              <video src={src} muted preload="metadata" playsInline />
              <div className="gallery-play">
                <div className="gallery-play-circle">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#241a0e">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="gallery-arrow gallery-arrow-right" onClick={() => scrollTrack(1)} aria-label="Successivo">
          <ChevronRight size={22} />
        </button>
      </div>

      {/* TikTok CTA */}
      <div className="flex justify-center mt-12 px-4 reveal">
        <a href={`https://www.tiktok.com/@${SHOP.tiktok}`} target="_blank" rel="noopener noreferrer" className="tiktok-btn">
          <div className="tiktok-icon-wrap">
            <TikTokIcon size={17} />
          </div>
          <div className="tiktok-btn-text">
            <span className="tiktok-btn-sub">@{SHOP.tiktok}</span>
            <span className="tiktok-btn-main">{t.gallery.tiktokCta}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(105,201,208,0.8)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:4}}>
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div className="lb-overlay" onTouchStart={onLbTouchStart} onTouchEnd={onLbTouchEnd} onClick={close}>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Precedente">
            <ChevronLeft size={26} />
          </button>
          <video ref={lightboxVideoRef} className="lb-video" src={GALLERY_VIDEOS[active]}
            controls playsInline onClick={(e) => e.stopPropagation()} />
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Successivo">
            <ChevronRight size={26} />
          </button>
          <button className="lb-close" onClick={close} aria-label="Chiudi"><X size={20} /></button>
        </div>
      )}
    </section>
  );
}

/* ── Loading screen ── */
function LoadingScreen({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    /* dependency array is intentionally [] so onDone reference changes
       (caused by parent re-renders) never reset these timers */
    const t1 = setTimeout(() => setLeaving(true), 1500);
    const t2 = setTimeout(onDone, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`ls-wrap${leaving ? " ls-exit" : ""}`} aria-hidden="true">
      <div className="ls-scissor"><Scissors size={52} /></div>
      <div className="ls-logo">
        <p className="f-display tracking-[0.28em] text-[var(--brass-light)]" style={{ fontSize: "1.6rem" }}>LA BARBERIA</p>
        <p className="f-display tracking-[0.48em] text-[var(--cream-dim)] text-center" style={{ fontSize: "1.1rem" }}>HASSAN</p>
      </div>
      <div className="ls-line" />
      <p className="ls-sub">VERONA · ITALIA</p>
    </div>
  );
}

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
function getSlots(dateStr, durationMin, bookedTimes) {
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
    // bookedTimes is an array of "HH:MM" strings already booked for this barber+date
    if (bookedTimes.includes(minToTime(t))) continue;
    slots.push(t);
  }
  return slots.map(minToTime);
}

/* Fetch booked times for a barber on a given date from Supabase */
async function fetchBookedTimes(barberId, dateStr) {
  if (!barberId || !dateStr) return [];
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('time')
      .eq('barber_id', barberId)
      .eq('date', dateStr)
      .eq('status', 'confirmed');
    if (error) { console.error('fetchBookedTimes error:', error); return []; }
    return (data || []).map(r => r.time);
  } catch (e) { return []; }
}

/* Save appointment to Supabase */
async function saveAppointment(payload) {
  try {
    const { error } = await supabase.from('appointments').insert(payload);
    if (error) { console.error('saveAppointment error:', error); return false; }
    return true;
  } catch (e) { return false; }
}

/* ============================================================
   SMALL VISUAL PIECES
   ============================================================ */
function WAIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.522 5.846L.054 23.5l5.818-1.525A11.934 11.934 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.782 9.782 0 01-4.99-1.366l-.358-.213-3.712.972.992-3.624-.234-.373A9.787 9.787 0 012.182 12C2.182 6.58 6.58 2.182 12 2.182S21.818 6.58 21.818 12 17.42 21.818 12 21.818z"/>
    </svg>
  );
}

function WhatsAppChat({ shopName, waNumber, t }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const send = () => {
    const text = msg.trim() || t.chat.defaultMsg;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank");
    setMsg("");
    setOpen(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 80, right: 20, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
      {open && (
        <div className="wa-popup" style={{ width: 300, borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 48px rgba(0,0,0,0.6)" }}>
          {/* Header */}
          <div style={{ background: "#075e54", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WAIcon size={22} />
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0, lineHeight: 1.2 }}>{shopName}</p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, margin: 0 }}>
                  <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#25d366", marginRight: 5, verticalAlign: "middle" }} />
                  {t.chat.tagline}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }} aria-label="Chiudi">✕</button>
          </div>
          {/* Body */}
          <div style={{ background: "var(--panel)", padding: "14px 14px 10px" }}>
            <div style={{ background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
              <p style={{ fontSize: 12, color: "var(--cream-dim)", margin: 0 }}>👋 {t.chat.tagline}</p>
            </div>
            <textarea rows={3} value={msg} onChange={(e) => setMsg(e.target.value)}
              placeholder={t.chat.placeholder}
              className="px-3 py-2 text-sm w-full"
              style={{ resize: "none", borderRadius: 8, width: "100%", boxSizing: "border-box" }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
          </div>
          {/* Footer */}
          <div style={{ background: "var(--panel)", padding: "0 14px 14px" }}>
            <button onClick={send} style={{ width: "100%", padding: "10px", borderRadius: 24, background: "#25d366", border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <WAIcon size={16} /> {t.chat.send}
            </button>
          </div>
        </div>
      )}
      {/* FAB */}
      <button onClick={() => setOpen((o) => !o)} className="wa-btn"
        style={{ width: 56, height: 56, borderRadius: "50%", background: "#25d366", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
        aria-label="WhatsApp Chat">
        {open ? <X size={24} color="#fff" /> : <WAIcon size={28} />}
      </button>
    </div>
  );
}

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
  const isApp = typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);

  const [loading, setLoading] = useState(true);
  /* useCallback keeps the reference stable across re-renders,
     preventing LoadingScreen's effect from resetting its timers */
  const handleLoadDone = useCallback(() => setLoading(false), []);

  const [lang, setLang] = useState("it");
  const t = T[lang];
  const [menuOpen, setMenuOpen] = useState(false);

  const [booking, setBooking] = useState({ barberId: "", barberName: "", serviceId: null, date: "", time: "", name: "", phone: "", notes: "" });
  const [step, setStep] = useState(1);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [reservedDone, setReservedDone] = useState(false);
  const bookingRef = useRef(null);
  const reserveGuard = useRef(false);
  const heroBgRef = useRef(null);

  /* PWA install prompt */
  const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const [installPrompt, setInstallPrompt] = useState(() => _pwaInstallEvent);
  const [installDone, setInstallDone] = useState(false);
  const [installModal, setInstallModal] = useState(false);
  useEffect(() => {
    // Caso o evento dispare depois do React montar
    const handler = (e) => { e.preventDefault(); _pwaInstallEvent = e; setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => { setInstallDone(true); _pwaInstallEvent = null; });
    // Se o evento já foi capturado antes de montar, sincroniza o estado
    if (_pwaInstallEvent && !installPrompt) setInstallPrompt(_pwaInstallEvent);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const handleInstall = useCallback(async () => {
    const prompt = _pwaInstallEvent || installPrompt;
    if (prompt) {
      try {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") { setInstallDone(true); setInstallPrompt(null); _pwaInstallEvent = null; }
      } catch {
        setInstallModal(true);
      }
    } else {
      setInstallModal(true);
    }
  }, [installPrompt]);

  /* Hora actual — atualiza a cada minuto para open/closed status */
  const [nowTime, setNowTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNowTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  /* only activate observers after loading screen is gone */
  useScrollReveal(!loading);
  useParallax(heroBgRef, 0.2);
  const twWord = useTypewriter(t.tw);

  const service = SERVICES.find((s) => s.id === booking.serviceId) || null;

  useEffect(() => {
    if (!booking.date || !booking.barberId) { setBookedTimes([]); return; }
    setLoadingSlots(true);
    fetchBookedTimes(booking.barberId, booking.date).then((times) => {
      setBookedTimes(times);
      setLoadingSlots(false);
    });
  }, [booking.date, booking.barberId]);

  const slots = useMemo(
    () => (service && booking.date ? getSlots(booking.date, service.duration, bookedTimes) : []),
    [service, booking.date, bookedTimes]
  );

  const dayNum = booking.date ? new Date(booking.date + "T00:00:00").getDay() : null;
  const isClosedDay = booking.date ? !HOURS[dayNum] : false;

  function selectService(id) {
    setBooking((p) => ({ ...p, serviceId: id, time: "" }));
    // If barber already chosen go to step 3 (date), else go to step 2 (service selection)
    setStep(booking.barberId ? 3 : 2);
    if (isApp) {
      navigate("book");
    } else {
      setTimeout(() => bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }
  function goStep(n) { setStep(n); }
  function canNext() {
    if (step === 1) return !!booking.barberId;
    if (step === 2) return !!booking.serviceId;
    if (step === 3) return !!booking.date && !isClosedDay;
    if (step === 4) return !!booking.time;
    if (step === 5) return booking.name.trim().length >= 2 && booking.phone.trim().length >= 6;
    return true;
  }

  useEffect(() => {
    if (step === 6 && !reserveGuard.current && service && booking.date && booking.time) {
      reserveGuard.current = true;
      setReserving(true);
      saveAppointment({
        barber_id: booking.barberId,
        barber_name: booking.barberName,
        service_id: booking.serviceId,
        service_name: service.name["it"],
        service_price: service.price,
        service_duration: service.duration,
        date: booking.date,
        time: booking.time,
        customer_name: booking.name,
        customer_phone: booking.phone,
        notes: booking.notes || '',
        status: 'confirmed',
      }).then(() => {
        setReserving(false);
        setReservedDone(true);
      });
    }
  }, [step]); // eslint-disable-line

  function resetBooking() {
    setBooking({ barberId: "", barberName: "", serviceId: null, date: "", time: "", name: "", phone: "", notes: "" });
    setStep(1); setReservedDone(false); reserveGuard.current = false;
  }

  const waLink = service && booking.date && booking.time
    ? `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(
        t.waMessage({ barberName: booking.barberName, serviceName: service.name[lang], date: booking.date, time: booking.time, name: booking.name, phone: booking.phone, notes: booking.notes })
      )}`
    : "#";

  const [currentPage, setCurrentPage] = useState("home");
  const navigate = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
      {loading && <LoadingScreen onDone={handleLoadDone} />}
      <GrainOverlay />

      {/* PWA install side tab - only in browser mode */}
      {!isApp && !installDone && (
        <button className="pwa-side-tab" onClick={handleInstall} aria-label="Installa app">
          <div className="pwa-side-tab-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1105" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <span className="pwa-side-tab-text">Scarica App</span>
        </button>
      )}

      {/* PWA install manual modal */}
      {installModal && (
        <div style={{ position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"flex-end",justifyContent:"center" }} onClick={() => setInstallModal(false)}>
          <div style={{ background:"#130e06",border:"1px solid rgba(199,154,69,0.28)",borderRadius:"24px 24px 0 0",padding:"28px 22px 44px",width:"100%",maxWidth:480 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--brass-light),var(--brass))",display:"flex",alignItems:"center",justifyContent:"center",color:"#1a1105",fontWeight:900,fontSize:"1rem",fontFamily:"serif" }}>H</div>
                <div>
                  <p className="f-display" style={{ color:"var(--brass-light)",fontSize:"0.95rem",lineHeight:1 }}>Installa Hassan Barber</p>
                  <p style={{ color:"var(--cream-dim)",fontSize:"0.68rem",marginTop:2 }}>Barberia Professionale — Verona</p>
                </div>
              </div>
              <button onClick={() => setInstallModal(false)} style={{ color:"var(--cream-dim)",background:"rgba(255,255,255,0.06)",border:"none",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"1.1rem",lineHeight:1 }}>&#215;</button>
            </div>
            {/* Platform tabs */}
            <div style={{ display:"flex",gap:8,margin:"18px 0 20px",background:"rgba(255,255,255,0.04)",borderRadius:12,padding:4 }}>
              {["iPhone / iPad","Android"].map((label, idx) => (
                <div key={label} style={{ flex:1,padding:"8px 0",borderRadius:9,fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.04em",textAlign:"center",
                  background: (isIOS ? idx===0 : idx===1) ? "var(--brass)" : "transparent",
                  color: (isIOS ? idx===0 : idx===1) ? "#1a1105" : "var(--cream-dim)" }}>
                  {label}
                </div>
              ))}
            </div>
            {isIOS ? (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {[
                  { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
                    text: <>Abre este site no <strong style={{color:"var(--cream)"}}>Safari</strong> e toca no ícone <strong style={{color:"var(--cream)"}}>&#x2B06;</strong> (quadrado com seta, na barra do Safari em baixo)</> },
                  { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
                    text: <><strong style={{color:"var(--brass-light)"}}>Desliza para baixo</strong> na lista até encontrar <strong style={{color:"var(--cream)"}}>"Aggiungi alla schermata Home"</strong> — <strong style={{color:"rgba(248,113,113,0.9)"}}>NÃO</strong> é "elenco di lettura"!</> },
                  { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
                    text: <>Toca em <strong style={{color:"var(--cream)"}}>Aggiungi</strong> — o ícone <strong style={{color:"var(--brass-light)"}}>H dourado</strong> aparece no ecrã!</> },
                ].map((s, i) => (
                  <div key={i} style={{ display:"flex",gap:14,alignItems:"center" }}>
                    <div style={{ width:40,height:40,borderRadius:12,background:"rgba(199,154,69,0.1)",border:"1px solid rgba(199,154,69,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{s.icon}</div>
                    <p style={{ color:"var(--cream-dim)",fontSize:"0.86rem",lineHeight:1.5 }}>{s.text}</p>
                  </div>
                ))}
                <div style={{ marginTop:4,padding:"10px 14px",background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:10 }}>
                  <p style={{ fontSize:"0.72rem",color:"rgba(251,191,36,0.8)",lineHeight:1.5 }}>&#9888; Funciona apenas no <strong>Safari</strong>. Chrome e outros browsers no iPhone não suportam instalação.</p>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {[
                  { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>,
                    text: <>Toca nos <strong style={{color:"var(--cream)"}}>3 pontos &#8942;</strong> no canto superior direito do Chrome</> },
                  { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
                    text: <>Seleciona <strong style={{color:"var(--cream)"}}>"Aggiungi a schermata Home"</strong> ou <strong style={{color:"var(--cream)"}}>"Installa app"</strong></> },
                  { icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
                    text: <>Confirma — o ícone <strong style={{color:"var(--brass-light)"}}>H dourado</strong> aparece no ecrã!</> },
                ].map((s, i) => (
                  <div key={i} style={{ display:"flex",gap:14,alignItems:"center" }}>
                    <div style={{ width:40,height:40,borderRadius:12,background:"rgba(199,154,69,0.1)",border:"1px solid rgba(199,154,69,0.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{s.icon}</div>
                    <p style={{ color:"var(--cream-dim)",fontSize:"0.86rem",lineHeight:1.5 }}>{s.text}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setInstallModal(false)} style={{ width:"100%",marginTop:22,padding:"13px",borderRadius:12,border:"none",cursor:"pointer",fontSize:"0.88rem",fontWeight:700,background:"linear-gradient(135deg,var(--brass-light),var(--brass))",color:"#1a1105",letterSpacing:"0.05em" }}>
              Capito!
            </button>
          </div>
        </div>
      )}

      {isApp ? (
        /* ===================== APP MODE UI ===================== */
        <div className="app-shell">
          <div className="app-pages-wrap">

            {/* ── HOME ── */}
            <div className={`app-page${currentPage === "home" ? " active" : ""}`}>
              {/* Hero */}
              <section style={{ position:"relative", height:"58svh", minHeight:320, display:"flex", alignItems:"flex-end", overflow:"hidden" }}>
                <video ref={heroBgRef} src={heroVideo} autoPlay muted loop playsInline aria-hidden="true"
                  style={{ position:"absolute", inset:0, width:"100%", height:"120%", top:"-10%", objectFit:"cover", opacity:0.45 }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(4,3,1,0.1) 0%, rgba(4,3,1,0.5) 60%, rgba(4,3,1,0.97) 100%)" }} />
                <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 60%, rgba(199,154,69,0.1), transparent 70%)" }} />
                {/* Lang selector */}
                <div style={{ position:"absolute", top:16, right:16, display:"flex", gap:6 }}>
                  {LANGS.map(code => (
                    <button key={code} className="lang-btn pb-0.5 px-1 text-xs" data-active={lang === code} onClick={() => setLang(code)}>{T[code].code}</button>
                  ))}
                </div>
                {/* Staff access */}
                <a href="/#/barber" style={{ position:"absolute", top:16, left:16, display:"flex", alignItems:"center", gap:6, padding:"7px 13px", borderRadius:10, background:"rgba(10,8,4,0.7)", backdropFilter:"blur(12px)", border:"1px solid rgba(199,154,69,0.35)", color:"var(--brass-light)", fontSize:"0.7rem", fontWeight:700, letterSpacing:"0.06em", textDecoration:"none", zIndex:10 }}>
                  🔐 Staff
                </a>
                {/* Emblem top-center */}
                <div style={{ position:"absolute", top:24, left:"50%", transform:"translateX(-50%)", zIndex:2 }}>
                  <BadgeEmblem size={72} />
                </div>
                {/* Hero text */}
                <div style={{ position:"relative", padding:"0 24px 28px", width:"100%" }}>
                  <p className="f-display" style={{ fontSize:"0.65rem", letterSpacing:"0.35em", color:"var(--brass)", marginBottom:6 }}>{t.hero.kicker}</p>
                  <h1 className="f-display brass-text" style={{ fontSize:"clamp(2rem,8vw,3rem)", lineHeight:1.1, marginBottom:4 }}>LA BARBERIA</h1>
                  <h2 className="f-display" style={{ fontSize:"clamp(1.4rem,5vw,2rem)", color:"var(--cream)", marginBottom:8 }}>HASSAN</h2>
                  <p className="f-display" style={{ fontSize:"1rem", color:"var(--brass-light)", minHeight:"1.5rem" }}>{twWord}<span className="tw-cursor" /></p>
                  <div style={{ display:"flex", gap:10, marginTop:16 }}>
                    <button onClick={() => navigate("book")}
                      style={{ flex:1, padding:"13px 0", borderRadius:100, background:"linear-gradient(135deg,var(--brass-light),var(--brass))", color:"#1a1105", fontWeight:700, fontSize:"0.82rem", border:"none", cursor:"pointer", letterSpacing:"0.05em" }}>
                      {t.hero.ctaBook}
                    </button>
                    <button onClick={() => navigate("services")}
                      style={{ flex:1, padding:"13px 0", borderRadius:100, background:"rgba(199,154,69,0.08)", color:"var(--cream)", fontSize:"0.82rem", border:"1px solid rgba(199,154,69,0.3)", cursor:"pointer", letterSpacing:"0.05em" }}>
                      {t.hero.ctaServices}
                    </button>
                  </div>
                </div>
              </section>

              {/* Open / Closed status strip */}
              {(() => {
                const day = nowTime.getDay();
                const h = nowTime.getHours() + nowTime.getMinutes() / 60;
                const cfg = HOURS[day];
                const open = cfg && h >= parseInt(cfg.open) && h < parseInt(cfg.close);
                return (
                  <div style={{ margin:"16px 16px 0", background: open ? "rgba(34,197,94,0.06)" : "rgba(248,113,113,0.06)", border:`1px solid ${open ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius:12, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:"50%", background: open ? "#4ade80" : "#f87171", boxShadow: open ? "0 0 8px rgba(74,222,128,0.6)" : "0 0 8px rgba(248,113,113,0.6)", flexShrink:0 }} />
                      <span style={{ fontSize:"0.75rem", color: open ? "#4ade80" : "#f87171", fontWeight:600 }}>{open ? "Aperto ora" : "Chiuso ora"}</span>
                    </div>
                    {cfg && <span style={{ fontSize:"0.68rem", color:"var(--cream-dim)" }}>{cfg.open} – {cfg.close}</span>}
                    {!cfg && <span style={{ fontSize:"0.68rem", color:"var(--cream-dim)" }}>{t.hours.closed}</span>}
                  </div>
                );
              })()}

              {/* Action grid */}
              <div style={{ padding:"16px 16px 0" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  <button onClick={() => navigate("book")} className="home-qcard home-qcard-gold">
                    <div className="home-qcard-icon"><CalendarIcon size={22} /></div>
                    <div>
                      <p className="f-display" style={{ fontSize:"0.78rem", color:"var(--brass-light)" }}>{t.hero.ctaBook}</p>
                      <p style={{ fontSize:"0.65rem", color:"var(--brass)", marginTop:2 }}>da €15</p>
                    </div>
                  </button>
                  <button onClick={() => navigate("services")} className="home-qcard">
                    <div className="home-qcard-icon"><Scissors size={22} /></div>
                    <div>
                      <p className="f-display" style={{ fontSize:"0.78rem", color:"var(--cream)" }}>{t.nav.services}</p>
                      <p style={{ fontSize:"0.65rem", color:"var(--cream-dim)", marginTop:2 }}>7 servizi</p>
                    </div>
                  </button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24 }}>
                  <button onClick={() => navigate("gallery")} className="home-qcard">
                    <div className="home-qcard-icon"><Camera size={22} /></div>
                    <div>
                      <p className="f-display" style={{ fontSize:"0.78rem", color:"var(--cream)" }}>Galleria</p>
                      <p style={{ fontSize:"0.65rem", color:"var(--cream-dim)", marginTop:2 }}>Video &amp; Arte</p>
                    </div>
                  </button>
                  <button onClick={() => navigate("info")} className="home-qcard">
                    <div className="home-qcard-icon"><MapPin size={22} /></div>
                    <div>
                      <p className="f-display" style={{ fontSize:"0.78rem", color:"var(--cream)" }}>Info</p>
                      <p style={{ fontSize:"0.65rem", color:"var(--cream-dim)", marginTop:2 }}>Orari &amp; Mappa</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <StatsBand t={t} />

              {/* Google rating strip */}
              <div style={{ margin:"16px 16px 24px", background:"rgba(18,13,6,0.85)", border:"1px solid rgba(199,154,69,0.14)", borderRadius:16, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <p className="f-display" style={{ fontSize:"0.62rem", letterSpacing:"0.2em", color:"var(--brass)", marginBottom:4 }}>GOOGLE REVIEWS</p>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span className="f-display" style={{ fontSize:"1.6rem", color:"var(--brass-light)", lineHeight:1 }}>4.5</span>
                    <div style={{ display:"flex", gap:2 }}>
                      {[1,2,3,4,5].map(s => <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill="var(--brass)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                    </div>
                  </div>
                  <p style={{ fontSize:"0.65rem", color:"var(--cream-dim)", marginTop:3 }}>119 recensioni verificate</p>
                </div>
                <div style={{ textAlign:"right" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                </div>
              </div>
            </div>

            {/* ── SERVICES ── */}
            <div className={`app-page${currentPage === "services" ? " active" : ""}`}>
              <div className="page-header-app">
                <span className="f-display" style={{ fontSize:"0.9rem", color:"var(--brass-light)" }}>{t.services.title}</span>
                <div style={{ display:"flex", gap:8 }}>
                  {LANGS.map(code => <button key={code} className="lang-btn pb-0.5 px-1 text-xs" data-active={lang === code} onClick={() => setLang(code)}>{T[code].code}</button>)}
                </div>
              </div>
              <div style={{ position:"relative", overflow:"hidden" }}>
                <video autoPlay muted loop playsInline aria-hidden="true"
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.12 }} src={gallery5} />
                <div style={{ position:"absolute", inset:0, background:"rgba(4,3,1,0.7)" }} />
                <div style={{ position:"relative", padding:"16px 14px", display:"flex", flexDirection:"column", gap:10 }}>
                  {SERVICES.map((s, i) => (
                    <div key={s.id} className="svc-card-app">
                      <div className="svc-card-body">
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                              <span className="f-display" style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"var(--brass)", opacity:0.7 }}>{String(i+1).padStart(2,"0")}</span>
                              <div style={{ height:1, flex:1, background:"rgba(199,154,69,0.15)" }} />
                            </div>
                            <h3 className="f-display" style={{ fontSize:"1.05rem", color:"var(--cream)", marginBottom:4 }}>{s.name[lang]}</h3>
                            <p style={{ fontSize:"0.75rem", color:"var(--cream-dim)", lineHeight:1.5 }}>{s.desc[lang]}</p>
                          </div>
                          <div style={{ textAlign:"right", flexShrink:0 }}>
                            <p className="f-display" style={{ fontSize:"1.4rem", color:"var(--brass-light)", lineHeight:1 }}>€{s.price}</p>
                            <p style={{ fontSize:"0.65rem", color:"var(--cream-dim)", marginTop:3 }}>{s.duration} {t.services.minutes}</p>
                          </div>
                        </div>
                      </div>
                      <div className="svc-card-footer">
                        <button onClick={() => { selectService(s.id); navigate("book"); }}
                          style={{ width:"100%", padding:"11px", borderRadius:12, background:"rgba(199,154,69,0.08)", border:"1px solid rgba(199,154,69,0.22)", color:"var(--brass-light)", fontSize:"0.78rem", fontWeight:600, cursor:"pointer", letterSpacing:"0.05em", transition:"background 0.18s" }}>
                          {t.services.bookThis}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Promos */}
              <div style={{ padding:"0 14px 24px", display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { img: studentImg, promo: t.promos.student },
                  { img: militaryImg, promo: t.promos.military },
                ].map(({ img, promo }) => (
                  <div key={promo.badge} style={{ position:"relative", borderRadius:18, overflow:"hidden", minHeight:120 }}>
                    <img src={img} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
                    <div style={{ position:"absolute", inset:0, background:"rgba(4,3,1,0.72)" }} />
                    <div style={{ position:"relative", padding:"20px", display:"flex", justifyContent:"space-between", alignItems:"center", minHeight:120 }}>
                      <div>
                        <p className="f-display" style={{ fontSize:"0.6rem", letterSpacing:"0.3em", color:"var(--brass)", marginBottom:4 }}>{promo.badge}</p>
                        <p style={{ fontSize:"0.8rem", color:"var(--cream-dim)" }}>{promo.title}</p>
                        <p style={{ fontSize:"0.7rem", color:"var(--cream-dim)", marginTop:2 }}>{promo.note}</p>
                      </div>
                      <p className="f-display brass-text" style={{ fontSize:"2rem" }}>{promo.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── BOOK ── */}
            <div className={`app-page${currentPage === "book" ? " active" : ""}`}>
              <div className="page-header-app">
                <span className="f-display" style={{ fontSize:"0.9rem", color:"var(--brass-light)" }}>{t.booking.title}</span>
                <div style={{ display:"flex", gap:8 }}>
                  {LANGS.map(code => <button key={code} className="lang-btn pb-0.5 px-1 text-xs" data-active={lang === code} onClick={() => setLang(code)}>{T[code].code}</button>)}
                </div>
              </div>
              <div style={{ padding:"20px 16px" }}>
                {step < 6 && (
                  <>
                    <div className="book-bar">
                      <div className="book-bar-fill" style={{ width:`${(step/5)*100}%` }} />
                    </div>
                    <p style={{ fontSize:"0.7rem", color:"var(--cream-dim)", textAlign:"center", marginTop:-20, marginBottom:20, letterSpacing:"0.08em" }}>
                      {t.booking.subtitle}
                    </p>
                  </>
                )}
                <div className="ticket-card" style={{ padding:"22px 18px" }}>
                  {step === 1 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <p className="f-display" style={{ fontSize:"0.7rem", letterSpacing:"0.15em", color:"var(--brass)", marginBottom:4 }}>01 — {t.booking.barberLabel}</p>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:10 }}>
                        {TEAM.map(member => {
                          const bid = member.name.toLowerCase().replace(' ', '-');
                          const sel = booking.barberId === bid;
                          return (
                            <button key={member.name} onClick={() => setBooking(p => ({ ...p, barberId: bid, barberName: member.name }))}
                              style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 10px", borderRadius:14, border:"1px solid", borderColor: sel ? "var(--brass)" : "rgba(199,154,69,0.15)", background: sel ? "rgba(199,154,69,0.1)" : "rgba(18,13,6,0.8)", cursor:"pointer", transition:"all 0.18s" }}>
                              <img src={member.photo} alt={member.name} style={{ width:60, height:60, borderRadius:"50%", objectFit:"cover", objectPosition:"top", border: sel ? "2px solid var(--brass)" : "2px solid rgba(199,154,69,0.2)" }} />
                              <span style={{ fontSize:"0.82rem", color:"var(--cream)", fontWeight: sel ? 600 : 400 }}>{member.name}</span>
                              <span style={{ fontSize:"0.65rem", color:"var(--brass)" }}>{member.role[lang]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <p className="f-display" style={{ fontSize:"0.7rem", letterSpacing:"0.15em", color:"var(--brass)", marginBottom:4 }}>02 — {t.booking.selectServicePlaceholder}</p>
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {SERVICES.map(s => (
                          <button key={s.id} onClick={() => setBooking(p => ({ ...p, serviceId: s.id, time:"" }))}
                            style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderRadius:14, border:"1px solid", borderColor: booking.serviceId === s.id ? "var(--brass)" : "rgba(199,154,69,0.15)", background: booking.serviceId === s.id ? "rgba(199,154,69,0.1)" : "rgba(18,13,6,0.8)", cursor:"pointer", transition:"all 0.18s" }}>
                            <span style={{ fontSize:"0.88rem", color:"var(--cream)", fontWeight: booking.serviceId === s.id ? 600 : 400 }}>{s.name[lang]}</span>
                            <div style={{ textAlign:"right" }}>
                              <span className="f-display" style={{ fontSize:"1rem", color:"var(--brass-light)" }}>€{s.price}</span>
                              <p style={{ fontSize:"0.62rem", color:"var(--cream-dim)", marginTop:1 }}>{s.duration} {t.services.minutes}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <p className="f-display" style={{ fontSize:"0.7rem", letterSpacing:"0.15em", color:"var(--brass)", marginBottom:4 }}>03 — {t.booking.dateLabel}</p>
                      <input type="date" min={todayStr()} max={maxDateStr()} value={booking.date}
                        onChange={e => setBooking(p => ({ ...p, date: e.target.value, time:"" }))}
                        style={{ padding:"14px 16px", borderRadius:14, border:"1px solid rgba(199,154,69,0.2)", background:"rgba(18,13,6,0.8)", color:"var(--cream)", fontSize:"0.95rem", width:"100%" }} />
                      {isClosedDay && <p style={{ fontSize:"0.82rem", color:"var(--brass-light)", padding:"8px 12px", background:"rgba(199,154,69,0.06)", borderRadius:10, border:"1px solid rgba(199,154,69,0.15)" }}>{t.booking.closedNotice}</p>}
                    </div>
                  )}
                  {step === 4 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      <p className="f-display" style={{ fontSize:"0.7rem", letterSpacing:"0.15em", color:"var(--brass)", marginBottom:4 }}>04 — {t.booking.timeLabel}</p>
                      {loadingSlots ? (
                        <p style={{ fontSize:"0.85rem", color:"var(--cream-dim)", textAlign:"center", padding:"24px 0" }}>{t.booking.loadingSlots}</p>
                      ) : slots.length === 0 ? (
                        <p style={{ fontSize:"0.85rem", color:"var(--cream-dim)", textAlign:"center", padding:"24px 0" }}>{t.booking.noSlots}</p>
                      ) : (
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                          {slots.map(tm => (
                            <button key={tm} onClick={() => setBooking(p => ({ ...p, time: tm }))}
                              className={`time-slot-btn${booking.time === tm ? " sel" : ""}`}>
                              {tm}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {step === 5 && (
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      <p className="f-display" style={{ fontSize:"0.7rem", letterSpacing:"0.15em", color:"var(--brass)", marginBottom:4 }}>05 — {t.booking.nameLabel}</p>
                      {[
                        { label: t.booking.nameLabel, key:"name", type:"text", icon:<User size={14}/> },
                        { label: t.booking.phoneLabel, key:"phone", type:"tel", icon:<Phone size={14}/> },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.72rem", color:"var(--cream-dim)", marginBottom:6 }}>{f.icon} {f.label}</label>
                          <input type={f.type} value={booking[f.key]} onChange={e => setBooking(p => ({ ...p, [f.key]: e.target.value }))}
                            style={{ width:"100%", padding:"13px 16px", borderRadius:14, border:"1px solid rgba(199,154,69,0.18)", background:"rgba(18,13,6,0.8)", color:"var(--cream)", fontSize:"0.9rem" }} />
                        </div>
                      ))}
                      <div>
                        <label style={{ fontSize:"0.72rem", color:"var(--cream-dim)", display:"block", marginBottom:6 }}>{t.booking.notesLabel}</label>
                        <textarea rows={2} placeholder={t.booking.notesPlaceholder} value={booking.notes} onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))}
                          style={{ width:"100%", padding:"12px 16px", borderRadius:14, border:"1px solid rgba(199,154,69,0.15)", background:"rgba(18,13,6,0.8)", color:"var(--cream)", fontSize:"0.88rem", resize:"none" }} />
                      </div>
                      {!canNext() && (booking.name || booking.phone) && (
                        <p style={{ fontSize:"0.75rem", color:"var(--brass-light)" }}>{t.booking.requiredNotice}</p>
                      )}
                    </div>
                  )}
                  {step === 6 && service && (
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, textAlign:"center" }}>
                      <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,rgba(199,154,69,0.2),rgba(199,154,69,0.05))", border:"1px solid rgba(199,154,69,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Check size={28} style={{ color:"var(--brass-light)" }} />
                      </div>
                      <div>
                        <p className="f-display" style={{ fontSize:"1rem", color:"var(--brass-light)" }}>{t.booking.successTitle}</p>
                        <p style={{ fontSize:"0.8rem", color:"var(--cream-dim)", marginTop:4 }}>{reserving ? t.booking.reserving : t.booking.successBody}</p>
                      </div>
                      <div style={{ width:"100%", background:"rgba(18,13,6,0.8)", border:"1px solid rgba(199,154,69,0.15)", borderRadius:14, padding:"16px", textAlign:"left", display:"flex", flexDirection:"column", gap:6 }}>
                        <p style={{ fontSize:"0.9rem", color:"var(--cream)", fontWeight:600 }}>{booking.barberName} · {service.name[lang]}</p>
                        <p style={{ fontSize:"0.8rem", color:"var(--cream-dim)" }}>€{service.price} · {service.duration} {t.services.minutes}</p>
                        <div style={{ height:1, background:"rgba(199,154,69,0.1)", margin:"4px 0" }} />
                        <p style={{ fontSize:"0.8rem", color:"var(--cream-dim)" }}>{booking.date} · {booking.time}</p>
                        <p style={{ fontSize:"0.8rem", color:"var(--cream-dim)" }}>{booking.name} · {booking.phone}</p>
                      </div>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-brass"
                        style={{ width:"100%", padding:"14px", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none", fontSize:"0.88rem", fontWeight:600 }}>
                        <MessageCircle size={16} /> {t.booking.confirmButton}
                      </a>
                      <button onClick={resetBooking} className="btn-outline" style={{ width:"100%", padding:"12px", borderRadius:14, fontSize:"0.85rem" }}>
                        {t.booking.newBooking}
                      </button>
                    </div>
                  )}
                  {step < 6 && (
                    <div style={{ display:"flex", justifyContent:"space-between", paddingTop:20, marginTop:16, borderTop:"1px solid rgba(199,154,69,0.1)" }}>
                      <button onClick={() => goStep(Math.max(1, step - 1))} disabled={step === 1}
                        className="btn-outline" style={{ padding:"11px 20px", borderRadius:12, display:"flex", alignItems:"center", gap:6, fontSize:"0.82rem", opacity: step === 1 ? 0.3 : 1 }}>
                        <ChevronLeft size={14} /> {t.booking.backButton}
                      </button>
                      <button onClick={() => goStep(step + 1)} disabled={!canNext()}
                        className="btn-brass" style={{ padding:"11px 22px", borderRadius:12, display:"flex", alignItems:"center", gap:6, fontSize:"0.82rem", opacity: !canNext() ? 0.4 : 1 }}>
                        {t.booking.nextButton} <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── GALLERY ── */}
            <div className={`app-page${currentPage === "gallery" ? " active" : ""}`}>
              {/* Cinematic header */}
              <div style={{ position:"relative", height:180, overflow:"hidden" }}>
                <video autoPlay muted loop playsInline aria-hidden="true" src={gallery1}
                  style={{ position:"absolute", inset:0, width:"100%", height:"150%", top:"-25%", objectFit:"cover", opacity:0.55 }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(4,3,1,0.3),rgba(4,3,1,0.95))" }} />
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                  <p className="f-display" style={{ fontSize:"0.62rem", letterSpacing:"0.35em", color:"var(--brass)", marginBottom:6 }}>LA NOSTRA ARTE</p>
                  <h2 className="f-display brass-text" style={{ fontSize:"1.6rem" }}>Galleria</h2>
                </div>
                {/* Lang selector */}
                <div style={{ position:"absolute", top:14, right:14, display:"flex", gap:6 }}>
                  {LANGS.map(code => <button key={code} className="lang-btn pb-0.5 px-1 text-xs" data-active={lang === code} onClick={() => setLang(code)}>{T[code].code}</button>)}
                </div>
              </div>
              <Gallery t={t} />
            </div>

            {/* ── INFO ── */}
            <div className={`app-page${currentPage === "info" ? " active" : ""}`}>
              <div className="page-header-app">
                <span className="f-display" style={{ fontSize:"0.9rem", color:"var(--brass-light)" }}>Info</span>
                <div style={{ display:"flex", gap:8 }}>
                  {LANGS.map(code => <button key={code} className="lang-btn pb-0.5 px-1 text-xs" data-active={lang === code} onClick={() => setLang(code)}>{T[code].code}</button>)}
                </div>
              </div>

              {/* Staff access card */}
              <a href="/#/barber" style={{ display:"flex", alignItems:"center", gap:14, margin:"16px 16px 0", padding:"16px 18px", background:"linear-gradient(135deg,rgba(199,154,69,0.13),rgba(199,154,69,0.04))", border:"1px solid rgba(199,154,69,0.35)", borderRadius:18, textDecoration:"none", WebkitTapHighlightColor:"transparent" }}>
                <div style={{ width:46, height:46, borderRadius:13, background:"linear-gradient(135deg,#e8c87a,#c79a45)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", flexShrink:0, boxShadow:"0 4px 16px rgba(199,154,69,0.3)" }}>🔐</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:"0.88rem", fontWeight:700, color:"var(--brass-light)", letterSpacing:"0.05em", marginBottom:3 }}>Area Staff</p>
                  <p style={{ fontSize:"0.7rem", color:"rgba(182,165,135,0.5)" }}>Barbieri · Amministratore</p>
                </div>
                <span style={{ fontSize:"1.1rem", color:"var(--brass)", opacity:0.7 }}>›</span>
              </a>

              {/* About */}
              <div className="info-section">
                <p className="f-display" style={{ fontSize:"0.62rem", letterSpacing:"0.25em", color:"var(--brass)", marginBottom:8 }}>{t.about.badge}</p>
                <h2 className="f-display" style={{ fontSize:"1.2rem", color:"var(--cream)", marginBottom:10 }}>{t.about.title}</h2>
                <p style={{ fontSize:"0.85rem", color:"var(--cream-dim)", lineHeight:1.65 }}>{t.about.body}</p>
              </div>

              {/* Team */}
              <div style={{ paddingTop:20, paddingBottom:20, borderBottom:"1px solid rgba(199,154,69,0.08)" }}>
                <p className="f-display" style={{ fontSize:"0.85rem", color:"var(--cream)", paddingLeft:20, marginBottom:14 }}>{t.team.title}</p>
                <div style={{ display:"flex", gap:12, overflowX:"auto", padding:"0 20px 4px", scrollSnapType:"x mandatory" }}>
                  {TEAM.map(member => (
                    <div key={member.name} style={{ flexShrink:0, width:148, background:"rgba(18,13,6,0.85)", border:"1px solid rgba(199,154,69,0.14)", borderRadius:16, overflow:"hidden", scrollSnapAlign:"start" }}>
                      <img src={member.photo} alt={member.name} style={{ width:"100%", aspectRatio:"4/5", objectFit:"cover", objectPosition:"top", display:"block" }} />
                      <div style={{ padding:"10px 12px 12px" }}>
                        <p className="f-display" style={{ fontSize:"0.8rem", color:"var(--cream)" }}>{member.name}</p>
                        <p style={{ fontSize:"0.67rem", color:"var(--brass)", marginTop:2 }}>{member.role[lang]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="info-section">
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                  <p className="f-display" style={{ fontSize:"0.85rem", color:"var(--cream)", display:"flex", alignItems:"center", gap:8 }}><Clock size={15} style={{ color:"var(--brass)" }} /> {t.hours.title}</p>
                  {(() => {
                    const day = nowTime.getDay();
                    const h = nowTime.getHours() + nowTime.getMinutes()/60;
                    const cfg = HOURS[day];
                    const open = cfg && h >= parseInt(cfg.open) && h < parseInt(cfg.close);
                    return <span className={open ? "badge-open" : "badge-closed"}><span className="status-dot" />{open ? "Aperto" : "Chiuso"}</span>;
                  })()}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {DAY_ORDER.map((dayNumIdx, i) => {
                    const cfg = HOURS[dayNumIdx];
                    const isToday = nowTime.getDay() === dayNumIdx;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(199,154,69,0.07)", fontWeight: isToday ? 600 : 400 }}>
                        <span style={{ fontSize:"0.82rem", color: isToday ? "var(--cream)" : "var(--cream-dim)" }}>{t.hours.days[i]}</span>
                        <span style={{ fontSize:"0.82rem", color: isToday ? "var(--brass-light)" : cfg ? "var(--cream)" : "rgba(182,165,135,0.4)" }}>{cfg ? `${cfg.open} – ${cfg.close}` : t.hours.closed}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map */}
              <div className="info-section" style={{ paddingBottom:0 }}>
                <p className="f-display" style={{ fontSize:"0.85rem", color:"var(--cream)", display:"flex", alignItems:"center", gap:8, marginBottom:12 }}><MapPin size={15} style={{ color:"var(--brass)" }} /> {t.location.title}</p>
                <p style={{ fontSize:"0.8rem", color:"var(--cream-dim)", marginBottom:14 }}>{SHOP.address}</p>
                <div style={{ borderRadius:14, overflow:"hidden", marginBottom:14 }}>
                  <ShopMap address={SHOP.address} shopName={SHOP.name} mapsQuery={SHOP.mapsQuery} />
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapsQuery)}`}
                  target="_blank" rel="noopener noreferrer" className="contact-pill" style={{ justifyContent:"center", marginBottom:24 }}>
                  <MapPin size={14} /> {t.location.openInMaps}
                </a>
              </div>

              {/* Contact */}
              <div className="info-section">
                <p className="f-display" style={{ fontSize:"0.85rem", color:"var(--cream)", marginBottom:14 }}>{t.contact.title}</p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <a href={`tel:${SHOP.phoneDisplay.replace(/\s/g,"")}`} className="contact-pill"><Phone size={16} style={{ color:"var(--brass)" }} />{SHOP.phoneDisplay}</a>
                  <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contact-pill">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </a>
                  <a href={`https://instagram.com/${SHOP.instagram}`} target="_blank" rel="noopener noreferrer" className="contact-pill"><Camera size={16} style={{ color:"var(--brass)" }} /> Instagram</a>
                  <a href={`https://www.tiktok.com/@${SHOP.tiktok}`} target="_blank" rel="noopener noreferrer" className="contact-pill"><TikTokIcon size={16} /> TikTok</a>
                </div>
              </div>

              <div style={{ padding:"20px", textAlign:"center", borderTop:"1px solid rgba(199,154,69,0.08)" }}>
                <p style={{ fontSize:"0.68rem", color:"rgba(182,165,135,0.35)", letterSpacing:"0.08em" }}>© {new Date().getFullYear()} {SHOP.name} — Verona</p>
                <p style={{ fontSize:"0.62rem", color:"rgba(182,165,135,0.25)", letterSpacing:"0.05em", marginTop:4 }}>Sviluppato da Walid Marghata</p>
              </div>
            </div>

          </div>{/* end app-pages-wrap */}

          {/* ── BOTTOM NAV ── */}
          <nav className="bottom-nav">
            <button className="bnav-tab" data-active={currentPage === "home"} onClick={() => navigate("home")}>
              <Home size={21} />
              <span>Home</span>
            </button>
            <button className="bnav-tab" data-active={currentPage === "services"} onClick={() => navigate("services")}>
              <Scissors size={21} />
              <span>Servizi</span>
            </button>
            <button className="bnav-fab-wrap" data-active={currentPage === "book"} onClick={() => navigate("book")}>
              <div className="bnav-fab"><CalendarIcon size={22} /></div>
              <span className="bnav-fab-label">Prenota</span>
            </button>
            <button className="bnav-tab" data-active={currentPage === "gallery"} onClick={() => navigate("gallery")}>
              <Camera size={21} />
              <span>Galleria</span>
            </button>
            <button className="bnav-tab" data-active={currentPage === "info"} onClick={() => navigate("info")}>
              <Info size={21} />
              <span>Info</span>
            </button>
          </nav>

          <WhatsAppChat shopName={SHOP.name} waNumber={SHOP.whatsapp} t={t} />
        </div>
      ) : (
        /* ===================== SITE MODE UI (UNCHANGED) ===================== */
        <>
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
              <div className="flex items-center gap-3 shrink-0">
                <a href="/#/barber" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1px solid rgba(199,154,69,0.4)", background:"linear-gradient(135deg,rgba(199,154,69,0.12),rgba(199,154,69,0.04))", color:"var(--brass-light)", fontSize:"0.72rem", fontWeight:700, letterSpacing:"0.08em", textDecoration:"none", whiteSpace:"nowrap" }}>
                  🔐 <span className="hidden sm:inline">Area Staff</span>
                </a>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  {LANGS.map((code) => (
                    <button key={code} className="lang-btn pb-0.5 px-0.5" data-active={lang === code} onClick={() => setLang(code)} aria-label={T[code].label}>
                      {T[code].code}
                    </button>
                  ))}
                </div>
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
          <section id="hero" className="relative px-4 py-20 sm:py-32 text-center overflow-hidden" style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}>
            <video ref={heroBgRef} src={heroVideo} autoPlay muted loop playsInline aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "120%", top: "-10%", objectFit: "cover", objectPosition: "center", opacity: 0.38, willChange: "transform" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(21,17,13,0.75) 0%, rgba(115,39,52,0.15) 50%, rgba(21,17,13,0.9) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(199,154,69,0.12), transparent 65%)" }} />
            <div className="relative max-w-2xl mx-auto flex flex-col items-center gap-6 w-full hero-seq">
              <BadgeEmblem size={160} />
              <p className="f-display text-xs sm:text-sm tracking-[0.3em] text-[var(--brass)]">{t.hero.kicker}</p>
              <h1 className="f-display brass-text text-5xl sm:text-7xl leading-tight">LA BARBERIA</h1>
              <h2 className="f-display text-3xl sm:text-5xl text-[var(--cream)]">HASSAN</h2>
              <p className="f-display text-xl sm:text-2xl" style={{ color: "var(--brass-light)", minHeight: "2rem", letterSpacing: "0.06em" }}>
                {twWord}<span className="tw-cursor" aria-hidden="true" />
              </p>
              <p className="text-xs sm:text-sm tracking-[0.35em] text-[var(--cream-dim)] uppercase">{t.hero.location}</p>
              <p className="f-tagline text-xl sm:text-2xl text-[var(--cream-dim)] max-w-md">{t.hero.tagline}</p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <a href="#booking" className="btn-brass px-8 py-3.5 rounded-full text-sm font-semibold">{t.hero.ctaBook}</a>
                <a href="#services" className="btn-outline px-8 py-3.5 rounded-full text-sm font-semibold">{t.hero.ctaServices}</a>
              </div>
            </div>
          </section>
          {/* STATS */}
          <StatsBand t={t} />

          {/* ABOUT */}
          <section id="about" className="px-4 py-20 max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <p className="f-display text-xs tracking-[0.3em] text-[var(--brass)] mb-3">{t.about.badge}</p>
              <h2 className="f-display text-3xl sm:text-4xl text-[var(--cream)] mb-5">{t.about.title}</h2>
              <p className="text-[var(--cream-dim)] leading-relaxed text-base">{t.about.body}</p>
            </div>
            <div className="flex justify-center reveal-right">
              <img src={hassanAboutImg} alt="Hassan" style={{ width: "100%", maxWidth: 400, borderRadius: 12, border: "1px solid rgba(199,154,69,0.3)", objectFit: "cover", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }} />
            </div>
          </section>

          {/* TEAM */}
          <section id="team" className="px-4 py-20 panel-bg">
            <div className="max-w-5xl mx-auto">
              <h2 className="f-display text-3xl sm:text-4xl text-center text-[var(--cream)] mb-2 reveal">{t.team.title}</h2>
              <p className="text-center text-[var(--cream-dim)] mb-12 text-sm reveal">{t.team.subtitle}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {TEAM.map((member, i) => (
                  <div key={member.name} className="team-card flex flex-col rounded-xl overflow-hidden border border-[rgba(199,154,69,0.2)] reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                    <div className="tc-img">
                      <img src={member.photo} alt={member.name} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", objectPosition: "top", display: "block" }} />
                    </div>
                    <div className="glass-panel p-4 flex flex-col gap-2 flex-1 text-center border-t-0 rounded-none">
                      <h3 className="f-display text-base text-[var(--cream)]">{member.name}<span className="text-[var(--brass)] font-normal">, {member.role[lang]}</span></h3>
                      <p className="text-sm text-[var(--cream-dim)] leading-relaxed">{member.desc[lang]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" className="px-4 py-20 relative overflow-hidden panel-bg">
            <video autoPlay muted loop playsInline aria-hidden="true"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", opacity: 0.28 }}
              src={gallery5} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,0.55)" }} />
            <div className="max-w-5xl mx-auto relative">
              <h2 className="f-display text-3xl sm:text-4xl text-center text-[var(--cream)] mb-2 reveal">{t.services.title}</h2>
              <p className="text-center text-[var(--cream-dim)] mb-12 text-sm reveal">{t.services.subtitle}</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SERVICES.map((s, i) => (
                  <div key={s.id} className="ticket-card p-6 flex flex-col gap-3 reveal" style={{ transitionDelay: `${i * 0.09}s` }}>
                    <span className="f-display text-xs text-[var(--brass)] tracking-widest">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="f-display text-xl text-[var(--cream)]">{s.name[lang]}</h3>
                    <p className="text-sm text-[var(--cream-dim)] flex-1 leading-relaxed">{s.desc[lang]}</p>
                    <div className="flex items-center justify-between pt-3 border-t hairline">
                      <span className="text-xs text-[var(--cream-dim)]">{s.duration} {t.services.minutes}</span>
                      <span className="f-display text-lg text-[var(--brass-light)]">€{s.price}</span>
                    </div>
                    <button onClick={() => selectService(s.id)} className="btn-outline mt-1 py-2.5 rounded-full text-sm font-semibold">
                      {t.services.bookThis}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PROMOS */}
          {[
            { img: studentImg, promo: t.promos.student },
            { img: militaryImg, promo: t.promos.military },
          ].map(({ img, promo }) => (
            <section key={promo.badge} className="relative overflow-hidden" style={{ minHeight: 220 }}>
              <img src={img} alt="" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(21,17,13,0.72)" }} />
              <div className="relative flex items-center justify-center min-h-[220px] px-4 py-12">
                <div className="text-center border hairline rounded p-8 max-w-sm" style={{ background: "rgba(21,17,13,0.75)", backdropFilter: "blur(6px)" }}>
                  <p className="f-display text-xs tracking-[0.3em] text-[var(--brass)] mb-2">{promo.badge}</p>
                  <p className="text-sm text-[var(--cream-dim)] mb-1">{promo.title}</p>
                  <p className="f-display text-3xl brass-text mb-3">{promo.price}</p>
                  <p className="text-xs text-[var(--cream-dim)]">{promo.note}</p>
                </div>
              </div>
            </section>
          ))}

          {/* GALLERY */}
          <Gallery t={t} />

          {/* REVIEWS */}
          <section id="reviews" className="py-20 panel-bg overflow-hidden">
            {/* Header */}
            <div className="max-w-5xl mx-auto px-4 text-center mb-12 reveal">
              <h2 className="f-display text-3xl sm:text-4xl text-[var(--cream)] mb-4">{t.reviews.title}</h2>
              <div className="flex justify-center">
                <div className="reviews-header-rating">
                  <span className="f-display text-2xl text-[var(--brass-light)]">4.5</span>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="18" height="18" viewBox="0 0 24 24" fill="var(--brass-light)">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-[var(--cream-dim)] tracking-wider">119 Google Reviews</span>
                </div>
              </div>
            </div>

            {/* Marquee — row 1 left, row 2 right */}
            {[REVIEWS.slice(0, Math.ceil(REVIEWS.length / 2)), REVIEWS.slice(Math.ceil(REVIEWS.length / 2))].map((group, gi) => (
              <div key={gi} className="reviews-marquee-wrap mb-4">
                <div className={`reviews-track${gi === 1 ? " reviews-track-r" : ""}`}>
                  {[...group, ...group].map((r, i) => (
                    <div key={i} className="review-card">
                      <div className="review-quote">"</div>
                      <p className="text-sm text-[var(--cream-dim)] leading-relaxed flex-1 italic">{r.text}</p>
                      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "rgba(199,154,69,0.12)" }}>
                        <div className="review-avatar">{r.name[0]}</div>
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="f-display text-sm text-[var(--cream)] truncate">{r.name}</p>
                            <span className="text-xs text-[var(--cream-dim)] flex-shrink-0">· {r.city}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="review-stars">
                              {Array.from({length: r.stars}).map((_, s) => (
                                <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill="var(--brass)">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="review-google">
                              <svg width="8" height="8" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                              Google
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <div className="stripe-band" />

          {/* BOOKING */}
          <section id="booking" ref={bookingRef} className="px-4 py-16 max-w-2xl mx-auto">
            <h2 className="f-display text-3xl text-center text-[var(--cream)] mb-2">{t.booking.title}</h2>
            <p className="text-center text-[var(--cream-dim)] mb-8 text-sm">{t.booking.subtitle}</p>

            {step < 6 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className="step-dot" data-active={step === n} data-done={step > n} />
                ))}
              </div>
            )}

            <div className="ticket-card p-6">
              {step === 1 && (
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-[var(--cream-dim)] flex items-center gap-2"><User size={14} /> {t.booking.barberLabel}</label>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:10 }}>
                    {TEAM.map(member => {
                      const bid = member.name.toLowerCase().replace(' ', '-');
                      const sel = booking.barberId === bid;
                      return (
                        <button key={member.name} onClick={() => setBooking(p => ({ ...p, barberId: bid, barberName: member.name }))}
                          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 10px", borderRadius:14, border:"1px solid", borderColor: sel ? "var(--brass)" : "rgba(199,154,69,0.15)", background: sel ? "rgba(199,154,69,0.1)" : "rgba(18,13,6,0.8)", cursor:"pointer", transition:"all 0.18s" }}>
                          <img src={member.photo} alt={member.name} style={{ width:60, height:60, borderRadius:"50%", objectFit:"cover", objectPosition:"top", border: sel ? "2px solid var(--brass)" : "2px solid rgba(199,154,69,0.2)" }} />
                          <span style={{ fontSize:"0.82rem", color:"var(--cream)", fontWeight: sel ? 600 : 400 }}>{member.name}</span>
                          <span style={{ fontSize:"0.65rem", color:"var(--brass)" }}>{member.role[lang]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-[var(--cream-dim)]">{t.booking.selectServicePlaceholder}</label>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {SERVICES.map(s => (
                      <button key={s.id} onClick={() => setBooking(p => ({ ...p, serviceId: s.id, time:"" }))}
                        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderRadius:12, border:"1px solid", borderColor: booking.serviceId === s.id ? "var(--brass)" : "rgba(199,154,69,0.15)", background: booking.serviceId === s.id ? "rgba(199,154,69,0.1)" : "rgba(18,13,6,0.8)", cursor:"pointer", transition:"all 0.18s" }}>
                        <span style={{ fontSize:"0.88rem", color:"var(--cream)", fontWeight: booking.serviceId === s.id ? 600 : 400 }}>{s.name[lang]}</span>
                        <div style={{ textAlign:"right" }}>
                          <span className="f-display" style={{ fontSize:"1rem", color:"var(--brass-light)" }}>€{s.price}</span>
                          <p style={{ fontSize:"0.62rem", color:"var(--cream-dim)", marginTop:1 }}>{s.duration} {t.services.minutes}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-[var(--cream-dim)] flex items-center gap-2"><CalendarIcon size={14} /> {t.booking.dateLabel}</label>
                  <input type="date" min={todayStr()} max={maxDateStr()} value={booking.date}
                    onChange={(e) => setBooking((p) => ({ ...p, date: e.target.value, time: "" }))}
                    className="px-3 py-2 text-sm" />
                  {isClosedDay && <p className="text-sm text-[var(--brass-light)]">{t.booking.closedNotice}</p>}
                </div>
              )}

              {step === 4 && (
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

              {step === 5 && (
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

              {step === 6 && service && (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="flex items-center gap-2 text-[var(--brass-light)]"><Check size={20} /><span className="f-display">{t.booking.successTitle}</span></div>
                  <div className="w-full text-left rtl:text-right border hairline rounded p-4 text-sm flex flex-col gap-1">
                    <p><strong className="text-[var(--cream)]">{t.booking.summaryTitle}</strong></p>
                    <p className="text-[var(--cream-dim)]">{booking.barberName} · {service.name[lang]} — €{service.price}</p>
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

              {step < 6 && (
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
              <p className="text-sm text-[var(--cream-dim)] mb-1">{SHOP.address}</p>
              <p className="text-xs text-[var(--brass)] mb-4">{t.location.nearby}</p>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP.mapsQuery)}`} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex items-center gap-2 px-4 py-2 rounded text-sm">
                <MapPin size={14} /> {t.location.openInMaps}
              </a>
            </div>
          </section>

          {/* MAP */}
          <section id="map" className="px-4 pb-16 max-w-5xl mx-auto">
            <ShopMap address={SHOP.address} shopName={SHOP.name} mapsQuery={SHOP.mapsQuery} />
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
            <br />
            <span style={{ opacity:0.45, fontSize:"0.65rem", letterSpacing:"0.05em" }}>Sviluppato da Walid Marghata</span>
          </footer>

          {/* WHATSAPP CHAT WIDGET */}
          <WhatsAppChat shopName={SHOP.name} waNumber={SHOP.whatsapp} t={t} />

          {/* MOBILE QUICK BAR */}
          <div className="md:hidden fixed bottom-0 inset-x-0 z-40 panel-bg border-t hairline flex">
            <a href="#booking" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[var(--brass-light)]">
              <CalendarIcon size={18} /><span className="text-[11px]">{t.nav.booking}</span>
            </a>
            <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[var(--cream-dim)]">
              <MessageCircle size={18} /><span className="text-[11px]">{t.contact.whatsapp}</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
