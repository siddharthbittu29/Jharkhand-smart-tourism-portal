const mongoose = require('mongoose');
const path = require('path');

// Use the same model your app uses
const Place = require(path.join(__dirname, '..', 'models', 'place'));

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/JKtour';

// -------------------- DATA --------------------
const places = [
  // Latehar / Palamu
  {
    name: 'Betla National Park',
    district: 'Latehar',
    category: 'National Park',
    description: 'Core of Palamu Tiger Reserve with sal forests, elephants, bison and rich birdlife.',
    image: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?q=80&w=1200',
    tags: ['eco','wildlife','safari','birding'],
    bestSeason: ['Nov','Dec','Jan','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 6,
    entryFeeINR: 100,
    eco: { ecoScore: 85, litterIndex: 20, communityOwned: false, guidelines: ['Maintain silence','No littering','Respect wildlife distance'] }
  },
  {
    name: 'Netarhat (Queen of Chotanagpur)',
    district: 'Latehar',
    category: 'Viewpoint',
    description: 'Hill station famed for sunrise and sunset points, pine lines and cool climate.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200',
    tags: ['eco','sunset','family'],
    bestSeason: ['Oct','Nov','Dec','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 4,
    eco: { ecoScore: 78, litterIndex: 25, communityOwned: false, guidelines: ['Use dustbins','Avoid plastic','Stay on marked trails'] }
  },
  {
    name: 'Lodh Falls (Burha Pahar Falls)',
    district: 'Latehar',
    category: 'Waterfall',
    description: 'One of the tallest waterfalls of Jharkhand near Netarhat, thunderous post-monsoon.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200',
    tags: ['waterfall','monsoon','trek'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Moderate',
    timeRequiredHrs: 3,
    eco: { ecoScore: 73, litterIndex: 34, communityOwned: false, guidelines: ['Keep distance from edge','Carry back waste'] }
  },
  {
    name: 'Palamu Fort (Old & New)',
    district: 'Palamu',
    category: 'Heritage',
    description: 'Twin hilltop forts of Chero rulers inside PTR buffer; panoramic forest views.',
    image: 'https://images.unsplash.com/photo-1518022125960-d6b3481b3191?q=80&w=1200',
    tags: ['heritage','hill','history'],
    bestSeason: ['Nov','Dec','Jan'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 69, litterIndex: 30, communityOwned: false, guidelines: ['Do not deface walls','Stick to paths'] }
  },

  // Ranchi
  {
    name: 'Hundru Falls',
    district: 'Ranchi',
    category: 'Waterfall',
    description: 'Subarnarekha plunges over a rocky escarpment; iconic Ranchi day trip.',
    image: 'https://images.unsplash.com/photo-1542044801-7ea7286dba1b?q=80&w=1200',
    tags: ['waterfall','eco','trek'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Moderate',
    timeRequiredHrs: 3,
    eco: { ecoScore: 70, litterIndex: 40, communityOwned: false, guidelines: ['Avoid slippery rocks','Carry back waste'] }
  },
  {
    name: 'Dassam Falls',
    district: 'Ranchi',
    category: 'Waterfall',
    description: 'On the Kanchi river near Taimara; powerful cascades post monsoon.',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1200',
    tags: ['waterfall','family','eco'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Moderate',
    timeRequiredHrs: 3,
    eco: { ecoScore: 69, litterIndex: 42, communityOwned: false, guidelines: ['Keep safe distance','Low noise'] }
  },
  {
    name: 'Jonha Falls (Gautamdhara)',
    district: 'Ranchi',
    category: 'Waterfall',
    description: 'Picturesque fall accessed by long stairway; great in monsoon.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200',
    tags: ['trek','waterfall','eco'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Moderate',
    timeRequiredHrs: 3,
    eco: { ecoScore: 68, litterIndex: 45, communityOwned: false, guidelines: ['Carry water','Avoid plastic'] }
  },
  {
    name: 'Hirni Falls',
    district: 'Ranchi',
    category: 'Waterfall',
    description: 'Wide forest cascade with fenced viewpoints; serene forest ambience.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1200',
    tags: ['waterfall','forest','eco'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 75, litterIndex: 28, communityOwned: false, guidelines: ['Use dustbins','Respect forest silence'] }
  },
  {
    name: 'Sita Falls',
    district: 'Ranchi',
    category: 'Waterfall',
    description: 'A slender fall on the Radhu river; photogenic after rains.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
    tags: ['waterfall','monsoon','photo'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 71, litterIndex: 33, communityOwned: false, guidelines: ['Stay on trail','No littering'] }
  },
  {
    name: 'Pahari Mandir',
    district: 'Ranchi',
    category: 'Temple',
    description: 'Hilltop Shiva temple offering panoramic city views.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200',
    tags: ['temple','viewpoint','city'],
    bestSeason: ['Oct','Nov','Dec','Jan'],
    difficulty: 'Easy',
    timeRequiredHrs: 1,
    eco: { ecoScore: 66, litterIndex: 38, communityOwned: false, guidelines: ['Respect customs','No plastic flowers'] }
  },
  {
    name: 'Tagore Hill',
    district: 'Ranchi',
    category: 'Viewpoint',
    description: 'Granite hill associated with Rabindranath Tagore; popular sunset spot.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200',
    tags: ['sunset','city','stairs'],
    bestSeason: ['Oct','Nov','Dec','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 1,
    eco: { ecoScore: 67, litterIndex: 36, communityOwned: false, guidelines: ['Use bins','No graffiti'] }
  },
  {
    name: 'Rock Garden & Kanke Dam',
    district: 'Ranchi',
    category: 'Lake',
    description: 'Urban leisure combo: lakeside promenade and landscaped rock garden.',
    image: 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?q=80&w=1200',
    tags: ['lake','city','family'],
    bestSeason: ['Nov','Dec','Jan','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 74, litterIndex: 25, communityOwned: true, guidelines: ['Support local vendors','Avoid plastic waste'] }
  },
  {
    name: 'Deori Mandir (Tamar)',
    district: 'Ranchi',
    category: 'Temple',
    description: 'Ancient 16-pillared temple dedicated to Maa Durga; popular pilgrimage.',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200',
    tags: ['pilgrimage','heritage'],
    bestSeason: ['Oct','Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 72, litterIndex: 30, communityOwned: false, guidelines: ['Queue discipline','No litter'] }
  },

  // Ramgarh / Khunti / Gumla
  {
    name: 'Patratu Valley & Lake',
    district: 'Ramgarh',
    category: 'Viewpoint',
    description: 'Winding ghat road with sweeping views; lakeside promenade for evenings.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200',
    tags: ['scenic','roadtrip','eco'],
    bestSeason: ['Aug','Sep','Oct','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 3,
    eco: { ecoScore: 72, litterIndex: 35, communityOwned: false, guidelines: ['No honking on curves','Do not litter'] }
  },
  {
    name: 'Rajrappa Temple & Confluence',
    district: 'Ramgarh',
    category: 'Temple',
    description: 'Chhinnamasta temple at the confluence of Damodar & Bhairavi with small cascades.',
    image: 'https://images.unsplash.com/photo-1490604001847-b712b0c2f967?q=80&w=1200',
    tags: ['pilgrimage','river','falls'],
    bestSeason: ['Oct','Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 68, litterIndex: 37, communityOwned: false, guidelines: ['Use ghats responsibly','Avoid plastic offerings'] }
  },
  {
    name: 'Panchghagh Falls',
    district: 'Khunti',
    category: 'Waterfall',
    description: 'Five streams of the Banai river spread across rock beds; picnic favourite.',
    image: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1200',
    tags: ['waterfall','family','picnic'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Easy',
    timeRequiredHrs: 3,
    eco: { ecoScore: 74, litterIndex: 29, communityOwned: true, guidelines: ['Keep area clean','Avoid loud music'] }
  },
  {
    name: 'Anjan Dham (Birthplace of Hanuman)',
    district: 'Gumla',
    category: 'Temple',
    description: 'Cave-temple complex amidst laterite hills dedicated to Lord Hanuman.',
    image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa7?q=80&w=1200',
    tags: ['pilgrimage','cave','heritage'],
    bestSeason: ['Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 70, litterIndex: 32, communityOwned: false, guidelines: ['Respect sanctity','No littering'] }
  },

  // Giridih / Deoghar / Dumka / Hazaribagh / Chatra
  {
    name: 'Parasnath Hills (Shikharji)',
    district: 'Giridih',
    category: 'Temple',
    description: 'Jain pilgrimage to the highest peak of Jharkhand with multiple tonks.',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200',
    tags: ['pilgrimage','trek','heritage'],
    bestSeason: ['Oct','Nov','Dec','Jan','Feb'],
    difficulty: 'Moderate',
    timeRequiredHrs: 8,
    eco: { ecoScore: 74, litterIndex: 30, communityOwned: false, guidelines: ['Respect norms','No litter on trails'] }
  },
  {
    name: 'Usri Falls',
    district: 'Giridih',
    category: 'Waterfall',
    description: 'Three-stream cascade through gneissic rocks; best after monsoon.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200',
    tags: ['waterfall','rocks','monsoon'],
    bestSeason: ['Aug','Sep','Oct'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 72, litterIndex: 31, communityOwned: false, guidelines: ['No plastic','Stay behind rails'] }
  },
  {
    name: 'Baidyanath Jyotirlinga',
    district: 'Deoghar',
    category: 'Temple',
    description: 'One of the 12 Jyotirlingas; major Hindu pilgrimage with ancient complex.',
    image: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1200',
    tags: ['pilgrimage','heritage','city'],
    bestSeason: ['Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 3,
    eco: { ecoScore: 70, litterIndex: 35, communityOwned: false, guidelines: ['Queue discipline','Use dustbins'] }
  },
  {
    name: 'Naulakha Mandir',
    district: 'Deoghar',
    category: 'Temple',
    description: 'Iconic 146-foot temple inspired by Ramakrishna Mission architecture.',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1200',
    tags: ['architecture','heritage'],
    bestSeason: ['Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 1,
    eco: { ecoScore: 71, litterIndex: 33, communityOwned: false, guidelines: ['No litter','Respect silence'] }
  },
  {
    name: 'Maluti Terracotta Temples',
    district: 'Dumka',
    category: 'Heritage',
    description: 'Cluster of exquisite terracotta temples with mythological panels.',
    image: 'https://images.unsplash.com/photo-1535398080289-52b58a48b289?q=80&w=1200',
    tags: ['terracotta','heritage','art'],
    bestSeason: ['Dec','Jan','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 76, litterIndex: 24, communityOwned: true, guidelines: ['Do not touch panels','Use paths'] }
  },
  {
    name: 'Basukinath Temple',
    district: 'Dumka',
    category: 'Temple',
    description: 'Important Shaivite temple often paired with Deoghar.',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200',
    tags: ['pilgrimage','shaivite'],
    bestSeason: ['Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 1,
    eco: { ecoScore: 69, litterIndex: 36, communityOwned: false, guidelines: ['Respect rituals','No plastic garlands'] }
  },
  {
    name: 'Hazaribagh Sanctuary & Canary Hill',
    district: 'Hazaribagh',
    category: 'National Park',
    description: 'Sanctuary drives, lakes and Canary Hill viewpoint over the town.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200',
    tags: ['wildlife','birding','viewpoint'],
    bestSeason: ['Nov','Dec','Jan','Feb','Mar'],
    difficulty: 'Moderate',
    timeRequiredHrs: 5,
    eco: { ecoScore: 80, litterIndex: 25, communityOwned: false, guidelines: ['Do not feed wildlife','Keep distance'] }
  },
  {
    name: 'Itkhori (Bhadrakali) Temple',
    district: 'Chatra',
    category: 'Temple',
    description: 'Syncretic Buddhist–Hindu site with ancient statues and stupa remains.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200',
    tags: ['heritage','buddhist','pilgrimage'],
    bestSeason: ['Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 75, litterIndex: 27, communityOwned: true, guidelines: ['No touching idols','Use bins'] }
  },

  // Dhanbad / East & West Singhbhum
  {
    name: 'Maithon Dam',
    district: 'Dhanbad',
    category: 'Lake',
    description: 'Large reservoir famed for boating and island views on Barakar river.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200',
    tags: ['lake','sunset','family'],
    bestSeason: ['Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 4,
    eco: { ecoScore: 65, litterIndex: 40, communityOwned: false, guidelines: ['Do not pollute water','Wear life vests'] }
  },
  {
    name: 'Topchanchi Lake',
    district: 'Dhanbad',
    category: 'Lake',
    description: 'Forest-fringed lake with birdlife; calm picnic spot.',
    image: 'https://images.unsplash.com/photo-1496412705862-e0088f16f791?q=80&w=1200',
    tags: ['lake','picnic','eco'],
    bestSeason: ['Nov','Dec','Jan','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 4,
    eco: { ecoScore: 74, litterIndex: 25, communityOwned: true, guidelines: ['Carry reusable bottles','Avoid litter'] }
  },
  {
    name: 'Jubilee Park',
    district: 'Jamshedpur',
    category: 'City',
    description: 'Landscaped urban park with fountains, musical lights and lakes.',
    image: 'https://images.unsplash.com/photo-1470058869958-2a77ade41f5c?q=80&w=1200',
    tags: ['park','family','relax'],
    bestSeason: ['Jan','Feb','Mar','Oct','Nov'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 82, litterIndex: 18, communityOwned: true, guidelines: ['Respect plants','No plastic disposal'] }
  },
  {
    name: 'Dimna Lake',
    district: 'Jamshedpur',
    category: 'Lake',
    description: 'Picturesque lake at the foothills of Dalma; sunrise paddling and picnics.',
    image: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?q=80&w=1200',
    tags: ['lake','sunrise','family'],
    bestSeason: ['Nov','Dec','Jan','Feb','Mar'],
    difficulty: 'Easy',
    timeRequiredHrs: 3,
    eco: { ecoScore: 77, litterIndex: 22, communityOwned: true, guidelines: ['No littering','Use designated spots'] }
  },
  {
    name: 'Dalma Wildlife Sanctuary',
    district: 'Jamshedpur',
    category: 'National Park',
    description: 'Sal-clad hills with elephants and viewpoints; trekking and forest drives.',
    image: 'https://images.unsplash.com/photo-1610395219791-965f87c98c1b?q=80&w=1200',
    tags: ['wildlife','trek','viewpoint'],
    bestSeason: ['Nov','Dec','Jan','Feb','Mar'],
    difficulty: 'Moderate',
    timeRequiredHrs: 5,
    eco: { ecoScore: 79, litterIndex: 23, communityOwned: false, guidelines: ['Keep distance','No honking'] }
  },
  {
    name: 'Kiriburu & Meghahatuburu',
    district: 'West Singhbhum',
    category: 'Viewpoint',
    description: 'Twin hill towns with rolling hills and misty vistas on Odisha border.',
    image: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?q=80&w=1200',
    tags: ['hills','sunset','roadtrip'],
    bestSeason: ['Oct','Nov','Dec','Jan','Feb'],
    difficulty: 'Easy',
    timeRequiredHrs: 3,
    eco: { ecoScore: 76, litterIndex: 26, communityOwned: false, guidelines: ['No litter','Respect local communities'] }
  },
  {
    name: 'Dassam Mela (Seasonal Fair)',
    district: 'Ranchi',
    category: 'Festival',
    description: 'Local fair around post-monsoon near the falls; crafts and food (dates vary).',
    image: 'https://images.unsplash.com/photo-1501554728187-ce583db33af7?q=80&w=1200',
    tags: ['festival','local','market'],
    bestSeason: ['Sep','Oct'],
    difficulty: 'Easy',
    timeRequiredHrs: 2,
    eco: { ecoScore: 60, litterIndex: 45, communityOwned: true, guidelines: ['Use community bins','Avoid single-use plastic'] }
  }
];

// --------------- UNIQUE IMAGE STEP (no duplicate URLs) ---------------
function uniqUnsplashUrl(p, sig) {
  const kws = [p.district, p.category, 'Jharkhand', (p.tags && p.tags[0])].filter(Boolean).join(',');
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(kws)}&sig=${sig}`;
}

function ensureUniqueImages(arr) {
  const seen = new Set();
  return arr.map((p, idx) => {
    const copy = { ...p };
    if (!copy.image || seen.has(copy.image)) {
      copy.image = uniqUnsplashUrl(copy, idx);
    }
    seen.add(copy.image);
    return copy;
  });
}

// -------------------- SEEDER --------------------
(async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ Connected to DB');

    // Drop then recreate to avoid leftovers
    const coll = 'places';
    const collections = (await mongoose.connection.db.listCollections().toArray()).map(c => c.name);
    if (collections.includes(coll)) {
      await mongoose.connection.db.dropCollection(coll);
      console.log('🗑️  Dropped collection:', coll);
    }

    // De-duplicate images before insert
    const placesNoDupImages = ensureUniqueImages(places);

    try {
      const result = await Place.insertMany(placesNoDupImages, { ordered: false });
      console.log('🌱 Inserted docs:', result.length);
    } catch (e) {
      console.log('⚠️  Insert had errors.');
      if (e.writeErrors?.length) {
        e.writeErrors.forEach((we, i) => {
          console.log(`#${i + 1} ERROR ->`, we.err?.errmsg || we.toString());
        });
      } else {
        console.error(e);
      }
    }

    const total = await Place.countDocuments();
    console.log('📊 Total Place docs in DB:', total);

    const byCat = await Place.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }, { $sort: { n: -1 } }]);
    console.log('🧭 By Category:', byCat);

    const byDist = await Place.aggregate([{ $group: { _id: '$district', n: { $sum: 1 } } }, { $sort: { n: -1 } }]);
    console.log('🗺️  By District:', byDist);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
