import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, {useEffect, useState} from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from './navSlice'
import MapViewDirection from "react-native-maps-directions"
import { GOOGLE_API_KEY } from '@env'
import * as Location from "expo-location";

const Map = ({currentLocation}) => {

    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
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

    if(currentLocation != null) {
        return (
            <MapView
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