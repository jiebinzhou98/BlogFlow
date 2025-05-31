// components/MapSelector.tsx
'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'

// ✅ 设置图标路径（放在 public/leaflet 文件夹）
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

export default function MapSelector({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void
}) {
  const [position, setPosition] = useState<[number, number] | null>(null)

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        setPosition([lat, lng])
        onLocationChange(lat, lng)
      },
    })
    return null
  }

  return (
    <MapContainer
      center={[43.6532, -79.3832]} // Toronto
      zoom={13}
      style={{ height: '300px', width: '100%' }}
      className="rounded border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler />
      {position && <Marker position={position} />}
    </MapContainer>
  )
}
