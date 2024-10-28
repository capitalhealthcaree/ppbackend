const mongoose = require("mongoose");

const treatmentsSchema = mongoose.Schema(
  {
    content: { type: String },
    slug: { type: String },
  },
  { timestamps: true }
);
const Treatments = mongoose.model("Treatments", treatmentsSchema);
module.exports = Treatments;
