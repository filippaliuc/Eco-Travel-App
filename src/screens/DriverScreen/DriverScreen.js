import {Button, StyleSheet, Text, View} from 'react-native'
import React, {useEffect, useState} from 'react'
import VehicleChooser from "./VehicleChooser";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { auth, database } from "../../../firebase"
import { getDatabase, ref, onValue, child, exists, remove, update, set, get } from "firebase/database";

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

function writeDriverData(userId, type, line, size, position) {
    set(ref(database, 'drivers/' + userId), {
        type: type,
        line: line,
        size : size,
        position: position
    }).catch(console.error);
}

const DriverScreen = () => {

    const [vehicle, setVehicle] = useState({type:null,line:null,size:null,isSet:false});
    const [position, setPosition] = useState(null)
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
            writeDriverData(userId, vehicle.type, vehicle.line, vehicle.size, position);
            startForegroundUpdate().catch(console.error);
        }
    }, [vehicle.isSet]);

    useEffect(() => {
        if(position != null) {
            writeDriverData(userId, vehicle.type, vehicle.line, vehicle.size, position);
        }
    }, [position]);

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
        requestPermissions()
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

    if(vehicle.isSet == false) {
        return (
            <View style={styles.root}>
                <View style={styles.container}>
                    <VehicleChooser vehicle={vehicle} setVehicle={setVehicle}></VehicleChooser>
                </View>
            </View>
        )
    }
    else {
        return (
            <View style={styles.container}>
                <Text>Driver Screen</Text>
                <Button title="Stop tracking" onPress={stopForegroundUpdate} />
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

    container: {
        alignItems: 'center',
        flex: 1,
        marginTop: 200
    },
})