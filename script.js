(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");

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

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
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

  function initMap() {
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const taipei101 = [25.0339, 121.5645];
    const map = L.map(mapEl, {
      scrollWheelZoom: false,
    }).setView(taipei101, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker(taipei101)
      .addTo(map)
      .bindPopup("<strong>台北 101</strong><br>台北市信義區");

    mapEl.addEventListener("focus", function () {
      map.scrollWheelZoom.enable();
    });
    mapEl.addEventListener("blur", function () {
      map.scrollWheelZoom.disable();
    });

    const mapWrapper = mapEl.closest(".map-wrapper");
    if (mapWrapper) {
      const resizeObserver = new ResizeObserver(function () {
        map.invalidateSize();
      });
      resizeObserver.observe(mapWrapper);

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const revealObserver = new IntersectionObserver(
          function (entries, obs) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                window.setTimeout(function () {
                  map.invalidateSize();
                }, 700);
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.2 }
        );
        revealObserver.observe(mapWrapper);
      }
    }

    window.setTimeout(function () {
      map.invalidateSize();
    }, 100);
  }

  function initVisitorCount() {
    const countEl = document.getElementById("visitor-count");
    if (!countEl) return;

    const key = "portfolio-wu-qian-yun-page-views";
    const apiUrl = "https://countapi.mileshilliard.com/api/v1/hit/" + key;

    fetch(apiUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("Visitor count request failed");
        return res.json();
      })
      .then(function (data) {
        const value = Number(data.value);
        if (!Number.isNaN(value)) {
          countEl.textContent = value.toLocaleString("zh-TW");
        }
      })
      .catch(function () {
        countEl.textContent = "—";
      });
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
    initMap();
    initVisitorCount();
  });
})();
