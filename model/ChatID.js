const mongoose = require("mongoose");

const chatIdSchema = mongoose.Schema(
  {
    chatIdKey: { type: String },
  },
  { timestamps: true }
);

// Create a Counter model using the schema
const ChatID = mongoose.model("ChatID", chatIdSchema);

module.exports = ChatID;
