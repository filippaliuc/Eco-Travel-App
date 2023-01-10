import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ActiveTickestScreen = () => {
  return (
    <View style={styles.container}>
      <Text>ActiveTickestScreen</Text>
    </View>
  )
}

export default ActiveTickestScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: '6%', 
        justifyContent: "center",
        backgroundColor: "white",
        alignItems: "center",
        paddingTop: 20, 
      },
})