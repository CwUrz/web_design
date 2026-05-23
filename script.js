(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");
  const highlightsRoot = document.querySelector("[data-highlights]");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "切換為深色主題" : "切換為淺色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme = stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function scrollToHash(id) {
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeNav();
    if (history.replaceState) {
      history.replaceState(null, "", id);
    }
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToHash(id);
      });
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initHeaderScroll() {
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initHighlights() {
    if (!highlightsRoot) return;

    const panels = highlightsRoot.querySelectorAll(".stat-panel");
    const dots = highlightsRoot.querySelectorAll("[data-stat-btn]");
    const counterEl = highlightsRoot.querySelector("[data-highlight-current]");
    if (!panels.length || !dots.length) return;

    function showStat(index) {
      const i = Number(index);
      panels.forEach(function (panel, idx) {
        const active = idx === i;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
      dots.forEach(function (dot) {
        const active = Number(dot.getAttribute("data-stat-btn")) === i;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
      if (counterEl) {
        counterEl.textContent = String(i + 1).padStart(2, "0");
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showStat(dot.getAttribute("data-stat-btn"));
      });
    });

    let autoTimer = null;
    function startAuto() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      autoTimer = window.setInterval(function () {
        const current = highlightsRoot.querySelector(".stat-panel.is-active");
        const idx = current ? Number(current.getAttribute("data-stat")) : 0;
        showStat((idx + 1) % panels.length);
      }, 6000);
    }

    function stopAuto() {
      if (autoTimer) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    highlightsRoot.addEventListener("mouseenter", stopAuto);
    highlightsRoot.addEventListener("mouseleave", startAuto);
    highlightsRoot.addEventListener("focusin", stopAuto);
    highlightsRoot.addEventListener("focusout", startAuto);

    showStat(0);
    startAuto();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initYear();
    initHeaderScroll();
    initHighlights();
  });
})();
