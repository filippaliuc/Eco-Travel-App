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

function writeDriverData(userId, type, line, size, position, timeBreak) {
    set(ref(database, 'drivers/' + userId), {
        type: type,
        line: line,
        size : size,
        position: position,
        break: timeBreak
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
    const [titleText, setTitleText] = useState('Choose your vehicle:')
    const [routes, setRoutes] = useState([])
    const navigation = useNavigation();
    const [showBreakModal, setShowBreakModal] = useState(false);

    const handleValidateClose = () => {

        if(!vehicle.isSet)
        {
             if(vehicle.type == null);
            else if(vehicle.line == null)
            {
                setTitleText('Choose your vehicle:')

                setVehicle(prevState => ({
                    ...prevState,
                    type: null
                }));
            }
            else
            {
                setTitleText('Choose your route:')

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
            })
        }
    }).catch((error) => {
        console.error(error);
    });

    useEffect(() => {
        if(vehicle.isSet) {
            writeDriverData(userId, vehicle.type, vehicle.line, vehicle.size, position, breakTime);
            startForegroundUpdate().catch(console.error);
        }
    }, [vehicle.isSet]);

    useEffect(() => {
        if(position != null) {
            writeDriverData(userId, vehicle.type, vehicle.line, vehicle.size, position, breakTime);
        }
    }, [position, breakTime]);

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
            }
        )
    }

    // Stop location tracking in foreground
    const stopForegroundUpdate = () => {
        foregroundSubscription?.remove()
        setPosition(null)

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
            "Change vehicle",
            "Are you sure you want to change your current vehicle?",
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
            "Ending Shift",
            "Are you sure you want to end today's shift?",
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
                            <Text style={styles.buttonText}>Resume</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, {paddingVertical: 40}]}
                            onPress={() => setShowBreakModal(true)}
                        >
                            <Text style={styles.buttonText}>Take a Break</Text>
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
                    <Text style={styles.buttonText}>Change Vehicle</Text>
                </TouchableOpacity>

                <TouchableHighlight style={{position: 'absolute', bottom: 0, backgroundColor:'#d13a34', width:'100%'}} underlayColor='#a63228' onPress={() => onEndShiftPress()}>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{padding: 15, fontSize:20, fontWeight: 'bold'}}>End Shift</Text>
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