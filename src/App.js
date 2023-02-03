import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  query,
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  where,
  updateDoc,
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
  const [myDot, setMyDot] = useState(Cookies.get("my-dot"));
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
      const q = doc(db, "communities", community);

      const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
        setMarkers(QuerySnapshot.data().markers);
      });
    }
  }, [community]);

  const onClick = (e) => {
    const [lat, lng] = [e.latLng.lat(), e.latLng.lng()];
    updateDoc(doc(db, "communities", community), {
      markers: [...markers, { lat, lng }],
    });
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
    // if (marker.id !== Cookies.get("my-dot")) {
    //   deleteDoc(doc(db, "markers", marker.id));
    // }
    updateDoc(doc(db, "communities", community), {
      markers: markers.filter((m) => {
        return m !== marker;
      }),
    });
  };

  const toggleCurrentLocation = () => {
    if (!Cookies.get("my-dot")) {
      navigator.geolocation.getCurrentPosition((res) => {
        const [lat, lng] = [res.coords.latitude, res.coords.longitude];
        addDoc(collection(db, "markers"), { lat, lng }).then((result) => {
          Cookies.set("my-dot", result.id);
          setMyDot(result.id);
        });
      });
    } else {
      deleteDoc(doc(db, "markers", Cookies.get("my-dot")));
      Cookies.remove("my-dot");
      setMyDot(undefined);
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
