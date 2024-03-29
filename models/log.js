const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    username: {required: true, type: String},
    count: Number,
    _id: String,
    log: {type: [Object]} 
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;