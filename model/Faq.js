const mongoose = require("mongoose");

const faqSchema = mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    metaDes: { type: String, required: true },
    foucKW: { type: String, required: true },
    slug: { type: String, required: true },
    seoTitle: { type: Array, required: true },
  },
  { timestamps: true }
);
const Faq = mongoose.model("Faq", faqSchema);
module.exports = Faq;
