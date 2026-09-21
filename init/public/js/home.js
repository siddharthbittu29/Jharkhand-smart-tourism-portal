/* ============================================================
   JHARKHAND TOURISM — HOMEPAGE INTERACTIONS
   File: init/public/js/home.js

   Responsibilities:
   - Homepage scroll state
   - Homepage reveal animations
   - Search interaction
   - Search suggestions
   - Destination accessibility
   - Lightweight counters
   - Image fallback
   - Map-safe initialization hooks
   - Duplicate initialization protection

   Important:
   - This file does not own backend logic.
   - Existing server-side routes remain authoritative.
   - Navbar interaction is owned by navbar.ejs.
============================================================ */

(() => {
  "use strict";


  /* ==========================================================
     01. HELPERS
  ========================================================== */

  const $ = (selector, scope = document) => {
    try {
      return scope.querySelector(selector);
    } catch {
      return null;
    }
  };


  const $$ = (selector, scope = document) => {
    try {
      return Array.from(scope.querySelectorAll(selector));
    } catch {
      return [];
    }
  };


  const prefersReducedMotion = () => {
    return Boolean(
      window.matchMedia &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    );
  };


  /* ==========================================================
     02. INITIALIZATION GUARD
  ========================================================== */

  const HOME_INIT_KEY =
    "jtHomeInitialized";


  if (
    document.documentElement.dataset[HOME_INIT_KEY] === "true"
  ) {
    return;
  }


  document.documentElement.dataset[HOME_INIT_KEY] =
    "true";


  /* ==========================================================
     03. HOMEPAGE NAVBAR / SCROLL STATE
  ========================================================== */

  const navbar =
    document.querySelector(".jt-navbar");


  const updateNavbarState = () => {

    if (!navbar) {
      return;
    }


    navbar.classList.toggle(
      "is-scrolled",
      window.scrollY > 12
    );

  };


  updateNavbarState();


  window.addEventListener(
    "scroll",
    updateNavbarState,
    {
      passive: true
    }
  );


  /* ==========================================================
     04. SMOOTH ANCHOR NAVIGATION
  ========================================================== */

  $$('a[href^="#"]').forEach(
    (link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute("href");


          if (
            !href ||
            href === "#" ||
            href === "#!"
          ) {
            return;
          }


          let target = null;

          try {
            target =
              document.querySelector(href);
          } catch {
            target = null;
          }


          if (!target) {
            return;
          }


          event.preventDefault();


          target.scrollIntoView({
            behavior:
              prefersReducedMotion()
                ? "auto"
                : "smooth",

            block: "start"
          });

        }
      );

    }
  );


  /* ==========================================================
     05. REVEAL ANIMATIONS
  ========================================================== */

  const revealElements =
    $$(".bravo-reveal");


  if (
    revealElements.length &&
    !prefersReducedMotion() &&
    "IntersectionObserver" in window
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach(
            (entry) => {

              if (!entry.isIntersecting) {
                return;
              }


              entry.target.classList.add(
                "is-visible"
              );


              observer.unobserve(
                entry.target
              );

            }
          );

        },
        {
          threshold: 0.12,

          rootMargin:
            "0px 0px -40px 0px"
        }
      );


    revealElements.forEach(
      (element) => {

        revealObserver.observe(
          element
        );

      }
    );


  } else {

    revealElements.forEach(
      (element) => {

        element.classList.add(
          "is-visible"
        );

      }
    );

  }


  /* ==========================================================
     06. STAGGERED CARD REVEALS
  ========================================================== */

  const staggerGroups = [

    ".bravo-home-destination-grid",

    ".bravo-home-experience-grid",

    ".bravo-home-stay-grid",

    ".bravo-home-testimonial-grid",

    ".bravo-home-culture-list",

    ".bravo-home-connect-cards"

  ];


  if (!prefersReducedMotion()) {

    staggerGroups.forEach(
      (selector) => {

        const container =
          $(selector);


        if (!container) {
          return;
        }


        Array.from(
          container.children
        ).forEach(
          (child, index) => {

            if (
              child.dataset.jtStaggered ===
              "true"
            ) {
              return;
            }


            child.dataset.jtStaggered =
              "true";


            child.style.transitionDelay =
              `${Math.min(
                index * 55,
                275
              )}ms`;

          }
        );

      }
    );

  }


  /* ==========================================================
     07. HOMEPAGE SEARCH
  ========================================================== */

  const searchForm =
    $(".bravo-home-search");


  const searchInput =
    searchForm
      ? $("input", searchForm)
      : null;


  if (
    searchForm &&
    searchInput
  ) {

    searchForm.addEventListener(
      "submit",
      (event) => {

        const value =
          searchInput.value.trim();


        if (!value) {

          event.preventDefault();


          searchInput.focus();


          searchInput.setAttribute(
            "aria-invalid",
            "true"
          );


          return;
        }


        searchInput.removeAttribute(
          "aria-invalid"
        );

      }
    );


    searchInput.addEventListener(
      "input",
      () => {

        if (
          searchInput.value.trim()
        ) {

          searchInput.removeAttribute(
            "aria-invalid"
          );

        }

      }
    );


    searchInput.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape"
        ) {

          searchInput.value = "";


          searchInput.removeAttribute(
            "aria-invalid"
          );

        }

      }
    );

  }


  /* ==========================================================
     08. SEARCH SUGGESTIONS
  ========================================================== */

  $$(".bravo-home-search-suggestion")
    .forEach(
      (suggestion) => {

        suggestion.setAttribute(
          "role",
          "button"
        );


        suggestion.setAttribute(
          "tabindex",
          "0"
        );


        const useSuggestion =
          () => {

            if (!searchInput) {
              return;
            }


            const value =
              suggestion.dataset.search ||
              suggestion.textContent.trim();


            if (!value) {
              return;
            }


            searchInput.value =
              value;


            searchInput.removeAttribute(
              "aria-invalid"
            );


            searchInput.focus();

          };


        suggestion.addEventListener(
          "click",
          useSuggestion
        );


        suggestion.addEventListener(
          "keydown",
          (event) => {

            if (
              event.key === "Enter" ||
              event.key === " "
            ) {

              event.preventDefault();

              useSuggestion();

            }

          }
        );

      }
    );


  /* ==========================================================
     09. DESTINATION CARD ACCESSIBILITY
  ========================================================== */

  $$(".bravo-home-destination-card")
    .forEach(
      (card) => {

        if (
          card.tagName.toLowerCase() !==
          "a"
        ) {
          return;
        }


        card.addEventListener(
          "keydown",
          (event) => {

            if (
              event.key === "Enter"
            ) {

              card.click();

            }

          }
        );

      }
    );


  /* ==========================================================
     10. IMAGE ERROR FALLBACK
  ========================================================== */

  const handleImageError =
    (image) => {

      if (
        image.dataset.jtFallbackApplied ===
        "true"
      ) {
        return;
      }


      image.dataset.jtFallbackApplied =
        "true";


      const fallback =
        image.dataset.fallback ||
        "/images/placeholder.jpg";


      if (
        !fallback ||
        image.src.endsWith(fallback)
      ) {
        return;
      }


      image.src =
        fallback;

    };


  $$("img[data-bravo-image]")
    .forEach(
      (image) => {

        image.addEventListener(
          "error",
          () => {

            handleImageError(
              image
            );

          }
        );

      }
    );


  /*
   * Also support normal homepage images.
   * We intentionally do not attach a fallback to
   * every image on the page because missing image
   * behavior should remain page-specific.
   */

  $$(".bravo-home img[data-fallback]")
    .forEach(
      (image) => {

        image.addEventListener(
          "error",
          () => {

            handleImageError(
              image
            );

          }
        );

      }
    );


  /* ==========================================================
     11. OPTIONAL COUNTERS
  ========================================================== */

  const counters =
    $$("[data-bravo-counter]");


  const animateCounter =
    (element) => {

      const target =
        Number(
          element.dataset.bravoCounter
        );


      if (
        !Number.isFinite(target)
      ) {
        return;
      }


      const duration =
        Number(
          element.dataset.bravoDuration
        ) || 1000;


      if (
        prefersReducedMotion()
      ) {

        element.textContent =
          target.toLocaleString();

        return;
      }


      const start =
        performance.now();


      const update =
        (now) => {

          const progress =
            Math.min(
              (now - start) /
                duration,
              1
            );


          const eased =
            1 -
            Math.pow(
              1 - progress,
              3
            );


          const value =
            Math.round(
              target * eased
            );


          element.textContent =
            value.toLocaleString();


          if (
            progress < 1
          ) {

            requestAnimationFrame(
              update
            );

          }

        };


      requestAnimationFrame(
        update
      );

    };


  if (
    counters.length &&
    "IntersectionObserver" in window
  ) {

    const counterObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach(
            (entry) => {

              if (
                !entry.isIntersecting
              ) {
                return;
              }


              animateCounter(
                entry.target
              );


              observer.unobserve(
                entry.target
              );

            }
          );

        },
        {
          threshold: 0.5
        }
      );


    counters.forEach(
      (counter) => {

        counterObserver.observe(
          counter
        );

      }
    );

  } else {

    counters.forEach(
      (counter) => {

        animateCounter(
          counter
        );

      }
    );

  }


  /* ==========================================================
     12. HOMEPAGE MAP HOOK
  ========================================================== */

  const mapContainer =
    $("#bravo-home-map");


  if (mapContainer) {

    window.dispatchEvent(
      new CustomEvent(
        "jt:home-map-ready",
        {
          detail: {
            container:
              mapContainer
          }
        }
      )
    );

  }


  /* ==========================================================
     13. PUBLIC HOMEPAGE API
  ========================================================== */

  window.JharkhandTourismHome = {

    version: "2.0.0",


    refreshNavbar() {
      updateNavbarState();
    },


    scrollTo(selector) {

      if (
        typeof selector !==
        "string"
      ) {
        return false;
      }


      let element = null;

      try {

        element =
          document.querySelector(
            selector
          );

      } catch {

        return false;

      }


      if (!element) {
        return false;
      }


      element.scrollIntoView({
        behavior:
          prefersReducedMotion()
            ? "auto"
            : "smooth",

        block: "start"
      });


      return true;

    }

  };


  /* ==========================================================
     14. BACKWARD-COMPATIBLE PUBLIC API
  ========================================================== */

  /*
   * Existing homepage integrations may still reference
   * the previous public object. Keep it as a compatibility
   * bridge while the homepage is being migrated.
   */

  window.BravoHome = {
    version: "2.0.0",

    refreshNavbar() {
      updateNavbarState();
    },

    scrollTo(selector) {
      return window.JharkhandTourismHome
        .scrollTo(selector);
    }

  };


  /* ==========================================================
     15. PAGE READY EVENT
  ========================================================== */

  window.dispatchEvent(
    new CustomEvent(
      "jt:home-ready",
      {
        detail: {
          version: "2.0.0"
        }
      }
    )
  );


  /*
   * Compatibility event for existing integrations.
   */

  window.dispatchEvent(
    new CustomEvent(
      "bravo:home-ready",
      {
        detail: {
          version: "2.0.0"
        }
      }
    )
  );


})();