function initializeMap(center) {
  const map = new maplibregl.Map({
    container: 'map',
    style:  `https://api.maptiler.com/maps/streets/style.json?key=umwYOTDAZlsPp2f3ZaTs`,
    center: listing.geometry.coordinates,
    zoom: 15
  });

  new maplibregl.Marker({ color: 'red' })
    .setLngLat( listing.geometry.coordinates)
    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(` <h3>${listing.location}</h3>
    <p>Exact location provided after bookings.</p>`))
    .addTo(map);

  map.addControl(new maplibregl.NavigationControl());
}
