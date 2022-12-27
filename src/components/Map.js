import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from './navSlice'
import MapViewDirection from "react-native-maps-directions"
import { GOOGLE_API_KEY } from '@env'

const Map = ({currentLocation}) => {

    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const mapRef = useRef(null);

    const defaultLocation = {
        lat: 45.7538355,
        lng: 21.2257474
    };

    const [lat, setLat] = useState(43);
    const [lng, setLng] = useState(42);

    useEffect(() => {
        // console.log(currentLocation);
        // console.log(destination)
        if(destination == null) {
            setLat(currentLocation?.coords.latitude);
            setLng(currentLocation?.coords.longitude);
        } 
    }, [currentLocation]);

    useEffect(() => {
        setLat(destination?.location.lat);
        setLng(destination?.location.lng);
    }, [destination]);
    
    useEffect(() => {
      if( !origin || !destination) return;

      mapRef.current.fitToSuppliedMarkers(["destination","origin"], {
        edgePadding: {top: 50, right: 50, left: 50, bottom: 50}
      });
    }, [origin,destination])
    

    if(currentLocation != null) {
        return (
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={
                        {
                            latitude: lat,
                            longitude: lng,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }
                }
            >
                {origin && destination && (
                    <MapViewDirection 
                        origin={origin.description}
                        destination={destination.description}
                        apikey={GOOGLE_API_KEY}
                        strokeWidth={3}
                        strokeColor="green"
                    />
                )}
                {destination?.location && (
                    <Marker 
                        coordinate={{
                            latitude: destination.location.lat,
                            longitude: destination.location.lng
                        }}
                        title="Destination"
                        description={destination.description}
                        identifier="destination"
                    />
                )}

                {origin?.location && (
                    <Marker 
                        coordinate={{
                            latitude: origin.location.lat,
                            longitude: origin.location.lng
                        }}
                        title="Origin"
                        description={origin.description}
                        identifier="origin"
                        opacity={1}
                    />
                )}
            </MapView> 
        )
    }
    else {
        return (
            <View style={styles.map}></View>
        )
    }
}

export default Map

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
})