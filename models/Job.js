const mongoose = require("mongoose");
const jobSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    externalLink: {
      type: String,
      required: false,
    },
    contact: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    salary: {
      type: Number,
    },
    requirements: {
      type: [String],
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
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
  },
  {
    timestamps: true,
  }
);

const Jobs = mongoose.model("Jobs", jobSchema);

module.exports = Jobs;