import { View, Text, Image, KeyboardAvoidingView, StyleSheet, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Logo from '../../../assets/bus_logo.png'
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { auth, database } from "../../../firebase"
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth"
import { useNavigation } from '@react-navigation/native';
import { ref, onValue} from '@firebase/database';


const LogInScreen = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('')

  useEffect(() => {
    if(role === 'sofer'){
      navigation.navigate("DriverScreen")
    } else if (role === 'student') {
      navigation.navigate("HomeScreen")
    }
  }, [role])
  
  
  const navigation = useNavigation();

  const readUserRole = (userId) => {
    const roleRef = ref(database, 'users/' + userId);
    onValue(roleRef, (snapshot) => {
      const data = snapshot.val()
      setRole(data.role)
    })
  }
  
  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log(user.uid) 
        readUserRole(user.uid)
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Alert.alert(error.message)
      });
  }

  // console.log(auth.currentUser.uid)

  return (
    <KeyboardAvoidingView style={styles.root}>
      <Image
        source={Logo}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appTitle}>Eco Travel</Text>
      <CustomInput placeholder="Username" value={username} setvalue={text => setUsername(text)} />
      <CustomInput placeholder="Password" value={password} setvalue={text => setPassword(text)} secureTextEntry={true} />
      <CustomButton text="Log In" onPress={handleSignIn} />
      <Text style={{ color: 'white', marginTop: 25, marginBottom: 15}}>__________________    OR    __________________</Text>
      <Text style={{ color: 'white', marginBottom: 15 }}>No account yet? Make one now.</Text>
      <CustomButton text="Create Account" onPress={() => navigation.navigate("RegisterScreen")} type="Register" />
    </KeyboardAvoidingView>
  )
}

export default LogInScreen

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    // padding: '5%',
    backgroundColor: '#279032',
    flex: 1
  },

  logo: {
    marginTop: 40,
    width: '60%',
    height: '13%',
  },

  appTitle: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    padding: 15,
    marginBottom: 20,
    textAlign: 'left'
  },
})