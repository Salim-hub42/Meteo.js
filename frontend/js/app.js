const apikey = "b0fa3a872abf8a99cac867c5ffe8f2fd";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}";

function createMeteoBlock(villesRecherchees, tempC, villesChaud, moyenneHumidite) {
   const bloc = document.createElement('div');
   bloc.style.marginTop = '30px';
   bloc.style.background = 'rgba(255,255,255,0.15)';
   bloc.style.padding = '20px';
   bloc.style.borderRadius = '12px';
   bloc.innerHTML = `
    <h3>Statistiques météo sur ${villesRecherchees.length} villes (Paris, Lyon, Jeddah, Marseille, Toulouse, Bordeaux)</h3>
    <ul>
      <li>Températures (°C) : ${tempC.join(', ')}</li>
      <li>Villes où il fait chaud (>20°C) : ${villesChaud.map(d => d.name).join(', ') || 'Aucune'}</li>
      <li>Humidité moyenne : ${moyenneHumidite.toFixed(1)}%</li>
    </ul>
  `;
   return bloc;
}

function getUrl(apiUrl, apikey, ville) {
   const url = apiUrl.replace("{city name}", ville).replace("{API key}", apikey);
   return url;
}


document.getElementById('btn').addEventListener('click', function (event) { // Ajout d'un écouteur d'événement au bouton
   event.preventDefault(); // Empêche le rechargement de la page lors de la soumission du formulaire
   const ville = document.getElementById('cityInput').value.trim(); // Récupère la ville saisie par l'utilisateur
   //const url = apiUrl.replace("{city name}", ville).replace("{API key}", apiKey); // Remplace les placeholders par les valeurs réelles
   let url = getUrl(apiUrl, apikey, ville);
   fetch(url) // Effectue une requête fetch à l'API
      .then(response => response.json()) // Convertit la réponse en JSON
      .then(data => { // Traite les données reçues
         document.getElementById('city').textContent = data.name || "Ville inconnue"; // Met à jour le nom de la ville
         document.getElementById('temperature').textContent = (data.main.temp - 273.15).toFixed(1) + "°C"; // Met à jour la température en Celsius
         document.getElementById('wind').textContent = data.wind.speed + " m/s"; // Met à jour la vitesse du vent
         document.getElementById('humidity').textContent = data.main.humidity + "%"; // Met à jour l'humidité
         document.getElementById('conditions').textContent = data.weather[0].description; // Met à jour les conditions météorologiques
      })
      .catch(error => { // Gère les erreurs éventuelles
         console.error("Erreur lors de la récupération des données :", error);
      });
});





// Exemple : récupérer la météo de plusieurs villes et utiliser map/filter/reduce
const villesRecherchees = ["Paris", "Lyon", "jeddah", "Marseille", "Toulouse", "Bordeaux"];

Promise.all( // Promise.all pour attendre que toutes les requêtes soient terminées les requetes sont les suivantes (paris, lyon, jeddah, marseille, toulouse, bordeaux)
   villesRecherchees.map(ville => { // map pour créer un tableau de promesses de requêtes fetch
      const url = apiUrl.replace("{city name}", ville).replace("{API key}", apikey); // Remplace les placeholders par les valeurs réelles
      return fetch(url).then(response => response.json()); // Effectue la requête fetch et convertit la réponse en JSON
   })
).then(resultats => { // .then est a l'exterieur de Promise.all pour traiter les résultats une fois toutes les requêtes terminées
   // map : extraire les températures en °C
   const tempC = resultats.map(data => (data.main.temp - 273.15).toFixed(1));
   console.log("Températures en °C :", tempC);

   // filter : villes où il fait plus de 20°C
   const villesChaud = resultats.filter(data => (data.main.temp - 273.15) > 20); // 
   console.log("Villes où il fait chaud :", villesChaud.map(d => d.name));// 

   // reduce : moyenne d’humidité
   const moyenneHumidite = resultats.reduce((acc, data) => acc + data.main.humidity, 0) / resultats.length;
   console.log("Humidité moyenne :", moyenneHumidite);

   // Affichage dans la page

   let bloc = createMeteoBlock(villesRecherchees, tempC, villesChaud, moyenneHumidite)
   document.querySelector('.container').appendChild(bloc);
});



// === Carte météo France avec Leaflet et OpenWeatherMap ===


// ici ont initialise la carte
setTimeout(() => {
   const map = L.map('map').setView([46.603354, 1.888334], 6); // Centre France 
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // ici ont ajoute la couche OpenStreetMap qui contient les cartes de base
      attribution: '© OpenStreetMap' // attribution obligatoire
   }).addTo(map); // Ajout de la couche OpenStreetMap au fond de la carte


   //  Ajout de marqueurs météo sur quelques villes
   const villes = [
      { name: "Paris", lat: 48.8566, lon: 2.3522 },
      { name: "Lyon", lat: 45.7640, lon: 4.8357 },
      { name: "Marseille", lat: 43.2965, lon: 5.3698 },
      { name: "Toulouse", lat: 43.6047, lon: 1.4442 },
      { name: "Bordeaux", lat: 44.8378, lon: -0.5792 }
   ];

   // Pour chaque ville, récupérer la météo et ajouter un marqueur
   villes.forEach(ville => { // Pour chaque ville définie ci-dessus , forEach pour itérer sur le tableau des villes
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${ville.lat}&lon=${ville.lon}&appid=b0fa3a872abf8a99cac867c5ffe8f2fd`; // Construire l'URL de l'API avec les coordonnées de la ville
      fetch(url) // Effectuer une requête fetch à l'API
         .then(Response => Response.json()) // Convertir la réponse en JSON
         .then(data => { // Traiter les données reçues
            const temp = (data.main.temp - 273.15).toFixed(1); // Convertir la température de Kelvin à Celsius
            L.marker([ville.lat, ville.lon]).addTo(map) // Ajouter un marqueur à la position de la ville
               .bindPopup(`<b>${ville.name}</b><br>Température : ${temp}°C<br>${data.weather[0].description}`); // Lier une popup au marqueur avec les informations météo
         });
   });
}, 1000); // Attendre que la page charge