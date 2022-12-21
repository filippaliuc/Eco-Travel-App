import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import CustomButton from './CustomButton'
import { useNavigation } from '@react-navigation/native'

const Test = () => {
    const navigation = useNavigation();

    const handleTickets = () => {
        navigation.navigate("TicketScreen");
    }

    const handleSubs = () => {
        navigation.navigate("BusPassScreen");
    }

    const handleMaps = () => {
        navigation.navigate("HomeScreen");
    }

    const handleLines = () => {
        navigation.navigate("LinesScreen");
    }

    const handleAccount = () => {
        navigation.navigate("AccountDetailsScreen");
    }

    return (
        <View style={styles.menuBar}>
            <CustomButton text="Bilete" icon='ticket' type="FontAwesome" onPress={handleTickets}></CustomButton>
            <CustomButton text="Abonamente" icon='md-card-outline' type="Ionicons" onPress={handleSubs} ></CustomButton>
            <CustomButton text="Harta" icon='md-map-sharp' type="Ionicons" onPress={handleMaps}></CustomButton>
            <CustomButton text="Linii" icon='tram' type="MaterialIcons" onPress={handleLines}></CustomButton>
            <CustomButton text="Cont" icon='account-circle' type="MaterialIcons" onPress={handleAccount}></CustomButton>
      </View>
    )
}

export default Test

const styles = StyleSheet.create({
    // navbar :{
    //   padding: 10, 
    //   flexDirection: 'row'
    // },
  
    // arrow: {
    //   flex: 1
    // },
  
    // navIcons: {
    //   marginHorizontal: 5,
    // },
  
    menuBar: {
      padding: 5, 
      flexDirection: 'row',
    //   backgroundColor: '#EDE8E8'
    },
})