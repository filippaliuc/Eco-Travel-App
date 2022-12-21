import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import NavigationBar from '../../components/NavigationBar/NavigationBar';

const AccountDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>AccountDetailsScreen</Text>
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