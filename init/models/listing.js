const mongoose = require('mongoose');


const listingSchema = new mongoose.Schema(
{
title: { type: String, required: true },
location: { type: String, required: true },
description: { type: String },
price: { type: Number, required: true, min: 0 },
image: { type: String }, // URL
category: { type: String, enum: ['Adventure', 'Pilgrimage', 'Nature', 'City', 'Heritage', 'Other'], default: 'Other' }
},
{ timestamps: true }
);


module.exports = mongoose.model('Listing', listingSchema);