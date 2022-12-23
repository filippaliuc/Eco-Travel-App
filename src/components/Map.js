import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, {useEffect, useState} from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from './navSlice'
import * as Location from "expo-location";

const Map = ({currentLocation}) => {

    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);

    const [lat, setLat] = useState(currentLocation?.coords.latitude);
    const [lng, setLng] = useState(currentLocation?.coords.longitude);

    useEffect(() => {
        console.log(currentLocation);
        if(currentLocation != null && destination == null) {
            setLat(currentLocation?.coords.latitude);
            setLng(currentLocation?.coords.longitude);
        }
    }, [currentLocation]);

    useEffect(() => {
        console.log(destination);
        if(destination != null) {
            setLat(destination.location.lat);
            setLng(destination.location.lng);
        }
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
            />
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