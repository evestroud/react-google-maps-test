/* global google */
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { useState } from "react";
import "./App.css";

const MAPS_API_KEY = `${process.env.REACT_APP_MAPS_API_KEY}`;

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
  });
  const [markers, setMarkers] = useState([]);

  const onClick = (e) => {
    const { lat, lng } = e.latLng;
    const marker = { lat: lat(), lng: lng() };
    setMarkers([...markers, marker]);
  };

  return (
    <div className="App">
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="map-container"
          onClick={onClick}
          center={{ lat: 39, lng: -95 }}
          zoom={4}
        >
          {markers.map(({ lat, lng }, i) => (
            <MarkerF position={{ lat, lng }} key={i} />
          ))}
        </GoogleMap>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default App;
