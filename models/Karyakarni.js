const mongoose = require('mongoose');

const karyakarniSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: ""
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
    designations: [{
        type: String,
        required: true
    }],
    members: [{
        name: {
            type: String,
            requires: true
        },
        familyID: {
            type: String,
            required: true
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
        }
    }]
});

