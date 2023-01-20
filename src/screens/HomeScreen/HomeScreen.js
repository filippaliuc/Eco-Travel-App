import {StyleSheet, Text, View, Image, Platform, StatusBar, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from "../../components/Map"
import CustomInput from './CustomInput'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import * as Location from 'expo-location';
import { selectDestination } from '../../components/navSlice'
import { useSelector } from 'react-redux'
import { auth, database } from '../../../firebase';
import {onValue, ref, set, push, child, update} from 'firebase/database';
import FilterButton from "./FilterButton";
import { Modal } from 'react-native'
import {FilterTypes} from "../../models/filter";
import FilterModal from "./FilterModal";
import { setDestination } from '../../components/navSlice';
import {GOOGLE_API_KEY} from '@env'
import { SafeAreaView } from 'react-native-safe-area-context';

let foregroundSubscription = null

const HomeScreen = () => {

    const destination = useSelector(selectDestination)

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [linesAll, setLinesAll] = useState([]);
    const [selectedLine, setSelectedLine] = useState([]);
    const [stations, setStations] = useState([]);
    const [stationsAll, setStationsAll] = useState([]);
    const [filter, setFilter] = useState({
        routeFilter: 0,
        vehiclesFilter: FilterTypes.SHOW_NEARBY,
        stationsFilter: FilterTypes.SHOW_NEARBY
    });

    const [showFilterModal, setShowFilterModal] = useState(false);

    const userId = auth.currentUser?.uid

    const read = () => {
    const star = ref(database, 'users/');
    onValue(star, (snapshot) => {
      const data = snapshot.val()
      for(let i in data){
      }
    })
    }

    useEffect(() => {
      const fetchDrivers = async () => {
          try {
            const driversRef = ref(database, 'drivers/');
            onValue(driversRef, (snapshot) => {
                setDrivers(snapshot.val());
            });
          }
          catch(error) {
              console.error(error);
          }
      }

      fetchDrivers().catch(console.error);
    }, [])

    // useEffect(() => {
    //     const fetchLines = async () => {
    //         try {
    //             const linesRef = ref(database, 'lines/');
    //             onValue(linesRef, (snapshot) => {
    //                 setLines(snapshot.val());
    //             });
    //         }
    //         catch(error) {
    //             console.error(error);
    //         }
    //     }
    //
    //     fetchLines().catch(console.error);
    // }, [])

    useEffect(() => {
        const fetchLines = async () => {
            try {
                await fetch('https://api.opentransport.ro/gtfs/v1/route')
                    .then((response) => response.json())
                    .then((json) => setLinesAll(json))
                    .catch((error) => console.error(error))

            }
            catch(error) {
                console.error(error);
            }
        }

        fetchLines().catch(console.error);
        // console.log(linesAll[0])
    }, [])



    useEffect(() => {
        const fetchStations = async () => {
            try {
                await fetch('https://api.opentransport.ro/gtfs/v1/stop')
                    .then((response) => response.json())
                    .then((json) => setStationsAll(json))
                    .catch((error) => console.error(error))

            }
            catch(error) {
                console.error(error);
            }
        }

        fetchStations().catch(console.error);
    }, [])

    useEffect(() => {

        if(filter.stationsFilter == FilterTypes.SHOW_ALL)
        {
            setStations(stationsAll);
        }
        else if(location && filter.stationsFilter == FilterTypes.SHOW_NEARBY)
        {
            fetch(`https://api.opentransport.ro/gtfs/v1/stop/nearby?latitude=${location?.coords.latitude}&longitude=${location?.coords.longitude}&radius=1000`)
                .then((response) => response.json())
                .then((json) => setStations(json))
                .catch((error) => console.error(error))
        }
        else {
            setStations([]);
        }

    }, [filter.stationsFilter, location]);

    useEffect(() => {

        if(filter.routeFilter == 0) {
            setSelectedLine([]);
        }
        else
        {
            fetch(`https://api.opentransport.ro/gtfs/v1/route/${filter.routeFilter}?include=stop`)
                .then((response) => response.json())
                .then((json) => setSelectedLine(json))
                .catch((error) => console.error(error))
        }

    }, [filter.routeFilter]);

    useEffect(() => {
        const requestPermissions = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
            setLocation(location);
        }
        requestPermissions().catch(console.error);
        startForegroundUpdate().catch(console.error);
    }, []);

    const startForegroundUpdate = async () => {
        // Check if foreground permission is granted

        // Make sure that foreground location tracking is not running
        foregroundSubscription?.remove()

        // Start watching position in real-time
        foregroundSubscription = await Location.watchPositionAsync(
            {
                // For better logs, we set the accuracy to the most sensitive option
                accuracy: Location.Accuracy.BestForNavigation,
            },
            location => {
                setLocation(location)
            }
        )
    }

  return (
  <SafeAreaView style={styles.container}>
    <View style={{padding: 15}}>
      {/*{destination?.location && (*/}
      {/*  <CustomInput text="Pornire:" placeholder="Initial location" set="Origin" ></CustomInput>*/}
      {/*)}*/}
      {/*  <View style={{width:340}}>*/}
            <CustomInput text="Destinatie:" placeholder="Destinatie" set="Destination"></CustomInput>
        {/*</View>*/}

      {/*<TouchableOpacity style={styles.clear} onPress={() => setDestination(null)}><Text style={{color:'white', fontWeight:'bold'}}>Clear</Text></TouchableOpacity>*/}
      {/* <CustomButton text="Cauta" onPress={() => setShowStart(true)}></CustomButton> */}
    </View>
      <Map styles={styles.map} currentLocation={location} drivers={drivers} stations={stations} filter={filter} routes={linesAll} displayedRoutes={selectedLine}/>
      { linesAll &&
          <FilterButton onPress={() => setShowFilterModal(true)} />
      }

      <FilterModal isVisible={showFilterModal} onClose={() => setShowFilterModal(false)} filter={filter} setFilter={setFilter} routes={linesAll}>

      </FilterModal>
    < NavigationBar></NavigationBar>
  </SafeAreaView>
  )
  
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'white'
  },
    clear: {
      backgroundColor: '#279032',
        alignSelf:'center',
        marginTop:15,
        marginStart:3,
        borderRadius:6,
        alignContent: 'center',
        justifyContent: 'center',
        height:43,
        paddingHorizontal: 10,
    }
})