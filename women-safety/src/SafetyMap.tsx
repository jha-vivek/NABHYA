import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCurrentLocation } from "./LocationService";

type UserPosition = {
  latitude: number;
  longitude: number;
};

type SafetyPlace = {
  id: number;
  name: string;
  type: "police" | "hospital" | "public";
  latitude: number;
  longitude: number;
};

/* -----------------------------
   MAP VIEW CONTROLLER
----------------------------- */

function MapViewController({
  position,
  places,
}: {
  position: UserPosition;
  places: SafetyPlace[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    const points: L.LatLngExpression[] = [
      [position.latitude, position.longitude],
      ...places.map(
        (place) =>
          [
            place.latitude,
            place.longitude,
          ] as L.LatLngExpression
      ),
    ];

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      });
    } else {
      map.setView(
        [position.latitude, position.longitude],
        14
      );
    }
  }, [map, position, places]);

  return null;
}

/* -----------------------------
   DISTANCE CALCULATOR
----------------------------- */

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadius * c;
}

/* -----------------------------
   COMPONENT
----------------------------- */

function SafetyMap() {
  const [position, setPosition] =
    useState<UserPosition | null>(null);

  const [places, setPlaces] =
    useState<SafetyPlace[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [placesLoading, setPlacesLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState<
      "all" | "police" | "hospital" | "public"
    >("all");

  /* -----------------------------
     GET LOCATION
  ----------------------------- */

  const loadLocation = async () => {
    setLoading(true);
    setError("");

    try {
      const location =
        await getCurrentLocation();

      setPosition({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    } catch (error) {
      console.error(error);

      setError(
        "Unable to detect your location. Please allow location access."
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     LOAD NEARBY PLACES
  ----------------------------- */

  const loadNearbyPlaces = async (
    latitude: number,
    longitude: number
  ) => {
    setPlacesLoading(true);

    const query = `
      [out:json][timeout:30];

      (
        nwr(around:5000,${latitude},${longitude})["amenity"="police"];
        nwr(around:5000,${latitude},${longitude})["amenity"="hospital"];
        nwr(around:5000,${latitude},${longitude})["shop"];
      );

      out center tags;
    `;

    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];

    let loadedPlaces: SafetyPlace[] = [];

    for (const endpoint of endpoints) {
      try {
        console.log(
          "Trying Overpass:",
          endpoint
        );

        const response = await fetch(
          `${endpoint}?data=${encodeURIComponent(
            query
          )}`
        );

        if (!response.ok) {
          throw new Error(
            `Overpass error: ${response.status}`
          );
        }

        const data = await response.json();

        const mappedPlaces: SafetyPlace[] =
          data.elements
            .map((item: any) => {
              const lat =
                item.lat ??
                item.center?.lat;

              const lon =
                item.lon ??
                item.center?.lon;

              if (
                lat === undefined ||
                lon === undefined
              ) {
                return null;
              }

              let type:
                | "police"
                | "hospital"
                | "public";

              if (
                item.tags?.amenity ===
                "police"
              ) {
                type = "police";
              } else if (
                item.tags?.amenity ===
                "hospital"
              ) {
                type = "hospital";
              } else if (
                item.tags?.shop
              ) {
                type = "public";
              } else {
                return null;
              }

              const name =
                item.tags?.name ||
                (type === "police"
                  ? "Police Station"
                  : type === "hospital"
                  ? "Hospital"
                  : "Public Place");

              return {
                id: Number(item.id),
                name,
                type,
                latitude: Number(lat),
                longitude: Number(lon),
              };
            })
            .filter(
              (
                place: SafetyPlace | null
              ): place is SafetyPlace =>
                place !== null
            );

        loadedPlaces = mappedPlaces;

        console.log(
          "Nearby places found:",
          loadedPlaces.length
        );

        if (loadedPlaces.length > 0) {
          break;
        }
      } catch (error) {
        console.error(
          "Overpass endpoint failed:",
          endpoint,
          error
        );
      }
    }

    setPlaces(loadedPlaces);
    setPlacesLoading(false);
  };

  /* -----------------------------
     INITIAL LOCATION
  ----------------------------- */

  useEffect(() => {
    loadLocation();
  }, []);

  /* -----------------------------
     LOAD PLACES
  ----------------------------- */

  useEffect(() => {
    if (!position) return;

    loadNearbyPlaces(
      position.latitude,
      position.longitude
    );
  }, [position]);

  /* -----------------------------
     REFRESH
  ----------------------------- */

  const refreshMap = async () => {
    await loadLocation();
  };

  /* -----------------------------
     FILTER
  ----------------------------- */

  const filteredPlaces =
    selectedFilter === "all"
      ? places
      : places.filter(
          (place) =>
            place.type === selectedFilter
        );

  /* -----------------------------
     SORT BY DISTANCE
  ----------------------------- */

  const sortedPlaces = [...filteredPlaces].sort(
    (a, b) =>
      calculateDistance(
        position?.latitude ?? 0,
        position?.longitude ?? 0,
        a.latitude,
        a.longitude
      ) -
      calculateDistance(
        position?.latitude ?? 0,
        position?.longitude ?? 0,
        b.latitude,
        b.longitude
      )
  );

  /* -----------------------------
     LOADING
  ----------------------------- */

  if (loading) {
    return (
      <div className="safety-map-page">
        <div className="map-loading">
          <div className="map-loading-icon">
            📍
          </div>

          <h2>
            Detecting your location...
          </h2>

          <p>
            Nabhya needs your location to
            find nearby safety places.
          </p>
        </div>
      </div>
    );
  }

  /* -----------------------------
     ERROR
  ----------------------------- */

  if (error || !position) {
    return (
      <div className="safety-map-page">
        <div className="map-error">
          <div className="map-error-icon">
            📍
          </div>

          <h2>
            Location unavailable
          </h2>

          <p>
            {error ||
              "We could not detect your current location."}
          </p>

          <button
            className="map-refresh-button"
            onClick={refreshMap}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  /* -----------------------------
     MAIN UI
  ----------------------------- */

  return (
    <div className="safety-map-page">

      {/* HEADER */}

      <div className="map-page-header">
        <div>
          <div className="map-badge">
            🛡️ SAFETY MAP
          </div>

          <h1>
            Nearby Safety
          </h1>

          <p>
            Find nearby emergency and
            public assistance locations.
          </p>
        </div>

        <button
          className="map-refresh-button"
          onClick={refreshMap}
        >
          🔄 Refresh
        </button>
      </div>

      {/* LOCATION */}

      <div className="map-status">
        <span className="map-status-dot"></span>

        Location detected

        <small>
          {position.latitude.toFixed(5)},{" "}
          {position.longitude.toFixed(5)}
        </small>
      </div>

      {/* FILTERS */}

      <div className="map-filters">

        <button
          className={
            selectedFilter === "all"
              ? "map-filter active"
              : "map-filter"
          }
          onClick={() =>
            setSelectedFilter("all")
          }
        >
          🗺️ All
        </button>

        <button
          className={
            selectedFilter === "police"
              ? "map-filter active"
              : "map-filter"
          }
          onClick={() =>
            setSelectedFilter("police")
          }
        >
          👮 Police
        </button>

        <button
          className={
            selectedFilter === "hospital"
              ? "map-filter active"
              : "map-filter"
          }
          onClick={() =>
            setSelectedFilter("hospital")
          }
        >
          🏥 Hospitals
        </button>

        <button
          className={
            selectedFilter === "public"
              ? "map-filter active"
              : "map-filter"
          }
          onClick={() =>
            setSelectedFilter("public")
          }
        >
          🏪 Public Places
        </button>

      </div>

      {/* LOADING */}

      {placesLoading && (
        <div className="places-loading">
          🔎 Finding nearby safety places...
        </div>
      )}

      {/* MAP */}

      <div className="map-container">

        <MapContainer
          center={[
            position.latitude,
            position.longitude,
          ]}
          zoom={14}
          scrollWheelZoom={true}
          className="safety-leaflet-map"
        >

          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* AUTO FIT */}

          <MapViewController
            position={position}
            places={filteredPlaces}
          />

          {/* USER LOCATION */}

          <CircleMarker
            center={[
              position.latitude,
              position.longitude,
            ]}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              weight: 4,
              fillColor: "#2563eb",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <strong>
                📍 You are here
              </strong>

              <br />

              Nabhya detected your
              current location.
            </Popup>
          </CircleMarker>

          {/* SAFETY PLACES */}

          {filteredPlaces.map(
            (place) => {

              const distance =
                calculateDistance(
                  position.latitude,
                  position.longitude,
                  place.latitude,
                  place.longitude
                );

              let markerColor = "#f59e0b";
              let emoji = "🏪";

              if (
                place.type === "police"
              ) {
                markerColor = "#2563eb";
                emoji = "👮";
              }

              if (
                place.type === "hospital"
              ) {
                markerColor = "#dc2626";
                emoji = "🏥";
              }

              return (
                <CircleMarker
                  key={`${place.type}-${place.id}`}
                  center={[
                    place.latitude,
                    place.longitude,
                  ]}
                  radius={13}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 4,
                    fillColor: markerColor,
                    fillOpacity: 1,
                  }}
                >

                  <Popup>

                    <div
                      style={{
                        minWidth: "190px",
                        fontFamily:
                          "Arial, sans-serif",
                      }}
                    >

                      <div
                        style={{
                          fontSize: "16px",
                          fontWeight: "700",
                          marginBottom: "8px",
                        }}
                      >
                        {emoji}{" "}
                        {place.name}
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        📏{" "}
                        {distance < 1
                          ? `${Math.round(
                              distance * 1000
                            )} m away`
                          : `${distance.toFixed(
                              1
                            )} km away`}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#777",
                          marginBottom: "12px",
                        }}
                      >
                        {place.type ===
                          "police" &&
                          "Police assistance"}

                        {place.type ===
                          "hospital" &&
                          "Medical assistance"}

                        {place.type ===
                          "public" &&
                          "Public place"}
                      </div>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "block",
                          textAlign: "center",
                          padding: "9px 12px",
                          borderRadius: "9px",
                          background:
                            "#111827",
                          color: "#ffffff",
                          textDecoration:
                            "none",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        🧭 Get Directions
                      </a>

                    </div>

                  </Popup>

                </CircleMarker>
              );
            }
          )}

        </MapContainer>

      </div>

      {/* NEARBY PLACES LIST */}

      <div className="nearby-places-section">

        <div className="nearby-places-header">

          <div>
            <div className="nearby-places-badge">
              📍 NEARBY
            </div>

            <h2>
              Nearby Safety Places
            </h2>

            <p>
              Places closest to your current
              location
            </p>
          </div>

          <span className="nearby-count">
            {sortedPlaces.length}
          </span>

        </div>

        {sortedPlaces.length === 0 ? (

          <div className="no-nearby-places">

            <div>🔎</div>

            <h3>
              No places found
            </h3>

            <p>
              Try another filter or refresh
              your location.
            </p>

          </div>

        ) : (

          <div className="nearby-places-list">

            {sortedPlaces.map((place) => {

              const distance =
                calculateDistance(
                  position.latitude,
                  position.longitude,
                  place.latitude,
                  place.longitude
                );

              let emoji = "🏪";
              let typeLabel =
                "Public Place";

              if (
                place.type === "police"
              ) {
                emoji = "👮";
                typeLabel =
                  "Police Station";
              }

              if (
                place.type === "hospital"
              ) {
                emoji = "🏥";
                typeLabel =
                  "Hospital";
              }

              return (
                <div
                  className="nearby-place-card"
                  key={`list-${place.type}-${place.id}`}
                >

                  <div className="nearby-place-icon">
                    {emoji}
                  </div>

                  <div className="nearby-place-info">

                    <h3>
                      {place.name}
                    </h3>

                    <span className="nearby-place-type">
                      {typeLabel}
                    </span>

                    <div className="nearby-place-distance">
                      📏{" "}
                      {distance < 1
                        ? `${Math.round(
                            distance * 1000
                          )} m away`
                        : `${distance.toFixed(
                            1
                          )} km away`}
                    </div>

                  </div>

                  <a
                    className="nearby-directions-button"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    🧭
                    <span>
                      Directions
                    </span>
                  </a>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* RESULTS */}

      <div className="map-results">

        <strong>
          {filteredPlaces.length} nearby
          place
          {filteredPlaces.length !== 1
            ? "s"
            : ""}{" "}
          found
        </strong>

        <span>
          Showing places within
          approximately 5 km
        </span>

      </div>

      {/* FEATURE CARDS */}

      <div className="map-feature-info">

        <div className="map-feature-card">
          <span>👮</span>

          <strong>
            Police Stations
          </strong>

          <small>
            Nearby police assistance
          </small>
        </div>

        <div className="map-feature-card">
          <span>🏥</span>

          <strong>
            Hospitals
          </strong>

          <small>
            Nearby medical assistance
          </small>
        </div>

        <div className="map-feature-card">
          <span>🏪</span>

          <strong>
            Public Places
          </strong>

          <small>
            Shops and populated areas
          </small>
        </div>

      </div>

    </div>
  );
}

export default SafetyMap;