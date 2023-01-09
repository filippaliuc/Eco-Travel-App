import {Dimensions, Image, StyleSheet, Text, TouchableHighlight, View} from 'react-native'
import React, {useEffect, useRef, useState} from 'react'
import { Marker, Callout, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import MapView from "react-native-map-clustering";
import { useSelector } from 'react-redux'
import { selectDestination, selectOrigin, setOrigin } from './navSlice'
import MapViewDirection from "react-native-maps-directions"
import { GOOGLE_API_KEY } from '@env'
import BusIcon from "../../assets/bus.png";
import TramIcon from "../../assets/tram.png";
import CarIcon from "../../assets/car.png";
import BusMarker from "../../assets/bus-marker.png";
import TramMarker from "../../assets/tram-marker.png";
import {VehicleTypes, VehicleSizes} from "../models/vehicle";
import {mapStyle} from './mapStyle'
import {getDistance} from "geolib";
import {FilterTypes} from "../models/filter";

const Map = ({currentLocation, drivers, lines, stations, filter}) => {

    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const mapRef = useRef(null);
    
    const mapViewDirectionRef = useRef(null);

    const [lat, setLat] = useState(43);
    const [lng, setLng] = useState(42);

    const [driversArray,setDriversArray ] = useState([]);
    const [linesArray,setLinesArray ] = useState([]);

    const getVehicleMarkerImage = (type) => {

        if(type == VehicleTypes.BUS)
            return BusIcon;
        else if (type == VehicleTypes.TRAM)
            return TramIcon;

        return CarIcon
    }

    const getStationCoord = (stationId) => {

        return {
            latitude: stations[stationId].coordinates[0],
            longitude: stations[stationId].coordinates[1]
        }
    }

    const markerClick = () => {
        console.log("Marker was clicked");
    }

    useEffect(() => {

        if(drivers) {
            switch (filter.vehiclesFilter) {
                case FilterTypes.SHOW_ALL:
                    setDriversArray(Object.values(drivers));
                    break;

                case FilterTypes.SHOW_NEARBY:
                    if(currentLocation) {
                        setDriversArray(Object.values(drivers).filter(d =>
                            getDistance({
                                    latitude: currentLocation?.coords?.latitude,
                                    longitude: currentLocation?.coords?.longitude
                                },
                                {
                                    latitude: d.position.latitude,
                                    longitude: d.position.longitude
                                }
                            ) < 1000)
                        );
                    }
                    break;

                case FilterTypes.HIDDEN:
                    setDriversArray([]);
                    break;
            }
        }
        else
            setDriversArray([]);


    }, [drivers, filter, currentLocation])

    useEffect(() => {
        if(lines != null) {
            setLinesArray(Object.values(lines));
        }
    }, [lines])

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
                customMapStyle={mapStyle}
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                showsUserLocation={true}
                initialRegion={{
                    latitude: 45.74767,
                    longitude: 21.22636,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
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

                {driversArray && driversArray.filter(d => d.position).map((driver, index) =>
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: driver.position.latitude,
                            longitude: driver.position.longitude
                        }}
                    >
                        <Image
                            source={getVehicleMarkerImage(driver.type)}
                            style={{width: 80, height: 50, marginTop: 12}}
                            resizeMode="center"
                            resizeMethod="resize"
                        />
                        <Callout tooltip={false} style={styles.calloutContainer}>
                            <Text>Size: {driver.size}</Text>
                        </Callout>
                    </Marker>
                )}

                {linesArray && stations && linesArray.map((line,index) => {
                    let waypoints = [];
                    const startCoord = getStationCoord(line.stations[0]);
                    for(let i = 1; i < line.stations.length; i++) {
                        waypoints.push(
                            getStationCoord(line.stations[i])
                        );
                    }

                    return (
                        <MapViewDirection
                            key={index}
                            origin={startCoord}
                            destination={startCoord}
                            waypoints={waypoints}
                            apikey={GOOGLE_API_KEY} // insert your API Key here
                            strokeWidth={4}
                            strokeColor={line.color}
                            opacity={0.5}
                        />
                    )}
                )}

                {stations && stations.map((station,index) => {

                    return (
                    <Marker
                        key={station.stop_id}
                        coordinate={{
                            latitude: parseFloat(station.stop_lat),
                            longitude: parseFloat(station.stop_lon)
                        }}
                    >
                        <Image
                            source={BusMarker}
                            style={{width: 85, height: 30, marginTop: 34}}
                            resizeMode="center"
                            resizeMethod="resize"
                        />
                        <Callout tooltip={false} style={styles.calloutContainer}>
                            <Text>{station.stop_name}</Text>
                        </Callout>
                    </Marker>)
                })}

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
    },

    calloutContainer: {

    },
})