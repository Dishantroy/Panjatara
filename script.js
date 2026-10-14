/* ===== CONFIG: replace these with the restaurant's verified details ===== */
const CONFIG = {
  phone: "",        // e.g. "+919XXXXXXXXX"  (digits with country code)
  whatsapp: "",     // e.g. "919XXXXXXXXX"   (no + or spaces)
  mapsUrl: "",      // paste the restaurant's Google Maps share link
  instagramUrl: ""  // paste the Panjatara Instagram profile link
};
/* ======================================================================== */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const waBase = CONFIG.whatsapp ? "https://wa.me/" + CONFIG.whatsapp.replace(/\D/g, "") : "";

$("#year").textContent = new Date().getFullYear();

/* Wire contact buttons; unconfigured ones fall back to the contact form / a Maps search */
$$("[data-wa]").forEach(a => {
  if (waBase) a.href = waBase + "?text=" + encodeURIComponent("Hello Panjatara, I'd like to make an enquiry.");
  else { a.removeAttribute("target"); a.href = "#contact"; a.title = "WhatsApp number not set yet"; }
});
$$("[data-call]").forEach(a => {
  if (CONFIG.phone) a.href = "tel:" + CONFIG.phone.replace(/[^\d+]/g, "");
  else { a.href = "#contact"; a.title = "Phone number not set yet"; }
});
$$("[data-map]").forEach(a => {
  // Placeholder: generic Maps search until the real share link is added
  a.href = CONFIG.mapsUrl || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Panjatara Restaurant Ujjain Road Indore");
});
$$("[data-ig]").forEach(a => {
  if (CONFIG.instagramUrl) a.href = CONFIG.instagramUrl;
  else { a.removeAttribute("target"); a.title = "Instagram link not set yet"; }
});
if (CONFIG.phone) $("#fphone").textContent = CONFIG.phone;

/* Nav: sticky style + mobile menu */
const nav = $("#nav"), burger = $("#burger"), links = $("#links");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
const setMenu = open => {
  links.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
$$("a", links).forEach(a => a.addEventListener("click", () => setMenu(false)));

/* Reservation form: builds a request; never claims a confirmed booking */
const dateInput = $("#date");
dateInput.min = new Date().toISOString().split("T")[0];
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, st = $("#status");
  if (!f.checkValidity()) { f.reportValidity(); return; }
  const d = Object.fromEntries(new FormData(f));
  const text = `Reservation request — Panjatara\nName: ${d.name}\nPhone: ${d.phone}\nDate: ${d.date}\nTime: ${d.time}\nGuests: ${d.guests}` + (d.msg ? `\nMessage: ${d.msg}` : "");
  if (waBase) {
    window.open(waBase + "?text=" + encodeURIComponent(text), "_blank", "noopener");
    st.textContent = "Request prepared in WhatsApp. Please press send there. Your table is not confirmed until the restaurant replies.";
    f.reset(); f.guests.value = 2;
  } else {
    st.textContent = "Demo mode: no WhatsApp number is configured yet, so nothing was sent. Add it in script.js (CONFIG).";
  }
});

/* Lightbox */
const lb = $("#lb"), lbb = $("#lbb"), lbx = $("#lbx");
let lastFocus = null;
const openLb = fig => {
  lastFocus = fig;
  const img = $("img", fig);
  lbb.innerHTML = "";
  if (img) { const c = document.createElement("img"); c.src = img.src; c.alt = img.alt; lbb.appendChild(c); }
  else { const d = document.createElement("div"); d.textContent = fig.dataset.label; lbb.appendChild(d); }
  lb.hidden = false; document.body.style.overflow = "hidden"; lbx.focus();
  if (window.gsap && !reduce) gsap.fromTo(lbb, { scale: .92, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "power3.out" });
};
const closeLb = () => { if (lb.hidden) return; lb.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
$$(".g").forEach(g => {
  g.addEventListener("click", () => openLb(g));
  g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(g); } });
});
lbx.addEventListener("click", closeLb);
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => { if (e.key === "Escape") { closeLb(); setMenu(false); } });

/* 3D card tilt (fine pointers only) */
if (!reduce && matchMedia("(hover:hover) and (pointer:fine)").matches) {
  $$(".tilt").forEach(c => {
    c.addEventListener("mousemove", e => {
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
    });
    c.addEventListener("mouseleave", () => { c.style.transform = ""; });
  });
}

/* GSAP animations — page stays fully usable if GSAP or motion is unavailable */
if (window.gsap && window.ScrollTrigger && !reduce) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hl", { y: 40, opacity: 0, duration: .9, stagger: .12 }, .15)
    .from(".dish", { scale: .82, opacity: 0, rotateY: -18, duration: 1.3 }, .3)
    .from(".nav", { y: -30, opacity: 0, duration: .8 }, 0);

  gsap.to(".hero-bg", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".cine-img", { yPercent: 8, ease: "none", scrollTrigger: { trigger: ".cine", start: "top bottom", end: "bottom top", scrub: true } });

  // Mouse-responsive depth on hero food
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const rx = gsap.quickTo(".dish", "rotationY", { duration: .8 }), ry = gsap.quickTo(".dish", "rotationX", { duration: .8 });
    $(".hero").addEventListener("mousemove", e => {
      rx((e.clientX / innerWidth - .5) * 14); ry(-(e.clientY / innerHeight - .5) * 10);
    });
  }

  gsap.utils.toArray(".rv").forEach(el => gsap.from(el, { y: 36, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } }));

  // Image reveal mask
  gsap.from(".rv-img", { clipPath: "inset(0 100% 0 0)", duration: 1.3, ease: "power3.inOut", scrollTrigger: { trigger: ".rv-img", start: "top 80%", once: true } });
  gsap.from(".cine-frame", { clipPath: "inset(12% 8% 12% 8% round 24px)", duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: ".cine", start: "top 80%", once: true } });

  ScrollTrigger.batch(".card", { start: "top 88%", once: true, onEnter: b => gsap.from(b, { y: 60, opacity: 0, duration: .8, stagger: .1, ease: "power3.out" }) });
  ScrollTrigger.batch(".g", { start: "top 90%", once: true, onEnter: b => gsap.from(b, { y: 50, opacity: 0, scale: .94, duration: .8, stagger: .1, ease: "power3.out" }) });
}
