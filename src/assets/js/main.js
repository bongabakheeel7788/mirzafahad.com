/* MirzaFahad.com — interaction & motion engine */
(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mark page loaded (triggers hero word rise) */
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  /* ── Split hero heading into rising words ─────────────────── */
  document.querySelectorAll("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const wrap = document.createElement("span");
      wrap.className = "hero-word";
      const inner = document.createElement("span");
      inner.textContent = w;
      inner.style.setProperty("--d", `${0.08 + i * 0.09}s`);
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
  });

  /* ── Sticky header state + scroll progress + parallax ─────── */
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (header) header.classList.toggle("scrolled", y > 24);
      if (progress) {
        const max = document.documentElement.scrollHeight - innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
      if (!reduced) {
        document.querySelectorAll("[data-parallax]").forEach((el) => {
          const f = parseFloat(el.dataset.parallax) || 0.05;
          el.style.transform = `translateY(${y * f}px)`;
        });
      }
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile nav ───────────────────────────────────────────── */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      })
    );
  }

  /* ── Reveal on scroll ─────────────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal, .reveal-scale").forEach((el) => io.observe(el));

  /* ── Animated counters ────────────────────────────────────── */
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count) || 0;
        if (reduced) { el.textContent = target; return; }
        const t0 = performance.now();
        const dur = 1400;
        const step = (t) => {
          const k = Math.min((t - t0) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 4)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

  /* ── Card glow follows cursor + magnetic buttons ──────────── */
  if (!reduced && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".card, .post-card").forEach((card) => {
      card.addEventListener("pointermove", (ev) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${ev.clientX - r.left}px`);
        card.style.setProperty("--my", `${ev.clientY - r.top}px`);
      });
    });
    document.querySelectorAll("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (ev) => {
        const r = btn.getBoundingClientRect();
        const x = (ev.clientX - r.left - r.width / 2) * 0.18;
        const y = (ev.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ── Contact form → /api/contact ──────────────────────────── */
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      status.className = "form-status";
      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        if (!res.ok) throw new Error("bad");
        status.textContent = form.dataset.sent;
        status.classList.add("ok");
        form.reset();
      } catch {
        status.textContent = form.dataset.error;
        status.classList.add("err");
      } finally {
        btn.disabled = false;
      }
    });
  }
})();
