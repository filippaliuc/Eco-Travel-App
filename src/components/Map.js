import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin } from './navSlice'

const Map = () => {

  // const origin = useSelector(selectOrigin);
  // const destination = useSelector(selectDestination)

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_GOOGLE}
      initialRegion={{
        // latitude: origin.location.lat,
        // longitude: origin.location.lng,
        latitude: 130.7754,
        longitude: -26.3452,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
    }}
  />
  )
}

export default Map

const styles = StyleSheet.create({
    map: {
        flex: 1
    }
})