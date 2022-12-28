import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from "../../components/Map"
import CustomInput from './CustomInput'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import * as Location from 'expo-location';
import { selectDestination } from '../../components/navSlice'
import { useSelector } from 'react-redux'

const HomeScreen = () => {

  const destination = useSelector(selectDestination)

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
          // console.log(location)
      })();
  }, []);


  return (
  <View style={styles.container}>
    <View style={{padding: 15, flex: 0}}>
      {destination?.location && (
        <CustomInput text="Pornire:" placeholder="Initial location" set="Origin" ></CustomInput>
      )}
      <CustomInput text="Destinatie:" placeholder="Destination" set="Destination"></CustomInput>
      {/* <CustomButton text="Cauta" onPress={() => setShowStart(true)}></CustomButton> */}
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