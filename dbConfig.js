const mongoose = require('mongoose');
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const path = require('path')

require('dotenv').config({path: path.resolve(__dirname, './.env')})

function connectToDb() {
    mongoose.set('strictQuery', true)

    mongoose.connect(process.env.DB)
    mongoose.connection.on("connected", () => {
        console.info('Database connected succesfully')
    })
    mongoose.connection.on("Error", (error) => {
        console.error(error)
        console.info("An error occurred while connecting to the db")
    })
}


var store = new MongoDBStore({
    uri: process.env.DB,
    collection: "userSession",
});

module.exports = {connectToDb, store};