import {
    Button,
    StyleSheet,
    Text,
    View,
    Platform,
    StatusBar,
    BackHandler,
    TouchableHighlight,
    TouchableOpacity, Image, Alert
} from 'react-native'
import Moment from 'moment';
import React, {useEffect, useState} from 'react'
import VehicleChooser from "./VehicleChooser";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { auth, database } from "../../../firebase"
import {getDatabase, ref, onValue, child, exists, remove, update, set, get, push} from "firebase/database";
import Logo from "../../../assets/bus_logo.png";
import {VehicleTypes} from "../../models/vehicle";
import Bus from "../../../assets/bus_icon.png";
import Tram from "../../../assets/tram_icon.png";
import Trolley from "../../../assets/trolleybus_icon.png";
import {FilterTypes} from "../../models/filter";
import {useNavigation} from "@react-navigation/native";
import {signOut} from "firebase/auth";
import FilterButton from "../HomeScreen/FilterButton";
import BreakTimePickerModal from "./BreakTimePickerModal";
import { GOOGLE_API_KEY } from '@env'

const LOCATION_TASK_NAME = 'LOCATION_TASK_NAME';
let foregroundSubscription = null

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
    if (error) {
        console.error(error)
        return
    }
    if (data) {
        console.log("Location in background")
        // Extract location coordinates from data
        const { locations } = data
        const location = locations[0]
        if (location) {
            console.log("Location in background", location.coords)
        }
    }
})

function writeDriverData(userId, type, line, size, position, timeBreak, nextStop) {
    set(ref(database, 'drivers/' + userId), {
        type: type,
        line: line,
        size : size,
        position: position,
        break: timeBreak,
        nextStop: nextStop
    }).catch(console.error);
}

function updateDriverNextStop(userId, nextStop) {
    update(ref(database, 'drivers/' + userId), {
        nextStop: nextStop
    }).catch(console.error);
}

function updateDriverBreak(userId, timeBreak) {
    update(ref(database, 'drivers/' + userId), {
        break: timeBreak
    }).catch(console.error);
}

function updateDriverPosition(userId, position) {
    update(ref(database, 'drivers/' + userId), {
        position: position
    }).catch(console.error);
}

function useBackHandler(handler) {
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handler);

        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handler);
        };
    });
}

const DriverScreen = () => {

    const [vehicle, setVehicle] = useState({type:null,line:null,size:null,isSet:false});
    const [breakTime, setBreakTime] = useState(null);
    const [position, setPosition] = useState(null)
    const [titleText, setTitleText] = useState('Alege un vehiculul:')
    const [routes, setRoutes] = useState([])
    const [route, setRoute] = useState([])
    const [nextStop, setNextStop] = useState(null)
    const navigation = useNavigation();
    const [showBreakModal, setShowBreakModal] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [waypoints, setWaypoints] = useState([]);
    let index = 0

    // useEffect(() => {
    //     if(isSimulating)
    //     {
    //         const interval = setInterval(() => {
    //             setPosition(waypoints[index])
    //             console.log(waypoints[index])
    //             console.log(index)
    //             index++;
    //             if(index == waypoints.length)
    //                 index = 0;
    //
    //         }, 10000);
    //
    //         return () => clearInterval(interval)
    //     }
    // }, [isSimulating]);

    const handleValidateClose = () => {

        if(!vehicle.isSet)
        {
             if(vehicle.type == null);
            else if(vehicle.line == null)
            {
                setTitleText('Alege un vehiculul:')

                setVehicle(prevState => ({
                    ...prevState,
                    type: null
                }));
            }
            else
            {
                setTitleText('Alege ruta:')

                setVehicle(prevState => ({
                    ...prevState,
                    line: null
                }));
            }
        }

        return true;
    };

    useBackHandler(handleValidateClose);

    const userId = auth.currentUser.uid

    const dbRef = ref(getDatabase());

    get(child(dbRef, `drivers/${userId}`)).then((snapshot) => {
        if (snapshot.exists() && !vehicle.isSet) {
            setVehicle({
                type: snapshot.val().type,
                line: snapshot.val().line,
                size: snapshot.val().size,
                isSet: true
            });
            setNextStop(snapshot.val().nextStop);
        }
    }).catch((error) => {
        console.error(error);
    });

    useEffect(() => {
        if(vehicle.isSet) {
            writeDriverData(userId, vehicle.type, vehicle.line, vehicle.size, position, breakTime, nextStop);

            if(vehicle.line != null && nextStop == null){
                fetch(`https://api.opentransport.ro/gtfs/v1/route/${vehicle.line}?include=stop`)
                    .then((response) => response.json())
                    .then((json) => {
                        setRoute(json[0]);
                        if(nextStop == null)
                        {
                            setNextStop(
                                {
                                    stopId: json[0].trips_array[0].stops_array[0].stop_id,
                                    stopName: json[0].trips_array[0].stops_array[0].stop_name,
                                    stopIndex:0,
                                    latitude: json[0].trips_array[0].stops_array[0].stop_lat,
                                    longitude: json[0].trips_array[0].stops_array[0].stop_lon,
                                    direction: 0
                                }
                            )
                        }

                        // let coordinates = [];
                        // JSON.parse(json[0].trips_array[0].geojson).coordinates.forEach(coord => coordinates.push({latitude: parseFloat(coord[1]), longitude: parseFloat(coord[0])}))
                        // JSON.parse(json[0].trips_array[1].geojson).coordinates.forEach(coord => coordinates.push({latitude: parseFloat(coord[1]), longitude: parseFloat(coord[0])}))
                        //
                        // setWaypoints(coordinates);
                    })
                    .catch((error) => console.error(error))
            }

            startForegroundUpdate().catch(console.error);
        }
    }, [vehicle.isSet]);

    useEffect(() => {
        if(position != null) {
            updateDriverPosition(userId, position);

            if(nextStop != null) {
                fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${nextStop.latitude},${nextStop.longitude}&origins=${position.latitude},${position.longitude}&units=metric&key=${GOOGLE_API_KEY}`)
                    .then((response) => response.json())
                    .then((json) => {
                        let distance = json.rows[0].elements[0].distance;
                        let duration = json.rows[0].elements[0].duration;

                        setNextStop(prevState => ({
                            ...prevState,
                            estimatedTime: duration.text,
                            estimatedDistance: distance.text
                        }));

                        if (distance.value < 5) {

                            console.log("Stop")
                            console.log(route)
                            let newIndex, newDirection;
                            if(nextStop.stopIndex == route.trips_array[nextStop.direction].stops_array.length - 1)
                            {
                                newIndex = 0;
                                newDirection = !nextStop.direction;
                            }
                            else
                            {
                                newIndex = nextStop.stopIndex + 1;
                            }

                            setNextStop(
                                {
                                    stopId: route.trips_array[nextStop.direction].stops_array[nextStop.stopIndex].stop_id,
                                    stopName: route.trips_array[nextStop.direction].stops_array[nextStop.stopIndex].stop_name,
                                    stopIndex: newIndex,
                                    latitude: route.trips_array[nextStop.direction].stops_array[nextStop.stopIndex].stop_lat,
                                    longitude: route.trips_array[nextStop.direction].stops_array[nextStop.stopIndex].stop_lon,
                                    direction: newDirection,
                                    estimatedTime: '',
                                    estimatedDistance: '',
                                }
                            );
                        }
                    })
                    .catch((error) => console.error(error))
            }
        }
    }, [position]);

    useEffect(() => {
        if(breakTime != null) {
            updateDriverBreak(userId, breakTime);
        }
    }, [breakTime]);

    useEffect(() => {
        if(nextStop != null) {
            updateDriverNextStop(userId, nextStop);
        }
    }, [nextStop]);

    const startLocationTracking = async () => {
        await Location.startLocationUpdatesAsync(TASK_NAME, {
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: "Location",
                notificationBody: "Location tracking in background",
                notificationColor: "#fff",
            },
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 0,
        });
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TRACKING
        );

        console.log('tracking started?', hasStarted);
    };
    const stopLocationTracking = async () => {
        await Location.stopLocationUpdatesAsync(TASK_NAME)
    };

    useEffect(() => {
        const requestPermissions = async () => {
            const foreground = await Location.requestForegroundPermissionsAsync()
            if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
        }
        requestPermissions().catch((error) => console.error(error))
    }, []);

    // Start location tracking in foreground
    const startForegroundUpdate = async () => {
        // Check if foreground permission is granted
        const { granted } = await Location.getForegroundPermissionsAsync()
        if (!granted) {
            console.log("location tracking denied")
            return
        }

        // Make sure that foreground location tracking is not running
        foregroundSubscription?.remove()

        // Start watching position in real-time
        foregroundSubscription = await Location.watchPositionAsync(
            {
                // For better logs, we set the accuracy to the most sensitive option
                accuracy: Location.Accuracy.BestForNavigation,
            },
            location => {
                console.log(location.coords)
                setPosition(location.coords)
                //check for stop
            }
        )
    }

    // Stop location tracking in foreground
    const stopForegroundUpdate = () => {
        foregroundSubscription?.remove()
        setPosition(null)
        setNextStop(null)

        remove(ref(database, 'drivers/' + userId)).catch(console.error)

        setVehicle({type:null,line:null,size:null,isSet:false})
    }

    // Start location tracking in background
    const startBackgroundUpdate = async () => {
        // Don't track position if permission is not granted
        const { granted } = await Location.getBackgroundPermissionsAsync()
        if (!granted) {
            console.log("location tracking denied")
            return
        }

        // Make sure the task is defined otherwise do not start tracking
        const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME)
        if (!isTaskDefined) {
            console.log("Task is not defined")
            return
        }

        // Don't track if it is already running in background
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TASK_NAME
        )
        if (hasStarted) {
            console.log("Already started")
            return
        }

        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            // For better logs, we set the accuracy to the most sensitive option
            accuracy: Location.Accuracy.BestForNavigation,
            // Make sure to enable this notification if you want to consistently track in the background
            showsBackgroundLocationIndicator: true,
            foregroundService: {
                notificationTitle: "Location",
                notificationBody: "Location tracking in background",
                notificationColor: "#fff",
            },
        })
    }

    // Stop location tracking in background
    const stopBackgroundUpdate = async () => {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TASK_NAME
        )
        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
            console.log("Location tacking stopped")
        }
    }

    useEffect(() => {
        const fetchStations = async () => {
            try {
                await fetch('https://api.opentransport.ro/gtfs/v1/route')
                    .then((response) => response.json())
                    .then((json) => setRoutes(json))
                    .catch((error) => console.error(error))

            }
            catch(error) {
                console.error(error);
            }
        }

        fetchStations().catch(console.error);
    }, [])

    const onVehicleChangePress = () => {

        Alert.alert(
            "Schimbare vehiculul",
            "Ești sigur că vrei să schimbi vehiculul curent?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { text: "OK", onPress: () => {
                        stopForegroundUpdate();
                    }
                }
            ]
        );
    }

    const onEndShiftPress = () => {

        Alert.alert(
            "Încheiere tură",
            "Ești sigur că vrei să închei tura de astăzi?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                { text: "OK", onPress: () => {
                        stopForegroundUpdate();
                        handleLogOut();
                    }
                }
            ]
        );
    }

    const handleLogOut = () => {
        signOut(auth).then(() =>{
            navigation.navigate("LogInScreen")
            console.log("signed out")
        }).catch((error) => {
        });
    }

    if(vehicle.isSet == false) {
        return (
            <View style={[styles.container]}>
                <View style={[styles.titleContainer]}><Text style={[styles.title]}>{titleText}</Text></View>
                <VehicleChooser vehicle={vehicle} setVehicle={setVehicle} routes={routes} setTitleText={setTitleText}></VehicleChooser>
            </View>
        )
    }
    else if(routes?.length > 0){
        let currentRoute = routes.find(r => r.route_id == vehicle.line);
        let vehicleIcon;
        if(vehicle.type == VehicleTypes.BUS)
            vehicleIcon = Bus;
        else if(vehicle.type == VehicleTypes.TRAM)
            vehicleIcon = Tram;
        else
            vehicleIcon = Trolley;

        return (
            <View style={[styles.container]}>
                {/*<TouchableOpacity*/}
                {/*    onPress={() => { if(!isSimulating) {foregroundSubscription?.remove(); setIsSimulating(true)} else {startForegroundUpdate(); setIsSimulating(false)}}}*/}
                {/*    style={[styles.button, {width: 70, position:'absolute', bottom:60, end:10}]}*/}
                {/*>*/}
                {/*    <Text style={styles.buttonText}>{isSimulating ? "E" : "S"}</Text>*/}
                {/*</TouchableOpacity>*/}
                <View style={[styles.titleContainer]}><Text style={{color: 'white', fontSize: 19}}>{currentRoute.trips_array[0].trip_headsign} - {currentRoute.trips_array[1].trip_headsign}</Text></View>

                <Image
                    source={vehicleIcon}
                    style={styles.vehicle}
                    resizeMode="contain"
                />

                <Text style={styles.route} >{currentRoute.route_short_name}</Text>

                {
                    breakTime ? (
                        <TouchableOpacity
                            style={[styles.button, {paddingVertical: 40}]}
                            onPress={() => setBreakTime(null)}
                        >
                            <Text style={styles.buttonText}>Încheie pauza</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, {paddingVertical: 40}]}
                            onPress={() => setShowBreakModal(true)}
                        >
                            <Text style={styles.buttonText}>Ia o pauză</Text>
                        </TouchableOpacity>
                    )
                }

                <BreakTimePickerModal isVisible={showBreakModal} onClose={() => setShowBreakModal(false)} onSetBreakTime={(time, start) =>
                    setBreakTime({timeDuration: time, timeStart: Moment(start).format('DD.MM.yyyy HH:mm:ss')})
                } />

                <TouchableOpacity
                    onPress={() => onVehicleChangePress()}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Shimbă vehiculul</Text>
                </TouchableOpacity>

                <TouchableHighlight style={{position: 'absolute', bottom: 0, backgroundColor:'#d13a34', width:'100%'}} underlayColor='#a63228' onPress={() => onEndShiftPress()}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{padding: 15, fontSize:20, fontWeight: 'bold'}}>Încheie tura</Text>
                        {/*<Text style={{position:'absolute', right:10, top:20, opacity: 0.4}}>{item.trips_array[0].trip_headsign} - {item.trips_array[1].trip_headsign}</Text>*/}
                    </View>
                </TouchableHighlight>
            </View>
        )
    }
}

export default DriverScreen

const styles = StyleSheet.create({
    root: {
        alignItems: 'center',
        backgroundColor: '#279032',
        flex: 1,
        marginVertical: 'auto'
    },

    titleContainer: {
        position: 'absolute',
        top: (Platform.OS === "android" ? StatusBar.currentHeight : 0),
        padding: 10,
        backgroundColor: '#22802c',
        alignItems: 'center',
        width: '100%'
    },

    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'white'
    },

    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#279032',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
    },

    button: {
        elevation: 5,
        padding: 20,
        alignItems: 'center',
        borderRadius: 7,
        opacity: 1,
        marginBottom: 20,
        backgroundColor: '#80D562',
        width: 250,
    },

    buttonText: {
        fontWeight: '600',
        fontSize: 20
    },

    vehicle: {
        position: 'absolute',
        top: (Platform.OS === "android" ? StatusBar.currentHeight : 0) + 90,
        width: '60%',
        height: '13%',
    },

    route: {
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        top: (Platform.OS === "android" ? StatusBar.currentHeight : 0) + 210,
        backgroundColor: 'white',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10
    },
})