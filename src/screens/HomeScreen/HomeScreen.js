import { StyleSheet, Text, View, Image } from 'react-native'
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

let foregroundSubscription = null

const HomeScreen = () => {

    const destination = useSelector(selectDestination)

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [lines, setLines] = useState(null);
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
  <View style={styles.container}>
    <View style={{padding: 15, flex: 0}}>
      {destination?.location && (
        <CustomInput text="Pornire:" placeholder="Initial location" set="Origin" ></CustomInput>
      )}
      <CustomInput text="Destinatie:" placeholder="Destination" set="Destination"></CustomInput>
      {/* <CustomButton text="Cauta" onPress={() => setShowStart(true)}></CustomButton> */}
    </View>
      <Map styles={styles.map} currentLocation={location} drivers={drivers} lines={lines} stations={stations} filter={filter}/>
      <FilterButton onPress={() => setShowFilterModal(true)} />
      <FilterModal isVisible={showFilterModal} onClose={() => setShowFilterModal(false)} filter={filter} setFilter={setFilter}>

      </FilterModal>
    < NavigationBar></NavigationBar>
  </View>
  )
  
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: '6%',
    justifyContent: 'flex-end',
    backgroundColor: 'white'
  },
})