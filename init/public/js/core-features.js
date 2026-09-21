(() => {
  "use strict";

  /* =========================================================
     JHARKHAND TOURISM — CORE FEATURES CONTROLLER
     Handles:
       1. Accordion cards
       2. AI itinerary demo
       3. Smart map zoom demo
       4. Cultural Hub month filtering
       5. EcoScore demo
       6. Tourist–Local Connect search

     AR/VR modal is intentionally handled by:
       /smart/js/slide7.js

     This file therefore does NOT register a second AR/VR
     implementation.
  ========================================================= */

  const root = document.querySelector(".jt-core-page");

  if (!root) {
    return;
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  const $ = (selector, scope = root) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = root) =>
    Array.from(scope.querySelectorAll(selector));

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  /* =========================================================
     1. FEATURE CARD ACCORDION
  ========================================================= */

  const cards = $$(".jt-core-card");

  const closeCard = (card) => {
    if (!card) {
      return;
    }

    const trigger = $(".jt-core-trigger", card);

    card.classList.remove("is-open");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
  };

  const openCard = (card) => {
    if (!card) {
      return;
    }

    cards.forEach((otherCard) => {
      if (otherCard !== card) {
        closeCard(otherCard);
      }
    });

    const trigger = $(".jt-core-trigger", card);

    card.classList.add("is-open");

    if (trigger) {
      trigger.setAttribute("aria-expanded", "true");
    }
  };

  cards.forEach((card) => {
    const trigger = $(".jt-core-trigger", card);

    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => {
      const isOpen =
        trigger.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeCard(card);
      } else {
        openCard(card);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    cards.forEach(closeCard);
  });

  /* =========================================================
     2. AI TRIP RECOMMENDER
  ========================================================= */

  const itineraryList = $("#itinerary-list");
  const regenBtn = $("#regen-itinerary");

  const interests = [
    "Waterfalls",
    "Wildlife Safari",
    "Tribal Craft Village",
    "Mountain Trek",
    "Temple Visit",
    "Cave Exploration",
    "Bird Watching",
    "Local Cuisine Trail"
  ];

  const places = [
    "Netarhat",
    "Betla National Park",
    "Hundru Falls",
    "Patratu Valley",
    "Parasnath Hills",
    "Ranchi Lake",
    "Deoghar",
    "Hazaribagh"
  ];

  const timeSlots = [
    "Morning",
    "Afternoon",
    "Evening",
    "Sunrise",
    "Sunset"
  ];

  const modes = [
    "Eco-Bus",
    "Shared Jeep",
    "Cycle",
    "On Foot",
    "Boat Ride",
    "E-Rickshaw"
  ];

  const randomItem = (items) =>
    items[Math.floor(Math.random() * items.length)];

  const generateItinerary = () => {
    if (!itineraryList) {
      return;
    }

    const plan = new Set();

    let attempts = 0;

    while (plan.size < 3 && attempts < 50) {
      attempts += 1;

      plan.add(
        `${randomItem(timeSlots)} — ` +
        `${randomItem(interests)} at ` +
        `${randomItem(places)} • via ` +
        `${randomItem(modes)}`
      );
    }

    itineraryList.innerHTML =
      Array.from(plan)
        .map(
          (item) =>
            `<li>${escapeHtml(item)}</li>`
        )
        .join("");

    if (!plan.size) {
      itineraryList.innerHTML =
        "<li>Example itinerary is unavailable.</li>";
    }
  };

  if (regenBtn) {
    regenBtn.addEventListener(
      "click",
      generateItinerary
    );
  }

  generateItinerary();

  /* =========================================================
     3. INTERACTIVE SMART MAP
  ========================================================= */

  const mapViewport = $("#mapViewport");
  const zoomIn = $("#zoomIn");
  const zoomOut = $("#zoomOut");

  let mapZoom = 1;

  const applyMapZoom = () => {
    if (!mapViewport) {
      return;
    }

    mapViewport.style.transform =
      `scale(${mapZoom})`;
  };

  if (zoomIn) {
    zoomIn.addEventListener("click", () => {
      mapZoom = Math.min(
        2.2,
        Number((mapZoom + 0.2).toFixed(2))
      );

      applyMapZoom();
    });
  }

  if (zoomOut) {
    zoomOut.addEventListener("click", () => {
      mapZoom = Math.max(
        0.8,
        Number((mapZoom - 0.2).toFixed(2))
      );

      applyMapZoom();
    });
  }

  applyMapZoom();

  /* =========================================================
     4. CULTURAL HUB
  ========================================================= */

  const monthSelect = $("#monthSelect");
  const festivalList = $("#festivalList");

  const festivals = {
    1: [
      "Sohrai Tribal Art Fest — Hazaribagh",
      "Makar Sankranti Kite Celebration — Ranchi"
    ],

    2: [
      "Basukhar Mela — Deoghar"
    ],

    3: [
      "Sarhul Tribal Festival — Statewide"
    ],

    4: [
      "Baha Festival — Santhal Communities"
    ],

    5: [
      "Paitkar Art & Handicraft Week — East Singhbhum"
    ],

    6: [
      "Monsoon Eco Trails — Netarhat"
    ],

    7: [
      "Palash Folk Music Festival — Ranchi"
    ],

    8: [
      "Harela Plantation Drive — Statewide"
    ],

    9: [
      "Karma Puja — Tribal Harvest Celebration"
    ],

    10: [
      "Durga Puja — All Districts"
    ],

    11: [
      "Chhath Puja — River & Lake Ghats"
    ],

    12: [
      "Winter Birding Festival — Betla",
      "Hot Spring Wellness Retreats — Latehar"
    ]
  };

  const updateFestivalList = () => {
    if (!monthSelect || !festivalList) {
      return;
    }

    const month =
      Number(monthSelect.value);

    const list =
      festivals[month] || [];

    if (!list.length) {
      festivalList.innerHTML =
        "<li>No demonstration events listed.</li>";

      return;
    }

    festivalList.innerHTML =
      list
        .map(
          (festival) =>
            `<li>${escapeHtml(festival)}</li>`
        )
        .join("");
  };

  if (monthSelect) {
    monthSelect.addEventListener(
      "change",
      updateFestivalList
    );
  }

  updateFestivalList();

  /* =========================================================
     5. ECOSCORE TRACKER
  ========================================================= */

  const ecoFill = $("#ecoFill");
  const ecoScore = $("#ecoScore");
  const calcEco = $("#calcEco");

  const calculateEcoScore = () => {
    if (!ecoFill || !ecoScore) {
      return;
    }

    const score =
      Math.floor(
        60 + Math.random() * 40
      );

    ecoFill.style.width =
      `${score}%`;

    ecoScore.textContent =
      String(score);

    const meter =
      ecoFill.closest(".jt-meter");

    if (meter) {
      meter.setAttribute(
        "aria-valuenow",
        String(score)
      );
    }
  };

  if (calcEco) {
    calcEco.addEventListener(
      "click",
      calculateEcoScore
    );
  }

  /* =========================================================
     6. TOURIST — LOCAL CONNECT
  ========================================================= */

  const connectList = $("#connectList");
  const connectSearch = $("#connectSearch");

  const directory = [
    {
      type: "Guide",
      name: "Anita Kumar",
      tags: [
        "birding",
        "Betla",
        "wildlife"
      ]
    },

    {
      type: "Guide",
      name: "Rakesh Sharma",
      tags: [
        "heritage",
        "Deoghar"
      ]
    },

    {
      type: "Homestay",
      name: "Netarhat Pine Stay",
      tags: [
        "nature",
        "family"
      ]
    },

    {
      type: "Homestay",
      name: "Palamu Riverside Retreat",
      tags: [
        "forest",
        "riverside"
      ]
    },

    {
      type: "Guide",
      name: "Tina Mahato",
      tags: [
        "trekking",
        "Parasnath"
      ]
    }
  ];

  const initialsFor = (name) => {
    return name
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const renderDirectory = () => {
    if (!connectList || !connectSearch) {
      return;
    }

    const query =
      connectSearch.value
        .trim()
        .toLowerCase();

    const results =
      directory.filter((item) => {
        const matchesName =
          item.name
            .toLowerCase()
            .includes(query);

        const matchesType =
          item.type
            .toLowerCase()
            .includes(query);

        const matchesTags =
          item.tags.some((tag) =>
            tag
              .toLowerCase()
              .includes(query)
          );

        return (
          matchesName ||
          matchesType ||
          matchesTags
        );
      });

    if (!results.length) {
      connectList.innerHTML = `
        <div class="jt-connect-item">
          <div
            class="jt-connect-avatar"
            aria-hidden="true"
          >
            —
          </div>

          <div>
            <p class="jt-connect-name">
              No matches found
            </p>

            <p class="jt-connect-meta">
              Try another guide, destination or interest.
            </p>
          </div>
        </div>
      `;

      return;
    }

    connectList.innerHTML =
      results
        .map((item) => {
          const tags =
            item.tags
              .map(
                (tag) =>
                  `<span class="jt-connect-tag">${escapeHtml(tag)}</span>`
              )
              .join("");

          return `
            <div class="jt-connect-item">
              <div
                class="jt-connect-avatar"
                aria-hidden="true"
              >
                ${escapeHtml(
                  initialsFor(item.name)
                )}
              </div>

              <div>
                <p class="jt-connect-name">
                  ${escapeHtml(item.name)}
                </p>

                <p class="jt-connect-meta">
                  ${escapeHtml(item.type)}
                </p>

                <div class="jt-connect-tags">
                  ${tags}
                </div>
              </div>
            </div>
          `;
        })
        .join("");
  };

  if (connectSearch) {
    connectSearch.addEventListener(
      "input",
      renderDirectory
    );
  }

  renderDirectory();

})();