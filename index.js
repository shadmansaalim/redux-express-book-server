const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const run = async () => {
    try {
        const db = client.db("bookies");
        const booksCollection = db.collection("books");
        const usersCollection = db.collection("users");



    } catch (error) {
        console.log(error);
    }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Bookies App");
});

app.listen(port, () => {
    console.log(`Listening on PORT : ${port}`);
});