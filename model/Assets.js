const mongoose = require("mongoose");

const assetsSchema = mongoose.Schema(
  {
    folderName: { type: String },
    fileName: { type: String },
    filePath: { type: String },
  },
  { timestamps: true }
);

const Assets = mongoose.model("Assets", assetsSchema);

module.exports = Assets;
