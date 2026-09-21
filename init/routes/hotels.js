// =========================================================
// JHARKHAND TOURISM — HOTEL ROUTES
// =========================================================

const express = require("express");
const router = express.Router();

let hotelsData = [];

try {
  hotelsData = require("../models/hotels");
} catch (error) {
  console.error("Hotels dataset not found", error);
  hotelsData = [];
}


// ---------------------------------------------------------
// Data helper
// ---------------------------------------------------------

function getAllHotels() {
  return Array.isArray(hotelsData)
    ? hotelsData
    : [];
}


// ---------------------------------------------------------
// GET /hotels
// Hotel listing + filters + pagination
// ---------------------------------------------------------

router.get("/", (req, res) => {
  try {
    let page = Math.max(
      1,
      parseInt(req.query.page || "1", 10)
    );

    const perPage = 12;

    const q = String(
      req.query.q || ""
    ).trim().toLowerCase();

    const district = String(
      req.query.district || ""
    ).trim().toLowerCase();

    const priceRange = String(
      req.query.price || ""
    ).trim();

    const ratingQuery = String(
      req.query.rating || ""
    ).trim();

    const availability = String(
      req.query.availability || ""
    ).trim().toLowerCase();


    let list = getAllHotels();


    // -----------------------------------------------------
    // Search
    // -----------------------------------------------------

    if (q) {
      list = list.filter((hotel) => {
        const name = String(
          hotel.name || ""
        ).toLowerCase();

        const address = String(
          hotel.address || ""
        ).toLowerCase();

        const hotelDistrict = String(
          hotel.district || ""
        ).toLowerCase();

        return (
          name.includes(q) ||
          address.includes(q) ||
          hotelDistrict.includes(q)
        );
      });
    }


    // -----------------------------------------------------
    // District
    // -----------------------------------------------------

    if (district) {
      list = list.filter((hotel) => {
        return String(
          hotel.district || ""
        ).toLowerCase() === district;
      });
    }


    // -----------------------------------------------------
    // Price
    // -----------------------------------------------------

    if (priceRange) {
      const parts = priceRange
        .split("-")
        .map((value) => {
          const parsed = parseFloat(value);
          return Number.isFinite(parsed)
            ? parsed
            : 0;
        });

      const minPrice = parts[0] || 0;
      const maxPrice =
        parts[1] || Number.POSITIVE_INFINITY;

      list = list.filter((hotel) => {
        const price = Number(
          hotel.price_from
        );

        if (!Number.isFinite(price)) {
          return false;
        }

        return (
          price >= minPrice &&
          price <= maxPrice
        );
      });
    }


    // -----------------------------------------------------
    // Rating
    // -----------------------------------------------------

    const minRating = parseFloat(
      ratingQuery || "0"
    );

    if (
      Number.isFinite(minRating) &&
      minRating > 0
    ) {
      list = list.filter((hotel) => {
        const rating = Number(
          hotel.rating || 0
        );

        return rating >= minRating;
      });
    }


    // -----------------------------------------------------
    // Availability
    // -----------------------------------------------------

    if (availability) {
      list = list.filter((hotel) => {
        return String(
          hotel.availability || ""
        ).toLowerCase() === availability;
      });
    }


    // -----------------------------------------------------
    // Pagination
    // -----------------------------------------------------

    const total = list.length;

    const totalPages = Math.max(
      1,
      Math.ceil(total / perPage)
    );

    if (page > totalPages) {
      page = totalPages;
    }

    const startIndex =
      (page - 1) * perPage;

    const endIndex =
      startIndex + perPage;

    const paged = list.slice(
      startIndex,
      endIndex
    );


    // -----------------------------------------------------
    // District options
    // -----------------------------------------------------

    const districts = Array.from(
      new Set(
        getAllHotels()
          .map((hotel) => hotel.district)
          .filter(Boolean)
      )
    ).sort();


    // -----------------------------------------------------
    // Render
    // -----------------------------------------------------

    res.render("hotels/index", {
      hotels: paged,

      page,
      totalPages,
      total,

      q: req.query.q || "",

      districts,

      selectedDistrict:
        req.query.district || "",

      selectedPrice:
        req.query.price || "",

      selectedRating:
        req.query.rating || "",

      selectedAvailability:
        req.query.availability || ""
    });

  } catch (error) {
    console.error(
      "GET /hotels error",
      error
    );

    res.status(500).send(
      "Server error"
    );
  }
});


// ---------------------------------------------------------
// GET /hotels/:id
// Hotel detail
// ---------------------------------------------------------

router.get("/:id", (req, res) => {
  try {
    const id = req.params.id;

    const list = getAllHotels();

    const hotel = list.find((item) => {
      return (
        item.id === id ||
        item.id === decodeURIComponent(id)
      );
    });

    if (!hotel) {
      return res
        .status(404)
        .render("404", {
          message: "Hotel not found"
        });
    }


    // -----------------------------------------------------
    // Nearby hotels
    // -----------------------------------------------------

    const nearby = list
      .filter((item) => {
        return (
          item.id !== hotel.id &&
          item.district === hotel.district
        );
      })
      .slice(0, 4);


    res.render("hotels/show", {
      hotel,
      nearby
    });

  } catch (error) {
    console.error(
      "GET /hotels/:id error",
      error
    );

    res.status(500).send(
      "Server error"
    );
  }
});


module.exports = router;