// init/routes/smart-tourism.js
const express = require('express');
const router = express.Router();

// Slide 1 container (index)
router.get('/', (req, res) => {
  res.render('smart-tourism/index', { title: 'Smart Tourism — Jharkhand' });
});

// Slide 3
router.get('/objectives', (req, res) => {
  res.render('smart-tourism/objectives', { title: 'Objectives & Government Vision' });
});

// Slide 4
router.get('/features', (req, res) => {
  res.render('smart-tourism/features', { title: 'Smart Tourism Platform – Features' });
});

// Slide 5 (you chose B: User Journey)
router.get('/journey', (req, res) => {
  res.render('smart-tourism/journey', { title: 'Tourist User Journey' });
});
// Slide 6 — Architecture + System Flow
router.get('/architecture', (req, res) => {
  res.render('smart-tourism/architecture', { title: 'Implementation Architecture + System Flow' });
});

//// Slide 7 – Core Features
router.get('/core-features', (req, res) => {
  res.render('smart-tourism/core-features', {
    title: 'Core Features',
    active: 'core-features',       // if any include still reads `active`
    currentPath: req.originalUrl   // nav.ejs uses currentPath
  });
});



module.exports = router;
