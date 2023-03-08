const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    username: {required: true, type: String},
    description: String,
    duration: Number,
    date: String,
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;