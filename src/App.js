/* global google */
import { GoogleMap, MarkerF, useLoadScript } from "@react-google-maps/api";
import { useEffect, useState } from "react";
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

  const onClick = async (e) => {
    const { lat, lng } = e.latLng;
    await addDoc(collection(db, "markers"), {
      lat: lat(),
      lng: lng(),
    });
  };

  const onClickMarker = (e) => {
    const [lat, lng] = [e.latLng.lat(), e.latLng.lng()];
    const toDelete = markers.find((m) => m.lat === lat && m.lng === lng);
    deleteDoc(doc(db, "markers", toDelete.id));
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
            <MarkerF position={{ lat, lng }} key={i} onClick={onClickMarker} />
          ))}
        </GoogleMap>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default App;
