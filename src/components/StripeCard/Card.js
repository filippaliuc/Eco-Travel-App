import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CardField, initStripe, StripeProvider, useConfirmPayment } from '@stripe/stripe-react-native'
import Dialog from "react-native-dialog"
import { auth, database } from "../../../firebase"
import { onValue, ref } from '@firebase/database'
import { getId } from '../CustomFlatList'
import { ticketsData } from '../../models/ticketsData'
import moment from 'moment'


const API_URL = "http://192.168.1.6:3000"

const STRIPE_PK = 'pk_test_51MMYuXKVO8NcwZ1fSkRFO3NB9RnbEvRyhHZofipYYkFQ8mjPoNTatgbfVFzxvjtRTdmlV73mxaVG2NsCepIxbxZP0047AuCHDZ'

const Card = ({showCard, hideCard}) => {

    const [userId, setUserId] = useState(null)
    const [username, setUsername] = useState('')
    const [price, setPrice] = useState(0)
    const [ticketType, setTicketType] = useState('nothing')
    const [cardDetails, setCardDetails] = useState()
    const {confirmPayment, loading } = useConfirmPayment()
    const [date, setDate] = useState(null)

    let testDate = moment(`2023-01-09 05:00:07`).format(`YYYY-MM-DD hh:mm:ss`)
    let a = moment().format(`YYYY-MM-DD hh:mm:ss`)
    
    useEffect(() => {
        const userId = auth.currentUser?.uid
        const userRef = ref(database, 'users/' + userId);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val()
            setUserId(userId);
            setUsername(data.email)
        })
    }, [])

    useEffect(() => {
        if(getId()){
            setPrice(ticketsData[getId() - 1].price)
            setTicketType(ticketsData[getId()-1].name) 
        }
        setDate(moment().format(`YYYY-MM-DD hh:mm:ss`))
    }, [showCard])

    
    console.log(date, testDate)
    // console.log(a.diff(testDate,'days'))
    const fetchPaymentIntentClientSecret = async () => {
        const response = await fetch(`${API_URL}/create-payment-intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price, 
                ticketType,
            })
        });

        const { clientSecret, error } = await response.json();
        return { clientSecret, error };
    }; 

    const handlePayPress = async () => {
        if(!cardDetails?.complete || !userId || !username) {
            Alert.alert("Please enter card details")
            return
        }
        // Gather the customer's billing information (for example, email)
        const billingDetails = {
          userId: userId,
          username: username
        };
    
        // Fetch the intent client secret from the backend

        try{
            const { clientSecret, error } = await fetchPaymentIntentClientSecret();
            if(error) {
                console.log("Unable to process payment")
            } else {
                const {paymentIntent, error} = await confirmPayment(
                    clientSecret, 
                    {
                        paymentMethodType: "Card",
                        billingDetails: billingDetails,
                    },
                );
                if(error) { 
                    Alert.alert(`Payment confimation error ${error.message}`);
                } else if (paymentIntent){  
                    // formatDate()
                    alert("Payment Succesful");
                    console.log("Payment succesful ", paymentIntent);
                    console.log(billingDetails)
                }
            }
        } catch(e) {
            console.log(e)
        }
    };
    

    return (
        <StripeProvider
            publishableKey={STRIPE_PK}

        >
            <Dialog.Container visible={showCard}>
                <CardField
                    postalCodeEnabled={false}
                    cardStyle={styles.card}
                    style={styles.cardContainer}
                    onCardChange={cardDetails => {
                        setCardDetails(cardDetails);
                    }}
                >
                </CardField>
                <Dialog.Button 
                    disabled={loading} 
                    style={{color: "green"}}   
                    label="Confirma" 
                    onPress={handlePayPress}
                />
                <Dialog.Button 
                    style={{color: "red"}} 
                    label="Anuleaza" 
                    onPress={hideCard}
                />
            </Dialog.Container>
        </StripeProvider>
    )
}

export default Card

const styles = StyleSheet.create({
    cardContainer: {
        // flex: 1,
        alignSelf: 'center',
        margin: 10,
        height: 50, 
        width: '90%',
        color: 'grey'
    },
    card: {
        backgroundColor: 'grey'
    },
})