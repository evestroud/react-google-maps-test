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
import Cookies from "js-cookie";
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
    const [lat, lng] = [e.latLng.lat(), e.latLng.lng()];
    addDoc(collection(db, "markers"), { lat, lng });
  };

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

  const deleteMarkerFromDb = (marker) => {
    if (marker.id === Cookies.get("my-dot")) {
      Cookies.remove("my-dot");
    }
    deleteDoc(doc(db, "markers", marker.id));
  };

  const getCurrentLocation = () => {
    if (!Cookies.get("my-dot")) {
      navigator.geolocation.getCurrentPosition((res) => {
        const [lat, lng] = [res.coords.latitude, res.coords.longitude];
        addDoc(collection(db, "markers"), { lat, lng }).then((result) =>
          Cookies.set("my-dot", result.id)
        );
      });
    }
  };

  const zoomToFit = () => {
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds();
      markers?.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      ref.current.fitBounds(bounds);
    } else if (markers.length === 1) {
      setCenter(markers[0]);
      setZoom(15);
    } else {
      resetMap();
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
          {markers.map(({ lat, lng, id }) => (
            <MarkerF position={{ lat, lng }} key={id} onClick={onClickMarker} />
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
