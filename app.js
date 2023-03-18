const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const Order = require("./orderModel");
const { connectToDb }  = require("./dbConfig");
const { sessionMiddleware, menus } = require('./utils/helper')

require('dotenv').config({path: path.resolve(__dirname, './.env')})

const app = express();
const server = http.createServer(app);
const io = socketio(server);

connectToDb();

app.use(sessionMiddleware);

io.use((socket, next) => sessionMiddleware(socket.request, {}, next));

const PORT = process.env.PORT || 3000

const botName = "ChatBot";

const orders = [];

const options = [
  "Type 1 to Place an order",
  "Type 99 to checkout order",
  "Type 98 to see order history",
  "Type 97 to see current order",
  "Type 0 to cancel order",
];


//Setting the static path
app.use(express.static("public"));


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


//When a client connects
io.on("connection", (socket) => {
  const session = socket.request.session;

  if (!session.orders) {
    session.orders = [];
    session.save();
  }

  console.log("User Joined!..", session.id);

  socket.emit("welcome", { options });

  socket.on(
    "chatMessage",
    (msg) => {

      const pattern = /^[2-9]|1[0-1]$/;
      
      switch (true) {
        //Places an order
        case msg === "1": 
          socket.emit("botResponse", { type: "menu", data: menus });
          break;
          //to checkout order
        case msg === "99":
          if (session.orders.length == 0) {
            socket.emit("botResponse", {
              type: "no-checkout",
              data: { message: "You have no order to checkout" },
            });
          } else {
            socket.emit("botResponse", {
              type: "checkout",
              data: session.orders,
            });
            session.orders = [];
            session.save();
          }

          break;
          //to see order history
        case msg === "98":
          socket.emit("botResponse", {
              type: "order-history",
              data: session.orders,
            })

          break;
          //to see current order
        case msg === "97":
          if (session.orders.length == 0) {
            socket.emit("botResponse", {
              type: "no-order",
              data: {
                message:
                  "You have not made any order yet!  Type 1 to Place an order",
              },
            });
          } else {
            socket.emit("botResponse", {
              type: "currentOrder",
              data: session.orders,
            });
          }
          break;
          //cancel order
        case msg === "0":
          if (session.orders.length == 0) {
            socket.emit("botResponse", {
              type: "no-cancel",
              data: {
                message: "No order to cancel",
              },
            });
          } else {
            socket.emit("botResponse", {
              type: "cancel",
              data: {
                message: `You just cancelled your order of ${session.orders.length} item(s)
                `,
              },
            });
            session.orders = [];
            session.save();
          }
          break;
          case pattern.test(msg):
            // Find the menu item in the menus array with the id that matches the customer's message
            const order = menus.find((item) => item.id == +msg);
            // Add the menu item to the session's orders array
            session.orders.push(order);
            // Create a new Order document with the session's id and orders array
            const newOrder = new Order({
              sessionId: session.id,
              orders: session.orders,
            });
            // Save the new Order document
            newOrder.save();
            // Save the updated session
            session.save();
            // Emit a response to the customer with the updated orders array
            socket.emit("botResponse", { type: "pattern", data: session.orders });
            // Break out of the switch statement
            break;
          
        default:
          socket.emit("botResponse", {
            type: "wrong-input" || "null",
            data: {
              message: `Your input is wrong, Try again!`,
            },
          });
          break;
      }
    }
  );
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});