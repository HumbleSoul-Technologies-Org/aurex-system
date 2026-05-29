"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { listProperties } from "@/lib/services/properties";
import { listTenants } from "@/lib/services/tenants";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapContentProps {
  properties: any[];
  tenants: any[];
}

export default function MapContent({ properties, tenants }: MapContentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const map = L.map(mapContainer.current, {
      center: [0, 20],
      zoom: 2,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !markersLayer.current) return;

    const layer = markersLayer.current;
    layer.clearLayers();

    const bounds = L.latLngBounds([]);

    properties.forEach((property) => {
      if (property.location?.lat && property.location?.lng) {
        const marker = L.marker([property.location.lat, property.location.lng]);

        const propertyTenants = tenants.filter(
          (t) => t.propertyId === property.id,
        );
        const tenantCount = propertyTenants.length;

        const popupContent = `
          <div style="cursor: pointer;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${property.name}</h3>
            <p style="margin: 4px 0; font-size: 13px; color: #666;">${property.city}, ${property.country}</p>
            <div style="margin: 8px 0 0 0; padding-top: 8px; border-top: 1px solid #e0e0e0;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
                <div>
                  <p style="margin: 0; color: #999;"><strong>Units</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${property.units_available}</p>
                </div>
                <div>
                  <p style="margin: 0; color: #999;"><strong>Tenants</strong></p>
                  <p style="margin: 4px 0 0 0; color: #333;">${tenantCount}</p>
                </div>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(layer);
        bounds.extend([property.location.lat, property.location.lng]);
      }
    });

    if (properties.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [properties, tenants]);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
    />
  );
}
