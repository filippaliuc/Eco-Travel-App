import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import NavigationBar from '../../components/NavigationBar/NavigationBar';

const BusPassScreen = () => {
  return (
    <View style={styles.container}>
      <Text>BusPassScreen</Text>
    </View>
  )
}

export default BusPassScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%', 
    justifyContent: 'flex-end'
  },
})