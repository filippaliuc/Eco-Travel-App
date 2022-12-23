import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Alert, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Map from "../../components/Map"
import CustomInput from './CustomInput'
import CustomButton from './CustomButton'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import * as Location from 'expo-location';

const HomeScreen = () => {
  
    const [showStart, setShowStart] = useState(false);

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);


    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            setLocation(location);
        })();
    }, []);

    const showOrigin = () => {
    if(showStart) {
      return (
        <View>
          <CustomInput text="Pornire:" placeholder="Initial location" set="Origin"></CustomInput>
        </View>
      )
    }
    }

    return (
    <View style={styles.container}>
      <View style={{padding: 15, flex: 0}}>
        {showOrigin()}
        <CustomInput text="Destinatie" placeholder="Destination" set="Destination"></CustomInput>
        <CustomButton text="Cauta" onPress={() => setShowStart(true)}></CustomButton>
      </View>
        <Map styles={styles.map} currentLocation={location}/>
      < NavigationBar></NavigationBar>
    </View>
    )
  
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%', 
    justifyContent: 'flex-end',
    backgroundColor: 'white'
  },
})