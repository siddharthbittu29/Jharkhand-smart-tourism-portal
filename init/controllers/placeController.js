// init/controllers/placeController.js
const mongoose = require('mongoose');
const Place = require('../models/place');

exports.listPlaces = async (req, res) => {
  try {
    // NOTE: your schema doesn't have `published` so we query all places.
    // If you later add published flag, change query accordingly.
    const places = await Place.find().sort({ createdAt: -1 }).lean();
    console.log('DEBUG listPlaces - found', places.length, 'places');
    return res.render('places/index', { places }); // render view at init/views/places/index.ejs
  } catch (err) {
    console.error('ERROR in listPlaces:', err);
    return res.status(500).send('Server error');
  }
};

exports.showPlace = async (req, res) => {
  try {
    // Using place_id in schema; we'll accept either place_id or slug-like param
    const id = req.params.id;
    const place = await Place.findOne({
      $or: [{ place_id: id }, { slug: id }, { name: id }]
    }).lean();
    if (!place) return res.status(404).send('Place not found');
    return res.render('places/show', { place });
  } catch (err) {
    console.error('ERROR in showPlace:', err);
    return res.status(500).send('Server error');
  }
};
