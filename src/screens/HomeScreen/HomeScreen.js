import { StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Alert, DeviceEventEmitter } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Map from "../../components/Map"
import CustomInput from './CustomInput'
import CustomButton from './CustomButton'
import NavigationBar from '../../components/NavigationBar/NavigationBar';

const HomeScreen = () => {
  
  const [showStart, setShowStart] = useState(false);

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
      {/* <View style={styles.navbar}>
          <Ionicons name='md-arrow-back-outline' onPress={handleBackButton} style={styles.arrow} size={32} ></Ionicons>
          <Ionicons name='notifications-outline' style={styles.icons} size={32} ></Ionicons>
          <Ionicons name='settings-outline' size={32} ></Ionicons>
      </View> */}
      <View style={{padding: 15, flex: 0}}>
        {showOrigin()}
        <CustomInput text="Destinatie" placeholder="Destination" set="Destination"></CustomInput>
        <CustomButton text="Cauta" onPress={() => setShowStart(true)}></CustomButton>
      </View>
      <Map styles={styles.map} />
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