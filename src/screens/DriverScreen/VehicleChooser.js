import React, {useEffect, useState} from 'react'
import {View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView} from "react-native";
import Bus from "../../../assets/bus_logo.png";
import Tram from "../../../assets/bus_logo.png";
import Small from "../../../assets/bus_logo.png";
import Normal from "../../../assets/bus_logo.png";
import Large from "../../../assets/bus_logo.png";

const VehicleTypes = {
    DEFAULT: 0,
    BUS: 1,
    TRAM: 2
};

const VehicleSizes = {
    DEFAULT: 0,
    SMALL: 1,
    NORMAL: 2,
    LARGE: 3,
};

const VehicleChooser = ({vehicle, setVehicle}) => {

    const [lines, setLines] = useState([{
        lineNumber: 1,
        lineType: VehicleTypes.TRAM,
        lineRoute: "Gara de Nord - Meteo"
    },
    {
        lineNumber: 2,
        lineType: VehicleTypes.TRAM,
        lineRoute: "City Mall - Meteo"
    },
    {
        lineNumber: 11,
        lineType: VehicleTypes.BUS,
        lineRoute: "Ghe. Baritiu - Arena Aqua"
    },
    {
        lineNumber: 16,
        lineType: VehicleTypes.BUS,
        lineRoute: "Gir. Bv. Sudului - T. Grozavescu"
    }])

    useEffect(() => {
        if(vehicle.type != null && vehicle.line != null & vehicle.size != null) {
            setVehicle(prevState => ({
                ...prevState,
                isSet: true
            }));
        }
    });

    const onVehicleTypeSelect = (vehicleType) => {
        setVehicle(prevState => ({
            ...prevState,
            type: vehicleType
        }));
    }

    const onVehicleLineSelect = (vehicleLine) => {
        setVehicle(prevState => ({
            ...prevState,
            line: vehicleLine
        }));
    }

    const onVehicleSizeSelect = (vehicleSize) => {
        setVehicle(prevState => ({
            ...prevState,
            size: vehicleSize
        }));
    }

    if(vehicle.type == null) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => onVehicleTypeSelect(VehicleTypes.BUS)}
                    style={[styles.type]}
                >
                    <Image
                        source={Bus}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onVehicleTypeSelect(VehicleTypes.TRAM)}
                    style={[styles.type]}
                >
                    <Image
                        source={Tram}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </TouchableOpacity>
            </View>
        )
    }
    else if(vehicle.line == null) {
        return (
            <View style={styles.container}>
                <ScrollView>
                    { lines.filter(l => l.lineType == vehicle.type).map(line => (
                            <View key={line.lineNumber}>
                                <TouchableOpacity
                                     onPress={() => onVehicleLineSelect(line.lineNumber)}
                                    style={styles.line}
                                >
                                    <Text style={styles.text}>{line.lineNumber}:  {line.lineRoute}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </ScrollView>
            </View>
        )
    }
    else if(vehicle.size == null) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => onVehicleSizeSelect(VehicleSizes.SMALL)}
                    style={[styles.type]}
                >
                    <Image
                        source={Small}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onVehicleSizeSelect(VehicleSizes.NORMAL)}
                    style={[styles.type]}
                >
                    <Image
                        source={Normal}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onVehicleSizeSelect(VehicleSizes.LARGE)}
                    style={[styles.type]}
                >
                    <Image
                        source={Large}
                        resizeMode="contain"
                        style={styles.logo}
                    />
                </TouchableOpacity>
            </View>
        )
    }
}

export default VehicleChooser

const styles = StyleSheet.create({
    type: {
        elevation: 5,
        padding: 10,
        margin: 10,
        alignItems: 'center',
        borderRadius: 7,
        opacity: 1,
        backgroundColor: '#80D562',
        width: 200,
        height: 200
    },

    line: {
        elevation: 5,
        padding: 10,
        margin: 10,
        borderRadius: 7,
        opacity: 1,
        backgroundColor: '#80D562',
        width: 300,
    },

    text: {
        fontWeight: '500',
        fontSize: 17,
        color: 'white',
    },

    logo: {
        width: '100%',
        height: '100%',
    },
});