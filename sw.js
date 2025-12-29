const CACHE_NAME = 'mk-reissuapuri-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    
    // PWA-ikonit (varmista että nämä on luotu)
    './icons/icon-192.png',
    './icons/icon-512.png',

    // Kätköikonit (script.js viittaamat)
    './icons/unknown.svg',
    './icons/tradi.svg',
    './icons/multi.svg',
    './icons/mysse.svg',
    './icons/earth.svg',
    './icons/letteri.svg',
    './icons/wherigo.svg',
    './icons/cito.svg',
    './icons/mega.svg',
    './icons/event.svg',
    './icons/virtual.svg',

    // Äänitiedostot (script.js viittaamat)
    './approach.mp3',
    './target.mp3',
    './new_municipality.mp3',

    // Ulkoiset kirjastot (Leaflet)
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Asennus: Ladataan tiedostot välimuistiin
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Avataan välimuisti ja lisätään tiedostot');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((err) => {
                console.error('Virhe tiedostojen välimuistiin latauksessa:', err);
            })
    );
});

// Aktivointi: Siivotaan vanhat välimuistit pois
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Poistetaan vanha välimuisti:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Haku: Palvellaan tiedostot välimuistista, jos mahdollista
self.addEventListener('fetch', (event) => {
    // Ohitetaan ei-GET pyynnöt ja firebase-tietokantakutsut
    if (event.request.method !== 'GET' || event.request.url.includes('firebase')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Löytyi välimuistista
                if (response) {
                    return response;
                }
                // Ei löytynyt, haetaan verkosta
                return fetch(event.request).catch(() => {
                    // Jos verkkohaku epäonnistuu (esim. offline), ja kyseessä on sivun lataus,
                    // voitaisiin palauttaa joku offline-sivu, mutta tässä tapauksessa
                    // index.html pitäisi olla jo välimuistissa.
                });
            })
    );
});
