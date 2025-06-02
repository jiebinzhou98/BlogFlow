'use client'

import { GoogleMap, Marker } from '@react-google-maps/api'

interface MapViewProps {
    latitude: number
    longitude: number
}

export default function MapView({ latitude, longitude }: MapViewProps) {
    return (
        <div className='w-full h-64 rounded-xl overflow-hidden'>
            <GoogleMap
                center={{ lat: latitude, lng: longitude }}
                zoom={15}
                mapContainerStyle={{ width: '100%', height: '100%' }}
            >
                <Marker position={{ lat: latitude, lng: longitude }} />
            </GoogleMap>
        </div>
    )
}
