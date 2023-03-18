const chatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");

const socket = io();

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value.trim();

  displayMessage(msg, false);
  //emit message to the server
  socket.emit("chatMessage", msg);

  //clear the message
  clearMessage();
});

const options = [
  "Type any of the Number to continue",
  "Type 99 to checkout order",
  "Type 98 to see order history",
  "Type 97 to see current order",
  "Type 0 to cancel order",
];

//When a user connects
socket.on("connect", () => {
  console.log("You are connected:", socket.id);
});

socket.on("welcome", ({ options }) => {
  displayOptions(options);
});

socket.on("botResponse", ({ type, data }) => {
  switch (type) {
    case "menu":
      displayMenu(data);
      break;
    case "pattern":
      displayOrder(data);
      break;
    case "no-checkout":
      displayMessage(data.message, true);
      break;
    case "checkout":
      displayCheckout(data);
      break;
    case "no-order":
      displayMessage(data.message, true);
      break;
    case "currentOrder":
      displayOrder(data);
      break;
    case "no-cancel":
      displayMessage(data.message, true);
      break;
    case "wrong-input":
      displayMessage(data.message, true);
      break;
    case "order-history":
      orderHistory(data);
      break;
    default:
      displayMessage(data.message, true);
      break;
  }
});

function displayOptions (options) {
  const message = `<ul>${options.map((option) => `<li>${option}</li>`).join("")}</ul>`;
  displayMessage(message, true);
};

function displayMessage (message, isBotMessage) {
  const div = document.createElement("div");
  div.classList.add("message", `message-${isBotMessage ? "bot" : "user"}`);
  div.innerHTML = message;

  chatMessage.append(div);
  chatMessage.scrollTop = chatMessage.scrollHeight;
};


function displayMenu (menus) {
  const message = `<ol start="2">${menus.map((menu) => `<li>${menu.name}</li>`).join("")}</ol>`;
  displayMessage(message, true);
};

function displayOrder (orders) {
  if (orders.includes(null)) {
    const newOrder = orders.filter((value) => value !== null);
    const message = `There is an invalid order. You ordered for : <ul>${newOrder.map((order) => `<li>${order.name}</li>`).join("")}</ul><br><br>Select 0 to cancel order`;

    console.log(newOrder);

    displayMessage(message, true);
  } else {
    const message = `You just ordered for : <ul>${orders.map((order) => `<li>${order.name}</li>`).join("")}</ul>`;
    console.log("message", message);
    displayMessage(message, true);
    displayOptions(options);
  }
};

function displayCheckout (orders)  {
  const message = `Checkout : <ul>${orders.map((order) => `<li>${order.name}</li>`).join("")}</ul>`;
  displayMessage(message, true);
  displayOptions(options);
};

function orderHistory (orders)  {
  const message = `Your Order History : <ul>${orders.map((order) => `<li>${order.name}</li>`).join("")}</ul>`;
  displayMessage(message, true);
};


function clearMessage () {
  chatForm.elements.msg.value = "";
  chatForm.elements.msg.focus();
};



