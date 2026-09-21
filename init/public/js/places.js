/* ============================================================
   JHARKHAND TOURISM
   Places Explorer — Client Interactions
   ============================================================ */

(function () {
  'use strict';

  /*
   * ----------------------------------------------------------
   * DOM helpers
   * ----------------------------------------------------------
   */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));


  /*
   * ----------------------------------------------------------
   * Initialization
   * ----------------------------------------------------------
   */

  function init() {
    initBookmarkButtons();
    initImageFallbacks();
    initSearchEnhancements();
    initDestinationLinks();
    initCardInteractions();
  }


  /*
   * ----------------------------------------------------------
   * Bookmark buttons
   *
   * Preserve compatibility with any existing bookmark
   * implementation while keeping the UI functional when
   * no bookmark API is available.
   * ----------------------------------------------------------
   */

  function initBookmarkButtons() {
    const buttons = $$('.bookmark');

    if (!buttons.length) {
      return;
    }

    buttons.forEach((button) => {
      if (button.dataset.placesInitialized === 'true') {
        return;
      }

      button.dataset.placesInitialized = 'true';

      button.addEventListener('click', async function (event) {
        event.preventDefault();
        event.stopPropagation();

        const placeId =
          this.dataset.id ||
          this.closest('[data-id]')?.dataset.id;

        if (!placeId) {
          return;
        }

        await handleBookmark(this, placeId);
      });
    });
  }


  /*
   * ----------------------------------------------------------
   * Bookmark handling
   *
   * The existing project may already expose bookmark/wishlist
   * behavior through another script or endpoint.
   *
   * We first detect common existing global handlers.
   * If none exist, the UI still provides a useful local state
   * instead of sending an unknown request to the server.
   * ----------------------------------------------------------
   */

  async function handleBookmark(button, placeId) {

    /*
     * Existing application handler compatibility.
     */

    if (
      typeof window.toggleBookmark === 'function'
    ) {
      try {
        await window.toggleBookmark(placeId, button);
        return;
      } catch (error) {
        console.warn(
          'Existing bookmark handler failed:',
          error
        );
      }
    }

    if (
      typeof window.addToWishlist === 'function'
    ) {
      try {
        await window.addToWishlist(placeId, button);
        return;
      } catch (error) {
        console.warn(
          'Existing wishlist handler failed:',
          error
        );
      }
    }

    /*
     * Fallback visual state.
     *
     * This does not pretend that the destination was
     * persisted on the server.
     */

    toggleLocalBookmarkState(button, placeId);
  }


  /*
   * ----------------------------------------------------------
   * Local bookmark state
   *
   * Used only when no application bookmark handler exists.
   * ----------------------------------------------------------
   */

  function toggleLocalBookmarkState(button, placeId) {
    const storageKey =
      'jt-bookmarked-places';

    let saved = [];

    try {
      saved =
        JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );

      if (!Array.isArray(saved)) {
        saved = [];
      }
    } catch (error) {
      saved = [];
    }

    const index =
      saved.indexOf(String(placeId));

    const icon =
      $('i', button);

    if (index >= 0) {

      saved.splice(index, 1);

      button.classList.remove('is-bookmarked');
      button.setAttribute(
        'aria-pressed',
        'false'
      );

      if (icon) {
        icon.classList.remove(
          'fa-solid'
        );

        icon.classList.add(
          'fa-regular'
        );
      }

      showBookmarkFeedback(
        button,
        'Removed from saved places'
      );

    } else {

      saved.push(String(placeId));

      button.classList.add('is-bookmarked');
      button.setAttribute(
        'aria-pressed',
        'true'
      );

      if (icon) {
        icon.classList.remove(
          'fa-regular'
        );

        icon.classList.add(
          'fa-solid'
        );
      }

      showBookmarkFeedback(
        button,
        'Saved to this browser'
      );
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(saved)
      );
    } catch (error) {
      /*
       * Storage may be disabled.
       * The visual state still works.
       */
    }
  }


  /*
   * ----------------------------------------------------------
   * Restore local bookmark state
   * ----------------------------------------------------------
   */

  function restoreLocalBookmarks() {
    let saved = [];

    try {
      saved =
        JSON.parse(
          localStorage.getItem(
            'jt-bookmarked-places'
          ) || '[]'
        );

      if (!Array.isArray(saved)) {
        saved = [];
      }
    } catch (error) {
      return;
    }

    $$('.bookmark').forEach((button) => {

      const placeId =
        button.dataset.id ||
        button.closest('[data-id]')?.dataset.id;

      if (!placeId) {
        return;
      }

      if (
        saved.includes(String(placeId))
      ) {
        button.classList.add(
          'is-bookmarked'
        );

        button.setAttribute(
          'aria-pressed',
          'true'
        );

        const icon =
          $('i', button);

        if (icon) {
          icon.classList.remove(
            'fa-regular'
          );

          icon.classList.add(
            'fa-solid'
          );
        }
      }
    });
  }


  /*
   * ----------------------------------------------------------
   * Small feedback message
   * ----------------------------------------------------------
   */

  function showBookmarkFeedback(
    button,
    message
  ) {
    const existing =
      $('.jt-bookmark-feedback');

    if (existing) {
      existing.remove();
    }

    const feedback =
      document.createElement('span');

    feedback.className =
      'jt-bookmark-feedback';

    feedback.textContent = message;

    feedback.setAttribute(
      'role',
      'status'
    );

    /*
     * Position relative to the clicked button.
     */

    const rect =
      button.getBoundingClientRect();

    feedback.style.position =
      'fixed';

    feedback.style.left =
      `${Math.min(
        rect.left,
        window.innerWidth - 230
      )}px`;

    feedback.style.top =
      `${Math.min(
        rect.bottom + 10,
        window.innerHeight - 60
      )}px`;

    feedback.style.zIndex =
      '9999';

    document.body.appendChild(
      feedback
    );

    window.setTimeout(() => {
      feedback.classList.add(
        'is-hiding'
      );

      window.setTimeout(() => {
        feedback.remove();
      }, 180);

    }, 1800);
  }


  /*
   * ----------------------------------------------------------
   * Image fallback
   * ----------------------------------------------------------
   */

  function initImageFallbacks() {
    const images =
      $$('.jt-destination-image');

    images.forEach((image) => {

      image.addEventListener(
        'error',
        function () {

          if (
            this.dataset.fallbackApplied ===
            'true'
          ) {
            return;
          }

          this.dataset.fallbackApplied =
            'true';

          this.src =
            '/images/placeholder.jpg';

        }
      );

    });
  }


  /*
   * ----------------------------------------------------------
   * Search enhancements
   * ----------------------------------------------------------
   */

  function initSearchEnhancements() {

    const form =
      $('#placesSearchForm');

    const input =
      $('#liveSearch');

    if (!form || !input) {
      return;
    }

    /*
     * Keyboard shortcut:
     *
     * "/" focuses the destination search,
     * unless the user is already typing somewhere.
     */

    document.addEventListener(
      'keydown',
      function (event) {

        if (
          event.key !== '/' ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey
        ) {
          return;
        }

        const target =
          event.target;

        if (
          target &&
          (
            target.matches(
              'input, textarea, select'
            ) ||
            target.isContentEditable
          )
        ) {
          return;
        }

        event.preventDefault();

        input.focus();
      }
    );


    /*
     * Search submission state.
     */

    form.addEventListener(
      'submit',
      function () {

        input.value =
          input.value.trim();

        const button =
          $('.jt-search-submit', form);

        if (!button) {
          return;
        }

        button.disabled = true;

        button.dataset.originalText =
          button.innerHTML;

        button.innerHTML =
          '<i class="fa-solid fa-spinner fa-spin"></i> Searching...';

      }
    );

  }


  /*
   * ----------------------------------------------------------
   * Destination links
   *
   * Add a lightweight loading state without delaying
   * normal navigation.
   * ----------------------------------------------------------
   */

  function initDestinationLinks() {

    $$('.jt-destination-link')
      .forEach((link) => {

        link.addEventListener(
          'click',
          function () {

            const icon =
              $('i', this);

            if (!icon) {
              return;
            }

            icon.classList.remove(
              'fa-arrow-right'
            );

            icon.classList.add(
              'fa-spinner',
              'fa-spin'
            );

          }
        );

      });

  }


  /*
   * ----------------------------------------------------------
   * Card interactions
   * ----------------------------------------------------------
   */

  function initCardInteractions() {

    $$('.jt-destination-card')
      .forEach((card) => {

        card.addEventListener(
          'keydown',
          function (event) {

            /*
             * Do not turn the entire card into a link.
             * Existing links remain the primary interaction.
             */

            if (
              event.key !== 'Enter' ||
              event.target !== card
            ) {
              return;
            }

            const link =
              $('.jt-destination-link', card);

            if (link) {
              link.click();
            }

          }
        );

      });

  }


  /*
   * ----------------------------------------------------------
   * Bookmark visual feedback styles
   *
   * Inject only the tiny amount of JS-specific styling
   * needed for the fallback notification.
   * ----------------------------------------------------------
   */

  function injectFeedbackStyles() {

    if (
      document.getElementById(
        'jtPlacesFeedbackStyles'
      )
    ) {
      return;
    }

    const style =
      document.createElement('style');

    style.id =
      'jtPlacesFeedbackStyles';

    style.textContent = `
      .jt-bookmark-feedback {
        padding: 9px 13px;
        border: 1px solid rgba(47, 107, 82, 0.18);
        border-radius: 9px;
        background: #ffffff;
        color: #173f32;
        box-shadow: 0 10px 30px rgba(16, 47, 39, 0.14);
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
        animation: jtPlacesFeedbackIn 180ms ease both;
      }

      .jt-bookmark-feedback.is-hiding {
        opacity: 0;
        transform: translateY(-4px);
        transition:
          opacity 180ms ease,
          transform 180ms ease;
      }

      .jt-destination-bookmark.is-bookmarked {
        background: #173f32;
        color: #ffffff;
      }

      @keyframes jtPlacesFeedbackIn {
        from {
          opacity: 0;
          transform: translateY(4px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .jt-bookmark-feedback {
          animation: none;
        }
      }
    `;

    document.head.appendChild(style);
  }


  /*
   * ----------------------------------------------------------
   * Public compatibility hook
   *
   * Some existing project scripts may expect this function.
   * Keep it available without forcing a client-side filtering
   * implementation that could disagree with server results.
   * ----------------------------------------------------------
   */

  window.applyClientFilter = function () {
    const form =
      $('#placesSearchForm');

    if (form) {
      form.submit();
    }
  };


  /*
   * ----------------------------------------------------------
   * Start
   * ----------------------------------------------------------
   */

  function start() {

    injectFeedbackStyles();

    init();

    restoreLocalBookmarks();
  }


  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      start
    );
  } else {
    start();
  }

})();