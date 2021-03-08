const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: String,
})

const imageModel = mongoose.model('Image', imageSchema)

module.exports = imageModel;

