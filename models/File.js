const mongoose = require("mongoose");

const fileSchema = mongoose.Schema({
  path: {
    type: String,
    required: true,
  },
  password: String,
  originalName: {
    type: String,
    required: true,
  },
  downloadCount: {
    type: Number,
    required: true,
    default: 0,
  },
});
module.exports = mongoose.model("File", fileSchema);
