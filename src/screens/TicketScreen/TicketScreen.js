import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const TicketScreen = () => {
  return (
    <View style={styles.container}>
      <Text>TicketScreen</Text>
      < NavigationBar></NavigationBar>
    </View>
  )
}

export default TicketScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%', 
    justifyContent: 'flex-end'
  },
})