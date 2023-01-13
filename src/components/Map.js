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
import BusMarker from "../../assets/bus-marker.png";
import {VehicleTypes, VehicleSizes} from "../models/vehicle";
import {mapStyle} from './mapStyle'
import {getDistance} from "geolib";
import {FilterTypes} from "../models/filter";

const Map = ({currentLocation, drivers, routes, stations, filter, displayedRoutes}) => {

    const origin = useSelector(selectOrigin);
    const destination = useSelector(selectDestination);
    const mapRef = useRef(null);
    const [driverTimes, setDriverTimes] = useState([]);
    const [googleDirections, setGoogleDirections] = useState()
    
    const mapViewDirectionRef = useRef(null);

    const [lat, setLat] = useState(43);
    const [lng, setLng] = useState(42);

    const [driversArray,setDriversArray ] = useState([]);
    const [linesArray,setLinesArray ] = useState([]);

    const getVehicleMarkerImage = (type) => {

        if(type == VehicleTypes.BUS || type == VehicleTypes.TROLLEYBUS)
            return BusIcon;
        else if (type == VehicleTypes.TRAM)
            return TramIcon;

        return BusIcon
    }

    const getSizeText = (size) => {

        if(size == VehicleSizes.SMALL)
            return 'Small';
        else if (size == VehicleSizes.NORMAL)
            return 'Normal';
        else if (size == VehicleSizes.LARGE)
            return 'Large';

        return ''
    }

    const getStationCoord = (stop) => {

        return {
            latitude: parseFloat(stop.stop_lat),
            longitude: parseFloat(stop.stop_lon)
        }
    }

    const markerClick = () => {
        console.log("Marker was clicked");
    }

    useEffect(() => {

        const org = `${currentLocation?.coords?.latitude},${currentLocation?.coords?.longitude}`
        let mode = 'transit'
        if(destination){
            fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${org}&destination=${destination.description}&mode=${mode}&key=${GOOGLE_API_KEY}`)
                .then((response) => response.json())
                .then((json) => {
                    // console.log(json.routes[0].legs[0].steps[0].travel_mode)
                    // console.log(json.routes[0])
                    setGoogleDirections(json)
                }
                )
                .catch((error) => console.error(error))
        }
    }, [currentLocation,destination])

    function test (index) {
        let lineColor
        let dashedline
        const directionSteps = googleDirections.routes[0].legs[0].steps
        let finalDirection =[]
        for(let i=0; i<directionSteps.length; i++){
            const type = directionSteps[i].travel_mode
            if(type === 'WALKING'){
                lineColor = 'green'
                dashedline = [20,30]
            } else if (type === "TRANSIT"){
                lineColor = '#3466EF'
                dashedline = []
            }
            let aditionalStepsExists = directionSteps[i].steps
            if(!aditionalStepsExists){
                finalDirection.push(
                    <MapViewDirection
                        origin={`${directionSteps[i].start_location.lat},${directionSteps[i].start_location.lng}`}
                        destination={`${directionSteps[i].end_location.lat},${directionSteps[i].end_location.lng}`}
                        apikey={GOOGLE_API_KEY}
                        strokeWidth={5}
                        strokeColor={lineColor}
                        mode={type.toUpperCase()}
                    />
                )
            } else {
                let aditionalSteps = directionSteps[i].steps
                for(let y=0; y<aditionalSteps.length; y++){
                    finalDirection.push(
                        <MapViewDirection
                            origin={`${aditionalSteps[y].start_location.lat},${aditionalSteps[y].start_location.lng}`}
                            destination={`${aditionalSteps[y].end_location.lat},${aditionalSteps[y].end_location.lng}`}
                            apikey={GOOGLE_API_KEY}
                            strokeWidth={5}
                            strokeColor={lineColor}
                            lineDashPattern={dashedline}
                            mode={type.toUpperCase()}
                        />
                    )
                }
            }
        }
        return finalDirection
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
                            d.position && getDistance({
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
                case FilterTypes.ROUTE:
                    console.log(filter.routeFilter)
                    setDriversArray(Object.values(drivers).filter(d => d.line == filter.routeFilter));
                    break;
            }
        }
        else
            setDriversArray([]);


    }, [drivers, filter, currentLocation])

    // useEffect(() => {
    //     if(lines != null) {
    //         setLinesArray(Object.values(lines));
    //     }
    // }, [lines])

    useEffect(() => {

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
                {googleDirections && test(0)}
                {/* {currentLocation && destination && (
                    <MapViewDirection
                        origin={{
                            latitude: currentLocation?.coords?.latitude,
                            longitude: currentLocation?.coords?.longitude
                        }}
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
                )} */}
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

                {driversArray && routes && driversArray.filter(d => d.position).map((driver, index) => {

                        let route = routes.find(r => r.route_id == driver.line)
                        let driverRender = [];
                        let driverTime = '';

                        driverRender.push(
                            <MapViewDirection
                                origin={{
                                    latitude: driver?.position?.latitude,
                                    longitude: driver?.position?.longitude
                                }}
                                destination={{
                                    latitude: currentLocation?.coords?.latitude,
                                    longitude: currentLocation?.coords?.longitude
                                }}
                                apikey={GOOGLE_API_KEY}
                                strokeWidth={0}
                                onReady={results => {
                                    setDriverTimes(current => ([...current, results.legs[0].duration.text]))
                                }}
                                onError={(errorMessage) => {
                                    console.error(errorMessage);
                                }}
                            />
                        );

                        driverRender.push(
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: driver?.position?.latitude,
                                    longitude: driver?.position?.longitude
                                }}
                            >
                                <Image
                                    source={getVehicleMarkerImage(driver.type)}
                                    style={{width: 70, height: 70, marginTop:20}}
                                    resizeMode="center"
                                    resizeMethod="resize"
                                />
                                <Callout tooltip>
                                    <View>
                                        <View style={[styles.bubble, {
                                            alignContent: 'center',
                                            borderColor: `#${route?.route_color}`
                                        }]}>
                                            <Text style={[styles.route, {
                                                backgroundColor: `#${route?.route_color}`,
                                                color: `#${route?.route_text_color}`
                                            }]}>{route?.route_short_name}</Text>
                                            <Text style={{color: 'black', position:'absolute', right:8, fontSize:15}}>{driverTimes[index]}</Text>
                                            {route &&
                                                <Text style={{fontSize:12, paddingTop:10}}>{route.trips_array[0].trip_headsign} - {route.trips_array[1].trip_headsign}</Text>
                                            }

                                            <Text style={{fontSize:12, paddingTop:3}}>Size: {getSizeText(driver.size)}</Text>

                                            {
                                                driver.break &&
                                                <Text style={{fontSize:12, paddingTop:3}}>On break: {driver.break.timeDuration} mins</Text>
                                            }

                                        </View>
                                        <View style={[styles.arrowBorder, {borderTopColor: `#${route?.route_color}`}]}/>
                                        <View style={[styles.arrow, {borderTopColor: `#${route?.route_color}`}]}/>
                                    </View>
                                </Callout>
                                {/*<Callout tooltip={false} style={styles.calloutContainer}>*/}
                                {/*    <Text>Size: {driver.size}</Text>*/}
                                {/*</Callout>*/}
                            </Marker>
                        )
                        return driverRender
                    })
                }

                {displayedRoutes && displayedRoutes.map((route,index) => {
                        let waypoints = [];

                        const startCoord = getStationCoord(route.trips_array[0].stops_array[0]);

                        for (let i = 0; i < route.trips_array.length; i++) {
                            for (let j = 0; j < route.trips_array[i].stops_array.length; j++) {
                                if (i == 0 && j == 0)
                                    continue;

                                waypoints.push(
                                    getStationCoord(route.trips_array[i].stops_array[j])
                                );
                            }
                        }

                        return (
                            <MapViewDirection
                                key={index}
                                origin={startCoord}
                                destination={startCoord}
                                waypoints={waypoints}
                                splitWaypoints={true}
                                apikey={GOOGLE_API_KEY} // insert your API Key here
                                strokeWidth={4}
                                strokeColor={`#${route.route_color}`}
                                opacity={0.5}
                            />
                        )
                    })
                }

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
                            style={{width: 40, height: 40}}
                            resizeMode="center"
                            resizeMethod="resize"
                        />
                        <Callout tooltip>
                            <View>
                                <View style={[styles.bubble, {alignContent: 'center'}]}>
                                    <Text style={styles.name}>{station.stop_name}</Text>
                                </View>
                                <View style={styles.arrowBorder}/>
                                <View style={styles.arrow}/>
                            </View>
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

    bubble: {
        // flexDirection: 'row',
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 6,
        borderColor: '#279032',
        borderWidth: 6,
        padding: 15,
        width: 150,
        marginTop: 30,

    },
    name: {
        fontSize: 15,
        marginBottom: 5,
        fontWeight: '600'
    },
    route: {
        position: 'absolute',
        left: -2,
        top: -2,
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 2,
        paddingHorizontal: 4,
        borderRadius: 4
    },
    arrow: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#279032',
        borderWidth: 16,
        alignSelf: 'center',
        marginTop: -32
    },
    arrowBorder: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderTopColor: '#279032',
        borderWidth: 16,
        alignSelf: 'center',
        marginTop: -0.5
    }
})