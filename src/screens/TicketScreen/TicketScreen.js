import { View, StyleSheet } from 'react-native'
import React from 'react'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { ticketsData } from '../../models/ticketsData';
import { RootSiblingParent } from 'react-native-root-siblings';
import Toast from 'react-native-root-toast';
import CustomFlatList from '../../components/CustomFlatList';

const TicketScreen = () => {

  function showItemNotSelectedToast () {
    Toast.show('Nu ati ales niciun timp de bilet', {
      duration: Toast.durations.SHORT,
    });
  }

  return (
    <RootSiblingParent>
      <View style={styles.container}>
        <CustomFlatList 
          data={ticketsData}
          isTicket={true} 
          showToast={() => showItemNotSelectedToast()}
          handleBottomButton={() => handleConfirm()}
        />
        < NavigationBar></NavigationBar>
      </View>
    </RootSiblingParent>
  )
}

export default TicketScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%', 
    justifyContent: 'flex-end',
    backgroundColor: "white",
    alignItems: "center",
    paddingTop: 20, 
  },
})