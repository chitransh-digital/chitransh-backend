const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Please fill a valid phone number"]
  },
  familyID: {
    type: String,
    required: false
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;