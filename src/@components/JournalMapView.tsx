import { useMemo } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import type { Journal } from "../@apis/journal";

interface JournalMapViewProps {
  journals: Journal[];
}

const JournalMapView = ({ journals }: JournalMapViewProps) => {
  const grouped = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; entries: Journal[] }>();
    journals.forEach((j) => {
      if (typeof j.location_lat !== "number" || typeof j.location_lng !== "number") return;
      const key = `${j.location_lat.toFixed(4)}:${j.location_lng.toFixed(4)}`;
      if (!map.has(key)) {
        map.set(key, { lat: j.location_lat, lng: j.location_lng, entries: [] });
      }
      map.get(key)!.entries.push(j);
    });
    return Array.from(map.values());
  }, [journals]);

  if (!grouped.length) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
          <MapPin size={24} className="text-accent" />
        </div>
        <h3 className="text-text-primary font-bold">No pinned locations yet</h3>
        <p className="text-text-secondary text-sm mt-1">
          Add full address and pin coordinates while creating or editing journal entries.
        </p>
      </div>
    );
  }

  const topPlace = useMemo(
    () => [...grouped].sort((a, b) => b.entries.length - a.entries.length)[0],
    [grouped],
  );

  const center: [number, number] = [
    topPlace.lat,
    topPlace.lng,
  ];

  const makeCountIcon = (count: number) =>
    L.divIcon({
      className: "journal-count-marker",
      html: `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background: linear-gradient(135deg, #f97316, #fb923c);
          border: 2px solid rgba(255,255,255,0.85);
          box-shadow: 0 8px 22px rgba(249,115,22,0.35);
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:800;font-size:12px;
        ">${count}</div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

  return (
    <div className="bg-surface border border-border rounded-3xl p-3 sm:p-4">
      <div className="h-[520px] w-full overflow-hidden rounded-2xl border border-border">
        <MapContainer center={center} zoom={5} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {grouped.map((group) => (
            <Marker
              key={`${group.lat}-${group.lng}`}
              position={[group.lat, group.lng]}
              icon={makeCountIcon(group.entries.length)}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold text-sm">
                    {group.entries.length} entr{group.entries.length === 1 ? "y" : "ies"} here
                  </p>
                  <p className="text-xs mt-1 opacity-80">{group.entries[0].location_address || group.entries[0].location}</p>
                  <div className="mt-2 flex flex-col gap-1">
                    {group.entries.slice(0, 4).map((entry) => (
                      <Link key={entry._id} to={`/dashboard/journal/${entry._id}`} className="text-xs font-semibold underline">
                        {entry.title}
                      </Link>
                    ))}
                    {group.entries.length > 4 && (
                      <span className="text-xs opacity-70">+{group.entries.length - 4} more</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default JournalMapView;
