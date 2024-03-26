const mongoose = require("mongoose");

const adminConfig = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
    }
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

const AdminConfig = mongoose.model(
  "AdminConfig",
  adminConfig
);

module.exports = AdminConfig;
