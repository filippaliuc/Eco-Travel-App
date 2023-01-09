import {Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableHighlight, View} from 'react-native'
import { ListItem } from 'react-native-elements'
import React, {useEffect, useRef, useState} from 'react'
import {VehicleTypes, VehicleSizes} from "../../models/vehicle";
import BusIcon from "../../../assets/bus.png";

const list = [
    {
        key: "0",
        name: 'Route',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    },
    {
        key: "1",
        name: 'Vehicles',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    },
    {
        key: "2",
        name: 'Stations',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    }
]

const RouteFilter = ({itemStyle}) => {

    return (
        <FlatList style={{width:'100%'}}
                  data={list}
                  renderItem={({ item, index }) => {
                      return (
                          <TouchableHighlight onPress={() => console.log("press")}>
                              <View style={itemStyle}>
                                  <Text style={{padding: 20, fontSize:16}}>{item.name}</Text>
                                  <Text style={{position:'absolute', right:10, top:20, opacity: 0.4}}>Show Nearby</Text>
                              </View>
                          </TouchableHighlight>
                      )
                  }}
        />
    )
}

export default RouteFilter

const styles = StyleSheet.create({

});