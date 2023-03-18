const session = require("express-session");
const { store }  = require("../dbConfig");
const path = require('path')
require('dotenv').config({path: path.resolve(__dirname, './.env')})


const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  store: store,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 2629056000 }, //
});


const menus = [
  { id: 2, name: "Rice and Beans" },
  { id: 3, name: "Amala and Ewedu" },
  { id: 4, name: "Peppersoup and Rice" },
  { id: 5, name: "Spaghetti" },
  { id: 6, name: "Chicken and Chips" },
  { id: 7, name: "Pizza" },
  { id: 8, name: "Fries" },
  { id: 9, name: "Shawarma" },
  { id: 10, name: "French Onion Soup" },
  { id: 11, name: "Afang soup" },
];


module.exports = {
  sessionMiddleware,
  menus
}