import { View, Text, Image, KeyboardAvoidingView, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import Logo from '../../../assets/bus_logo.png'
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { auth } from "../../../firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"


const LogInScreen = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, username, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      console.log("Registered")
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });
  }

  const handleSignIn = () => {
    signInWithEmailAndPassword(auth, username, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("Signed");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

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
      <CustomButton text="Create Account" onPress={handleRegister} type="Register" />
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