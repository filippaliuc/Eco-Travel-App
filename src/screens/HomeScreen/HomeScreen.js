import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Map from "../../components/Map"
import CustomInput from './CustomInput'
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import * as Location from 'expo-location';
import { selectDestination } from '../../components/navSlice'
import { useSelector } from 'react-redux'
import { auth, database } from '../../../firebase';
import {onValue, ref, set, push, child, update} from 'firebase/database';

const HomeScreen = () => {

    const destination = useSelector(selectDestination)

    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [drivers, setDrivers] = useState([]);
    const [lines, setLines] = useState(null);
    const [stations, setStations] = useState(null);

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
                const data = snapshot.val();

                let arr = [];
                Object.entries(data).map(driver => {
                    arr.push(driver[1]);
                })

                setDrivers(arr);
            });
          }
          catch(error) {
              console.error(error);
          }
      }

      fetchDrivers().catch(console.error);
    }, [])

    useEffect(() => {
        const fetchLines = async () => {
            try {
                const linesRef = ref(database, 'lines/');
                onValue(linesRef, (snapshot) => {
                    setLines(snapshot.val());
                });
            }
            catch(error) {
                console.error(error);
            }
        }

        fetchLines().catch(console.error);
    }, [])

    useEffect(() => {
        const fetchStations = async () => {
            try {
                const stationsRef = ref(database, 'stations/');
                onValue(stationsRef, (snapshot) => {
                    setStations(snapshot.val());
                });
            }
            catch(error) {
                console.error(error);
            }
        }

        fetchStations().catch(console.error);
    }, [])

    // useEffect(() => {
    //     console.log('AAA')
    //     //console.log(drivers["etbwNBv6cuaAMA6aHNl5DqlzObs1"].position.latitude);
    //     if(stations != null) {
    //         //Object.entries(drivers).map(d =>{console.log(d[1])})
    //         console.log(stations)
    //     }
    // }, [stations])

  useEffect(() => {
      (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
              setErrorMsg('Permission to access location was denied');
              return;
          }
          let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
          setLocation(location);
          // console.log(location)
          console.log(userId)
      })();
  }, []);


  return (
  <View style={styles.container}>
    <View style={{padding: 15, flex: 0}}>
      {destination?.location && (
        <CustomInput text="Pornire:" placeholder="Initial location" set="Origin" ></CustomInput>
      )}
      <CustomInput text="Destinatie:" placeholder="Destination" set="Destination"></CustomInput>
      {/* <CustomButton text="Cauta" onPress={() => setShowStart(true)}></CustomButton> */}
    </View>
      <Map styles={styles.map} currentLocation={location} drivers={drivers} lines={lines} stations={stations}/>
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