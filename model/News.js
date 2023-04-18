const mongoose = require("mongoose");

const newsSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    metaDes: { type: String, required: true },
    foucKW: { type: String, required: true },
    slug: { type: String, required: true },
    seoTitle: { type: Array, required: true },
    category: { type: String, required: true },
    image: { type: String },
  },
  { timestamps: true }
);
const News = mongoose.model("News", newsSchema);
module.exports = News;
