
import { useState, useRef, useCallback, useEffect } from 'react'
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  StandaloneSearchBox
} from '@react-google-maps/api'

interface MapSelectorProps {
  latitude: number | null
  longitude: number | null
  onLocationChange: (lat: number, lng: number, address: string) => void
  resetKey?: number
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

export default function MapSelector({
  latitude,
  longitude,
  onLocationChange,
  resetKey
}: MapSelectorProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places']
  })

  const [address, setAddress] = useState('')
  const searchBoxRef = useRef<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 43.6532, lng: -79.3832 })

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() ?? 0
    const lng = e.latLng?.lng() ?? 0
    const addr = await reverseGeocode(lat, lng)
    onLocationChange(lat, lng, addr)
    setAddress(addr)
  }

  const handlePlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces?.()
    if (places && places.length > 0) {
      const place = places[0]
      const lat = place.geometry?.location?.lat() ?? 0
      const lng = place.geometry?.location?.lng() ?? 0
      const addr = place.formatted_address ?? place.name
      onLocationChange(lat, lng, addr)
      setAddress(addr)
    }
  }, [onLocationChange])

  const reverseGeocode = async (lat: number, lng: number) => {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    )
    const data = await response.json()
    return data.results?.[0]?.formatted_address || `(${lat.toFixed(5)}, ${lng.toFixed(5)})`
  }

  useEffect(() => {
    setAddress('')
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setMapCenter({lat: latitude ?? 43.6532, lng: longitude ?? -79.3832})
  }, [resetKey])

  if (!isLoaded) return <div>Loading map...</div>

  return (
    <div className="space-y-2">
      <StandaloneSearchBox
        onLoad={(ref) => (searchBoxRef.current = ref)}
        onPlacesChanged={handlePlacesChanged}
      >
        <input
          ref={inputRef} 
          type="text"
          placeholder="Search a location..."
          className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none"
        />
      </StandaloneSearchBox>

      <div className="w-full h-64 rounded-xl overflow-hidden">
        <GoogleMap
          center={{ lat: latitude ?? 43.6532, lng: longitude ?? -79.3832 }}
          zoom={13}
          mapContainerStyle={containerStyle}
          onClick={handleMapClick}
        >
          {latitude && longitude && (
            <Marker position={{ lat: latitude, lng: longitude }} />
          )}
        </GoogleMap>
      </div>

      <p className="text-sm text-gray-500">
        📍 <strong>Selected Location:</strong>{' '}
        {address || (latitude && longitude
          ? `(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`
          : 'None')}
      </p>
    </div>
  )
}
