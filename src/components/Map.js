import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin, setOrigin } from './navSlice'
import MapViewDirection from "react-native-maps-directions"
import { GOOGLE_API_KEY } from '@env'

const Map = ({currentLocation}) => {

    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const mapRef = useRef(null);

    const directionsService = new google.maps.DirectionsService();
    
    const mapViewDirectionRef = useRef(null);

    const [lat, setLat] = useState(43);
    const [lng, setLng] = useState(42);

    useEffect(() => {
        // console.log(currentLocation);
        // console.log(destination)
        if(!destination) {
            setLat(currentLocation?.coords.latitude);
            setLng(currentLocation?.coords.longitude);
        } 
    }, [currentLocation]);

    useEffect(() => {
        setLat(destination?.location.lat);
        setLng(destination?.location.lng);
    }, [destination]);

    if(currentLocation != null) {
        return (
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
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
                        mode="TRANSIT"
                        apikey={GOOGLE_API_KEY}
                        strokeWidth={5}
                        strokeColor="green"
                        onReady={results => {
                            console.log(results.legs)
                            mapRef?.current.fitToSuppliedMarkers(["destination","origin"], {
                                edgePadding: {top: 50, right: 50, left: 50, bottom: 50}
                              });
                        }}
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