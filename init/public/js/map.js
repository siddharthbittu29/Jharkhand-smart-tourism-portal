const map = L.map("tripMap").setView(
    [23.6102, 85.2799],
    7
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            "&copy; OpenStreetMap"
    }
).addTo(map);

const places = [

    {
        name:"Patratu Valley",
        lat:23.667,
        lng:85.277
    },

    {
        name:"Lodh Falls",
        lat:23.533,
        lng:84.103
    },

    {
        name:"Hundru Falls",
        lat:23.459,
        lng:85.528
    }

];

places.forEach(place=>{

    L.marker(
        [place.lat,place.lng]
    )

    .addTo(map)

    .bindPopup(

        `<b>${place.name}</b>`

    );

});