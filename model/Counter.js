const mongoose = require("mongoose");

const counterSchema = mongoose.Schema(
  {
    count: { type: Number, default: 0 },
    kw: { type: String },
  },
  { timestamps: true }
);

// Create a Counter model using the schema
const Counter = mongoose.model("Counter", counterSchema);

module.exports = Counter;
