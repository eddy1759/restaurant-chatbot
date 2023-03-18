const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  sessionId: String,
  orders: [{ id: String, name: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);