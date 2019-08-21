function autocomplete(searchInput, nameInput, addressInput, latInput, lngInput) {
  if(!searchInput) return; // skip if there is no input on the page

  const placeInput = new google.maps.places.Autocomplete(searchInput);

  placeInput.addListener('place_changed', function() {
    const place = placeInput.getPlace();
    nameInput.value = place.name;
    addressInput.value = place.formatted_address;
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  })
  //if some one hits enter on address don't submit

  searchInput.on('keydown', (e) => {
    if (e.keyCode === 13) e.preventDefault();
  })

}

export default autocomplete;