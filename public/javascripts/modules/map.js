import { $, $$ } from './bling';
import axios from 'axios';

navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

let googleMap;

const mapOptions = {
  center: {
    lat: 43.2608503,
    lng: -79.8711111
  },
  zoom: 6
}

function initMap(mapDiv) {
  if (!mapDiv) return;
  googleMap = new google.maps.Map(mapDiv, mapOptions)
  const searchInput = $('[name=geolocate]');
  const autocomplete = new google.maps.places.Autocomplete(searchInput);

  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    console.log(place);
    loadNearByStores({lat: place.geometry.location.lat(), lng: place.geometry.location.lng()})
  })

}

function loadNearByStores(loc) {
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
    console.log(err);
  });
}

function geoSuccess(position) {
  mapOptions.center.lat = position.coords.latitude;
  mapOptions.center.lng = position.coords.longitude;
  // googleMap.setCenter(mapOptions.center);
  loadNearByStores(mapOptions.center);
};

function geoError(error) {
  console.log('Error occurred. Error code: ' + error.code);
  // error.code can be:
  //   0: unknown error
  //   1: permission denied
  //   2: position unavailable (error response from location provider)
  //   3: timed out
};

export default initMap;