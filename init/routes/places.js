const express = require('express');
const router = express.Router();

/*
 * Jharkhand Tourism
 * -----------------
 * Places discovery + place details
 *
 * Core behavior preserved:
 * - MongoDB/Mongoose Place model when available
 * - Static dataset fallback
 * - Search
 * - Category filtering
 * - District filtering
 * - Pagination
 * - Place details
 * - Nearby places
 * - Nearby hotels
 */

// ------------------------------------------------------------
// DATA SOURCES
// ------------------------------------------------------------

let PlaceModel = null;

try {
  PlaceModel = require('../models/place');
} catch (error) {
  console.warn(
    'places router: Place model unavailable, using fallback dataset.'
  );
}

let fallbackData = [];

try {
  fallbackData = require('../data/places_data');
} catch (error) {
  console.warn(
    'places router: fallback places dataset unavailable.'
  );
}

let hotelsList = [];

try {
  hotelsList = require('../models/hotels');
} catch (error) {
  console.warn(
    'places router: hotels dataset unavailable.'
  );
}

// ------------------------------------------------------------
// CONSTANTS
// ------------------------------------------------------------

const DEFAULT_PAGE = 1;
const ITEMS_PER_PAGE = 12;

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function cleanString(value, fallback = '') {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value).trim();
}

function normalize(value) {
  return cleanString(value).toLowerCase();
}

function getPlaceImage(place) {
  if (!place) {
    return '/images/placeholder.jpg';
  }

  if (Array.isArray(place.images) && place.images.length > 0) {
    const firstImage = place.images[0];

    if (typeof firstImage === 'string' && firstImage.trim()) {
      return firstImage;
    }

    if (
      firstImage &&
      typeof firstImage === 'object' &&
      firstImage.url
    ) {
      return firstImage.url;
    }
  }

  return (
    place.image ||
    place.thumbnail ||
    '/images/placeholder.jpg'
  );
}

function transformPlace(place) {
  if (!place) {
    return null;
  }

  const description =
    cleanString(place.description) ||
    cleanString(place.long_desc) ||
    cleanString(place.short_desc);

  const shortDescription =
    cleanString(place.short_desc) ||
    description.slice(0, 160);

  let googleMap = cleanString(place.google_map);

  if (
    !googleMap &&
    place.coordinates &&
    typeof place.coordinates === 'object'
  ) {
    const lat = place.coordinates.lat;
    const lng = place.coordinates.lng;

    if (
      lat !== undefined &&
      lat !== null &&
      lng !== undefined &&
      lng !== null
    ) {
      googleMap = `https://www.google.com/maps?q=${encodeURIComponent(
        `${lat},${lng}`
      )}`;
    }
  }

  return {
    ...place,

    place_id:
      cleanString(place.place_id) ||
      cleanString(place._id),

    name: cleanString(place.name, 'Unnamed Destination'),

    district: cleanString(
      place.district,
      'Jharkhand'
    ),

    category: cleanString(
      place.category,
      'Other'
    ),

    short_desc: shortDescription,

    long_desc: description,

    google_map: googleMap,

    image: getPlaceImage(place)
  };
}

// ------------------------------------------------------------
// FETCH PLACES
// ------------------------------------------------------------

async function fetchPlacesFromSource() {
  if (PlaceModel) {
    try {
      const count = await PlaceModel.countDocuments();

      if (count > 0) {
        const documents = await PlaceModel
          .find()
          .sort({ createdAt: -1 })
          .lean();

        return documents
          .map(transformPlace)
          .filter(Boolean);
      }
    } catch (error) {
      console.warn(
        'places router: database read failed; using fallback dataset:',
        error?.message || error
      );
    }
  }

  return Array.isArray(fallbackData)
    ? fallbackData
        .map(transformPlace)
        .filter(Boolean)
    : [];
}

// ------------------------------------------------------------
// FILTERING
// ------------------------------------------------------------

function applyFilters(
  list,
  {
    q = '',
    category = 'all',
    district = 'all'
  } = {}
) {
  let result = Array.isArray(list)
    ? [...list]
    : [];

  const searchTerm = normalize(q);
  const selectedCategory = normalize(category);
  const selectedDistrict = normalize(district);

  // Search
  if (searchTerm) {
    result = result.filter((place) => {
      const searchableText = [
        place.name,
        place.district,
        place.category,
        place.short_desc,
        place.long_desc,
        Array.isArray(place.tags)
          ? place.tags.join(' ')
          : place.tags
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }

  // Category
  if (
    selectedCategory &&
    selectedCategory !== 'all'
  ) {
    result = result.filter(
      (place) =>
        normalize(place.category) ===
        selectedCategory
    );
  }

  // District
  if (
    selectedDistrict &&
    selectedDistrict !== 'all'
  ) {
    result = result.filter(
      (place) =>
        normalize(place.district) ===
        selectedDistrict
    );
  }

  return result;
}

// ------------------------------------------------------------
// FILTER OPTIONS
// ------------------------------------------------------------

function getFilterOptions(places) {
  const categories = Array.from(
    new Set(
      places
        .map((place) => cleanString(place.category))
        .filter(Boolean)
    )
  ).sort((a, b) =>
    a.localeCompare(b)
  );

  const districts = Array.from(
    new Set(
      places
        .map((place) => cleanString(place.district))
        .filter(Boolean)
    )
  ).sort((a, b) =>
    a.localeCompare(b)
  );

  return {
    categories,
    districts
  };
}

// ------------------------------------------------------------
// LIST — GET /places
// ------------------------------------------------------------

router.get('/', async (req, res) => {
  try {
    const requestedPage = Number.parseInt(
      req.query.page,
      10
    );

    const page =
      Number.isFinite(requestedPage) &&
      requestedPage > 0
        ? requestedPage
        : DEFAULT_PAGE;

    const q = cleanString(req.query.q);

    const category = cleanString(
      req.query.category,
      'all'
    ) || 'all';

    const district = cleanString(
      req.query.district,
      'all'
    ) || 'all';

    const allPlaces =
      await fetchPlacesFromSource();

    const safePlaces = Array.isArray(allPlaces)
      ? allPlaces
      : [];

    const filteredPlaces = applyFilters(
      safePlaces,
      {
        q,
        category,
        district
      }
    );

    const total = filteredPlaces.length;

    const totalPages = Math.max(
      1,
      Math.ceil(total / ITEMS_PER_PAGE)
    );

    // Prevent requests beyond the last page
    const safePage = Math.min(
      page,
      totalPages
    );

    const start =
      (safePage - 1) * ITEMS_PER_PAGE;

    const pagePlaces =
      filteredPlaces.slice(
        start,
        start + ITEMS_PER_PAGE
      );

    const {
      categories,
      districts
    } = getFilterOptions(safePlaces);

    return res.render(
      'places/index',
      {
        places: pagePlaces,

        page: safePage,

        totalPages,

        total,

        q,

        selectedCategory: category,

        selectedDistrict: district,

        categories,

        districts
      }
    );
  } catch (error) {
    console.error(
      'Error in GET /places:',
      error
    );

    return res.status(500).render(
      '404',
      {
        message:
          'Unable to load destinations right now.'
      }
    );
  }
});

// ------------------------------------------------------------
// DETAIL — GET /places/:id
// ------------------------------------------------------------

router.get('/:id', async (req, res) => {
  try {
    const requestedId =
      cleanString(req.params.id);

    if (!requestedId) {
      return res.status(404).render(
        '404',
        {
          message:
            'Destination not found.'
        }
      );
    }

    const allPlaces =
      await fetchPlacesFromSource();

    const safePlaces = Array.isArray(allPlaces)
      ? allPlaces
      : [];

    const place = safePlaces.find(
      (item) =>
        cleanString(item.place_id) ===
        requestedId ||
        cleanString(item._id) ===
        requestedId
    );

    if (!place) {
      return res.status(404).render(
        '404',
        {
          message:
            'Destination not found.'
        }
      );
    }

    // --------------------------------------------------------
    // Nearby places
    // --------------------------------------------------------

    const nearbyPlaces = safePlaces
      .filter((item) => {
        if (
          cleanString(item.place_id) ===
          cleanString(place.place_id)
        ) {
          return false;
        }

        const sameDistrict =
          normalize(item.district) ===
          normalize(place.district);

        const sameCategory =
          normalize(item.category) ===
          normalize(place.category);

        return (
          sameDistrict ||
          sameCategory
        );
      })
      .slice(0, 6);

    // --------------------------------------------------------
    // Nearby hotels
    // --------------------------------------------------------

    let nearbyHotels = [];

    if (
      Array.isArray(hotelsList) &&
      hotelsList.length > 0
    ) {
      const placeDistrict =
        normalize(place.district);

      nearbyHotels = hotelsList
        .filter((hotel) => {
          return (
            normalize(hotel?.district) ===
            placeDistrict
          );
        })
        .slice(0, 4);
    }

    return res.render(
      'places/show',
      {
        place,

        nearby: nearbyPlaces,

        nearbyHotels
      }
    );
  } catch (error) {
    console.error(
      'Error in GET /places/:id:',
      error
    );

    return res.status(500).render(
      '404',
      {
        message:
          'Unable to load this destination right now.'
      }
    );
  }
});

module.exports = router;