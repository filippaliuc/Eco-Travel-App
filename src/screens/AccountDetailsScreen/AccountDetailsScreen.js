import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';

const AccountDetailsScreen = () => {

  const navigation = useNavigation();
  const handleLogOut = () => {
    signOut(auth).then(() =>{
      navigation.navigate("LogInScreen")
      console.log("signed out")
    }).catch((error) => {
    });
  }

  return (
    <View style={styles.container}>
      <Text>AccountDetailsScreen</Text>
      <TouchableOpacity 
        style={{backgroundColor: "green"}}
        onPress={() => handleLogOut()}  
      >
        <Text style={{fontSize: 30}}>LogOut</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={{backgroundColor: "yellow"}}
        onPress={() => navigation.navigate("DriverScreen")}  
      >
        <Text style={{fontSize: 30}}>DriverScreen</Text>
      </TouchableOpacity>
      < NavigationBar></NavigationBar>
    </View>
  )
}

export default AccountDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%', 
    justifyContent: 'flex-end'
  },
})