// const express = require('express');
// const router = express.Router();


// // --- Data (replace image paths with yours under /public/images/...) ---
// const hotels = [
// { name: 'Radisson Blu', city: 'Ranchi', stars: 5, price: 6999, slug: 'radisson-blu-ranchi', image: '/images/hotels/radisson-ranchi.jpg', desc: 'Upscale rooms, pool & all-day dining near Main Road.', badge: 'Premium' },
// { name: 'Capitol Hill', city: 'Ranchi', stars: 4, price: 4999, slug: 'capitol-hill-ranchi', image: '/images/hotels/capitol-hill.jpg', desc: 'Central location with refined rooms & banquet.', badge: 'Top Pick' },
// { name: 'Chanakya BNR Hotel', city: 'Ranchi', stars: 4, price: 4599, slug: 'chanakya-bnr', image: '/images/hotels/chanakya-bnr.jpg', desc: 'Heritage charm, lawns & classic dining.', badge: 'Heritage' },
// { name: 'The Sonnet', city: 'Jamshedpur', stars: 4, price: 5199, slug: 'the-sonnet-jamshedpur', image: '/images/hotels/sonnet.jpg', desc: 'Business hotel with polished rooms & café.' },
// { name: 'Ramada', city: 'Jamshedpur', stars: 4, price: 5499, slug: 'ramada-jamshedpur', image: '/images/hotels/ramada.jpg', desc: 'Modern comforts near city center.' },
// { name: 'Le Lac (Sarovar Portico)', city: 'Ranchi', stars: 4, price: 4699, slug: 'le-lac-sarovar', image: '/images/hotels/lelac.jpg', desc: 'Lakeside vibes & multi-cuisine restaurant.' }
// ];


// const festivals = [
// { name: 'Sarhul', region: 'Ranchi & surrounding', month: 'Mar–Apr', slug: 'sarhul', image: '/images/festivals/sarhul.jpg', desc: 'Tribal spring festival celebrating Sal tree & nature.' },
// { name: 'Karam', region: 'Across Jharkhand', month: 'Aug–Sep', slug: 'karam', image: '/images/festivals/karam.jpg', desc: 'Harvest festival with Karam tree worship & dance.' },
// { name: 'Tusu', region: 'Kolhan & Santhal Pargana', month: 'Jan', slug: 'tusu', image: '/images/festivals/tusu.jpg', desc: 'Folk songs, decorated idols and river immersion.' },
// { name: 'Sohrai', region: 'Hazaribagh belt', month: 'Oct–Nov', slug: 'sohrai', image: '/images/festivals/sohrai.jpg', desc: 'Cattle worship & stunning mud-wall paintings.' },
// { name: 'Chhath', region: 'Deoghar & borders', month: 'Oct–Nov', slug: 'chhath', image: '/images/festivals/chhath.jpg', desc: 'Sun worship on river ghats at dawn & dusk.' }
// ];


// const gallery = [
// { title: 'Dassam Falls, Ranchi', tag: 'Nature', image: '/images/gallery/dassam.jpg', caption: 'Monsoon mist at the falls.' },
// { title: 'Netarhat Sunset', tag: 'Hills', image: '/images/gallery/netarhat.jpg', caption: 'The Queen of Chotanagpur.' },
// { title: 'Hazaribagh Art', tag: 'Culture', image: '/images/gallery/hazaribagh-art.jpg', caption: 'Sohrai & Khovar murals.' },
// { title: 'Baidhyanath Dham, Deoghar', tag: 'Pilgrimage', image: '/images/gallery/deoghar.jpg', caption: 'Jyotirlinga temple complex.' },
// { title: 'Dimna Lake, Jamshedpur', tag: 'Lake', image: '/images/gallery/dimna.jpg', caption: 'Calm waters & boating.' },
// { title: 'Betla National Park', tag: 'Wildlife', image: '/images/gallery/betla.jpg', caption: 'Sal forests & watchtowers.' }
// ];


// // --- Routes ---
// router.get('/book-hostels', (req, res) => {
// res.render('book-hostels', { hotels });
// });


// router.get('/festivals', (req, res) => {
// res.render('festivals', { festivals });
// });


// router.get('/gallery', (req, res) => {
// res.render('gallery', { gallery });
// });


// module.exports = router;