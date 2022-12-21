import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { useNavigation } from '@react-navigation/native';

const AccountDetailsScreen = () => {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text>AccountDetailsScreen</Text>
      <TouchableOpacity 
        style={{backgroundColor: "green"}}
        onPress={() => navigation.navigate("LogInScreen")}  
      >
        <Text style={{fontSize: 30}}>LogOut</Text>
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