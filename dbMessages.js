import mongoose from "mongoose";

//db schema

const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received  :Boolean
})

export default mongoose.model('messagecontents',whatsappSchema);
