import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
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
  const [communities, setCommunities] = useState([]);
  const [community, setCommunity] = useState("");
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({ lat: 39, lng: -95 });
  const [zoom, setZoom] = useState(4);
  const [myDot, setMyDot] = useState(Cookies.get(community));
  const ref = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "communities"));

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let communities = [];
      QuerySnapshot.forEach((doc) => {
        communities.push({ ...doc.data(), id: doc.id });
      });
      setCommunities(communities);
    });
  }, []);

  useEffect(() => {
    if (community) {
      const q = query(collection(doc(db, "communities", community), "markers"));

      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        let markers = [];
        QuerySnapshot.forEach((marker) => {
          markers.push({ ...marker.data(), id: marker.id });
        });
        setMarkers(markers);
      });
    } else {
      setMarkers([]);
    }
  }, [community]);

  const onClick = (e) => {
    if (community) {
      const [lat, lng] = [e.latLng.lat(), e.latLng.lng()];
      const communityMarkers = collection(
        doc(db, "communities", community),
        "markers"
      );
      addDoc(communityMarkers, { lat, lng });
    }
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
    if (marker.id !== Cookies.get(community)) {
      const communityMarkers = doc(db, "communities", community);
      deleteDoc(doc(communityMarkers, "markers", marker.id));
    }
  };

  const toggleCurrentLocation = () => {
    if (community) {
      const communityDoc = doc(db, "communities", community);
      if (!Cookies.get(community)) {
        navigator.geolocation.getCurrentPosition((res) => {
          const [lat, lng] = [res.coords.latitude, res.coords.longitude];
          addDoc(collection(communityDoc, "markers"), { lat, lng }).then(
            (result) => {
              Cookies.set(community, result.id);
              setMyDot(result.id);
            }
          );
        });
      } else {
        deleteDoc(doc(communityDoc, "markers", Cookies.get(community)));
        Cookies.remove(community);
        setMyDot(undefined);
      }
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
      <header>
        <select onClick={(e) => setCommunity(e.target.value)}>
          <option value="">Select community:</option>
          {communities.map((c) => (
            <option value={c.id} key={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </header>
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
            <Marker
              position={{ lat, lng }}
              key={id}
              onClick={onClickMarker}
              icon={
                myDot === id
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : ""
              }
            />
          ))}
        </GoogleMap>
      ) : (
        <h1>Loading...</h1>
      )}
      <div className="controls">
        <button onClick={toggleCurrentLocation}>Toggle my location</button>
        <button onClick={zoomToFit}>Zoom to fit markers</button>
        <button onClick={resetMap}>Reset map view</button>
        <button onClick={deleteAllMarkers}>Clear markers</button>
      </div>
    </div>
  );
}

export default App;
