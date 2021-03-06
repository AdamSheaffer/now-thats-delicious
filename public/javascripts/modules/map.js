import axios from 'axios';
import { $ } from './bling';

const defaultMapOptions = {
    center: { lat: 0, lng: 0 },
    zoom: 6
};

function loadPlaces(map, lat = 43.2, lng = -79.8) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;

            if(!places.length) return alert('No Locations Found');

            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                const position = { lat: placeLat, lng: placeLng };
                bounds.extend(position);
                const marker = new google.maps.Marker({ map, position });
                marker.place = place;
                return marker;
            });

            markers.forEach(marker => marker.addListener('click', function() {
                const html = `
                    <div class="popup">
                        <a href="/store/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"
                            <p>${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            }));

            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        }).catch(err => console.error(err));
}

function makeMap(mapDiv) {
    if(!mapDiv) return;

    let map;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            map = new google.maps.Map(mapDiv, {
                center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
                zoom: 8
            });
            loadPlaces(map, pos.coords.latitude, pos.coords.longitude);

            const input = $('[name="geolocate"]');
            const autocomplete = new google.maps.places.Autocomplete(input);

            autocomplete.addListener('place_changed', function() {
                const place = this.getPlace();
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                loadPlaces(map, lat, lng);
            });
        });
    } else {
        map = new google.maps.Map(mapDiv, defaultMapOptions);
    }    
}

export default makeMap;