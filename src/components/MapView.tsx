// 'use client'

// import {GoogleMap, Marker, useJsApiLoader} from '@react-google-maps/api'

// interface MapViewProps{
//     latitude: number
//     longitude: number
// }

// export default function MapView({latitude, longitude}: MapViewProps) {
//     const {isLoaded} = useJsApiLoader({
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
//         libraries:['places']
//     })

//     if(!isLoaded) return <div>Loading map...</div>

//     return (
//         <div className='w-full h-64 rounded-xl overflow-hidden'>
//             <GoogleMap
//                 center={{lat: latitude, lng: longitude}}
//                 zoom={15}
//                 mapContainerStyle={{width: '100%', height: '100%'}}
//             >
//                 <Marker position ={{lat: latitude, lng: longitude}} />
//             </GoogleMap>
//         </div>
//     )
// }

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
