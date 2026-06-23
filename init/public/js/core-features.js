/* ========= BASIC UTILITIES ========= */
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => [...el.querySelectorAll(sel)];

/* ========= CARD EXPAND / COLLAPSE ========= */
$$('.card').forEach(card => {
  const trigger = $('.card-trigger', card);
  const panel = $('#' + trigger.getAttribute('aria-controls'));

  const toggleCard = () => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    // Close other cards
    $$('.card.expanded').forEach(openCard => {
      if (openCard !== card) {
        openCard.classList.remove('expanded');
        $('.card-trigger', openCard).setAttribute('aria-expanded', 'false');
      }
    });

    // Toggle selected card
    trigger.setAttribute('aria-expanded', String(!isOpen));
    card.classList.toggle('expanded', !isOpen);  
  };

  trigger.addEventListener('click', toggleCard);
});

/* Close all cards with ESC key */
document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") {
    $$('.card.expanded').forEach(card => {
      card.classList.remove('expanded');
      $('.card-trigger', card).setAttribute('aria-expanded', 'false');
    });
  }
});

/* ========= 1) AI TRIP RECOMMENDER ========= */
const itineraryList = $('#itinerary-list');
const regenBtn = $('#regen-itinerary');

const interests = ["Waterfalls", "Wildlife Safari", "Tribal Craft Village", "Mountain Trek", "Temple Visit", "Cave Exploration", "Bird Watching", "Local Cuisine Trail"];
const places = ["Netarhat", "Betla National Park", "Hundru Falls", "Patratu Valley", "Parasnath Hills", "Ranchi Lake", "Deoghar", "Hazaribagh"];
const timeSlots = ["Morning", "Afternoon", "Evening", "Sunrise", "Sunset"];
const modes = ["Eco-Bus", "Shared Jeep", "Cycle", "On Foot", "Boat Ride", "E-Rickshaw"];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateItinerary() {
  const plan = new Set();
  while (plan.size < 3) {
    plan.add(`${randomItem(timeSlots)} — ${randomItem(interests)} at ${randomItem(places)} • via ${randomItem(modes)}`);
  }
  itineraryList.innerHTML = [...plan].map(i => `<li>${i}</li>`).join("");
}

regenBtn.addEventListener('click', generateItinerary);
generateItinerary();

/* ========= 2) INTERACTIVE SMART MAP (Zoom Demo) ========= */
const mapView = $('#mapViewport');
let zoom = 1;

$('#zoomIn').addEventListener('click', () => {
  zoom = Math.min(2.2, zoom + 0.2);
  mapView.style.transform = `scale(${zoom})`;
});
$('#zoomOut').addEventListener('click', () => {
  zoom = Math.max(0.8, zoom - 0.2);
  mapView.style.transform = `scale(${zoom})`;
});

/* ========= 3) CULTURAL HUB (Dynamic Festival List) ========= */
const monthSelect = $('#monthSelect');
const festivalUl = $('#festivalList');

const festivals = {
  1: ["Sohrai Tribal Art Fest — Hazaribagh", "Makar Sankranti Kite Celebration — Ranchi"],
  2: ["Basukhar Mela — Deoghar"],
  3: ["Sarhul Tribal Festival — Statewide"],
  4: ["Baha Festival — Santhal Communities"],
  5: ["Paitkar Art & Handicraft Week — East Singhbhum"],
  6: ["Monsoon Eco Trails — Netarhat"],
  7: ["Palash Folk Music Festival — Ranchi"],
  8: ["Harela Plantation Drive — Statewide"],
  9: ["Karma Puja — Tribal Harvest Celebration"],
 10: ["Durga Puja — All Districts"],
 11: ["Chhath Puja — River & Lake Ghats"],
 12: ["Winter Birding Festival — Betla", "Hot Spring Wellness Retreats — Latehar"]
};

function updateFestivalList() {
  const list = festivals[monthSelect.value] || [];
  festivalUl.innerHTML = list.map(f => `<li>${f}</li>`).join("") || "<li>No events listed</li>";
}

monthSelect.addEventListener('change', updateFestivalList);
updateFestivalList();

/* ========= 4) ECOSCORE METER ========= */
const ecoFill = $('#ecoFill');
const ecoScore = $('#ecoScore');

$('#calcEco').addEventListener('click', () => {
  const score = Math.floor(60 + Math.random() * 40); // Bias towards eco positive
  ecoFill.style.width = score + "%";
  ecoScore.textContent = score;
});

/* ========= 5) AR / VR HERITAGE SLIDER ========= */
const arvrSlider = $('#arvrSlider');
const overlay = document.querySelector('.arvr-overlay');

arvrSlider.addEventListener('input', (e) => {
  const percentage = e.target.value;
  overlay.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
});

/* ========= 6) TOURIST — LOCAL CONNECT (Search Filter) ========= */
const connectList = $('#connectList');
const connectSearch = $('#connectSearch');

const directory = [
  { type: "Guide", name: "Anita Kumar", tags: ["birding", "Betla", "wildlife"] },
  { type: "Guide", name: "Rakesh Sharma", tags: ["heritage", "Deoghar"] },
  { type: "Homestay", name: "Netarhat Pine Stay", tags: ["nature", "family"] },
  { type: "Homestay", name: "Palamu Riverside Retreat", tags: ["forest", "riverside"] },
  { type: "Guide", name: "Tina Mahato", tags: ["trekking", "Parasnath"] }
];

function filterDirectory() {
  const q = connectSearch.value.toLowerCase();
  const results = directory.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.type.toLowerCase().includes(q) ||
    item.tags.some(t => t.includes(q))
  );
  connectList.innerHTML = results.length 
    ? results.map(i => `<li><strong>${i.type}</strong> — ${i.name} <em>(${i.tags.join(", ")})</em></li>`).join("")
    : "<li>No matches found</li>";
}

connectSearch.addEventListener('input', filterDirectory);
filterDirectory();


