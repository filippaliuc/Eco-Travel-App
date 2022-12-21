import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from './navSlice'

const Map = ({currentLocation}) => {

    // const origin = useSelector(selectOrigin);
    // const destination = useSelector(selectDestination)

    if(currentLocation != null) {
        return (
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    // latitude: origin.location.lat,
                    // longitude: origin.location.lng,
                    latitude:  currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
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