/* global google */
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import "./App.css";

const MAPS_API_KEY = `${process.env.REACT_APP_MAPS_API_KEY}`;

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
  });

  return (
    <div className="App">
      {isLoaded ? (
        <GoogleMap
          zoom={9}
          center={{ lat: -4, lng: 40.7 }}
          mapContainerClassName="map-container"
        />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default App;
