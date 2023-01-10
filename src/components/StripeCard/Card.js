import { Alert, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CardField, initStripe, StripeProvider, useConfirmPayment } from '@stripe/stripe-react-native'
import Dialog from "react-native-dialog"
import { auth, database } from "../../../firebase"
import { child, onValue, ref, push, update, remove } from '@firebase/database'
import { getId } from '../CustomFlatList'
import { ticketsData } from '../../models/ticketsData'
import { busPassData } from '../../models/busPassData'


const API_URL = "http://192.168.1.6:3000"

const STRIPE_PK = 'pk_test_51MMYuXKVO8NcwZ1fSkRFO3NB9RnbEvRyhHZofipYYkFQ8mjPoNTatgbfVFzxvjtRTdmlV73mxaVG2NsCepIxbxZP0047AuCHDZ'

const Card = ({showCard, hideCard, cardType, selectedId}) => {

    const [userId, setUserId] = useState(null)
    const [username, setUsername] = useState('')
    const [price, setPrice] = useState(0)
    const [ticketType, setTicketType] = useState('nothing')
    const [cardDetails, setCardDetails] = useState()
    const {confirmPayment, loading } = useConfirmPayment()
    
    console.log(selectedId)
    useEffect(() => {
        const userId = auth.currentUser?.uid
        const userRef = ref(database, 'users/' + userId);
        onValue(userRef, (snapshot) => {
            const data = snapshot.val()
            setUserId(userId);
            setUsername(data.email)
        })
        readActiveTickets()
    }, [])

    useEffect(() => {
        if(cardType === "Ticket")
        { 
            if(getId()){
                setPrice(ticketsData[getId() - 1].price)
                setTicketType(ticketsData[getId()-1].name) 
            }
        } else if (cardType === "Subscription") {
            if(selectedId){
                setPrice(busPassData[selectedId - 1].price)
                setTicketType(busPassData[selectedId-1].name) 
            }
        }
    }, [showCard])

    function writeTicketsToDB(){
        const date = new Date();

        const postData = {
            date: date,
            type: ticketType,
        };
        const newPostKey = push(child(ref(database),'posts')).key;

        const updates = {}
        updates['users/' + userId + '/tickets/' + newPostKey] = postData;

        return update(ref(database), updates)
    }

    function writeSubscriptionToDB(){
        const date = new Date();

        const postData = {
            date: date,
            type: ticketType,
        };
        const newPostKey = push(child(ref(database),'posts')).key;

        const updates = {}
        updates['users/' + userId + '/subscriptions/' + newPostKey] = postData;

        return update(ref(database), updates)
    }

    function readActiveTickets(){
        const currentDate = new Date()
        const ticketsRef = ref(database, 'users/' + userId + '/tickets/');
        onValue(ticketsRef, (snapshot) => {
            snapshot.forEach((child) => {
                const date = new Date(child.val().date)
                const ticketType = child.val().type
                const diff = Math.floor((currentDate-date)/(1000*60*60))
                // console.log(diff)
                if(ticketType == "Bilet 60 de minute" && diff){
                    const removedIdRef = ref(database, 'users/' + userId + '/tickets/' + child.key)
                    remove(removedIdRef)
                } else if (ticketType == "Bilet de o zi" && diff>24 ) {
                    const removedIdRef = ref(database, 'users/' + userId + '/tickets/' + child.key)
                    remove(removedIdRef)
                }
            })
        })
    }

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
                    alert("Payment Succesful");
                    if(cardType === 'Ticket'){
                        writeTicketsToDB()
                    } else if (cardType === 'Subscription'){
                        writeSubscriptionToDB()
                    }
                    // console.log("Payment succesful ", paymentIntent);
                    // console.log(billingDetails)
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