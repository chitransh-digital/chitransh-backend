const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    familyID: {
        type: String,
        required: true,
    },
    members: [{
        name: {
            type: String,
            required: true
        },
        age: {
            type: Number,
            required: true
        },
        landmark: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        gender: {
            type: String,
            enum: ["Male", "Female", "Others"],
            required: true
        },
        karyakarni: {
            type: String,
            required: true
        },
        contact: {
            type: String,
            required: true,
            match: [/^\d{10}$/, "Please fill a valid contact number"]
        },
        DOB: {
            type: Date,
            required: true
        },
        profilePic: {
            type: String,
            default: ''
        },
        relation: {
            type: String,
            required: true
        },
        bloodGroup: {
            type: String,
            required: true
        },
        occupation: {
            type: String,
            required: true
        },
        education: {
            type: String,
            required: true
        }
    }]
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

const Member = mongoose.model("Member", memberSchema);

module.exports = Member;
