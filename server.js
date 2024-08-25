
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require('./routes/routes');

const mongoString = process.env.DATABASE_URL;

const PORT = process.env.PORT || 3030;

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on("error", (error) => {
    console.log("Database Error", error);
});

database.once("connected", () => {
    console.log("Database Connected");
})

const app = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));

app.use('/api', routes);

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});