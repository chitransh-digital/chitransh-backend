const mongoose = require('mongoose');

const karyakarniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        default: ""
    },
    landmark: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        required: true
    },
    designations: [{
        type: String,
        required: true
    }],
    level: { 
        type: String, 
        enum: ["India", "State", "City"], 
        required: true 
    },
    members: [{
        name: {
            type: String,
            requires: true
        },
        familyID: {
            type: String,
            default: ''
        },
        contact: {
            type: String,
            required: false,
            match: [/^\d{10}$/, "Please fill a valid contact number"]
        },
        profilePic: {
            type: String,
            default: ''
        },
        designations: [{
            type: String,
            required: true
        }],
        karyakarni: {
            type: String,
            required: true
        },
    }]
},
{
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
}
);

const Karyakarni = mongoose.model('Karyakarni', karyakarniSchema);

module.exports = Karyakarni;