import {Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableHighlight, View} from 'react-native'
 import { ListItem } from 'react-native-elements'
import React, {useEffect, useRef, useState} from 'react'
import {VehicleTypes, VehicleSizes} from "../../models/vehicle";
import BusIcon from "../../../assets/bus.png";
import TramIcon from "../../../assets/tram.png";
import CarIcon from "../../../assets/car.png";
import {FilterOptions, FilterTypes} from "../../models/filter";
import ProximityFilter from "./ProximityFilter";
import RouteFilter from "./RouteFilter";

const list = [
    {
        key: FilterOptions.FILTER_ROUTE,
        name: 'Route',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    },
    {
        key: FilterOptions.FILTER_VEHICLES,
        name: 'Vehicles',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    },
    {
        key: FilterOptions.FILTER_STATIONS,
        name: 'Stations',
        avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    }
]

const Filter = ({itemStyle, filter, setFilter}) => {

    const [filterOption, setFilterOption] = useState(FilterOptions.DEFAULT);

    const getFilterText = (item) => {

        let filterType;

        if(item.name == 'Route')
            filterType = filter.routeFilter;
        else if(item.name == 'Vehicles')
            filterType = filter.vehiclesFilter;
        else if(item.name == 'Stations')
            filterType = filter.stationsFilter;

        if(filterType == FilterTypes.SHOW_ALL)
            return 'Show All';
        else if (filterType == FilterTypes.SHOW_NEARBY)
            return 'Show Nearby';
        else if (filterType == FilterTypes.HIDDEN)
            return 'Hidden';

        return ''
    }

    const onFilterSelect = (option, type) => {

        if(option == FilterOptions.FILTER_VEHICLES) {
            setFilter(prevState => ({
                ...prevState,
                vehiclesFilter: type,
            }));
        }
        else if(option == FilterOptions.FILTER_STATIONS) {
            setFilter(prevState => ({
                ...prevState,
                stationsFilter: type,
            }));
        }

        setFilterOption(FilterOptions.DEFAULT);
    }

    switch (filterOption) {
        case FilterOptions.DEFAULT:
            return (
                <FlatList style={{width:'100%'}}
                          data={list}
                          renderItem={({ item, index }) => {
                              return (
                                  <TouchableHighlight onPress={() => setFilterOption(item.key)}>
                                      <View style={itemStyle}>
                                          <Text style={{padding: 20, fontSize:16}}>{item.name}</Text>
                                          <Text style={{position:'absolute', right:10, top:20, opacity: 0.4}}>{getFilterText(item)}</Text>
                                      </View>
                                  </TouchableHighlight>
                              )
                          }}
                />
            )
        case FilterOptions.FILTER_ROUTE:
            return (
               <RouteFilter/>
            )
        case FilterOptions.FILTER_VEHICLES:
            return (
                <ProximityFilter itemStyle={itemStyle} onSelected={(type) => onFilterSelect(FilterOptions.FILTER_VEHICLES, type)}/>
            )
        case FilterOptions.FILTER_STATIONS:
            return (
                <ProximityFilter itemStyle={itemStyle} onSelected={(type) => onFilterSelect(FilterOptions.FILTER_STATIONS, type)}/>
            )
    }

}

export default Filter

const styles = StyleSheet.create({

});