const search = document.getElementById("globalSearch");

const box = document.getElementById("searchSuggestions");

if(search){

const data=[

"Patratu Valley",

"Lodh Falls",

"Betla National Park",

"Hundru Falls",

"Dassam Falls",

"Netarhat",

"Deoghar",

"Parasnath",

"Wildlife",

"Hotels",

"Festivals",

"AI Planner"

];

search.addEventListener("keyup",()=>{

const value=search.value.toLowerCase();

box.innerHTML="";

if(value===""){

box.style.display="none";

return;

}

const result=data.filter(item=>

item.toLowerCase().includes(value)

);

result.forEach(item=>{

const div=document.createElement("div");

div.className="search-item";

div.innerHTML="🔍 "+item;

div.onclick=()=>{

search.value=item;

box.style.display="none";

};

box.appendChild(div);

});

box.style.display=result.length?"block":"none";

});

}