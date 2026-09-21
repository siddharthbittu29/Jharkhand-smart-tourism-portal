const express = require("express");
const router = express.Router();

let Place;

try {
  Place = require("../models/place");
} catch (error) {
  console.error("❌ Unable to load Place model:", error.message);

  Place = null;
}


/* ============================================================
   CONFIG
   ============================================================ */

const DEFAULT_LIMIT = 9;
const MAX_LIMIT = 48;


/* ============================================================
   HELPERS
   ============================================================ */

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function positiveInt(value, fallback) {
  const parsed = parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : fallback;
}


function safePage(value) {
  return Math.max(
    positiveInt(value, 1),
    1
  );
}


function safeLimit(value) {
  const parsed = positiveInt(
    value,
    DEFAULT_LIMIT
  );

  return Math.min(
    parsed,
    MAX_LIMIT
  );
}


function escapeRegex(value) {
  return String(value || "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


/* ============================================================
   QUERY BUILDER
   ============================================================ */

function buildQuery({
  q,
  category,
  district,
  minRating
}) {

  const query = {};

  if (q) {

    const safeSearch =
      escapeRegex(q);

    const expression =
      new RegExp(
        safeSearch,
        "i"
      );

    query.$or = [
      { name: expression },
      { place_id: expression },
      { district: expression },
      { category: expression },
      { description: expression },
      { tags: expression }
    ];
  }


  if (category) {

    query.category =
      category;

  }


  if (district) {

    query.district =
      district;

  }


  if (minRating) {

    const rating =
      Number(minRating);

    if (
      Number.isFinite(rating) &&
      rating > 0
    ) {

      query.average_rating = {
        $gte: rating
      };

    }

  }


  return query;
}


/* ============================================================
   SORT
   ============================================================ */

function buildSort(sort) {

  switch (sort) {

    case "recent":
      return {
        createdAt: -1,
        name: 1
      };


    case "popular":
      return {
        popularity_index: -1,
        average_rating: -1,
        name: 1
      };


    case "rating":
      return {
        average_rating: -1,
        popularity_index: -1,
        name: 1
      };


    case "name":
      return {
        name: 1
      };


    case "relevance":
    default:
      return {
        popularity_index: -1,
        average_rating: -1,
        name: 1
      };

  }

}


/* ============================================================
   DATA LOADER
   ============================================================ */

async function getListingPageData({
  q,
  category,
  district,
  minRating,
  sort,
  page,
  limit
}) {

  if (!Place) {

    return {
      places: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit,
      categories: [],
      districts: []
    };

  }


  const query =
    buildQuery({
      q,
      category,
      district,
      minRating
    });


  const total =
    await Place.countDocuments(
      query
    );


  const totalPages =
    Math.max(
      Math.ceil(
        total / limit
      ),
      1
    );


  const safeCurrentPage =
    Math.min(
      page,
      totalPages
    );


  const skip =
    (safeCurrentPage - 1) *
    limit;


  const sortSpec =
    buildSort(sort);


  const [
    places,
    categories,
    districts
  ] = await Promise.all([

    Place.find(query)
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .lean(),

    Place.distinct(
      "category"
    ),

    Place.distinct(
      "district"
    )

  ]);


  return {
    places,
    total,
    totalPages,
    page: safeCurrentPage,
    limit,
    categories:
      categories
        .filter(Boolean)
        .sort(
          (a, b) =>
            String(a)
              .localeCompare(
                String(b)
              )
        ),

    districts:
      districts
        .filter(Boolean)
        .sort(
          (a, b) =>
            String(a)
              .localeCompare(
                String(b)
              )
        )
  };

}


/* ============================================================
   QUERY SERIALIZER
   ============================================================ */

function normalizedSort(sort, q) {

  const allowed = [
    "name",
    "recent",
    "popular",
    "rating",
    "relevance"
  ];

  if (
    allowed.includes(sort)
  ) {

    return sort;

  }

  return q
    ? "relevance"
    : "name";
}


/* ============================================================
   HTML
   GET /listings
   ============================================================ */

router.get(
  "/",
  async (req, res, next) => {

    try {

      const q =
        cleanString(
          req.query.q
        );

      const category =
        cleanString(
          req.query.category
        );

      const district =
        cleanString(
          req.query.district
        );

      const minRating =
        cleanString(
          req.query.minRating
        );

      const sort =
        normalizedSort(
          cleanString(
            req.query.sort
          ),
          q
        );

      const page =
        safePage(
          req.query.page
        );

      const limit =
        safeLimit(
          req.query.limit
        );


      const data =
        await getListingPageData({
          q,
          category,
          district,
          minRating,
          sort,
          page,
          limit
        });


      res.render(
        "listings",
        {
          title:
            "Explore Listings",

          places:
            data.places,

          pagination: {

            page:
              data.page,

            limit:
              data.limit,

            total:
              data.total,

            totalPages:
              data.totalPages,

            hasPrev:
              data.page > 1,

            hasNext:
              data.page <
              data.totalPages

          },

          filters: {

            q,

            category,

            district,

            minRating,

            sort

          },

          categories:
            data.categories,

          districts:
            data.districts

        }
      );

    } catch (error) {

      console.error(
        "❌ GET /listings error:",
        error
      );

      next(error);

    }

  }
);


/* ============================================================
   JSON
   GET /listings/api
   ============================================================ */

router.get(
  "/api",
  async (req, res, next) => {

    try {

      const q =
        cleanString(
          req.query.q
        );

      const category =
        cleanString(
          req.query.category
        );

      const district =
        cleanString(
          req.query.district
        );

      const minRating =
        cleanString(
          req.query.minRating
        );

      const sort =
        normalizedSort(
          cleanString(
            req.query.sort
          ),
          q
        );

      const page =
        safePage(
          req.query.page
        );

      const limit =
        safeLimit(
          req.query.limit
        );


      const data =
        await getListingPageData({
          q,
          category,
          district,
          minRating,
          sort,
          page,
          limit
        });


      return res.json({

        places:
          data.places,

        pagination: {

          page:
            data.page,

          limit:
            data.limit,

          total:
            data.total,

          totalPages:
            data.totalPages,

          hasPrev:
            data.page > 1,

          hasNext:
            data.page <
            data.totalPages

        },

        filters: {

          q,

          category,

          district,

          minRating,

          sort

        }

      });

    } catch (error) {

      console.error(
        "❌ GET /listings/api error:",
        error
      );

      next(error);

    }

  }
);


module.exports = router;