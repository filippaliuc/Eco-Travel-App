import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import React, { useState } from 'react'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { useNavigation } from '@react-navigation/core';

const data = [ 
  {name: "1 linie - 30 de zile", price: '100',  key: '1'},
  {name: "1 linie expres - 30 de zile", price: '115', key: '2'},
  {name: "general - 30 de zile", price: '130', key: '3'},
  {name: "general anual", price: '1100', key: '4'},
  {name: "student", price: '0', key: '5'},
]   

const Item = ({item, onPress, borderColor, textColor, elevation, borderWidth, shadowOpacity}) => (
  <TouchableOpacity 
    onPress={onPress}
    style={[styles.item, borderColor, elevation, borderWidth, shadowOpacity]}
    activeOpacity={0.7}
  >
    <Text style={[styles.itemText, textColor]}>{item.name}</Text>
  </TouchableOpacity>
);



const BusPassScreen = () => {

  const navigation = useNavigation();
  const [selectedId, setSelectedId] = useState(null);

  const renderItem = ({ item }) => {
    const borderColor = item.key === selectedId ? "#196220" : null;
    const color = item.key === selectedId ? "black" : "grey";
    const elevation = item.key === selectedId ? 5 : 0;
    const shadowOpacity = item.key === shadowOpacity ? 1 : 0;
    const borderWidth = item.key === selectedId ? 2 : 0;
    
    return (
      <Item
        item={item}
        onPress={() => setSelectedId(item.key)}
        borderColor={{ borderColor }}
        elevation={{ elevation }}
        shadowOpacity={{ shadowOpacity }}
        textColor={{ color }}
        borderWidth={{ borderWidth }}
      />
    );
  };

  const handleConfirm = () => {
    return data[selectedId-1].name === 'student' ? navigation.navigate("ConfirmStudentPassScreen") : navigation.navigate("ConfirmStandardPassScreen") 
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        extraData={selectedId}
        contentContainerStyle={styles.buttonsContainer}
      />
      {selectedId && (
        <Text style={styles.price}>{data[selectedId-1].price} lei</Text>
      )}
      <TouchableOpacity style={styles.chooseButton} onPress={() => handleConfirm()}>
        <Text style={styles.chooseText}>Confirma</Text>
      </TouchableOpacity>
      < NavigationBar></NavigationBar>
    </View>
  )
}

export const getData = () => {
  return data
}

export default BusPassScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%', 
    justifyContent: 'flex-end',
    backgroundColor: "white",
    alignItems: "center",
  },

  buttonsContainer: {
    // flex: 1,
    alignItems: "center",
  },

  chooseButton: {
    backgroundColor: "#279032",
    paddingHorizontal: '15%',
    paddingVertical:'5%',
    alignItems: "center",
    borderRadius: 20,
    marginBottom: 40,
    marginTop: 5,
    elevation: 4,
    shadowOpacity: 0.2
  },

  chooseText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600"
  },
  
  item: {
    backgroundColor: "#EFEAEA",
    width: 300,
    maxWidth: '80%',
    paddingVertical: 18,
    alignItems: "center",
    borderRadius: 20,
    marginTop: 30,
  },

  itemText: {
    fontSize: 16, 
    fontWeight: '500'
  },

  price: {
    fontSize: 20, 
    fontWeight: '500',
    color: 'black',
    padding: 10,
  },
})