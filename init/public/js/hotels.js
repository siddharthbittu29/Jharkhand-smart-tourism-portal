// =========================================================
// JHARKHAND TOURISM — HOTELS PAGE
// Preserves favorites, filtering and booking UI behavior.
// =========================================================

(function () {
  "use strict";

  const FAVORITES_KEY = "jh_hotels_favs_v1";

  // -------------------------------------------------------
  // Favorites storage
  // -------------------------------------------------------

  function readFavorites() {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      const parsed = JSON.parse(stored || "[]");

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn("Unable to read hotel favorites.", error);
      return [];
    }
  }

  function writeFavorites(favorites) {
    try {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.warn("Unable to save hotel favorites.", error);
    }
  }

  // -------------------------------------------------------
  // Favorite button UI
  // -------------------------------------------------------

  function updateFavoriteButton(button, active) {
    if (!button) return;

    const icon = button.querySelector("i");

    button.classList.toggle("is-active", active);
    button.classList.toggle("fav-active", active);

    button.setAttribute(
      "aria-pressed",
      active ? "true" : "false"
    );

    button.setAttribute(
      "aria-label",
      active
        ? "Remove hotel from favorites"
        : "Add hotel to favorites"
    );

    if (icon) {
      icon.className = active
        ? "fa-solid fa-heart"
        : "fa-regular fa-heart";
    } else {
      button.textContent = active ? "♥" : "♡";
    }
  }

  function refreshFavoriteButtons() {
    const favorites = readFavorites();

    document.querySelectorAll(
      ".jt-hotel-favorite, .fav"
    ).forEach((button) => {
      const id = String(button.dataset.id || "");

      if (!id) return;

      updateFavoriteButton(
        button,
        favorites.includes(id)
      );
    });
  }

  function toggleFavorite(id) {
    if (!id) return;

    const normalizedId = String(id);
    const favorites = readFavorites();

    const index = favorites.indexOf(normalizedId);

    if (index === -1) {
      favorites.push(normalizedId);
    } else {
      favorites.splice(index, 1);
    }

    writeFavorites(favorites);
    refreshFavoriteButtons();
  }

  // -------------------------------------------------------
  // Favorite button events
  // -------------------------------------------------------

  function bindFavoriteButtons() {
    document.querySelectorAll(
      ".jt-hotel-favorite, .fav"
    ).forEach((button) => {
      if (button.dataset.favoriteBound === "true") {
        return;
      }

      button.dataset.favoriteBound = "true";

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        toggleFavorite(this.dataset.id);
      });
    });

    refreshFavoriteButtons();
  }

  // -------------------------------------------------------
  // Hotel filters
  // -------------------------------------------------------

  function buildFilterUrl() {
    const searchInput =
      document.getElementById("hotelSearch");

    const districtSelect =
      document.getElementById("filterDistrict");

    const availabilitySelect =
      document.getElementById("filterAvailability");

    const priceSelect =
      document.getElementById("filterPrice");

    const ratingSelect =
      document.getElementById("filterRating");

    const params = new URLSearchParams();

    params.set("page", "1");

    const q = searchInput
      ? searchInput.value.trim()
      : "";

    const district = districtSelect
      ? districtSelect.value.trim()
      : "";

    const availability = availabilitySelect
      ? availabilitySelect.value.trim()
      : "";

    const price = priceSelect
      ? priceSelect.value.trim()
      : "";

    const rating = ratingSelect
      ? ratingSelect.value.trim()
      : "";

    if (q) {
      params.set("q", q);
    }

    if (district) {
      params.set("district", district);
    }

    if (price) {
      params.set("price", price);
    }

    if (rating) {
      params.set("rating", rating);
    }

    if (availability) {
      params.set("availability", availability);
    }

    return "/hotels?" + params.toString();
  }

  function bindHotelFilters() {
    const filterButton =
      document.getElementById("doFilter");

    if (!filterButton) return;

    filterButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        window.location.href = buildFilterUrl();
      }
    );

    const searchInput =
      document.getElementById("hotelSearch");

    if (searchInput) {
      searchInput.addEventListener(
        "keydown",
        function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            window.location.href = buildFilterUrl();
          }
        }
      );
    }
  }

  // -------------------------------------------------------
  // Booking form
  // -------------------------------------------------------

  function bindBookingForm() {
    const bookingForm =
      document.getElementById("bookingForm");

    if (!bookingForm) return;

    bookingForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        const formData =
          new FormData(bookingForm);

        const checkin =
          formData.get("checkin") || "";

        alert(
          "Booking UI only — integration pending. " +
          "You entered: " +
          checkin
        );
      }
    );
  }

  // -------------------------------------------------------
  // Image fallback
  // -------------------------------------------------------

  function bindImageFallbacks() {
    document.querySelectorAll(
      ".jt-hotel-image"
    ).forEach((image) => {
      if (image.dataset.fallbackBound === "true") {
        return;
      }

      image.dataset.fallbackBound = "true";

      image.addEventListener(
        "error",
        function () {
          this.classList.add("is-fallback");

          if (
            this.src.indexOf(
              "/images/placeholder-hotel.jpg"
            ) === -1
          ) {
            this.src =
              "/images/placeholder-hotel.jpg";
          }
        }
      );
    });
  }

  // -------------------------------------------------------
  // Initialization
  // -------------------------------------------------------

  function initializeHotelsPage() {
    bindFavoriteButtons();
    bindHotelFilters();
    bindBookingForm();
    bindImageFallbacks();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeHotelsPage
    );
  } else {
    initializeHotelsPage();
  }

  // Optional public API for future hotel components.
  window.JharkhandTourismHotels = {
    readFavorites,
    toggleFavorite,
    refreshFavoriteButtons
  };
})();