/* =========================================================
   JHARKHAND TOURISM — INTERACTIVE PLANNER MAP
   =========================================================

   Responsibilities:
   - Initialize Leaflet
   - Read Planner data from #plannerMapData
   - Resolve real destination locations
   - Display destination / itinerary / hotel markers
   - Draw the planned journey
   - Fit the map to available locations
   - Provide map controls
   - Handle loading / error / retry states
   - Cache geocoding results during the page session
   - Gracefully handle partial geocoding failures

   IMPORTANT:
   Coordinates are never invented.
   Locations are resolved through OpenStreetMap Nominatim.
   ========================================================= */

(function () {
    "use strict";

    /* =====================================================
       BASIC ELEMENTS
    ====================================================== */

    const mapElement = document.getElementById("tripMap");
    const dataElement = document.getElementById("plannerMapData");

    if (!mapElement || !dataElement) {
        console.warn("Planner map: required elements not found.");
        return;
    }

    if (typeof window.L === "undefined") {
        console.error("Planner map: Leaflet is not loaded.");
        showMapError("The map library could not be loaded.");
        return;
    }

    const L = window.L;

    /* =====================================================
       UI ELEMENTS
    ====================================================== */

    const loadingElement =
        document.getElementById("mapLoading");

    const errorElement =
        document.getElementById("mapError");

    const statusText =
        document.getElementById("mapStatusText");

    const statusDot =
        document.getElementById("mapStatusDot");

    const fitButton =
        document.getElementById("mapFitBounds");

    const destinationButton =
        document.getElementById("mapLocateDestination");

    const resetButton =
        document.getElementById("mapResetView");

    const retryButton =
        document.getElementById("mapRetry");

    /* =====================================================
       PLANNER DATA
    ====================================================== */

    let plannerData = {};

    try {
        plannerData =
            JSON.parse(dataElement.textContent || "{}");
    } catch (error) {
        console.error(
            "Planner map: unable to parse planner map data.",
            error
        );

        showMapError(
            "The trip map data could not be loaded."
        );

        return;
    }

    const destination =
        String(
            plannerData.destination || ""
        ).trim();

    const itinerary =
        Array.isArray(plannerData.itinerary)
            ? plannerData.itinerary
            : [];

    const hotels =
        Array.isArray(plannerData.hotels)
            ? plannerData.hotels
            : [];

    /* =====================================================
       CONFIGURATION
    ====================================================== */

    const JHARKHAND_CENTER = [
        23.6102,
        85.2799
    ];

    const DEFAULT_ZOOM = 7;

    const FOCUS_ZOOM = 11;

    const NOMINATIM_URL =
        "https://nominatim.openstreetmap.org/search";

    /*
     * Nominatim asks clients to avoid aggressive request
     * rates. A single controlled queue is used below.
     */
    const GEOCODE_DELAY = 1100;

    /* =====================================================
       MAP STATE
    ====================================================== */

    let map = null;

    let destinationLocation = null;

    let itineraryLocations = [];

    let hotelLocations = [];

    let destinationMarker = null;

    let journeyLayer = null;

    let markersLayer = null;

    let mapInitialBounds = null;

    let isLoading = false;

    let geocodingQueue = Promise.resolve();

    /*
     * Session-level geocoding cache.
     *
     * Key:
     *   normalized query
     *
     * Value:
     *   resolved location OR null
     */
    const geocodeCache = new Map();

    /* =====================================================
       SAFE HTML
    ====================================================== */

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       WAIT HELPER
    ====================================================== */

    function wait(milliseconds) {
        return new Promise(function (resolve) {
            window.setTimeout(
                resolve,
                milliseconds
            );
        });
    }

    /* =====================================================
       STATUS
    ====================================================== */

    function setStatus(
        message,
        state = "loading"
    ) {
        if (statusText) {
            statusText.textContent = message;
        }

        if (statusDot) {
            statusDot.classList.remove(
                "is-loading",
                "is-ready",
                "is-error"
            );

            statusDot.classList.add(
                `is-${state}`
            );
        }
    }

    /* =====================================================
       LOADING
    ====================================================== */

    function showLoading(message) {
        if (loadingElement) {
            loadingElement.style.display = "flex";

            const strong =
                loadingElement.querySelector("strong");

            const span =
                loadingElement.querySelector("span");

            if (strong) {
                strong.textContent =
                    "Preparing your journey map";
            }

            if (span) {
                span.textContent =
                    message ||
                    "Locating your destinations...";
            }
        }

        setStatus(
            message || "Preparing map...",
            "loading"
        );
    }

    function hideLoading() {
        if (loadingElement) {
            loadingElement.style.display = "none";
        }
    }

    /* =====================================================
       ERROR
    ====================================================== */

    function showMapError(message) {
        hideLoading();

        if (errorElement) {
            errorElement.hidden = false;

            const paragraph =
                errorElement.querySelector("p");

            if (paragraph && message) {
                paragraph.textContent = message;
            }
        }

        setStatus(
            "Map unavailable",
            "error"
        );
    }

    function hideMapError() {
        if (errorElement) {
            errorElement.hidden = true;
        }
    }

    /* =====================================================
       MAP INITIALIZATION
    ====================================================== */

    function initializeMap() {
        if (map) {
            return;
        }

        map = L.map(
            "tripMap",
            {
                zoomControl: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
                dragging: true,
                keyboard: true,
                attributionControl: true
            }
        ).setView(
            JHARKHAND_CENTER,
            DEFAULT_ZOOM
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            }
        ).addTo(map);

        markersLayer =
            L.layerGroup().addTo(map);

        journeyLayer =
            L.layerGroup().addTo(map);

        window.setTimeout(function () {
            if (map) {
                map.invalidateSize();
            }
        }, 250);
    }

    /* =====================================================
       GEOCODING QUEUE
    ====================================================== */

    function queueGeocode(task) {
        const nextTask =
            geocodingQueue.then(
                async function () {
                    return task();
                }
            );

        geocodingQueue =
            nextTask
                .catch(function () {
                    /*
                     * Keep the queue alive even if one
                     * request fails.
                     */
                })
                .then(function () {
                    return wait(GEOCODE_DELAY);
                });

        return nextTask;
    }

    /* =====================================================
       NORMALIZE GEOCODING QUERY
    ====================================================== */

    function normalizeQuery(value) {
        return String(value || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }

    /* =====================================================
       GEOCODING
    ====================================================== */

    async function geocodePlace(placeName) {
        const cleanName =
            String(placeName || "").trim();

        if (!cleanName) {
            return null;
        }

        const queries = [
            `${cleanName}, Jharkhand, India`,
            `${cleanName}, India`
        ];

        for (const query of queries) {
            const cacheKey =
                normalizeQuery(query);

            if (geocodeCache.has(cacheKey)) {
                return geocodeCache.get(cacheKey);
            }

            const result =
                await queueGeocode(
                    async function () {
                        try {
                            const params =
                                new URLSearchParams({
                                    q: query,
                                    format: "json",
                                    limit: "1",
                                    countrycodes: "in",
                                    addressdetails: "1"
                                });

                            const response =
                                await fetch(
                                    `${NOMINATIM_URL}?${params.toString()}`,
                                    {
                                        method: "GET",
                                        headers: {
                                            Accept:
                                                "application/json"
                                        }
                                    }
                                );

                            if (!response.ok) {
                                return null;
                            }

                            const results =
                                await response.json();

                            if (
                                !Array.isArray(results) ||
                                !results.length
                            ) {
                                return null;
                            }

                            const firstResult =
                                results[0];

                            const lat =
                                Number(
                                    firstResult.lat
                                );

                            const lng =
                                Number(
                                    firstResult.lon
                                );

                            if (
                                !Number.isFinite(lat) ||
                                !Number.isFinite(lng)
                            ) {
                                return null;
                            }

                            return {
                                lat,
                                lng,
                                displayName:
                                    firstResult.display_name ||
                                    cleanName
                            };
                        } catch (error) {
                            console.warn(
                                `Map geocoding failed for "${cleanName}".`,
                                error
                            );

                            return null;
                        }
                    }
                );

            geocodeCache.set(
                cacheKey,
                result
            );

            if (result) {
                return result;
            }
        }

        return null;
    }

    /* =====================================================
       DESTINATION MARKER
    ====================================================== */

    function addDestinationMarker(
        location,
        name
    ) {
        if (!map || !location) {
            return;
        }

        const marker =
            L.marker(
                [
                    location.lat,
                    location.lng
                ],
                {
                    title: name,
                    alt:
                        `Destination: ${name}`
                }
            );

        marker
            .addTo(markersLayer)
            .bindPopup(`
                <div class="jt-map-popup jt-map-popup-destination">

                    <span class="jt-map-popup-kicker">
                        <i class="fa-solid fa-location-dot"></i>
                        Destination
                    </span>

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                    <span>
                        Your planned journey destination
                    </span>

                </div>
            `);

        destinationMarker =
            marker;
    }

    /* =====================================================
       ITINERARY MARKER
    ====================================================== */

    function addItineraryMarker(
        item,
        location,
        index
    ) {
        if (!map || !location) {
            return;
        }

        const day =
            item.day ||
            index + 1;

        const place =
            item.place ||
            "Journey stop";

        const description =
            item.description ||
            "";

        const cost =
            item.cost || "";

        const marker =
            L.marker(
                [
                    location.lat,
                    location.lng
                ],
                {
                    title:
                        `Day ${day}: ${place}`,
                    alt:
                        `Itinerary stop: ${place}`
                }
            );

        let popup = `
            <div class="jt-map-popup jt-map-popup-itinerary">

                <span class="jt-map-popup-kicker">
                    <i class="fa-solid fa-route"></i>
                    Day ${escapeHtml(day)}
                </span>

                <strong>
                    ${escapeHtml(place)}
                </strong>
        `;

        if (description) {
            popup += `
                <p>
                    ${escapeHtml(description)}
                </p>
            `;
        }

        if (cost !== "") {
            popup += `
                <span class="jt-map-popup-cost">
                    <i class="fa-solid fa-indian-rupee-sign"></i>
                    ${escapeHtml(cost)}
                </span>
            `;
        }

        popup += `
            </div>
        `;

        marker
            .addTo(markersLayer)
            .bindPopup(popup);

        itineraryLocations.push({
            ...item,
            ...location,
            marker
        });
    }

    /* =====================================================
       HOTEL MARKER
    ====================================================== */

    function addHotelMarker(
        hotel,
        location
    ) {
        if (!map || !location) {
            return;
        }

        const name =
            hotel.name ||
            "Recommended Hotel";

        const address =
            hotel.address ||
            "";

        const rating =
            hotel.rating ||
            "";

        const price =
            hotel.price_from ||
            "";

        let popup = `
            <div class="jt-map-popup jt-map-popup-hotel">

                <span class="jt-map-popup-kicker">
                    <i class="fa-solid fa-hotel"></i>
                    Recommended Stay
                </span>

                <strong>
                    ${escapeHtml(name)}
                </strong>
        `;

        if (address) {
            popup += `
                <span>
                    ${escapeHtml(address)}
                </span>
            `;
        }

        if (rating) {
            popup += `
                <span class="jt-map-popup-rating">
                    <i class="fa-solid fa-star"></i>
                    ${escapeHtml(rating)}
                </span>
            `;
        }

        if (price) {
            popup += `
                <span class="jt-map-popup-cost">
                    Starting ₹${escapeHtml(price)}
                </span>
            `;
        }

        if (hotel.map) {
            popup += `
                <a
                    href="${escapeHtml(hotel.map)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View location
                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                </a>
            `;
        }

        popup += `
            </div>
        `;

        const marker =
            L.marker(
                [
                    location.lat,
                    location.lng
                ],
                {
                    title: name,
                    alt:
                        `Hotel: ${name}`
                }
            );

        marker
            .addTo(markersLayer)
            .bindPopup(popup);

        hotelLocations.push({
            ...hotel,
            ...location,
            marker
        });
    }

    /* =====================================================
       JOURNEY LINE
    ====================================================== */

    function drawJourneyLine() {
        if (!map || !journeyLayer) {
            return;
        }

        journeyLayer.clearLayers();

        const coordinates =
            itineraryLocations.map(
                function (location) {
                    return [
                        location.lat,
                        location.lng
                    ];
                }
            );

        if (coordinates.length < 2) {
            return;
        }

        const line =
            L.polyline(
                coordinates,
                {
                    color: "#2f6b45",
                    weight: 4,
                    opacity: 0.75,
                    dashArray: "8 10",
                    lineCap: "round",
                    lineJoin: "round"
                }
            );

        line
            .addTo(journeyLayer)
            .bindTooltip(
                "Planned journey",
                {
                    sticky: true
                }
            );
    }

    /* =====================================================
       BUILD BOUNDS
    ====================================================== */

    function buildJourneyBounds() {
        const bounds =
            L.latLngBounds([]);

        if (destinationLocation) {
            bounds.extend([
                destinationLocation.lat,
                destinationLocation.lng
            ]);
        }

        itineraryLocations.forEach(
            function (location) {
                bounds.extend([
                    location.lat,
                    location.lng
                ]);
            }
        );

        hotelLocations.forEach(
            function (location) {
                bounds.extend([
                    location.lat,
                    location.lng
                ]);
            }
        );

        return bounds;
    }

    /* =====================================================
       FIT MAP
    ====================================================== */

    function fitJourney() {
        if (!map) {
            return;
        }

        const bounds =
            buildJourneyBounds();

        if (!bounds.isValid()) {
            map.setView(
                JHARKHAND_CENTER,
                DEFAULT_ZOOM
            );

            return;
        }

        mapInitialBounds =
            bounds;

        map.fitBounds(
            bounds,
            {
                padding: [
                    40,
                    40
                ],
                maxZoom: 12,
                animate: true
            }
        );
    }

    /* =====================================================
       FOCUS DESTINATION
    ====================================================== */

    function focusDestination() {
        if (!map || !destinationLocation) {
            return;
        }

        map.flyTo(
            [
                destinationLocation.lat,
                destinationLocation.lng
            ],
            FOCUS_ZOOM,
            {
                duration: 1
            }
        );

        if (destinationMarker) {
            destinationMarker.openPopup();
        }
    }

    /* =====================================================
       RESET VIEW
    ====================================================== */

    function resetMapView() {
        if (!map) {
            return;
        }

        if (mapInitialBounds) {
            map.fitBounds(
                mapInitialBounds,
                {
                    padding: [
                        40,
                        40
                    ],
                    maxZoom: 12,
                    animate: true
                }
            );

            return;
        }

        map.setView(
            JHARKHAND_CENTER,
            DEFAULT_ZOOM
        );
    }

    /* =====================================================
       DESTINATION
    ====================================================== */

    async function loadDestination() {
        if (!destination) {
            return;
        }

        setStatus(
            "Locating destination...",
            "loading"
        );

        const location =
            await geocodePlace(
                destination
            );

        if (!location) {
            console.warn(
                `Could not locate destination: ${destination}`
            );

            return;
        }

        destinationLocation =
            location;

        addDestinationMarker(
            location,
            destination
        );
    }

    /* =====================================================
       ITINERARY
    ====================================================== */

    async function loadItinerary() {
        itineraryLocations = [];

        for (
            let index = 0;
            index < itinerary.length;
            index++
        ) {
            const item =
                itinerary[index];

            const place =
                item &&
                typeof item === "object"
                    ? item.place
                    : item;

            if (!place) {
                continue;
            }

            setStatus(
                `Locating stop ${index + 1} of ${itinerary.length}...`,
                "loading"
            );

            const location =
                await geocodePlace(
                    place
                );

            if (!location) {
                console.warn(
                    `Could not locate itinerary place: ${place}`
                );

                continue;
            }

            addItineraryMarker(
                item &&
                typeof item === "object"
                    ? item
                    : {
                        day: index + 1,
                        place: String(place)
                    },
                location,
                index
            );
        }

        drawJourneyLine();
    }

    /* =====================================================
       HOTELS
    ====================================================== */

    async function loadHotels() {
        hotelLocations = [];

        for (
            let index = 0;
            index < hotels.length;
            index++
        ) {
            const hotel =
                hotels[index];

            if (!hotel || !hotel.name) {
                continue;
            }

            setStatus(
                `Locating hotel ${index + 1} of ${hotels.length}...`,
                "loading"
            );

            const hotelQuery =
                hotel.address
                    ? `${hotel.name}, ${hotel.address}, Jharkhand, India`
                    : `${hotel.name}, Jharkhand, India`;

            const location =
                await geocodePlace(
                    hotelQuery
                );

            if (!location) {
                console.warn(
                    `Could not locate hotel: ${hotel.name}`
                );

                continue;
            }

            addHotelMarker(
                hotel,
                location
            );
        }
    }

    /* =====================================================
       CLEAR MAP CONTENT
    ====================================================== */

    function clearMapContent() {
        if (markersLayer) {
            markersLayer.clearLayers();
        }

        if (journeyLayer) {
            journeyLayer.clearLayers();
        }

        destinationLocation = null;

        itineraryLocations = [];

        hotelLocations = [];

        destinationMarker = null;

        mapInitialBounds = null;
    }

    /* =====================================================
       LOAD COMPLETE MAP
    ====================================================== */

    async function loadMapData() {
        if (isLoading) {
            return;
        }

        isLoading = true;

        hideMapError();

        showLoading(
            "Locating your journey..."
        );

        try {
            initializeMap();

            clearMapContent();

            if (!destination && !itinerary.length) {
                throw new Error(
                    "No destination or itinerary was provided."
                );
            }

            /*
             * Destination is loaded first so the user gets
             * an immediate geographical anchor.
             */
            await loadDestination();

            /*
             * Load itinerary stops next.
             */
            if (itinerary.length) {
                await loadItinerary();
            }

            /*
             * Hotels are supplementary information.
             */
            if (hotels.length) {
                await loadHotels();
            }

            fitJourney();

            hideLoading();

            const resolvedLocations =
                Number(Boolean(destinationLocation)) +
                itineraryLocations.length +
                hotelLocations.length;

            if (resolvedLocations > 0) {
                setStatus(
                    "Interactive map ready",
                    "ready"
                );
            } else {
                showMapError(
                    "No locations could be resolved for this itinerary."
                );

                return;
            }

            window.setTimeout(
                function () {
                    if (map) {
                        map.invalidateSize();
                    }
                },
                300
            );
        } catch (error) {
            console.error(
                "Planner map initialization error:",
                error
            );

            showMapError(
                "We couldn't prepare the interactive map. Please try again."
            );
        } finally {
            isLoading = false;
        }
    }

    /* =====================================================
       BUTTON EVENTS
    ====================================================== */

    if (fitButton) {
        fitButton.addEventListener(
            "click",
            function () {
                fitJourney();
            }
        );
    }

    if (destinationButton) {
        destinationButton.addEventListener(
            "click",
            function () {
                if (destinationLocation) {
                    focusDestination();
                } else {
                    setStatus(
                        "Destination location unavailable",
                        "error"
                    );
                }
            }
        );
    }

    if (resetButton) {
        resetButton.addEventListener(
            "click",
            function () {
                resetMapView();
            }
        );
    }

    if (retryButton) {
        retryButton.addEventListener(
            "click",
            function () {
                loadMapData();
            }
        );
    }

    /* =====================================================
       RESPONSIVE MAP REFRESH
    ====================================================== */

    window.addEventListener(
        "resize",
        function () {
            if (map) {
                map.invalidateSize();
            }
        }
    );

    /* =====================================================
       START
    ====================================================== */

    loadMapData();

})();

