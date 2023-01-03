import { View, Text, Image, KeyboardAvoidingView, StyleSheet, Alert, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import Logo from '../../../assets/bus_logo.png'
import CustomInput from "./CustomInput";
import CustomButton from "./CustomButton";
import { auth, database } from "../../../firebase"
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth"
import { useNavigation } from '@react-navigation/native';
import { ref, set } from "firebase/database";

const RegisterScreen = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();

  function writeUserToRealtimeDb(userId){
    set(ref(database,'users/' + userId), {
      email: email,
      role: 'student'
    });
  }
  
  const handleRegister = () => {
    if(password === confirmPassword){
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        writeUserToRealtimeDb(user.uid)
        navigation.navigate("HomeScreen")
        showToast()
        console.log("Registered")
        // ...
      })
      .catch((error) => {
        console.log("Not correct")
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
    } else {
      console.log("Not correct password")
      alert("Passwords doesn't match")
    }
  }

  const showToast = () =>{
    ToastAndroid.show(`Registered as ${username}`, 2)
  }
  
  return (
    <KeyboardAvoidingView style={styles.root}>
      <Image
        source={Logo}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appTitle}>Eco Travel</Text>
      <CustomInput placeholder="Email" value={email} setvalue={text => setEmail(text)} />
      <CustomInput placeholder="Password" value={password} setvalue={text => setPassword(text)} secureTextEntry={true} />
      <CustomInput placeholder="Confirm Password" value={confirmPassword} setvalue={text => setConfirmPassword(text)} secureTextEntry={true} />
      <CustomButton text="Register" onPress={() => handleRegister()} type="Register"/>
      <View style={styles.text}> 
        <Text style={{color: 'white', fontWeight: "500"}}>Already have an account? </Text>
        <Text 
          style={{fontWeight: "400"}} 
          onPress={() => navigation.navigate("LogInScreen")}
        > 
          Login now
        </Text>
      </View>
    </KeyboardAvoidingView>
  )
}

export default RegisterScreen

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

  text:{
    marginTop: 15,
    flexDirection: 'row'
  }
})