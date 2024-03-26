const mongoose = require("mongoose");
const notificationLogSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      required: true,
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

const NotificationLogs = mongoose.model(
  "NotificationLogs",
  notificationLogSchema
);

module.exports = NotificationLogs;
