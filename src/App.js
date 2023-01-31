import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  query,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

const MAPS_API_KEY = `${process.env.REACT_APP_MAPS_API_KEY}`;

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
  });
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 39, lng: -95 });
  const [zoom, setZoom] = useState(4);
  const ref = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "markers"));

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let markers = [];
      QuerySnapshot.forEach((doc) => {
        markers.push({ ...doc.data(), id: doc.id });
      });
      setMarkers(markers);
    });
  }, []);

  const onClick = (e) => {
    const { lat, lng } = e.latLng;
    addMarkerToDb(lat(), lng());
  };

  function addMarkerToDb(lat, lng) {
    const approxEquals = (x, y) => Math.abs(x - y) < 0.001;
    // don't add a duplicate marker
    if (
      !markers.find((m) => approxEquals(m.lat, lat) && approxEquals(m.lng, lng))
    ) {
      addDoc(collection(db, "markers"), { lat, lng });
    }
  }

  const onClickMarker = (e) => {
    const [lat, lng] = [e.latLng.lat(), e.latLng.lng()];
    const toDelete = markers.find((m) => m.lat === lat && m.lng === lng);
    deleteMarkerFromDb(toDelete);
  };

  const deleteAllMarkers = () => {
    for (let marker of markers) {
      deleteMarkerFromDb(marker);
    }
  };

  function deleteMarkerFromDb(marker) {
    deleteDoc(doc(db, "markers", marker.id));
  }

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((res) => {
      const [lat, lng] = [res.coords.latitude, res.coords.longitude];
      addMarkerToDb(lat, lng);
    });
  };

  const zoomToFit = () => {
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers?.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      ref.current.fitBounds(bounds);
    } else if (markers.length === 1) {
      // TODO manually set center and zoom
    }
  };

  const resetMap = () => {
    setCenter({ lat: 39, lng: -95 });
    setZoom(4);
  };

  return (
    <div className="App">
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="map-container"
          onClick={onClick}
          onTilesLoaded={() => {
            setCenter(null);
            setZoom(null);
          }}
          center={center}
          zoom={zoom}
          onLoad={(map) => (ref.current = map)}
        >
          {markers.map(({ lat, lng }, i) => (
            <MarkerF position={{ lat, lng }} key={i} onClick={onClickMarker} />
          ))}
        </GoogleMap>
      ) : (
        <h1>Loading...</h1>
      )}
      <div className="controls">
        <button onClick={getCurrentLocation}>Get my location</button>
        <button onClick={zoomToFit}>Zoom to fit markers</button>
        <button onClick={resetMap}>Reset map view</button>
        <button onClick={deleteAllMarkers}>Clear markers</button>
      </div>
    </div>
  );
}

export default App;
