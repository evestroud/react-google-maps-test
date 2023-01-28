/* global google */
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import "./App.css";

const MAPS_API_KEY = `${process.env.REACT_APP_MAPS_API_KEY}`;

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
  });
  const markers = [
    { lat: 18.5204, lng: 73.8567 },
    { lat: 18.5314, lng: 73.8446 },
    { lat: 18.5642, lng: 73.7769 },
  ];

  const onLoad = (map) => {
    const bounds = new google.maps.LatLngBounds();
    markers?.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
    map.fitBounds(bounds);
  };

  return (
    <div className="App">
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="map-container"
          onLoad={onLoad}
        >
          {markers.map(({ lat, lng }, i) => (
            <MarkerF
              position={{ lat, lng }}
              key={i}
            />
          ))}
        </GoogleMap>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default App;
