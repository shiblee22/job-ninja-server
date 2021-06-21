const express = require('express');
const app = express();
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdusz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
    const jobsCollection = client.db(`${process.env.DB_NAME}`).collection("jobs");
    console.log('connection err', err)

    app.get('/', (req, res) => {
        res.send('Server Running');
    });

    app.get('/jobs', (req, res) => {
        jobsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err)
            })
    })

    app.get('/users/:email', (req, res) => {
        usersCollection.find({ email: req.params.email })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err)
            })
    })

    app.get('/jobs/:status', (req, res) => {
        jobsCollection.find({ status: req.params.status })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(err)
            })
    })

    app.get('/jobsdetail/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        jobsCollection.find({ _id: id })
            .toArray((err, documents) => {
                res.send(documents);
                console.log(documents)
            })
    })

    app.post('/addUser', (req, res) => {
        const newUser = req.body;
        usersCollection.insertOne(newUser)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addJob', (req, res) => {
        const newJob = req.body;
        jobsCollection.insertOne(newJob)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.patch('/updateStatus/:id', (req, res) => {
        const id = ObjectID(req.params.id);
        jobsCollection.updateOne({_id: id},{ $set:{ status: req.body.status }})
        .then(documents => res.send("Done"))
    })
});

app.listen(process.env.PORT || '3001');