import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface LocationPickerMapProps {
  lat?: number;
  lng?: number;
  onPick: (lat: number, lng: number) => void;
}

const markerIcon = L.divIcon({
  className: "journal-pin-marker",
  html: `
    <div style="
      width:30px;height:30px;border-radius:9999px;
      background:linear-gradient(135deg,#f97316,#fb923c);
      border:2px solid rgba(255,255,255,.9);
      box-shadow:0 8px 18px rgba(249,115,22,.35);
      display:flex;align-items:center;justify-content:center;color:#fff;
      font-size:14px;font-weight:700;
    ">•</div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const ClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

const RecenterOnMarker = ({ lat, lng }: { lat?: number; lng?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (typeof lat === "number" && typeof lng === "number") {
      map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const LocationPickerMap = ({ lat, lng, onPick }: LocationPickerMapProps) => {
  const hasCoords = typeof lat === "number" && typeof lng === "number";
  const center: [number, number] = hasCoords ? [lat as number, lng as number] : [12.9716, 77.5946];

  return (
    <div className="relative z-0 h-52 w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={hasCoords ? 14 : 10} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnMarker lat={lat} lng={lng} />
        <ClickHandler onPick={onPick} />
        {hasCoords && <Marker position={[lat as number, lng as number]} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
};

export default LocationPickerMap;
