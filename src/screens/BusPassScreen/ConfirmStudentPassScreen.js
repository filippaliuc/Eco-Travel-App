import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { useNavigation } from '@react-navigation/core'
import { SelectList } from 'react-native-dropdown-select-list';
import CustomView from './CustomView';

const data = [
  {key: '1', value:"student"},
  {key: '2', value:"pensionar"}
];

const ConfirmStudentPassScreen = ({}) => {

  const navigation = useNavigation()
  const [selectedValue, setSelectedValue] = useState("")

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <SelectList
          setSelected={(val) => setSelectedValue(val)}
          data={data}
          save="value"
          search={false}
          boxStyles={styles.selectList}
          dropdownStyles={{}}
        />
        {selectedValue==='student' && (
          <View style={{flex:1}}>
            <CustomView text={"Act de identitate: "}/>
            <CustomView text={"Legitimatie de transport: "}/>
            <CustomView text={"Carnet de student: "}/>
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => Linking.openURL("http://ratt.ro/taxare/facilitati.pdf")}
        >
        <Text 
          style={{fontWeight: 'bold', fontSize: 15, textDecorationLine: 'underline'}}
        >
          Vezi ce facilitati ai
        </Text>
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={[styles.buttons]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={23} color="white" />
          <Text style={{fontSize: 20, color: 'white', fontWeight:"500"}}>Inapoi   </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttons}>
          <Text style={{fontSize: 20, color: 'white', fontWeight:"500"}}>  Incarca</Text>
          <Ionicons name="chevron-forward" size={23} color="white"/>
        </TouchableOpacity>  
      </View>
      <NavigationBar></NavigationBar>
    </View>
  )
}

export default ConfirmStudentPassScreen

const styles = StyleSheet.create({

  container: {
    flex: 1,
    marginTop: '6%',
    justifyContent: 'flex-end',
    backgroundColor: "white",
    alignItems: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    marginVertical: 20,
  },

  buttons: {
    flexDirection: "row",
    backgroundColor: "#279032",
    padding: 10,
    marginHorizontal: 20,
    width: 130,
    justifyContent: "center",
    alignItems: "center"
  },

  topContainer: {
    margin: 30,
    padding: 15,
    flex: 1,
    width: '85%',
    flexDirection: 'column',
    backgroundColor: '#F1EBEB',
    borderRadius: 10,
  },

  selectList:{
    
  },
})