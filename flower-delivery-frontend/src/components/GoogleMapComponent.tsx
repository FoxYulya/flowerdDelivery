import React, { useState, useCallback, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
  InfoWindow,
} from "@react-google-maps/api";

interface MapProps {
  onAddressSelect: (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => void;
  selectedAddress: string;
  shopId?: number;
}

const SHOP_LOCATIONS = {
  1: {
    lat: 50.4501,
    lng: 30.5234,
    name: 'Квіткова крамниця "Троянда"',
    address: "вул. Шевченка, 15, Київ",
  },
  2: {
    lat: 49.8397,
    lng: 24.0297,
    name: 'Садовий центр "Тюльпан"',
    address: "пр. Перемоги, 42, Львів",
  },
  3: {
    lat: 46.4825,
    lng: 30.7233,
    name: 'Елітні букети "Орхідея"',
    address: "вул. Садова, 7, Одеса",
  },
};

const CITY_CENTERS = {
  kyiv: { lat: 50.4501, lng: 30.5234 },
  lviv: { lat: 49.8397, lng: 24.0297 },
  odesa: { lat: 46.4825, lng: 30.7233 },
};

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "15px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const mapStyles = [
  {
    featureType: "all",
    elementType: "geometry.fill",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c3e50" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c3e50" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
];

const GoogleMapComponent: React.FC<MapProps> = ({
  onAddressSelect,
  selectedAddress,
  shopId,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [shopInfoWindowOpen, setShopInfoWindowOpen] = useState(false);
  const [deliveryInfoWindowOpen, setDeliveryInfoWindowOpen] = useState(false);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyB2MEM0uNYJnthtDS6D5Or13sBUc0q-bF8",
    libraries: ["geometry", "places"],
  });

  const shopLocation = shopId
    ? SHOP_LOCATIONS[shopId as keyof typeof SHOP_LOCATIONS]
    : null;

  const center = useMemo(() => {
    if (selectedLocation) return selectedLocation;
    if (shopLocation) return shopLocation;

    if (shopId === 41) return CITY_CENTERS.lviv;
    if (shopId === 42) return CITY_CENTERS.odesa;
    return CITY_CENTERS.kyiv;
  }, [selectedLocation, shopLocation, shopId]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);
      setGeocoder(new window.google.maps.Geocoder());

      if (selectedAddress && selectedAddress.trim()) {
        geocodeAddress(selectedAddress);
      }
    },
    [selectedAddress]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
    setGeocoder(null);
  }, []);

  const geocodeAddress = useCallback(
    async (address: string) => {
      if (!geocoder) return;

      try {
        const results = await geocoder.geocode({ address });
        if (results && results.results[0]) {
          const location = results.results[0].geometry.location;
          const newLocation = { lat: location.lat(), lng: location.lng() };
          setSelectedLocation(newLocation);
          onAddressSelect(results.results[0].formatted_address, newLocation);

          if (map) {
            map.setCenter(newLocation);
            map.setZoom(15);
          }

          if (shopLocation) {
            calculateRoute(newLocation);
          }
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    },
    [geocoder, map, onAddressSelect, shopLocation]
  );

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoder) return;

      try {
        const results = await geocoder.geocode({ location: { lat, lng } });
        if (results && results.results[0]) {
          onAddressSelect(results.results[0].formatted_address, { lat, lng });
        }
      } catch (error) {
        console.error("Reverse geocoding error:", error);
      }
    },
    [geocoder, onAddressSelect]
  );

  const calculateRoute = useCallback(
    async (destination: google.maps.LatLngLiteral) => {
      if (!shopLocation || !map) return;

      const directionsService = new google.maps.DirectionsService();

      try {
        const result = await directionsService.route({
          origin: shopLocation,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        });

        setDirections(result);
        setDeliveryInfoWindowOpen(true);
        setTimeout(() => setDeliveryInfoWindowOpen(false), 8000);
      } catch (error) {
        console.error("Directions error:", error);
      }
    },
    [shopLocation, map]
  );

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newLocation = { lat, lng };

      setSelectedLocation(newLocation);
      await reverseGeocode(lat, lng);

      if (shopLocation) {
        calculateRoute(newLocation);
      }
    },
    [reverseGeocode, calculateRoute, shopLocation]
  );

  const createCustomIcon = useCallback((color: string, scale: number = 1) => {
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale,
      anchor: new google.maps.Point(12, 22),
    };
  }, []);

  if (!isLoaded) {
    return (
      <div
        style={{
          ...containerStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <div style={{ color: "#db7093", fontSize: "16px" }}>
          Завантаження карти...
        </div>
      </div>
    );
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={shopLocation ? 14 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          styles: mapStyles,
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        {shopLocation && (
          <Marker
            position={shopLocation}
            title={shopLocation.name}
            icon={createCustomIcon("#e74c3c", 2)}
            onClick={() => setShopInfoWindowOpen(true)}
          >
            {shopInfoWindowOpen && (
              <InfoWindow
                position={shopLocation}
                onCloseClick={() => setShopInfoWindowOpen(false)}
              >
                <div
                  style={{
                    padding: "12px",
                    color: "#333",
                    fontFamily: "Arial, sans-serif",
                    maxWidth: "250px",
                  }}
                >
                  <strong style={{ color: "#e74c3c", fontSize: "14px" }}>
                    🏪 {shopLocation.name}
                  </strong>
                  <br />
                  <div
                    style={{ fontSize: "12px", margin: "5px 0", color: "#555" }}
                  >
                    {shopLocation.address}
                  </div>
                  <small style={{ color: "#888", fontSize: "11px" }}>
                    Клікніть на карту, щоб обрати адресу доставки
                  </small>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {selectedLocation && (
          <Marker
            position={selectedLocation}
            title="Адрес доставки"
            icon={createCustomIcon("#db7093", 1.5)}
            onClick={() => setDeliveryInfoWindowOpen(true)}
          >
            {deliveryInfoWindowOpen &&
              directions &&
              directions.routes[0]?.legs[0] && (
                <InfoWindow
                  position={selectedLocation}
                  onCloseClick={() => setDeliveryInfoWindowOpen(false)}
                >
                  <div
                    style={{
                      padding: "12px",
                      color: "#333",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    <strong style={{ color: "#e74c3c" }}>
                      🚚 Інформація про доставку
                    </strong>
                    <br />
                    <br />
                    <div style={{ margin: "4px 0" }}>
                      <strong>Відстань:</strong>{" "}
                      {directions.routes[0].legs[0].distance?.text ||
                        "Невідомо"}
                    </div>
                    <div style={{ margin: "4px 0" }}>
                      <strong>Час в дорозі:</strong>{" "}
                      {directions.routes[0].legs[0].duration?.text ||
                        "Невідомо"}
                    </div>
                    <div style={{ margin: "4px 0" }}>
                      <strong>Підготовка:</strong> 15-30 хв
                    </div>
                    <hr
                      style={{
                        margin: "8px 0",
                        border: "none",
                        borderTop: "1px solid #eee",
                      }}
                    />
                    <small style={{ color: "#666" }}>
                      Загальний час доставки може варіюватися
                    </small>
                  </div>
                </InfoWindow>
              )}
          </Marker>
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: "#db7093",
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default GoogleMapComponent;
