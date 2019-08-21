import { $, $$ } from './bling';
import axios from 'axios';
import flash from 'connect-flash';

let googleMap,
    autocomplete;

const mapOptions = {
  center: {
    lat: 43.2608503,
    lng: -79.8711111
  },
  zoom: 6
}

export function nearMe() {
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
}

function initMap(mapDiv) {
  if (!mapDiv) return;
  googleMap = new google.maps.Map(mapDiv, mapOptions)
  const searchInput = $('[name=geolocate]');
  autocomplete = new google.maps.places.Autocomplete(searchInput);
  loadNearByStores(mapOptions.center);
  autocomplete.addListener('place_changed', autoPlaceChanged)
}

function autoPlaceChanged(){
  const place = autocomplete.getPlace();
  loadNearByStores({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()})
}

function loadNearByStores(loc) {
  console.info(loc);
  axios
  .get(`/api/stores/near?lat=${loc.lat}&lng=${loc.lng}`)
  .then(res => {
    const places = res.data;
    if (!places.length) return;
    const bounds = new google.maps.LatLngBounds();
    const infoWindow = new google.maps.InfoWindow();

    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = new google.maps.LatLng(placeLat,placeLng);
      bounds.extend(position);
      const marker = new google.maps.Marker({ position, map: googleMap });
      marker.place = place;
      return marker;
    });

    markers.forEach(marker => marker.addListener('click', function() {
      const html = `<div class="popup">
        <a href="/store/${this.place.slug}">
          <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"/>
        </a>
        <p><strong>${this.place.name}</strong><br/>${this.place.location.address}</p>
      </div>
      `;
      infoWindow.setContent(html);
      infoWindow.open(map, this);
    }));
    googleMap.setCenter(bounds.getCenter());
    googleMap.fitBounds(bounds);
  })
  .catch(err => {
    console.error(err);
  });
}

function geoSuccess(position) {
  const center = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  loadNearByStores(center);
};

function geoError(error) {
  console.error('Error occurred. Error code: ' + error.code);
  // error.code can be:
  //   0: unknown error
  //   1: permission denied
  //   2: position unavailable (error response from location provider)
  //   3: timed out
};

export default initMap;