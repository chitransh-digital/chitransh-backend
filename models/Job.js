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

const Jobs = mongoose.model("Jobs", jobSchema);

module.exports = Jobs;