
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerID: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
      match: [/^\d{10}$/, "Please fill a valid contact number"],
    },
    desc: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    images: {
        type: [String],
        default: [],
    },
    attachments: {
        type: [String],
        default: [],
    },
    coupon: {
      type: String,
      required: false,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

const Business = mongoose.model("Business", businessSchema);

module.exports = Business;
