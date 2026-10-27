declare module "leaflet" {
  const L: any;
  export default L;
}

declare module "react-leaflet" {
  import type { ComponentType, ReactNode } from "react";

  export const MapContainer: ComponentType<any & { children?: ReactNode }>;
  export const TileLayer: ComponentType<any>;
  export const Marker: ComponentType<any & { children?: ReactNode }>;
  export const Popup: ComponentType<any & { children?: ReactNode }>;
  export const useMap: () => any;
  export const useMapEvents: (handlers: Record<string, (event: any) => void>) => any;
}
