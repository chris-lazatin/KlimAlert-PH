"use client"

import "leaflet/dist/leaflet.css"
import { useMemo, useState, useEffect, useCallback } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from "react-leaflet"
import { type EvacuationCenter, getAvailableCenters, STATUS_META } from "@/lib/evacuation-centers"

// Build a custom HTML pin so we don't depend on Leaflet's default image assets.
function buildIcon(status: EvacuationCenter["status"]) {
  const color = status === "OPEN" ? "#10b981" : "#f59e0b"
  return L.divIcon({
    className: "klim-pin",
    html: `
      <span class="klim-pin-wrap" style="--c:${color}">
        <span class="klim-pin-pulse" style="background:${color}"></span>
        <span class="klim-pin-dot" style="background:${color}"></span>
      </span>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  })
}

// Fly to a location when selectedId or userLocation changes
function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 15, { duration: 1.2 })
  }, [target, map])
  return null
}

type LatLng = [number, number]

interface RouteInfo {
  distance: string
  duration: string
  coords: LatLng[]
}

export function EvacuationMap({
  selectedId,
  onSelect,
  height = "100%",
}: {
  selectedId?: string | null
  onSelect?: (id: string) => void
  height?: string | number
}) {
  const centers = useMemo(() => getAvailableCenters(), [])
  const [userLocation, setUserLocation] = useState<LatLng | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [route, setRoute] = useState<RouteInfo | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)

  // Olongapo City center
  const center: [number, number] = [14.8386, 120.2842]

  // Watch user's real-time location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported")
      return
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
        setLocationError(null)
      },
      (err) => {
        setLocationError(err.message)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // Fetch route from OSRM when selectedId or userLocation changes
  const fetchRoute = useCallback(async () => {
    if (!selectedId || !userLocation) {
      setRoute(null)
      return
    }
    const dest = centers.find((c) => c.id === selectedId)
    if (!dest) return
    setRouteLoading(true)
    try {
      const [userLat, userLng] = userLocation
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.code === "Ok" && data.routes.length > 0) {
        const r = data.routes[0]
        const coords: LatLng[] = r.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        )
        const distKm = (r.distance / 1000).toFixed(1)
        const mins = Math.round(r.duration / 60)
        setRoute({
          distance: `${distKm} km`,
          duration: mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`,
          coords,
        })
      }
    } catch {
      setRoute(null)
    } finally {
      setRouteLoading(false)
    }
  }, [selectedId, userLocation, centers])

  useEffect(() => {
    fetchRoute()
  }, [fetchRoute])

  // Fly to selected center
  const selectedCenter = centers.find((c) => c.id === selectedId)
  const flyTarget: LatLng | null = selectedCenter
    ? [selectedCenter.lat, selectedCenter.lng]
    : userLocation ?? null

  return (
    <div className="relative isolate z-0 h-full w-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full rounded-2xl overflow-hidden"
        style={{ background: "#09090b" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapFlyTo target={flyTarget} />

        {/* Evac center markers */}
        {centers.map((c) => {
          const meta = STATUS_META[c.status]
          const pct = Math.round((c.occupancy / c.capacity) * 100)
          return (
            <Marker
              key={c.id}
              position={[c.lat, c.lng]}
              icon={buildIcon(c.status)}
              eventHandlers={{
                click: () => onSelect?.(c.id),
              }}
            >
              <Popup className="klim-popup">
                <div className="min-w-55">
                  <p className="text-[11px] uppercase tracking-wider text-emerald-600 font-semibold">
                    Brgy. {c.barangay}
                  </p>
                  <p className="font-semibold text-zinc-900 text-sm leading-snug mt-0.5">{c.name}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: meta.dot.includes("emerald") ? "#10b981" : "#f59e0b" }}
                    />
                    <span className="text-[11px] font-semibold text-zinc-700">{meta.label}</span>
                    <span className="text-[11px] text-zinc-500">
                      · {c.occupancy}/{c.capacity} ({pct}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-600 mt-1">{c.address}</p>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Contact: <span className="text-zinc-700 font-medium">{c.contact}</span>
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* Highlight selected center with a soft ring */}
        {selectedId &&
          centers
            .filter((c) => c.id === selectedId)
            .map((c) => (
              <CircleMarker
                key={`sel-${c.id}`}
                center={[c.lat, c.lng]}
                radius={22}
                pathOptions={{
                  color: "#10b981",
                  weight: 2,
                  opacity: 0.6,
                  fillColor: "#10b981",
                  fillOpacity: 0.08,
                }}
              />
            ))}

        {/* Route polyline */}
        {route && (
          <Polyline
            positions={route.coords}
            pathOptions={{
              color: "#3b82f6",
              weight: 5,
              opacity: 0.8,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* User location dot */}
        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              color: "#fff",
              weight: 2,
              fillColor: "#3b82f6",
              fillOpacity: 1,
            }}
          />
        )}
      </MapContainer>

      {/* Route info overlay */}
      {route && !routeLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-400 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950/90 backdrop-blur px-4 py-2 text-sm shadow-lg">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-zinc-100 font-medium">{route.distance}</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400">{route.duration} by road</span>
        </div>
      )}

      {/* Loading route indicator */}
      {routeLoading && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-400 rounded-xl border border-zinc-700 bg-zinc-950/90 backdrop-blur px-4 py-2 text-sm text-zinc-400 shadow-lg">
          Calculating route…
        </div>
      )}

      {/* Location permission error */}
      {locationError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-400 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur px-4 py-2 text-xs text-amber-300 shadow-lg text-center max-w-70">
          📍 Enable location access for real-time directions
        </div>
      )}

      <style>{`
        .klim-pin-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
        }
        .klim-pin-dot {
          position: relative;
          z-index: 2;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          box-shadow: 0 0 0 2px rgba(9, 9, 11, 0.85), 0 0 12px var(--c);
        }
        .klim-pin-pulse {
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          opacity: 0.45;
          animation: klim-pulse 1.8s ease-out infinite;
        }
        @keyframes klim-pulse {
          0%   { transform: scale(0.6); opacity: 0.55; }
          100% { transform: scale(1.7); opacity: 0;    }
        }
        .leaflet-container { font-family: inherit; }
        .leaflet-popup-content-wrapper {
          background: #fafafa;
          color: #18181b;
          border-radius: 12px;
          box-shadow: 0 20px 50px -10px rgba(0,0,0,0.5);
        }
        .leaflet-popup-tip { background: #fafafa; }
        .leaflet-control-zoom a {
          background: #18181b !important;
          color: #e4e4e7 !important;
          border-color: #27272a !important;
        }
        .leaflet-control-zoom a:hover { background: #27272a !important; }
        .leaflet-control-attribution {
          background: rgba(9,9,11,0.7) !important;
          color: #71717a !important;
          backdrop-filter: blur(8px);
        }
        .leaflet-control-attribution a { color: #a1a1aa !important; }
      `}</style>
    </div>
  )
}