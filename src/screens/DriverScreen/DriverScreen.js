import {Button, StyleSheet, Text, View} from 'react-native'
import React, {useEffect, useState} from 'react'
import VehicleChooser from "./VehicleChooser";
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Permissions from 'expo-permissions';

const LOCATION_TRACKING = 'location-tracking';

const DriverScreen = () => {

    const [vehicle, setVehicle] = useState({type:null,line:null,size:null,isSet:false});

    // useEffect(() => {
    //     if(vehicle.isSet) {
    //         startLocationTracking();
    //     }
    // });

    const startLocationTracking = async () => {
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 0,
        });
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TRACKING
        );
        console.log('tracking started?', hasStarted);
    };

    useEffect(() => {
        const config = async () => {
            let res = await Permissions.askAsync(Permissions.LOCATION_BACKGROUND);
            if (res.status !== 'granted') {
                console.log('Permission to access location was denied');
            } else {
                console.log('Permission to access location granted');
            }
        };

        config();
    }, []);

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
                <Button title="Start tracking" onPress={startLocationTracking} />
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
        margin: 'auto'
    },
})

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
        console.log('LOCATION_TRACKING task ERROR:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        let lat = locations[0].coords.latitude;
        let long = locations[0].coords.longitude;

        console.log(
            `${new Date(Date.now()).toLocaleString()}: ${lat},${long}`
        );
    }
});