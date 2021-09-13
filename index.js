const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()



const app = express();
app.use(bodyParser.json());
app.use(cors());




var serviceAccount = require("./server/burj-al-arab-3e09a-firebase-adminsdk-e2b8w-1e929a58ce.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseUrl: process.env.FIRE_DB
});





const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mumx.mongodb.net/alArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("alArab").collection("bookings");
    // perform actions on the collection object
    app.post('/addBookings', (req, res) => {
        const newBookings = req.body;
        collection.insertOne(newBookings)
            .then(result => {
                res.send(result.insertedCount > 0);
            })

        console.log(newBookings);
    })

    app.get('/bookings', (req, res) => {
        let bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });

            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    console.log(tokenEmail);
                    const queryEmail = req.query.email;
                    console.log(queryEmail);
                    if (tokenEmail === req.query.email) {
                        collection.find({ email: req.query.email })
                            .toArray((error, documents) => {
                                res.send(documents);
                            })
                    } else {
                        res.status(401).send('un-authorized access');

                    }
                    // ...
                })
                .catch((error) => {
                    // Handle error
                });
        } else {
            res.status(401).send('un-authorized access');
        }
        // idToken comes from the client app

    })


    console.log('db connected');


});


app.get('/', (req, res) => {
    res.send('Hello word');
})


app.listen(5000);