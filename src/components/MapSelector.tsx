'use client'

import { GoogleMap,Marker, useJsApiLoader } from "@react-google-maps/api"

interface MapSelectorProps {
    latitude: number | null
    longitude: number | null
    onChange: (lat: number, lng: number) => void
}

export default function MapSelector({ latitude, longitude, onChange }: MapSelectorProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    })

    if(!isLoaded) return <div>Loading map...</div>
    
    return (
        <div className="w-full h-64 rounded-xl overflow-hidden">
            <GoogleMap
                center={{ lat: latitude ?? 43.6532, lng: longitude ?? -79.3832 }}
                zoom={12}
                mapContainerStyle={{width: '100%', height: '100%'}}
                onClick={(e) => {
                    onChange(e.latLng?.lat() ?? 0, e.latLng?.lng() ?? 0)
                }}
            >
                {latitude && longitude && (
                    <Marker position={{ lat: latitude, lng: longitude }} />
                )}

            </GoogleMap>
        </div>
    )
}