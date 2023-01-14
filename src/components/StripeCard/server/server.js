// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys


import express from 'express'
import Stripe from 'stripe'

const app = express();
const port = 3000;
const ipAddress = '192.168.43.41';

const STRIPE_SK = "sk_test_51MMYuXKVO8NcwZ1f65HzG3GLr11SkDBBoejiiaDeLPKyD3i2l8tdtrlQYFerD5WFqJXX3ndxwJx4igN5NsJahXNp00lxHpG6gw"
const stripe = Stripe(STRIPE_SK,{apiVersion: "2022-11-15"});

app.use(express.json());

app.listen(port, ipAddress, () => {
    console.log(`Listening to http://${ipAddress}:${port} and address ${ipAddress}`);
});

app.post("/create-payment-intent", async (req, res) => {
    try{
        let {price, ticketType}  = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(price *100),
            currency: 'ron',
            metadata: {
                ticketType
            },
        });

        const clientSecret = paymentIntent.client_secret;
        
        res.json({
            clientSecret: clientSecret,
        })
    } catch (e) {
        console.log(e.message);
        res.json({error: e.message})
    }
})